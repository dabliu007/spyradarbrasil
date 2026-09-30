import { createFileRoute } from "@tanstack/react-router";

/**
 * Webhook AssetPay — POST /api/public/assetpay-webhook
 *
 * O corpo do webhook NÃO é confiável (qualquer um pode chamar esta URL).
 * Usamos apenas o ID da transação e re-consultamos GET /transactions/:id
 * na AssetPay para obter status e valor autoritativos.
 * Valores em CENTAVOS. Persistimos em REAIS.
 */
const PAID_STATUSES = ["paid", "ok", "completed", "approved", "confirmed", "success"];

function ok() {
  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

export const Route = createFileRoute("/api/public/assetpay-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();
        console.log("[assetpay webhook] body", rawBody.slice(0, 2000));
        let payload: any = {};
        try {
          payload = rawBody ? JSON.parse(rawBody) : {};
        } catch {
          return new Response("invalid json", { status: 400 });
        }

        const tx = payload?.data?.transaction ?? payload?.data ?? payload?.transaction ?? payload ?? {};
        const rawId = tx?.id ?? tx?.transactionId ?? tx?.transaction_id ?? payload?.objectId;
        const txId = typeof rawId === "string" || typeof rawId === "number" ? String(rawId).trim() : "";

        if (!txId || txId.length > 100) {
          console.warn("[assetpay webhook] sem id de transação", JSON.stringify(payload).slice(0, 400));
          return ok();
        }

        const { assetpayFetch, normalizeStatus } = await import("@/lib/pix.functions");

        let verified: any = null;
        try {
          const res = await assetpayFetch(`/transactions/${encodeURIComponent(txId)}`, {
            method: "GET",
            maxRetries: 2,
          });
          const json: any = await res.json().catch(() => ({}));
          if (res.ok) verified = json?.data ?? json;
          else console.error("[assetpay webhook] re-consulta HTTP", res.status, JSON.stringify(json).slice(0, 400));
        } catch (err) {
          console.error("[assetpay webhook] re-consulta falhou", err);
          // 500 faz a AssetPay reenviar o webhook mais tarde.
          return new Response("verification failed", { status: 500 });
        }

        if (!verified || normalizeStatus(verified?.status) !== "paid") return ok();

        const verifiedAmount = (Number(verified?.amount ?? 0) || 0) / 100;

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
          const finalAmount = Number((verifiedAmount || storedAmount || 0).toFixed(2));
          const alreadyPaid = existing && PAID_STATUSES.includes(String(existing.status).toLowerCase());

          const fbc: string | undefined = existing?.fbc || existingRaw?.fbc || undefined;
          const fbp: string | undefined = existing?.fbp || existingRaw?.fbp || undefined;
          const utmKeys = [
            "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "utm_id",
            "src", "sck", "xcod", "fbclid", "gclid", "landing_url", "referrer",
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
          if (error) console.error("[assetpay webhook] purchase_logs upsert", error);

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
            await sendUtmifyOrder({
              orderId: txId,
              status: "paid",
              amount: finalAmount,
              productId: txId,
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
            const origin = process.env.PUBLIC_APP_URL?.replace(/\/$/, "") || new URL(request.url).origin;
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
                value: finalAmount || undefined,
                currency: "BRL",
                content_ids: [txId],
                content_type: "product",
                transaction_id: txId,
                ...mergedUtms,
              },
            });
          }
        } catch (err) {
          console.error("[assetpay webhook] erro registrando purchase", err);
        }

        return ok();
      },
    },
  },
});
