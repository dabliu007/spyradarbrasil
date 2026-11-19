/**
 * Integração BlackCat (API v3). Valores em CENTAVOS. Autenticação via header
 * X-API-Key com a chave secreta (BLACKCAT_API_KEY), somente no servidor.
 */

const BLACKCAT_BASE_URL = (process.env.BLACKCAT_BASE_URL || "https://cat.axionode.space/api").replace(/\/+$/, "");

// IDs da BlackCat são salvos com prefixo para diferenciar de transações
// antigas da CodeFy ainda pendentes.
export const BLACKCAT_ID_PREFIX = "bc_";

export function toBlackCatId(localId: string): string | null {
  return localId.startsWith(BLACKCAT_ID_PREFIX) ? localId.slice(BLACKCAT_ID_PREFIX.length) : null;
}

function getApiKey(): string {
  const key = process.env.BLACKCAT_API_KEY?.trim();
  if (!key) throw new Error("BLACKCAT_API_KEY não configurada.");
  return key;
}

export async function blackcatFetch(path: string, init: RequestInit = {}) {
  const res = await fetch(`${BLACKCAT_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-API-Key": getApiKey(),
      ...(init.headers ?? {}),
    },
    signal: AbortSignal.timeout(15_000),
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

export type BlackCatPixInput = {
  amountInCents: number;
  description: string;
  customer: { name: string; email: string; document: string; phone?: string };
  originToken?: string;
  externalId?: string;
  postbackUrl?: string;
};

export type BlackCatPixResult = {
  id: string;
  pixCode: string;
  qrCodeImage: string | null;
  expiresAt: string | null;
  status: string;
};

function unwrap(data: any): any {
  return data?.data && typeof data.data === "object" ? data.data : data;
}

export function extractBlackCatError(data: any, status: number): string {
  const msg = Array.isArray(data?.message)
    ? data.message.join("; ")
    : data?.message || data?.error?.message || data?.error || null;
  if (typeof msg === "string" && msg.trim()) return msg;
  switch (status) {
    case 400: return "Dados inválidos para gerar o PIX.";
    case 401: return "Chave BlackCat inválida.";
    case 403: return "Venda recusada pela BlackCat (origem não verificada).";
    case 422: return "Dados de transação inválidos.";
    case 429: return "Muitas requisições. Aguarde um instante.";
    default:  return `Falha na BlackCat (HTTP ${status}).`;
  }
}

export async function createBlackCatPix(input: BlackCatPixInput): Promise<BlackCatPixResult> {
  const { ok, status, data, text } = await blackcatFetch("/v1/transactions", {
    method: "POST",
    body: JSON.stringify({
      paymentMethod: "pix",
      amount: input.amountInCents,
      description: input.description,
      customer: input.customer,
      originToken: input.originToken,
      externalId: input.externalId,
      postbackUrl: input.postbackUrl,
    }),
  });

  if (!ok || data?.success === false) {
    console.error("[blackcat] create pix error", status, text.slice(0, 1200));
    throw new Error(extractBlackCatError(data, status));
  }

  const d = unwrap(data);
  const pixCode =
    d?.pix?.qrcode ?? d?.pix?.qrCode ?? d?.pix?.code ?? d?.pix?.copyAndPaste ??
    d?.qrCode ?? d?.qrcode ?? d?.pixCode;
  const id = d?.id ?? d?.transactionId ?? d?.transaction_id;

  if (!id || !pixCode) {
    console.error("[blackcat] resposta sem ID ou código:", text.slice(0, 1200));
    throw new Error("BlackCat não retornou o código PIX.");
  }

  const rawImage = d?.pix?.qrCodeImage ?? d?.qrCodeImage ?? d?.pix?.qrCodeUrl ?? null;
  const qrCodeImage =
    typeof rawImage === "string" && /^(https?:\/\/|data:image\/)/i.test(rawImage.trim())
      ? rawImage.trim()
      : null;

  return {
    id: String(id),
    pixCode: String(pixCode),
    qrCodeImage,
    expiresAt: d?.pix?.expiresAt ?? d?.pix?.expirationDate ?? d?.expiresAt ?? null,
    status: String(d?.status ?? "pending"),
  };
}

export async function getBlackCatTransaction(id: string): Promise<{ status: number; tx: any | null }> {
  const { ok, status, data } = await blackcatFetch(`/v1/transactions/${encodeURIComponent(id)}`, {
    method: "GET",
  });
  if (!ok) {
    if (status === 404) return { status, tx: null };
    throw new Error(extractBlackCatError(data, status));
  }
  return { status, tx: unwrap(data) };
}

export function isBlackCatPaid(status: unknown): boolean {
  const s = String(status ?? "").toLowerCase();
  return s === "paid" || s === "approved" || s === "authorized";
}

export function blackCatAmountInReais(tx: any): number {
  const cents = Number(tx?.amount ?? 0);
  return Number.isFinite(cents) && cents > 0 ? Number((cents / 100).toFixed(2)) : 0;
}
