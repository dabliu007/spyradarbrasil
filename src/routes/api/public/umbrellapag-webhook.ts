import { createFileRoute } from "@tanstack/react-router";

/**
 * Webhook Umbrella Pag — POST /api/public/umbrellapag-webhook
 *
 * O formato exato do payload de notificação da Umbrella Pag não está
 * documentado com confiança (a documentação divergiu da API real em outros
 * pontos já confirmados por teste). Por isso, este webhook NUNCA confia no
 * conteúdo do corpo para decidir se a transação foi paga: ele apenas extrai
 * o id da transação do payload (em qualquer formato razoável) e sempre
 * reconsulta GET /user/transactions/:id na própria Umbrella Pag — essa é a
 * fonte de verdade autoritativa.
 *
 * Valores em CENTAVOS. Persistimos em REAIS.
 */
export const Route = createFileRoute("/api/public/umbrellapag-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();
        console.log("[umbrellapag webhook] raw body completo:", rawBody);
        let payload: any = {};
        try {
          payload = rawBody ? JSON.parse(rawBody) : {};
        } catch {
          return new Response("invalid json", { status: 400 });
        }

        const tx = payload?.data?.transaction ?? payload?.data ?? payload?.transaction ?? payload ?? {};
        const txId: string | undefined =
          tx?.id ||
          tx?.transactionId ||
          payload?.id ||
          payload?.transactionId ||
          payload?.objectId;

        if (!txId) {
          console.warn("[umbrellapag webhook] sem id de transação", JSON.stringify(payload).slice(0, 400));
          return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        }

        // Reconsulta autoritativa: nunca confia no status enviado pelo webhook.
        let verifiedStatus: string = "pending";
        let verifiedAmountCents = 0;
        let paidAt: string | null = null;
        try {
          const apiKey = process.env.UMBRELLAPAG_API_KEY;
          if (apiKey) {
            const res = await fetch(
              `https://api-gateway.umbrellapag.com/api/user/transactions/${encodeURIComponent(txId)}`,
              {
                method: "GET",
                headers: {
                  Accept: "application/json",
                  "User-Agent": "UMBRELLAB2B/1.0",
                  "x-api-key": apiKey,
                },
              },
            );
            const json: any = await res.json().catch(() => ({}));
            const inner = json?.data ?? json;
            const { normalizeStatus } = await import("@/lib/pix.functions");
            verifiedStatus = normalizeStatus(inner?.status);
            verifiedAmountCents = Number(inner?.amount ?? 0) || 0;
            paidAt = inner?.paidAt ?? null;
            console.log("[umbrellapag webhook] reconsulta", {
              id: txId,
              rawStatus: inner?.status,
              verifiedStatus,
            });
          } else {
            console.error("[umbrellapag webhook] UMBRELLAPAG_API_KEY ausente — não é possível confirmar pagamento");
          }
        } catch (err) {
          console.error("[umbrellapag webhook] reconsulta falhou", err);
        }

        const isPaid = verifiedStatus === "paid";
        const verifiedAmount = verifiedAmountCents / 100; // reais

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
            if (error) console.error("[umbrellapag webhook] purchase_logs upsert", error);

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
                approvedDate: paidAt || new Date(),
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
                  value: finalAmount || 87,
                  currency: "BRL",
                  content_ids: [txId],
                  content_type: "product",
                  transaction_id: txId,
                  ...mergedUtms,
                },
              });
            }
          } catch (err) {
            console.error("[umbrellapag webhook] erro registrando purchase", err);
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
