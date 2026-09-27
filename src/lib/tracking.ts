// Facebook Pixel + UTM tracking helpers (client-side only).
//
// - Pixel base é injetado em src/routes/__root.tsx (script inline no <head>).
// - Aqui guardamos UTMs/fbclid no localStorage e expomos `fbqTrack` para
//   disparar eventos com `eventID` (dedupe com CAPI).

export const FB_PIXEL_ID = "1582505587003439";
export const FB_PIXEL_ID_2 = "1298162017522804";
export const FB_PIXEL_ID_3 = "4429752110611862";
// fbq('track') sem trackSingle dispara para todos os pixels inicializados.
export const FB_PIXEL_IDS = [FB_PIXEL_ID, FB_PIXEL_ID_2, FB_PIXEL_ID_3];

const UTM_KEY = "zr_utms_v1";
const UTM_FIELDS = [
  "src",
  "sck",
  "xcod",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "utm_id",
  "fbclid",
  "gclid",
] as const;

export type Utms = Partial<Record<(typeof UTM_FIELDS)[number], string>> & {
  landing_url?: string;
  referrer?: string;
  captured_at?: string;
};

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

export function capturePersistedUtms(): Utms {
  if (typeof window === "undefined") return {};
  try {
    const existing = getPersistedUtms();
    const url = new URL(window.location.href);
    const incoming: Utms = {};
    for (const key of UTM_FIELDS) {
      const v = url.searchParams.get(key);
      if (v) incoming[key] = v;
    }
    if (incoming.fbclid && !incoming.utm_source) {
      incoming.utm_source = "facebook";
      incoming.utm_medium = incoming.utm_medium || "paid";
    }
    const hasIncoming = Object.keys(incoming).length > 0;
    const merged: Utms = hasIncoming
      ? {
          ...incoming,
          landing_url: window.location.href,
          referrer: document.referrer || undefined,
          captured_at: new Date().toISOString(),
        }
      : existing;

    if (hasIncoming) {
      localStorage.setItem(UTM_KEY, JSON.stringify(merged));
    } else if (!existing.captured_at) {
      const seed: Utms = {
        landing_url: window.location.href,
        referrer: document.referrer || undefined,
        captured_at: new Date().toISOString(),
      };
      localStorage.setItem(UTM_KEY, JSON.stringify(seed));
      return seed;
    }
    return merged;
  } catch {
    return {};
  }
}

export function getPersistedUtms(): Utms {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(UTM_KEY);
    return raw ? (JSON.parse(raw) as Utms) : {};
  } catch {
    return {};
  }
}

function genEventId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Dispara evento no Pixel (browser) + CAPI (server) com o mesmo event_id. */
export function fbqTrack(
  event: "PageView" | "InitiateCheckout" | "Purchase" | "Lead" | string,
  params: Record<string, any> = {},
  opts: { eventId?: string } = {},
) {
  if (typeof window === "undefined") return;
  const utms = getPersistedUtms();
  const eventID = opts.eventId || genEventId(event);

  // 1) Pixel browser
  if (typeof window.fbq === "function") {
    try {
      window.fbq("track", event, params, { eventID });
    } catch (err) {
      console.warn("[fbq] track falhou", event, err);
    }
  }

  // 2) CAPI server-side (mesmo domínio → bypassa adblockers).
  //    Purchase é enviado pelo servidor (pix.functions.ts) no momento da
  //    confirmação do pagamento — então pulamos o relay aqui para evitar
  //    eventos CAPI duplicados que quebram a desduplicação do Meta.
  if (event === "Purchase") {
    return;
  }
  try {
    const { fbc, fbp } = getMetaCookies();
    const payload = {
      event_name: event,
      event_id: eventID,
      event_source_url: window.location.href,
      fbc,
      fbp,
      value: params.value,
      currency: params.currency,
      content_ids: params.content_ids,
      content_type: params.content_type,
      transaction_id: params.transaction_id,
      email: params.email,
      phone: params.phone,
      first_name: params.first_name,
      last_name: params.last_name,
      gender: params.gender,
      dob: params.dob,
      city: params.city,
      state: params.state,
      zip: params.zip,
      country: params.country || "br",
      external_id: params.external_id,
      utms,
    };
    fetch("/api/public/fb-track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
      credentials: "same-origin",
    }).catch((err) => console.warn("[fb-capi-relay] fetch falhou", event, err));
  } catch (err) {
    console.warn("[fb-capi-relay] falhou", err);
  }
}


const fired = new Set<string>();
export function fbqTrackOnce(
  key: string,
  event: Parameters<typeof fbqTrack>[0],
  params?: Record<string, any>,
  opts?: { eventId?: string },
) {
  if (fired.has(key)) return;
  fired.add(key);
  fbqTrack(event, params, opts);
}

/** Lê cookies _fbc e _fbp do navegador. */
export function getMetaCookies(): { fbc?: string; fbp?: string } {
  if (typeof document === "undefined") return {};
  try {
    const cookies = Object.fromEntries(
      document.cookie.split(";").map((c) => {
        const [k, ...v] = c.trim().split("=");
        return [k, decodeURIComponent(v.join("="))];
      }),
    );
    return {
      fbc: cookies["_fbc"] || undefined,
      fbp: cookies["_fbp"] || undefined,
    };
  } catch {
    return {};
  }
}
