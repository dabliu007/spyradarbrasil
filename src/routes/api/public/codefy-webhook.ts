import { createFileRoute } from "@tanstack/react-router";

/**
 * Webhook Codefy — POST /api/public/codefy-webhook
 *
 * Headers enviados pela Codefy:
 *  - Content-Type: application/json
 *  - X-CodeFy-Signature: sha256=<hmac_sha256_do_payload>
 *  - X-CodeFy-Event: transaction.paid | transaction.expired | transaction.refunded
 *
 * Body:
 *  { id, external_id, status, amount, paid_at }
 */
export const Route = createFileRoute("/api/public/codefy-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();
        console.log("[codefy webhook] body", rawBody.slice(0, 2000));
        let payload: any = {};
        try {
          payload = rawBody ? JSON.parse(rawBody) : {};
        } catch {
          return new Response("invalid json", { status: 400 });
        }

        const tx = payload?.transaction ?? payload?.data ?? payload ?? {};
        const txId: string | undefined =
          tx?.id || tx?.transactionId || tx?.transaction_id || payload?.id;

        if (!txId) {
          console.warn("[codefy webhook] sem transactionId", JSON.stringify(payload).slice(0, 400));
          return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        }

        const { normalizeStatus } = await import("@/lib/pix.functions");

        const eventType: string = String(
          request.headers.get("x-codefy-event") ||
            payload?.event ||
            payload?.type ||
            "",
        ).toLowerCase();
        const bodyRawStatus = tx?.status ?? payload?.status;
        let verifiedStatus = normalizeStatus(bodyRawStatus);
        if (
          verifiedStatus !== "paid" &&
          /paid|approved|complete|success|captured|settled|authorized|confirmed/.test(eventType)
        ) {
          verifiedStatus = "paid";
        }
        // Codefy envia amount em REAIS
        let verifiedAmount = Number(tx?.amount ?? payload?.amount ?? 0) || 0;

        console.log("[codefy webhook] raw", {
          id: txId,
          eventType,
          bodyRawStatus,
          bodyStatus: verifiedStatus,
        });

        // Fallback: re-consulta a API se o body não confirmou pagamento.
        if (verifiedStatus !== "paid") {
          try {
            const publicKey = process.env.CODEFY_PUBLIC_KEY;
            const secretKey = process.env.CODEFY_SECRET_KEY;
            if (publicKey && secretKey) {
              const res = await fetch(
                `https://usecodefy.com/api/v1/gateway/transactions/${encodeURIComponent(txId)}`,
                {
                  method: "GET",
                  headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${secretKey}`,
                    "x-public-key": publicKey,
                    "x-secret-key": secretKey,
                  },
                },
              );
              const json: any = await res.json().catch(() => ({}));
              const inner = json?.transaction ?? json?.data ?? json;
              const apiStatus = normalizeStatus(inner?.status);
              if (apiStatus === "paid") verifiedStatus = "paid";
              verifiedAmount = Number(inner?.amount ?? verifiedAmount) || verifiedAmount;
            }
          } catch (err) {
            console.error("[codefy webhook] re-consulta falhou", err);
          }
        }

        const isPaid = verifiedStatus === "paid";

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
            if (error) console.error("[codefy webhook] purchase_logs upsert", error);

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
              const utmifyOrderId = String(txId);
              await sendUtmifyOrder({
                orderId: utmifyOrderId,
                status: "paid",
                amount: finalAmount,
                productId: utmifyOrderId,
                productName: existingRaw?.product_name || "Recupera Relacionamento: Acesso Anual",
                createdAt: existingRaw?.utmify_created_at || existing?.created_at || new Date(),
                approvedDate: tx?.paid_at || new Date(),
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
            console.error("[codefy webhook] erro registrando purchase", err);
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
