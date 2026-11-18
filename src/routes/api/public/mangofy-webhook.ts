import { createFileRoute } from "@tanstack/react-router";

/**
 * Webhook Mangofy — POST /api/public/mangofy-webhook
 *
 * O webhook não confia no status informado no payload. Usa o código apenas
 * para localizar uma cobrança criada pela aplicação e reconsulta o pagamento
 * na Mangofy antes de registrar a confirmação.
 *
 * Valores em CENTAVOS. Persistimos em REAIS.
 */
export const Route = createFileRoute("/api/public/mangofy-webhook")({
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

        const tx = payload?.data ?? payload ?? {};
        const rawId = tx?.payment_code ?? payload?.payment_code;
        const txId = typeof rawId === "string" ? rawId.trim() : "";

        if (!/^[\w-]{4,90}$/.test(txId)) {
          console.warn("[mangofy webhook] sem id de transação", JSON.stringify(payload).slice(0, 400));
          return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        }

        // Só processa pagamentos criados por este checkout.
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data: ownedCharge, error } = await supabaseAdmin
            .from("purchase_logs")
            .select("transaction_id")
            .eq("transaction_id", txId)
            .maybeSingle();
          if (error || !ownedCharge) {
            console.warn("[mangofy webhook] cobrança não localizada", txId);
            return new Response(JSON.stringify({ received: true }), {
              status: 200,
              headers: { "content-type": "application/json" },
            });
          }
        } catch (err) {
          console.error("[mangofy webhook] não foi possível localizar a cobrança", err);
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
          const apiKey = process.env.MANGOFY_API_KEY?.trim();
          const storeCode = process.env.MANGOFY_STORE_CODE?.trim();
          if (apiKey && storeCode) {
            const baseUrl = (process.env.MANGOFY_BASE_URL || "https://checkout.mangofy.com.br").replace(/\/+$/, "");
            const res = await fetch(
              `${baseUrl}/api/v1/payment/${encodeURIComponent(txId)}`,
              {
                method: "GET",
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                  Authorization: apiKey,
                  "Store-Code": storeCode,
                },
                signal: AbortSignal.timeout(15_000),
              },
            );
            const json: any = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(`Falha ao consultar Mangofy (HTTP ${res.status})`);
            const inner = json?.data ?? json;
            if (String(inner?.payment_code ?? "") !== txId) {
              throw new Error("A transação consultada não corresponde ao webhook.");
            }
            const { normalizeStatus } = await import("@/lib/pix.functions");
            verifiedStatus = normalizeStatus(inner?.payment_status);
            verifiedAmountCents = Number(inner?.payment_amount ?? 0) || 0;
            paidAt = inner?.approved_at ?? null;
            console.log("[mangofy webhook] reconsulta", {
              id: txId,
              rawStatus: inner?.payment_status,
              verifiedStatus,
            });
          } else {
            console.error("[mangofy webhook] credenciais ausentes — não é possível confirmar pagamento");
          }
        } catch (err) {
          console.error("[mangofy webhook] reconsulta falhou", err);
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
            if (error) console.error("[mangofy webhook] purchase_logs upsert", error);

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
            console.error("[mangofy webhook] erro registrando purchase", err);
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
