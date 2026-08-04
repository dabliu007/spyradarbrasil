import { createFileRoute } from "@tanstack/react-router";

/**
 * Webhook Millions Pay — POST /api/public/millions-webhook
 *
 * Eventos: charge.captured, charge.pending, charge.failed, charge.expired, etc.
 * Re-consulta a cobrança pela API antes de marcar como paga (autoritativo).
 */
export const Route = createFileRoute("/api/public/millions-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();
        console.log("[millions webhook] body", rawBody.slice(0, 2000));
        let payload: any = {};
        try {
          payload = rawBody ? JSON.parse(rawBody) : {};
        } catch {
          return new Response("invalid json", { status: 400 });
        }

        const charge = payload?.charge ?? payload?.data ?? payload ?? {};
        const txId: string | undefined = charge?.id || charge?.charge_id || payload?.id;

        if (!txId) {
          console.warn("[millions webhook] sem id", JSON.stringify(payload).slice(0, 400));
          return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        }

        const { normalizeStatus } = await import("@/lib/pix.functions");

        const eventType: string = String(payload?.event || payload?.type || "").toLowerCase();
        const bodyRawStatus = charge?.status;
        let verifiedStatus = normalizeStatus(bodyRawStatus);
        if (verifiedStatus !== "paid" && /captured|paid|approved|complete|success|confirmed/.test(eventType)) {
          verifiedStatus = "paid";
        }
        let verifiedAmountCents = Number(charge?.total_amount ?? charge?.amount ?? 0) || 0;
        let verifiedMeta: Record<string, any> =
          (charge?.metadata && typeof charge.metadata === "object" ? charge.metadata : {}) || {};

        console.log("[millions webhook] raw", {
          id: txId,
          eventType,
          bodyRawStatus,
          bodyStatus: verifiedStatus,
        });

        // Fallback: re-consulta a API só se o body não confirmou pagamento.
        if (verifiedStatus !== "paid") {
          try {
            const pub = process.env.MILLIONS_PUBLIC_KEY;
            const sec = process.env.MILLIONS_SECRET_KEY;
            if (pub && sec) {
              const auth = `Basic ${Buffer.from(`${pub}:${sec}`).toString("base64")}`;
              const res = await fetch(
                `https://api.millionspay.io/v1/charges/${encodeURIComponent(txId)}`,
                { method: "GET", headers: { Accept: "application/json", Authorization: auth } },
              );
              const json: any = await res.json().catch(() => ({}));
              const inner = json?.data ?? json ?? {};
              const apiStatus = normalizeStatus(inner?.status);
              if (apiStatus === "paid") verifiedStatus = "paid";
              verifiedAmountCents =
                Number(inner?.total_amount ?? inner?.amount ?? verifiedAmountCents) || verifiedAmountCents;
              if (inner?.metadata && typeof inner.metadata === "object") {
                verifiedMeta = { ...verifiedMeta, ...inner.metadata };
              }
            }
          } catch (err) {
            console.error("[millions webhook] re-consulta falhou", err);
          }
        }

        const isPaid = verifiedStatus === "paid";
        const verifiedAmount = verifiedAmountCents ? verifiedAmountCents / 100 : 0;

        const fbc: string | undefined = verifiedMeta?.fbc || undefined;
        const fbp: string | undefined = verifiedMeta?.fbp || undefined;
        const utmKeys = [
          "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
          "utm_id", "fbclid", "gclid", "landing_url", "referrer",
        ] as const;
        const utms: Record<string, string> = {};
        for (const k of utmKeys) {
          const v = verifiedMeta?.[k];
          if (typeof v === "string" && v) utms[k] = String(v);
        }

        console.log("[millions webhook]", {
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
              ["paid", "ok", "completed", "captured", "approved", "confirmed", "success"].includes(
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
            if (error) console.error("[millions webhook] purchase_logs upsert", error);

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
                    (verifiedMeta as any)?.client_ip ||
                    (existing?.raw_metadata as any)?.client_ip || undefined,
                  client_user_agent:
                    (verifiedMeta as any)?.client_user_agent ||
                    (existing?.raw_metadata as any)?.client_user_agent || undefined,
                  fbc: mergedFbc,
                  fbp: mergedFbp,
                  ph: (verifiedMeta as any)?.ph || (existing?.raw_metadata as any)?.ph || undefined,
                  ge: (verifiedMeta as any)?.ge || (existing?.raw_metadata as any)?.ge || undefined,
                  country:
                    (verifiedMeta as any)?.country ||
                    (existing?.raw_metadata as any)?.country || "br",
                  external_id: txId,
                },
                custom_data: {
                  value: verifiedAmount || 197,
                  currency: "BRL",
                  content_ids: [txId],
                  content_type: "product",
                  transaction_id: txId,
                  ...mergedUtms,
                },
              });
            }
          } catch (err) {
            console.error("[millions webhook] erro registrando purchase", err);
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
