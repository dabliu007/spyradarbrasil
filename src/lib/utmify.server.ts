type UtmifyTracking = Record<string, string | null | undefined>;

type UtmifyCustomer = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  document?: string | null;
  ip?: string | null;
};

type SendUtmifyOrderInput = {
  orderId: string;
  status: "waiting_payment" | "paid" | "refused" | "refunded" | "chargedback";
  amount: number;
  productId?: string;
  productName: string;
  createdAt?: string | Date | null;
  approvedDate?: string | Date | null;
  customer?: UtmifyCustomer;
  tracking?: UtmifyTracking;
};

const UTMIFY_ENDPOINT = "https://api.utmify.com.br/api-credentials/orders";

export function formatUtmifyDate(value: string | Date | null | undefined = new Date()) {
  const date = value instanceof Date ? value : value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return formatUtmifyDate(new Date());
  return date.toISOString().slice(0, 19).replace("T", " ");
}

export function buildUtmifyTracking(utms: UtmifyTracking = {}) {
  return {
    src: clean(utms.src),
    sck: clean(utms.sck || utms.xcod),
    utm_source: clean(utms.utm_source),
    utm_campaign: clean(utms.utm_campaign),
    utm_medium: clean(utms.utm_medium),
    utm_content: clean(utms.utm_content),
    utm_term: clean(utms.utm_term),
  };
}

function clean(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, 500) : null;
}

function digits(value: unknown): string | null {
  const only = typeof value === "string" ? value.replace(/\D/g, "") : "";
  return only || null;
}

function toCents(amount: number) {
  return Math.max(0, Math.round((Number(amount) || 0) * 100));
}

// IPv4 público determinístico derivado do orderId (nunca 0.x, 10.x, 127.x, etc.).
// Usado apenas como último recurso quando o IP real do cliente não é capturado,
// pois a UTMify rejeita customer.ip null.
function fallbackIp(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const a = 11 + (h % 213); // 11..223, evita ranges reservados/privados comuns
  const b = (h >>> 8) & 0xff; // 0..255 (unsigned shift + máscara)
  const c = (h >>> 16) & 0xff;
  const d = 1 + ((h >>> 24) % 254); // 1..254
  return `${a}.${b}.${c}.${d}`;
}

export async function sendUtmifyOrder(input: SendUtmifyOrderInput) {
  const token = process.env.UTMIFY_API_TOKEN || process.env.UTMIFY_TOKEN || process.env.UTMIFY_API_KEY;
  if (!token) {
    console.warn("[utmify] token ausente — envio direto ignorado", {
      orderId: input.orderId,
      status: input.status,
    });
    return { ok: false, status: 0 };
  }

  const totalPriceInCents = toCents(input.amount);
  const customer = input.customer || {};
  const payload = {
    orderId: input.orderId,
    platform: "BlackCat",
    paymentMethod: "pix",
    status: input.status,
    createdAt: formatUtmifyDate(input.createdAt),
    approvedDate: input.status === "paid" ? formatUtmifyDate(input.approvedDate) : null,
    refundedAt: null,
    customer: {
      name: clean(customer.name) || "Cliente Sigiloso",
      email: clean(customer.email) || `cliente.${input.orderId.slice(-8)}@gmail.com`,
      phone: digits(customer.phone),
      document: digits(customer.document),
      country: "BR",
      // A UTMify REJEITA (HTTP 400) quando customer.ip é null. Garante um IP
      // válido sempre: usa o capturado ou um fallback público determinístico.
      ip: clean(customer.ip) || fallbackIp(input.orderId),
    },
    products: [
      {
        id: input.productId || input.orderId,
        name: input.productName,
        planId: null,
        planName: null,
        quantity: 1,
        priceInCents: totalPriceInCents,
      },
    ],
    trackingParameters: buildUtmifyTracking(input.tracking),
    commission: {
      totalPriceInCents,
      gatewayFeeInCents: 0,
      userCommissionInCents: totalPriceInCents,
      currency: "BRL",
    },
    isTest: false,
  };

  try {
    const res = await fetch(UTMIFY_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-token": token,
      },
      body: JSON.stringify(payload),
    });
    const body = await res.text().catch(() => "");
    if (!res.ok) {
      console.error("[utmify] envio falhou", res.status, body.slice(0, 600));
    } else {
      console.log("[utmify] venda enviada", {
        orderId: input.orderId,
        status: input.status,
        utm_source: payload.trackingParameters.utm_source,
        utm_campaign: payload.trackingParameters.utm_campaign,
      });
    }
    return { ok: res.ok, status: res.status, body };
  } catch (err) {
    console.error("[utmify] erro de rede", err);
    return { ok: false, status: 0 };
  }
}
