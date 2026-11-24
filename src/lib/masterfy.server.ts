/**
 * Integração Masterfy (Pix). Valores em CENTAVOS. Autenticação via
 * `Authorization: Bearer MASTERFY_API_KEY`, somente no servidor.
 * Limite por Pix: R$ 250,00.
 */

const MASTERFY_BASE_URL = (process.env.MASTERFY_BASE_URL || "https://api.masterfypagamentos.com/v1").replace(/\/+$/, "");

export const MASTERFY_ID_PREFIX = "mf_";
export const MASTERFY_MAX_CENTS = 25_000;

export function toMasterfyId(localId: string): string | null {
  return localId.startsWith(MASTERFY_ID_PREFIX) ? localId.slice(MASTERFY_ID_PREFIX.length) : null;
}

function getApiKey(): string {
  const key = process.env.MASTERFY_API_KEY?.trim();
  if (!key) throw new Error("MASTERFY_API_KEY não configurada.");
  return key;
}

async function masterfyFetch(path: string, init: RequestInit = {}) {
  const res = await fetch(`${MASTERFY_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
      ...(init.headers ?? {}),
    },
    signal: AbortSignal.timeout(30_000),
  });
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { _raw: text };
  }
  return { ok: res.ok, status: res.status, data, text };
}

function extractMasterfyError(data: any, status: number): string {
  const code = typeof data?.code === "string" ? data.code : "";
  if (code === "payment.businessLogic.ticketMax") return "Valor acima do limite por Pix.";
  if (code === "payment.businessLogic.ticketMin") return "Valor abaixo do mínimo por Pix.";
  if (code.startsWith("schema.validation")) return "Dados inválidos para gerar o PIX.";
  switch (status) {
    case 401: return "Chave Masterfy inválida ou loja inativa.";
    case 403: return "Método de pagamento não permitido na Masterfy.";
    case 404: return "Pagamento não encontrado.";
    case 429: return "Muitas requisições. Aguarde um instante.";
    default:  return typeof data?.message === "string" && data.message ? data.message : `Falha na Masterfy (HTTP ${status}).`;
  }
}

export type MasterfyPixInput = {
  amountInCents: number;
  description: string;
  payer: { name: string; email: string; taxId: string; phone: string };
  externalRef: string;
  notificationUrl: string;
  ip?: string;
  utms?: Record<string, string>;
};

export async function createMasterfyPix(input: MasterfyPixInput) {
  const phoneDigits = input.payer.phone.replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "");
  const description = input.description.length >= 5 ? input.description.slice(0, 255) : `Pedido ${input.description}`;
  const sellerTaxId = process.env.MASTERFY_SELLER_TAX_ID?.replace(/\D/g, "");
  const sellerEmail = process.env.MASTERFY_SELLER_EMAIL?.trim();

  const { ok, status, data, text } = await masterfyFetch("/payment", {
    method: "POST",
    body: JSON.stringify({
      amount: input.amountInCents,
      currency: "BRL",
      method: "PIX",
      description,
      externalRef: input.externalRef,
      notificationUrl: input.notificationUrl,
      ...(input.ip ? { ip: input.ip.slice(0, 45) } : {}),
      payer: {
        name: input.payer.name,
        taxId: input.payer.taxId.replace(/\D/g, ""),
        email: input.payer.email,
        phone: `+55${phoneDigits}`,
      },
      items: [{ quantity: 1, name: description.slice(0, 256), price: input.amountInCents, type: "DIGITAL" }],
      metadata: {
        provider: "spyradarbrasil",
        orderId: input.externalRef,
        ...(sellerTaxId ? { sellerTaxId } : {}),
        ...(sellerEmail ? { sellerEmail } : {}),
      },
      utms: {
        utmSource: input.utms?.utm_source ?? "",
        utmMedium: input.utms?.utm_medium ?? "",
        utmCampaign: input.utms?.utm_campaign ?? "",
        utmContent: input.utms?.utm_content ?? "",
        utmTerm: input.utms?.utm_term ?? "",
        src: input.utms?.src ?? "",
        sck: input.utms?.sck ?? "",
      },
    }),
  });

  if (!ok) {
    console.error("[masterfy] create pix error", status, text.slice(0, 1200));
    throw new Error(extractMasterfyError(data, status));
  }

  const id = data?.id;
  const pixCode = data?.data?.copypaste;
  if (!id || !pixCode) {
    console.error("[masterfy] resposta sem id ou copypaste:", text.slice(0, 1200));
    throw new Error("Masterfy não retornou o código PIX.");
  }

  return { id: String(id), pixCode: String(pixCode), status: String(data?.status ?? "PENDING") };
}

export async function getMasterfyPayment(id: string): Promise<any | null> {
  const { ok, status, data } = await masterfyFetch(`/payment/${encodeURIComponent(id)}`, { method: "GET" });
  if (!ok) {
    if (status === 404) return null;
    throw new Error(extractMasterfyError(data, status));
  }
  return data;
}

export function isMasterfyPaid(status: unknown): boolean {
  return String(status ?? "").toUpperCase() === "PAID";
}

export function masterfyAmountInReais(payment: any): number {
  const cents = Number(payment?.amount ?? 0);
  return Number.isFinite(cents) && cents > 0 ? Number((cents / 100).toFixed(2)) : 0;
}

// A Masterfy bloqueia IPs que consultam o status em loop. O webhook é a fonte
// principal; a consulta direta fica limitada a uma por pagamento a cada 30 s
// por instância do servidor.
const lastLookup = new Map<string, number>();
export function canLookupMasterfy(id: string, minIntervalMs = 30_000): boolean {
  const now = Date.now();
  const last = lastLookup.get(id) ?? 0;
  if (now - last < minIntervalMs) return false;
  lastLookup.set(id, now);
  if (lastLookup.size > 5000) {
    for (const [k, t] of lastLookup) if (now - t > minIntervalMs) lastLookup.delete(k);
  }
  return true;
}
