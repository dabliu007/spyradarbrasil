import { createFileRoute } from "@tanstack/react-router";

/**
 * Webhook SyncPay — POST /api/public/syncpay-webhook
 *
 * Eventos: cashin.create, cashin.update, cashout.create, cashout.update.
 * Como a SyncPay não publica HMAC neste plano, re-verificamos o status
 * direto na API antes de marcar como pago.
 */
export const Route = createFileRoute("/api/public/syncpay-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();

        let payload: any = {};
        try {
          payload = rawBody ? JSON.parse(rawBody) : {};
        } catch {
          return new Response("invalid json", { status: 400 });
        }

        const event: string = String(
          payload?.event || payload?.type || payload?.action || "",
        ).toLowerCase();

        const tx =
          payload?.data?.transaction ??
          payload?.transaction ??
          payload?.data ??
          payload ??
          {};

        const identifier: string | undefined =
          tx?.identifier || tx?.id || tx?.transaction_id || tx?.transactionId;

        if (!identifier) {
          console.warn("[syncpay webhook] sem identifier", JSON.stringify(payload).slice(0, 400));
          return new Response(JSON.stringify({ received: true }), { status: 200 });
        }

        // Ignora eventos de cashout — não disparam Purchase.
        if (event.includes("cashout")) {
          return new Response(JSON.stringify({ received: true }), { status: 200 });
        }

        // Re-verifica status na SyncPay — fonte da verdade.
        let verifiedStatus = "";
        let amount = 0;
        let meta: Record<string, any> = tx?.metadata || payload?.metadata || {};

        try {
          const clientId = process.env.SYNCPAY_CLIENT_ID;
          const clientSecret = process.env.SYNCPAY_CLIENT_SECRET;
          if (clientId && clientSecret) {
            const authRes = await fetch(
              "https://api.syncpayments.com.br/api/partner/v1/auth-token",
              {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify({ client_id: clientId, client_secret: clientSecret }),
              },
            );
            if (authRes.ok) {
              const ajson: any = await authRes.json().catch(() => ({}));
              const token: string =
                ajson?.access_token || ajson?.token || ajson?.data?.access_token;
              if (token) {
                const verifyRes = await fetch(
                  `https://api.syncpayments.com.br/api/partner/v1/transaction/${encodeURIComponent(identifier)}`,
                  {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
                  },
                );
                if (verifyRes.ok) {
                  const vjson: any = await verifyRes.json().catch(() => ({}));
                  const vtx = vjson?.data ?? vjson?.transaction ?? vjson;
                  verifiedStatus = String(vtx?.status ?? "").toLowerCase();
                  amount = Number(vtx?.amount ?? 0) || 0;
                  if (vtx?.metadata && typeof vtx.metadata === "object") {
                    meta = { ...meta, ...vtx.metadata };
                  }
                }
              }
            }
          }
        } catch (err) {
          console.error("[syncpay webhook] erro ao verificar", err);
        }

        const isPaid = [
          "paid",
          "completed",
          "approved",
          "ok",
          "success",
          "confirmed",
          "authorized",
          "settled",
          "captured",
          "complete",
          "finished",
          "done",
        ].includes(verifiedStatus);

        const fbc: string | undefined = meta?.fbc || undefined;
        const fbp: string | undefined = meta?.fbp || undefined;
        const utmKeys = [
          "utm_source",
          "utm_medium",
          "utm_campaign",
          "utm_content",
          "utm_term",
          "utm_id",
          "fbclid",
          "gclid",
          "landing_url",
          "referrer",
        ] as const;
        const utms: Record<string, string> = {};
        for (const k of utmKeys) {
          if (typeof meta?.[k] === "string" && meta[k]) utms[k] = String(meta[k]);
        }

        console.log("[syncpay webhook]", {
          event,
          id: identifier,
          status: verifiedStatus,
          amount,
          isPaid,
          utm_campaign: utms.utm_campaign,
          utm_source: utms.utm_source,
        });

        if (isPaid) {
          try {
            const { sendCapiEvent } = await import("@/lib/fb-capi.server");
            const origin =
              process.env.PUBLIC_APP_URL?.replace(/\/$/, "") ||
              new URL(request.url).origin;

            await sendCapiEvent({
              event_name: "Purchase",
              event_id: `purchase-${identifier}`,
              event_source_url: `${origin}/checkout`,
              user_data: {
                client_ip_address:
                  request.headers.get("cf-connecting-ip") ||
                  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                  undefined,
                client_user_agent: request.headers.get("user-agent") || undefined,
                fbc,
                fbp,
              },
              custom_data: {
                value: amount || 87,
                currency: "BRL",
                content_ids: [identifier],
                content_type: "product",
                transaction_id: identifier,
                ...utms,
              },
            });
          } catch (err) {
            console.error("[syncpay webhook] falha CAPI", err);
          }


          try {
            const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
            const { error } = await supabaseAdmin
              .from("purchase_logs")
              .upsert(
                {
                  transaction_id: identifier,
                  amount: amount || null,
                  currency: "BRL",
                  status: verifiedStatus,
                  fbc: fbc ?? null,
                  fbp: fbp ?? null,
                  utm_source: utms.utm_source ?? "organico",
                  utm_medium: utms.utm_medium ?? null,
                  utm_campaign: utms.utm_campaign ?? null,
                  utm_content: utms.utm_content ?? null,
                  utm_term: utms.utm_term ?? null,
                  utm_id: utms.utm_id ?? null,
                  fbclid: utms.fbclid ?? null,
                  gclid: utms.gclid ?? null,
                  landing_url: utms.landing_url ?? null,
                  referrer: utms.referrer ?? null,
                  raw_metadata: meta,
                },
                { onConflict: "transaction_id" },
              );
            if (error) console.error("[syncpay webhook] purchase_logs insert", error);
          } catch (err) {
            console.error("[syncpay webhook] purchase_logs erro", err);
          }
        }

        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
