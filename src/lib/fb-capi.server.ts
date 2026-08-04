/**
 * Facebook Conversions API (CAPI) — server-side.
 * Dedupe com o Pixel via `event_id`.
 *
 * Secrets:
 *   - FB_PIXEL_ID
 *   - FB_CAPI_ACCESS_TOKEN
 *   - FB_TEST_EVENT_CODE (opcional)
 */

import { createHash } from "crypto";

const API_VERSION = "v19.0";

type CapiUserData = {
  client_ip_address?: string;
  client_user_agent?: string;
  fbp?: string;
  fbc?: string;
  em?: string;
  ph?: string;
  fn?: string;
  ln?: string;
  ge?: string;          // gênero: "m" | "f"
  db?: string;          // data de nascimento YYYYMMDD
  ct?: string;          // cidade
  st?: string;          // estado (sigla)
  zp?: string;          // CEP
  country?: string;     // país (ISO-2)
  external_id?: string;
};

type CapiCustomData = {
  value?: number;
  currency?: string;
  content_ids?: string[];
  content_type?: string;
  transaction_id?: string;
} & Record<string, any>;

type SendCapiEventInput = {
  event_name: "Purchase" | "InitiateCheckout" | "Lead" | "PageView" | string;
  event_id: string;
  event_source_url?: string;
  user_data?: CapiUserData;
  custom_data?: CapiCustomData;
};

function sha256(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

/** E.164 sem "+". Adiciona 55 (BR) se não houver código de país. */
function normalizePhoneE164(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("55") && digits.length >= 12) return digits;
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  return digits;
}

/**
 * Seleciona o melhor IP do cliente, preferindo IPv6 quando disponível.
 * Meta recomenda IPv6 — melhora a qualidade da correspondência.
 */
export function pickBestClientIp(headers: Headers): string | undefined {
  const v6 = headers.get("cf-connecting-ipv6")?.trim();
  if (v6) return v6;

  const xff = (headers.get("x-forwarded-for") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // Preferência por IPv6 dentro da cadeia XFF.
  const v6inXff = xff.find((ip) => ip.includes(":") && !ip.includes("."));
  if (v6inXff) return v6inXff;

  const cf = headers.get("cf-connecting-ip")?.trim();
  if (cf) return cf;

  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  return xff[0];
}

function normalizeUserData(u: CapiUserData = {}) {
  const out: Record<string, any> = {};
  if (u.client_ip_address) out.client_ip_address = u.client_ip_address;
  if (u.client_user_agent) out.client_user_agent = u.client_user_agent;
  if (u.fbp) out.fbp = u.fbp;
  if (u.fbc) out.fbc = u.fbc;
  if (u.em) out.em = [sha256(u.em)];
  if (u.ph) {
    const ph = normalizePhoneE164(u.ph);
    if (ph) out.ph = [sha256(ph)];
  }
  if (u.fn) out.fn = [sha256(u.fn)];
  if (u.ln) out.ln = [sha256(u.ln)];
  if (u.ge) out.ge = [sha256(u.ge.charAt(0))];
  if (u.db) out.db = [sha256(u.db.replace(/\D/g, ""))];
  if (u.ct) out.ct = [sha256(u.ct.replace(/\s+/g, ""))];
  if (u.st) out.st = [sha256(u.st.replace(/\s+/g, ""))];
  if (u.zp) out.zp = [sha256(u.zp.replace(/\D/g, ""))];
  if (u.country) out.country = [sha256(u.country)];
  if (u.external_id) out.external_id = [sha256(u.external_id.replace(/\D/g, "") || u.external_id)];
  return out;
}

export async function sendCapiEvent(input: SendCapiEventInput): Promise<{ ok: boolean; status: number; body?: any }> {
  const pixelId = process.env.FB_PIXEL_ID;
  const accessToken = process.env.FB_CAPI_ACCESS_TOKEN;
  const testEventCode = process.env.FB_TEST_EVENT_CODE;

  if (!pixelId || !accessToken) {
    console.warn("[fb-capi] secrets ausentes — evento não enviado", {
      event: input.event_name,
      event_id: input.event_id,
      hasPixel: !!pixelId,
      hasToken: !!accessToken,
    });
    return { ok: false, status: 0 };
  }

  const payload: Record<string, any> = {
    data: [
      {
        event_name: input.event_name,
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.event_id,
        action_source: "website",
        event_source_url: input.event_source_url,
        user_data: normalizeUserData(input.user_data),
        custom_data: input.custom_data ?? {},
      },
    ],
  };
  if (testEventCode) payload.test_event_code = testEventCode;

  const url = `https://graph.facebook.com/${API_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("[fb-capi] envio falhou", res.status, JSON.stringify(body).slice(0, 600));
    } else {
      console.log("[fb-capi] evento enviado", {
        event: input.event_name,
        event_id: input.event_id,
        status: res.status,
        ip_kind: input.user_data?.client_ip_address?.includes(":") ? "ipv6" : "ipv4",
      });
    }
    return { ok: res.ok, status: res.status, body };
  } catch (err) {
    console.error("[fb-capi] erro de rede", err);
    return { ok: false, status: 0 };
  }
}
