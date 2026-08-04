import { createFileRoute } from "@tanstack/react-router";

/**
 * Webhook Vizzion Pay — POST /api/public/vizzion-webhook
 *
 * Re-consulta a transação pela API antes de marcar como paga (autoritativo).
 */
export const Route = createFileRoute("/api/public/vizzion-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();
        console.log("[vizzion webhook] body", rawBody.slice(0, 2000));
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
          console.warn("[vizzion webhook] sem transactionId", JSON.stringify(payload).slice(0, 400));
          return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        }

        const { normalizeStatus } = await import("@/lib/pix.functions");

        // 1) Trust the webhook body first — gateway is the source of truth.
        const eventType: string = String(
          payload?.event || payload?.type || payload?.eventType || tx?.event || "",
        ).toLowerCase();
        const bodyRawStatus = tx?.status ?? tx?.payment_status ?? payload?.status;
        let verifiedStatus = normalizeStatus(bodyRawStatus);
        if (verifiedStatus !== "paid" && /paid|approved|complete|success|captured|settled|authorized|confirmed/.test(eventType)) {
          verifiedStatus = "paid";
        }
        let verifiedAmount = Number(tx?.amount ?? payload?.amount ?? 0) || 0;
        let verifiedMeta: Record<string, any> =
          (tx?.metadata && typeof tx.metadata === "object" ? tx.metadata : {}) || {};

        console.log("[vizzion webhook] raw", {
          id: txId,
          eventType,
          bodyRawStatus,
          bodyStatus: verifiedStatus,
        });

        // 2) Fallback: re-consulta a API só se o body não confirmou pagamento.
        if (verifiedStatus !== "paid") {
          try {
            const pub = process.env.VIZZION_PUBLIC_KEY;
            const sec = process.env.VIZZION_SECRET_KEY;
            if (pub && sec) {
              const res = await fetch(
                `https://app.vizzionpay.com.br/api/v1/gateway/transactions?id=${encodeURIComponent(txId)}`,
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
              const apiStatus = normalizeStatus(inner?.status ?? inner?.payment_status);
              if (apiStatus === "paid") verifiedStatus = "paid";
              verifiedAmount = Number(inner?.amount ?? verifiedAmount) || verifiedAmount;
              if (inner?.metadata && typeof inner.metadata === "object") {
                verifiedMeta = { ...verifiedMeta, ...inner.metadata };
              }
            }
          } catch (err) {
            console.error("[vizzion webhook] re-consulta falhou", err);
          }
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
          "src",
          "sck",
          "xcod",
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

        console.log("[vizzion webhook]", {
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
              .select("status, amount, created_at, fbc, fbp, utm_source, utm_medium, utm_campaign, utm_content, utm_term, utm_id, fbclid, gclid, landing_url, referrer, raw_metadata")
              .eq("transaction_id", txId)
              .maybeSingle();
            const existingRaw = (existing?.raw_metadata as any) || {};
            const storedAmount = Number(existing?.amount ?? 0) || 0;
            const finalAmount = Number((storedAmount || verifiedAmount || 0).toFixed(2));
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
              if (!mergedUtms[k] && typeof existingRaw?.[k] === "string" && existingRaw[k]) {
                mergedUtms[k] = existingRaw[k];
              }
            }

            const { error } = await supabaseAdmin.from("purchase_logs").upsert(
              {
                transaction_id: txId,
                amount: finalAmount || null,
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
            if (error) console.error("[vizzion webhook] purchase_logs upsert", error);

            // Claim atômico — só um caller (polling OU webhook) envia à Utmify.
            const { data: utmifyClaim } = await supabaseAdmin
              .from("purchase_logs")
              .update({ utmify_paid_sent_at: new Date().toISOString() })
              .eq("transaction_id", txId)
              .is("utmify_paid_sent_at", null)
              .select("transaction_id")
              .maybeSingle();

            if (utmifyClaim) {
              const { sendUtmifyOrder } = await import("@/lib/utmify.server");
              // A integração nativa Vizzion↔Utmify usa o transactionId (txId) como orderId.
              // Usamos o MESMO txId aqui para a Utmify tratar como a mesma venda (update),
              // em vez de criar um pedido duplicado com o external_id (`cs-...`).
              const utmifyOrderId = String(txId);
              await sendUtmifyOrder({
                orderId: utmifyOrderId,
                status: "paid",
                amount: finalAmount,
                productId: utmifyOrderId,
                productName: (verifiedMeta as any)?.product_name || "Recupera Relacionamento: Acesso Anual",
                createdAt: (verifiedMeta as any)?.utmify_created_at || existing?.created_at || new Date(),
                approvedDate: new Date(),
                customer: {
                  name: (verifiedMeta as any)?.customer_name || existingRaw?.customer_name,
                  email: (verifiedMeta as any)?.customer_email || existingRaw?.customer_email,
                  phone: (verifiedMeta as any)?.customer_phone || existingRaw?.customer_phone || (verifiedMeta as any)?.ph || existingRaw?.ph,
                  document: (verifiedMeta as any)?.customer_document || existingRaw?.customer_document,
                  ip: (verifiedMeta as any)?.client_ip || existingRaw?.client_ip,
                },
                tracking: mergedUtms,
              });
            }

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
                  // Webhook é chamado pelo gateway, então o IP do request é do gateway.
                  // Usamos o IP/UA reais capturados na criação do PIX (raw_metadata).
                  client_ip_address: (verifiedMeta as any)?.client_ip || (existing?.raw_metadata as any)?.client_ip || undefined,
                  client_user_agent: (verifiedMeta as any)?.client_user_agent || (existing?.raw_metadata as any)?.client_user_agent || undefined,
                  fbc: mergedFbc,
                  fbp: mergedFbp,
                  ph: (verifiedMeta as any)?.ph || (existing?.raw_metadata as any)?.ph || undefined,
                  ge: (verifiedMeta as any)?.ge || (existing?.raw_metadata as any)?.ge || undefined,
                  country: (verifiedMeta as any)?.country || (existing?.raw_metadata as any)?.country || "br",
                  external_id: txId,
                },
                custom_data: {
                  value: finalAmount || 47,
                  currency: "BRL",
                  content_ids: [txId],
                  content_type: "product",
                  transaction_id: txId,
                  ...mergedUtms,
                },
              });
            }
          } catch (err) {
            console.error("[vizzion webhook] erro registrando purchase", err);
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
