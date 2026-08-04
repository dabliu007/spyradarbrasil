import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

/**
 * Webhook NexusPag — POST /api/public/nexuspag-webhook
 *
 * Header de assinatura: x-nexuspag-signature: t=<unix>,v1=<hex>
 * HMAC-SHA256 sobre "<unix>.<body_cru>" usando NEXUSPAG_WEBHOOK_SECRET.
 * Janela anti-replay: 5 minutos.
 */
export const Route = createFileRoute("/api/public/nexuspag-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();
        const sigHeader = request.headers.get("x-nexuspag-signature") ?? "";
        const secret = process.env.NEXUSPAG_WEBHOOK_SECRET;

        if (secret) {
          const parts = Object.fromEntries(
            sigHeader.split(",").map((p) => {
              const [k, ...rest] = p.trim().split("=");
              return [k, rest.join("=")];
            }),
          );
          const t = parts["t"];
          const v1 = parts["v1"];
          if (!t || !v1) return new Response("missing signature", { status: 401 });

          const ts = Number(t);
          if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > 300) {
            return new Response("stale signature", { status: 401 });
          }

          const expected = createHmac("sha256", secret).update(`${t}.${rawBody}`).digest("hex");
          const a = Buffer.from(expected, "hex");
          const b = Buffer.from(v1, "hex");
          if (a.length !== b.length || !timingSafeEqual(a, b)) {
            return new Response("invalid signature", { status: 401 });
          }
        } else {
          console.warn("[nexuspag webhook] NEXUSPAG_WEBHOOK_SECRET não configurado");
        }

        let payload: any = {};
        try {
          payload = rawBody ? JSON.parse(rawBody) : {};
        } catch {
          return new Response("invalid json", { status: 400 });
        }

        const tx = payload?.transaction ?? payload?.data ?? payload ?? {};
        const txId: string | undefined = tx?.id || tx?.txid || tx?.external_id;
        const rawStatus = String(tx?.status ?? "").toLowerCase();
        const isPaid = ["paid", "completed", "approved", "success", "confirmed"].includes(rawStatus);
        const amount = Number(tx?.amount ?? tx?.net_amount ?? 0) || 0;
        const meta = tx?.metadata || payload?.metadata || {};
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

        console.log("[nexuspag webhook]", {
          id: txId,
          status: rawStatus,
          amount,
          hasFbc: !!fbc,
          hasFbp: !!fbp,
          utm_campaign: utms.utm_campaign,
          utm_source: utms.utm_source,
        });

        if (isPaid && txId) {
          try {
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
                fbc,
                fbp,
              },
              custom_data: {
                value: amount || 87,
                currency: "BRL",
                content_ids: [txId],
                content_type: "product",
                transaction_id: txId,
                ...utms,
              },
            });
          } catch (err) {
            console.error("[nexuspag webhook] falha CAPI", err);
          }


          // Log da compra em purchase_logs (UTMs do comprador).
          try {
            const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
            const { error } = await supabaseAdmin
              .from("purchase_logs")
              .upsert(
                {
                  transaction_id: txId,
                  amount: amount || null,
                  currency: "BRL",
                  status: rawStatus,
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
            if (error) console.error("[nexuspag webhook] purchase_logs insert", error);
          } catch (err) {
            console.error("[nexuspag webhook] purchase_logs erro", err);
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
