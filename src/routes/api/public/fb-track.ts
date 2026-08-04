import { createFileRoute } from "@tanstack/react-router";

/**
 * Relay de eventos do navegador para a Conversions API.
 * Mesmo domínio → bypassa adblockers.
 * Dedupe com o Pixel via mesmo `event_id`.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const Route = createFileRoute("/api/public/fb-track")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),
      POST: async ({ request }) => {
        let body: any = {};
        try {
          body = await request.json();
        } catch {
          return new Response("invalid json", { status: 400, headers: corsHeaders });
        }

        const {
          event_name,
          event_id,
          event_source_url,
          fbc,
          fbp,
          value,
          currency,
          content_ids,
          content_type,
          transaction_id,
          email,
          phone,
          first_name,
          last_name,
          gender,
          dob,
          city,
          state,
          zip,
          country,
          external_id,
          utms,
        } = body ?? {};

        if (!event_name || !event_id) {
          return new Response("missing event_name or event_id", {
            status: 400,
            headers: corsHeaders,
          });
        }

        try {
          const { sendCapiEvent, pickBestClientIp } = await import("@/lib/fb-capi.server");
          const ip = pickBestClientIp(request.headers);

          const cleanUtms: Record<string, string> = {};
          if (utms && typeof utms === "object") {
            for (const [k, v] of Object.entries(utms)) {
              if (typeof v === "string" && v) cleanUtms[k] = v;
            }
          }

          await sendCapiEvent({
            event_name,
            event_id,
            event_source_url,
            user_data: {
              client_ip_address: ip,
              client_user_agent: request.headers.get("user-agent") || undefined,
              fbc,
              fbp,
              em: email,
              ph: phone,
              fn: first_name,
              ln: last_name,
              ge: gender,
              db: dob,
              ct: city,
              st: state,
              zp: zip,
              country: country || "br",
              external_id,
            },
            custom_data: {
              value,
              currency,
              content_ids,
              content_type,
              transaction_id,
              ...cleanUtms,
            },
          });
        } catch (err) {
          console.error("[fb-track] falha CAPI", err);
        }

        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "content-type": "application/json", ...corsHeaders },
        });
      },
    },
  },
});
