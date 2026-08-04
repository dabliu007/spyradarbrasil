import { createFileRoute } from "@tanstack/react-router";

/**
 * Webhook Omega Payments — POST /api/public/omega-webhook
 *
 * Como a Omega não documenta assinatura HMAC, re-consultamos a transação
 * pela API antes de marcar como paga.
 */
export const Route = createFileRoute("/api/public/omega-webhook")({
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

        const tx =
          payload?.transaction ??
          payload?.data?.transaction ??
          payload?.data ??
          payload ?? {};
        const txId: string | undefined =
          tx?.transactionId || tx?.id || tx?.transaction_id || payload?.transactionId;

        if (!txId) {
          console.warn("[omega webhook] sem transactionId", JSON.stringify(payload).slice(0, 400));
          return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        }

        // Re-consulta autoritativa via Omega.
        let verifiedStatus = "pending";
        let verifiedAmount = Number(tx?.amount ?? 0) || 0;
        let verifiedMeta: Record<string, any> =
          (tx?.metadata && typeof tx.metadata === "object" ? tx.metadata : {}) || {};
        try {
          const { normalizeStatus } = await import("@/lib/pix.functions");
          const pub = process.env.OMEGA_PUBLIC_KEY;
          const sec = process.env.OMEGA_SECRET_KEY;
          if (pub && sec) {
            const res = await fetch(
              `https://app.omegapayments.com.br/api/v1/gateway/transactions?id=${encodeURIComponent(txId)}`,
              {
                method: "GET",
                headers: {
                  Accept: "application/json",
                  "x-public-key": pub,
                  "x-secret-key": sec,
                },
              },
            );
            const json: any = await res.json().catch(() => ({}));
            const inner =
              json?.transaction ??
              json?.data?.transaction ??
              json?.data ??
              (Array.isArray(json) ? json[0] : json) ??
              json;
            verifiedStatus = normalizeStatus(inner?.status ?? inner?.payment_status);
            verifiedAmount = Number(inner?.amount ?? verifiedAmount) || verifiedAmount;
            if (inner?.metadata && typeof inner.metadata === "object") {
              verifiedMeta = inner.metadata;
            }
          }
        } catch (err) {
          console.error("[omega webhook] re-consulta falhou", err);
        }

        const isPaid = verifiedStatus === "paid";

        const fbc: string | undefined = verifiedMeta?.fbc || undefined;
        const fbp: string | undefined = verifiedMeta?.fbp || undefined;
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
          const v = verifiedMeta?.[k];
          if (typeof v === "string" && v) utms[k] = String(v);
        }

        console.log("[omega webhook]", {
          id: txId,
          status: verifiedStatus,
          amount: verifiedAmount,
          hasFbc: !!fbc,
          hasFbp: !!fbp,
          utm_campaign: utms.utm_campaign,
          utm_source: utms.utm_source,
        });

        if (isPaid) {
          try {
            const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
            const { data: existing } = await supabaseAdmin
              .from("purchase_logs")
              .select("status, fbc, fbp, utm_source, utm_medium, utm_campaign, utm_content, utm_term, utm_id, fbclid, gclid, landing_url, referrer, raw_metadata")
              .eq("transaction_id", txId)
              .maybeSingle();
            const alreadyPaid =
              existing &&
              ["paid", "ok", "completed", "approved", "confirmed", "success"].includes(
                String(existing.status).toLowerCase(),
              );

            const mergedFbc = fbc || existing?.fbc || undefined;
            const mergedFbp = fbp || existing?.fbp || undefined;
            const mergedUtms: Record<string, string> = { ...utms };
            for (const k of utmKeys) {
              if (!mergedUtms[k] && typeof (existing as any)?.[k] === "string" && (existing as any)[k]) {
                mergedUtms[k] = (existing as any)[k];
              }
            }

            const { error } = await supabaseAdmin.from("purchase_logs").upsert(
              {
                transaction_id: txId,
                amount: verifiedAmount || null,
                currency: "BRL",
                status: "paid",
                fbc: mergedFbc ?? null,
                fbp: mergedFbp ?? null,
                utm_source: mergedUtms.utm_source ?? "organico",
                utm_medium: mergedUtms.utm_medium ?? null,
                utm_campaign: mergedUtms.utm_campaign ?? null,
                utm_content: mergedUtms.utm_content ?? null,
                utm_term: mergedUtms.utm_term ?? null,
                utm_id: mergedUtms.utm_id ?? null,
                fbclid: mergedUtms.fbclid ?? null,
                gclid: mergedUtms.gclid ?? null,
                landing_url: mergedUtms.landing_url ?? null,
                referrer: mergedUtms.referrer ?? null,
                raw_metadata: { ...(existing?.raw_metadata as any || {}), ...verifiedMeta },
              },
              { onConflict: "transaction_id" },
            );
            if (error) console.error("[omega webhook] purchase_logs upsert", error);

            if (!alreadyPaid) {
              const { sendCapiEvent } = await import("@/lib/fb-capi.server");
              const origin =
                process.env.PUBLIC_APP_URL?.replace(/\/$/, "") ||
                new URL(request.url).origin;
              await sendCapiEvent({
                event_name: "Purchase",
                event_id: `purchase-${txId}`,
                event_source_url: `${origin}/checkout`,
                user_data: {
                  client_ip_address:
                    request.headers.get("cf-connecting-ip") ||
                    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                    undefined,
                  client_user_agent: request.headers.get("user-agent") || undefined,
                  fbc: mergedFbc,
                  fbp: mergedFbp,
                },
                custom_data: {
                  value: verifiedAmount || 87,
                  currency: "BRL",
                  content_ids: [txId],
                  content_type: "product",
                  transaction_id: txId,
                  ...mergedUtms,
                },
              });
            }
          } catch (err) {
            console.error("[omega webhook] erro registrando purchase", err);
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
