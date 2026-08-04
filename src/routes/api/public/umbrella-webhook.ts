import { createFileRoute } from "@tanstack/react-router";

/**
 * Webhook Umbrella Pag — POST /api/public/umbrella-webhook
 *
 * Re-consulta a transação pela API (autoritativo) antes de marcar como paga.
 * Valores em CENTAVOS. Persistimos em REAIS.
 */
export const Route = createFileRoute("/api/public/umbrella-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();
        console.log("[umbrella webhook] body", rawBody.slice(0, 2000));
        let payload: any = {};
        try {
          payload = rawBody ? JSON.parse(rawBody) : {};
        } catch {
          return new Response("invalid json", { status: 400 });
        }

        const tx =
          payload?.data?.transaction ??
          payload?.data ??
          payload?.transaction ??
          payload ?? {};
        const txId: string | undefined = String(
          tx?.id ?? tx?.transactionId ?? tx?.transaction_id ?? payload?.id ?? "",
        ) || undefined;

        if (!txId) {
          console.warn("[umbrella webhook] sem id", JSON.stringify(payload).slice(0, 400));
          return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        }

        const { normalizeStatus } = await import("@/lib/pix.functions");

        const eventType: string = String(
          request.headers.get("x-webhook-event") ||
            payload?.event ||
            payload?.type ||
            payload?.eventType ||
            "",
        ).toLowerCase();
        const bodyRawStatus = tx?.status ?? payload?.status;
        let verifiedStatus = normalizeStatus(bodyRawStatus);
        if (
          verifiedStatus !== "paid" &&
          /paid|pago|approved|complete|success|captured|settled|authorized|confirmed/.test(eventType)
        ) {
          verifiedStatus = "paid";
        }
        let verifiedAmountCents = Number(tx?.amount ?? payload?.amount ?? 0) || 0;

        console.log("[umbrella webhook] raw", {
          id: txId,
          eventType,
          bodyRawStatus,
          bodyStatus: verifiedStatus,
        });

        // Fallback: re-consulta a API caso o body não confirme
        if (verifiedStatus !== "paid") {
          try {
            const token = process.env.UMBRELLA_API_TOKEN;
            if (token) {
              const res = await fetch(
                `https://api-gateway.umbrellapag.com/api/user/transactions/${encodeURIComponent(txId)}`,
                {
                  method: "GET",
                  headers: {
                    Accept: "application/json",
                    "x-api-key": token,
                    "User-Agent": "UMBRELLAB2B/1.0",
                    Origin: "https://whatsradar.com",
                    Referer: "https://whatsradar.com/checkout",
                  },
                },
              );
              const json: any = await res.json().catch(() => ({}));
              const inner = json?.data ?? json;
              const apiStatus = normalizeStatus(inner?.status);
              if (apiStatus === "paid") verifiedStatus = "paid";
              verifiedAmountCents =
                Number(inner?.amount ?? verifiedAmountCents) || verifiedAmountCents;
            }
          } catch (err) {
            console.error("[umbrella webhook] re-consulta falhou", err);
          }
        }

        const isPaid = verifiedStatus === "paid";
        const isPending = verifiedStatus === "pending";
        const verifiedAmount = verifiedAmountCents / 100;

        // ============ PIX GERADO → Utmify waiting_payment ============
        if (isPending) {
          try {
            const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
            const { data: existing } = await supabaseAdmin
              .from("purchase_logs")
              .select("amount, created_at, utm_source, utm_medium, utm_campaign, utm_content, utm_term, utm_id, fbclid, gclid, landing_url, referrer, raw_metadata")
              .eq("transaction_id", txId)
              .maybeSingle();
            const existingRaw = (existing?.raw_metadata as any) || {};

            // Extrai info do body do webhook como fallback
            const customer = tx?.customer || {};
            const payer = tx?.payer || {};
            const metaFromBody = (() => {
              try { return typeof tx?.metadata === "string" ? JSON.parse(tx.metadata) : (tx?.metadata || {}); }
              catch { return {}; }
            })();

            const mergedUtms: Record<string, string> = {};
            const utmKeys = ["utm_source","utm_medium","utm_campaign","utm_content","utm_term","utm_id","fbclid","gclid","landing_url","referrer"] as const;
            for (const k of utmKeys) {
              const v = (existing as any)?.[k] ?? existingRaw?.[k] ?? metaFromBody?.[k];
              if (typeof v === "string" && v) mergedUtms[k] = v;
            }
            if (!mergedUtms.utm_source) mergedUtms.utm_source = "organico";

            const amountReais = verifiedAmountCents
              ? verifiedAmountCents / 100
              : Number(existing?.amount ?? 0) || 0;

            // Grava/atualiza purchase_logs como pending
            await supabaseAdmin.from("purchase_logs").upsert(
              {
                transaction_id: txId,
                amount: amountReais || null,
                currency: "BRL",
                status: "pending",
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
                raw_metadata: { ...metaFromBody, ...existingRaw },
              },
              { onConflict: "transaction_id" },
            );

            // Claim atômico para não duplicar
            const { data: waitingClaim } = await supabaseAdmin
              .from("purchase_logs")
              .update({ utmify_waiting_sent_at: new Date().toISOString() })
              .eq("transaction_id", txId)
              .is("utmify_waiting_sent_at", null)
              .select("transaction_id")
              .maybeSingle();

            if (waitingClaim) {
              const { sendUtmifyOrder } = await import("@/lib/utmify.server");
              await sendUtmifyOrder({
                orderId: String(txId),
                status: "waiting_payment",
                amount: amountReais,
                productId: String(txId),
                productName:
                  tx?.items?.[0]?.title ||
                  existingRaw?.product_name ||
                  metaFromBody?.product_name ||
                  "Recupera Relacionamento: Acesso Anual",
                createdAt: tx?.createdAt || existing?.created_at || new Date(),
                customer: {
                  name: customer.name || payer.name || existingRaw?.customer_name,
                  email: customer.email || existingRaw?.customer_email,
                  phone: customer.phone || existingRaw?.customer_phone || existingRaw?.ph || metaFromBody?.ph,
                  document:
                    customer?.document?.number ||
                    payer?.documentNumber ||
                    existingRaw?.customer_document,
                  ip: metaFromBody?.client_ip || existingRaw?.client_ip || tx?.ip,
                },
                tracking: mergedUtms,
              });
            }
          } catch (err) {
            console.error("[umbrella webhook] erro waiting_payment", err);
          }
        }

        if (isPaid) {
          try {
            const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
            const { data: existing } = await supabaseAdmin
              .from("purchase_logs")
              .select(
                "status, amount, created_at, fbc, fbp, utm_source, utm_medium, utm_campaign, utm_content, utm_term, utm_id, fbclid, gclid, landing_url, referrer, raw_metadata",
              )
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

            const fbc: string | undefined = existing?.fbc || existingRaw?.fbc || undefined;
            const fbp: string | undefined = existing?.fbp || existingRaw?.fbp || undefined;
            const utmKeys = [
              "utm_source","utm_medium","utm_campaign","utm_content","utm_term","utm_id",
              "src","sck","xcod","fbclid","gclid","landing_url","referrer",
            ] as const;
            const mergedUtms: Record<string, string> = {};
            for (const k of utmKeys) {
              const v = (existing as any)?.[k] ?? existingRaw?.[k];
              if (typeof v === "string" && v) mergedUtms[k] = v;
            }

            const { error } = await supabaseAdmin.from("purchase_logs").upsert(
              {
                transaction_id: txId,
                amount: finalAmount || null,
                currency: "BRL",
                status: "paid",
                fbc: fbc ?? null,
                fbp: fbp ?? null,
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
                raw_metadata: existingRaw,
              },
              { onConflict: "transaction_id" },
            );
            if (error) console.error("[umbrella webhook] purchase_logs upsert", error);

            // Claim atômico Utmify
            const { data: utmifyClaim } = await supabaseAdmin
              .from("purchase_logs")
              .update({ utmify_paid_sent_at: new Date().toISOString() })
              .eq("transaction_id", txId)
              .is("utmify_paid_sent_at", null)
              .select("transaction_id")
              .maybeSingle();

            if (utmifyClaim) {
              const { sendUtmifyOrder } = await import("@/lib/utmify.server");
              const utmifyOrderId = String(txId);
              await sendUtmifyOrder({
                orderId: utmifyOrderId,
                status: "paid",
                amount: finalAmount,
                productId: utmifyOrderId,
                productName: existingRaw?.product_name || "Recupera Relacionamento: Acesso Anual",
                createdAt: existingRaw?.utmify_created_at || existing?.created_at || new Date(),
                approvedDate: new Date(),
                customer: {
                  name: existingRaw?.customer_name,
                  email: existingRaw?.customer_email,
                  phone: existingRaw?.customer_phone || existingRaw?.ph,
                  document: existingRaw?.customer_document,
                  ip: existingRaw?.client_ip,
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
                  client_ip_address: existingRaw?.client_ip || undefined,
                  client_user_agent: existingRaw?.client_user_agent || undefined,
                  fbc,
                  fbp,
                  ph: existingRaw?.ph || undefined,
                  ge: existingRaw?.ge || undefined,
                  country: existingRaw?.country || "br",
                  external_id: txId,
                },
                custom_data: {
                  value: finalAmount || 197,
                  currency: "BRL",
                  content_ids: [txId],
                  content_type: "product",
                  transaction_id: txId,
                  ...mergedUtms,
                },
              });
            }
          } catch (err) {
            console.error("[umbrella webhook] erro registrando purchase", err);
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
