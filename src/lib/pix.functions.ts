import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

/**
 * Gateway PIX principal: BlackCat (src/lib/blackcat.server.ts).
 * A CodeFy permanece apenas para consultar transações antigas (IDs sem o
 * prefixo "bc_") que ainda estavam pendentes na troca de gateway.
 */

const BASE_URL = (process.env.CODEFY_BASE_URL || "https://usecodefy.com/api/v1/gateway").replace(/\/+$/, "");
const BLACKCAT_WEBHOOK_PATH = "/api/public/blackcat-webhook";
const APP_ORIGIN = process.env.PUBLIC_APP_URL?.replace(/\/$/, "") || "https://zapradarbrasil.com.br";
const AMOUNT = 137.00;
const PRODUCT_DESCRIPTION = "Recupera Relacionamento: Acesso Anual";

// Lista de valores legítimos do funil (checkout, downsells e upsells).
// O front-end envia o valor junto com o pedido de cobrança, então sem essa
// validação um cliente poderia chamar esta função diretamente e gerar um PIX
// de qualquer valor (ex.: R$ 1,00) e, após pago, obter acesso normalmente.
// Cada produto só aceita os próprios preços, para impedir que o PIX de um
// produto seja gerado com o preço mais barato de outro.
const PRODUCT_PRICES = {
  checkout: [137.00],
  licenca_zapradar: [97],
  sigilo: [89.82],
  nota_fiscal: [59.12],
  taxa_meta: [63.41],
  conta_poupanca: [297],
  controle_bancario: [47],
} as const;

export type PixProduct = keyof typeof PRODUCT_PRICES;

function isPixProduct(v: unknown): v is PixProduct {
  return typeof v === "string" && Object.prototype.hasOwnProperty.call(PRODUCT_PRICES, v);
}

function isAllowedAmount(product: PixProduct, v: number): boolean {
  return PRODUCT_PRICES[product].some((a) => Math.abs(a - v) < 0.01);
}

export type PixCharge = {
  id: string;
  txid: string;
  externalId: string;
  amount: number;
  status: "pending" | "paid" | "expired" | "cancelled" | string;
  pixCopiaCola: string;
  qrCodeBase64: string | null;
  expiresAt: string | null;
};

export type PixStatus = {
  id: string;
  status: string;
  paid: boolean;
  paidAt: string | null;
  expiresAt: string | null;
};

/* -------------------------------------------------------------------------- */
/*  Cliente sintético                                                          */
/* -------------------------------------------------------------------------- */

const FIRST_NAMES = [
  "Lucas", "Carlos", "Joao", "Pedro", "Rafael", "Bruno", "Felipe", "Gustavo",
  "Marcelo", "Andre", "Thiago", "Diego", "Eduardo", "Leonardo", "Rodrigo",
  "Vinicius", "Matheus", "Daniel", "Ricardo", "Fernando", "Henrique", "Caio",
];
const LAST_NAMES = [
  "Silva", "Souza", "Oliveira", "Santos", "Pereira", "Costa", "Almeida",
  "Ferreira", "Rodrigues", "Gomes", "Martins", "Araujo", "Ribeiro", "Carvalho",
];
const VALID_DDDS = [11,12,13,14,15,16,17,18,19,21,22,24,27,28,31,32,33,34,35,37,38,41,42,43,44,45,46,47,48,49,51,53,54,55,61,62,63,64,65,66,67,68,69,71,73,74,75,77,79,81,82,83,84,85,86,87,88,89,91,92,93,94,95,96,97,98,99];

function randCpfDigits(): string {
  const n = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
  const calc = (arr: number[]) => {
    const sum = arr.reduce((acc, v, i) => acc + v * (arr.length + 1 - i), 0);
    const mod = (sum * 10) % 11;
    return mod === 10 ? 0 : mod;
  };
  const d1 = calc(n);
  const d2 = calc([...n, d1]);
  return [...n, d1, d2].join("");
}

function syntheticClient() {
  const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const num = Math.floor(Math.random() * 9000 + 1000);
  const ddd = VALID_DDDS[Math.floor(Math.random() * VALID_DDDS.length)];
  const p1 = Math.floor(Math.random() * 9000 + 1000);
  const p2 = Math.floor(Math.random() * 9000 + 1000);
  return {
    name: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}${num}@gmail.com`,
    phone: `${ddd}9${p1}${p2}`,
    document: randCpfDigits(),
  };
}

/* -------------------------------------------------------------------------- */
/*  HTTP helper                                                                */
/* -------------------------------------------------------------------------- */

function getCodefyCredentials() {
  const publicKey = process.env.CODEFY_PUBLIC_KEY?.trim();
  const secretKey = process.env.CODEFY_SECRET_KEY?.trim();
  if (!publicKey || !secretKey) throw new Error("Credenciais CodeFy não configuradas.");
  return { publicKey, secretKey };
}

export async function codefyFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const { publicKey, secretKey } = getCodefyCredentials();
  return fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-public-key": publicKey,
      "x-secret-key": secretKey,
      ...(init.headers || {}),
    },
    signal: AbortSignal.timeout(15_000),
  });
}

async function parseJson(res: Response): Promise<any> {
  const text = await res.text();
  if (!text) return {};
  try { return JSON.parse(text); } catch { return { _raw: text }; }
}

function normalizeDate(value: unknown): string | null {
  if (typeof value !== "string" || !value) return null;
  const match = /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})$/.exec(value);
  const normalized = match ? `${match[1]}T${match[2]}-03:00` : value;
  const timestamp = Date.parse(normalized);
  return Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString();
}

function extractError(json: any, status: number): string {
  const fieldErrors = Array.isArray(json?.message)
    ? json.message.join("; ")
    : typeof json?.message === "string"
      ? json.message
      : null;
  const msg = fieldErrors || json?.error?.message || json?.error || null;
  if (typeof msg === "string" && msg.trim()) return msg;
  switch (status) {
    case 400: return "Dados inválidos para gerar o PIX.";
    case 401: return "Credencial CodeFy inválida.";
    case 403: return "Credenciais CodeFy sem permissão.";
    case 404: return "Recurso não encontrado.";
    case 422: return "Dados de transação inválidos.";
    case 429: return "Muitas requisições. Aguarde um instante.";
    default:  return `Falha na CodeFy (HTTP ${status}).`;
  }
}

export function normalizeStatus(raw: any): PixCharge["status"] {
  const s = String(raw ?? "pending").toLowerCase().trim();
  if (["ok","paid","pago","completed","approved","success","confirmed","authorized","settled","captured","complete","finished","done"].includes(s)) return "paid";
  if (["expired","expirado"].includes(s)) return "expired";
  if (["failed","falha","cancelled","canceled","cancelado","rejected","recusado","refused","refunded","estornado","charged_back","chargeback","med"].includes(s)) return "cancelled";
  return "pending";
}

function pickIpv4(ip?: string | null): string | undefined {
  if (!ip) return undefined;
  const candidate = ip.split(",")[0]?.trim();
  if (!candidate) return undefined;
  const parts = candidate.split(".");
  if (parts.length !== 4) return undefined;
  const valid = parts.every((part) => {
    if (!/^\d{1,3}$/.test(part)) return false;
    const n = Number(part);
    return n >= 0 && n <= 255;
  });
  return valid ? candidate : undefined;
}

/* -------------------------------------------------------------------------- */
/*  Server Functions                                                          */
/* -------------------------------------------------------------------------- */

export const createPixCharge = createServerFn({ method: "POST" })
  .inputValidator((input: {
    externalId?: string;
    product: PixProduct;
    amount?: number;
    description?: string;
    fbc?: string;
    fbp?: string;
    utms?: Record<string, string | undefined>;
    customerName?: string;
    customerDocument?: string;
    phone?: string;
    gender?: string;
    humanToken?: string;
    originToken?: string;
  }) => ({
    originToken:
      typeof input?.originToken === "string" && input.originToken.trim()
        ? input.originToken.trim().slice(0, 4000)
        : undefined,
    externalId:
      input?.externalId?.trim() ||
      `cs-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    product: isPixProduct(input?.product) ? input.product : null,
    amount: typeof input?.amount === "number" && input.amount > 0 ? input.amount : AMOUNT,
    description: input?.description?.trim() || PRODUCT_DESCRIPTION,
    fbc: input?.fbc?.trim() || undefined,
    fbp: input?.fbp?.trim() || undefined,
    customerName: input?.customerName?.trim() || undefined,
    customerDocument: input?.customerDocument?.replace(/\D/g, "") || undefined,
    phone: input?.phone?.replace(/\D/g, "") || undefined,
    gender: (input?.gender || "").trim().toLowerCase().charAt(0) || undefined,
    humanToken: typeof input?.humanToken === "string" ? input.humanToken : undefined,
    utms: (() => {
      const u = input?.utms || {};
      const allowed = ["utm_source","utm_medium","utm_campaign","utm_content","utm_term","utm_id","fbclid","gclid","landing_url","referrer"];
      const out: Record<string, string> = {};
      for (const k of allowed) {
        const v = u[k];
        if (typeof v === "string" && v.trim()) out[k] = v.trim().slice(0, 500);
      }
      if (!out.utm_source) {
        out.utm_source = "organico";
        if (!out.utm_medium) out.utm_medium = "organic";
      }
      return out;
    })(),
  }))
  .handler(async ({ data }): Promise<PixCharge> => {
    const req = getRequest();

    const callbackUrl = `${APP_ORIGIN}${BLACKCAT_WEBHOOK_PATH}`;

    const synth = syntheticClient();
    const clientName = data.customerName || synth.name;
    const clientDocument = data.customerDocument || synth.document;
    const clientPhone = data.phone || synth.phone;

    let clientIp: string | undefined;
    let clientUa: string | undefined;
    try {
      const { pickBestClientIp } = await import("@/lib/fb-capi.server");
      clientIp = pickIpv4(pickBestClientIp(req.headers));
      clientUa = req.headers.get("user-agent") || undefined;
    } catch {}

    const utmifyCreatedAt = new Date().toISOString();
    const metadataObj: Record<string, string> = {
      ...(data.fbc ? { fbc: data.fbc } : {}),
      ...(data.fbp ? { fbp: data.fbp } : {}),
      ...(data.phone ? { ph: data.phone, customer_phone: data.phone } : {}),
      ...(data.gender ? { ge: data.gender } : {}),
      ...(data.customerName ? { customer_name: data.customerName } : {}),
      ...(data.customerDocument ? { customer_document: data.customerDocument } : {}),
      ...(clientIp ? { client_ip: clientIp } : {}),
      ...(clientUa ? { client_user_agent: clientUa } : {}),
      country: "br",
      ...data.utms,
      external_id: data.externalId,
      product_name: data.description,
      utmify_created_at: utmifyCreatedAt,
    };

    // Bloqueia geração de PIX com valor fora da tabela de preços do funil
    // (proteção contra manipulação do valor enviado pelo cliente).
    if (!data.product || !isAllowedAmount(data.product, Number(data.amount))) {
      console.error("[codefy] valor de PIX rejeitado:", data.product, data.amount);
      throw new Error("Valor de pagamento inválido.");
    }

    if (!data.originToken) {
      console.warn("[blackcat] PIX solicitado sem originToken", data.externalId);
    }

    const { createBlackCatPix, BLACKCAT_ID_PREFIX } = await import("@/lib/blackcat.server");
    const bc = await createBlackCatPix({
      amountInCents: Math.round(Number(data.amount) * 100),
      description: data.description.slice(0, 200),
      customer: {
        name: clientName,
        email: synth.email,
        document: clientDocument.replace(/\D/g, ""),
        phone: clientPhone.replace(/\D/g, ""),
      },
      originToken: data.originToken,
      externalId: data.externalId.slice(0, 100),
      postbackUrl: callbackUrl,
    });

    const body: Record<string, unknown> = { status: bc.status };
    const identifier = `${BLACKCAT_ID_PREFIX}${bc.id}`;
    const pixCode = bc.pixCode;
    const qrCodeBase64 = bc.qrCodeImage;
    const expiresAt = normalizeDate(bc.expiresAt);

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.from("purchase_logs").upsert(
        {
          transaction_id: identifier,
          amount: Number(data.amount) || null,
          currency: "BRL",
          status: "pending",
          fbc: data.fbc ?? null,
          fbp: data.fbp ?? null,
          utm_source: data.utms.utm_source ?? "organico",
          utm_medium: data.utms.utm_medium ?? null,
          utm_campaign: data.utms.utm_campaign ?? null,
          utm_content: data.utms.utm_content ?? null,
          utm_term: data.utms.utm_term ?? null,
          utm_id: data.utms.utm_id ?? null,
          fbclid: data.utms.fbclid ?? null,
          gclid: data.utms.gclid ?? null,
          landing_url: data.utms.landing_url ?? null,
          referrer: data.utms.referrer ?? null,
          raw_metadata: metadataObj,
        },
        { onConflict: "transaction_id", ignoreDuplicates: false },
      );
    } catch (err) {
      console.error("[codefy] purchase_logs pre-insert falhou", err);
    }

    // Utmify: notifica PIX gerado (waiting_payment)
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: claim } = await supabaseAdmin
        .from("purchase_logs")
        .update({ utmify_waiting_sent_at: new Date().toISOString() })
        .eq("transaction_id", identifier)
        .is("utmify_waiting_sent_at", null)
        .select("transaction_id")
        .maybeSingle();
      if (claim) {
        const { sendUtmifyOrder } = await import("@/lib/utmify.server");
        await sendUtmifyOrder({
          orderId: identifier,
          status: "waiting_payment",
          amount: Number(data.amount),
          productId: identifier,
          productName: data.description,
          createdAt: utmifyCreatedAt,
          customer: {
            name: data.customerName,
            phone: data.phone,
            document: data.customerDocument,
            ip: clientIp,
          },
          tracking: data.utms,
        });
      }
    } catch (err) {
      console.error("[codefy] utmify waiting_payment falhou", err);
    }

    return {
      id: identifier,
      txid: identifier,
      externalId: data.externalId,
      amount: Number(data.amount),
      status: normalizeStatus(body?.status ?? body?.payment_status),
      pixCopiaCola: pixCode,
      qrCodeBase64,
      expiresAt,
    };
  });

export const getPixStatus = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string; light?: boolean }) => ({
    id: String(input?.id ?? "").trim(),
    // Modo leve: consulta o Supabase alimentado pelo webhook do gateway,
    // sem gerar chamadas repetidas à API do provedor.
    light: input?.light === true,
  }))
  .handler(async ({ data }): Promise<PixStatus> => {
    if (!data.id) throw new Error("id obrigatório");

    // 1) Fallback rápido via purchase_logs (webhook) — fonte de verdade do "pago"
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: row } = await supabaseAdmin
        .from("purchase_logs")
        .select("status, transaction_id")
        .eq("transaction_id", data.id)
        .maybeSingle();
      if (row && ["paid","pago","ok","completed","approved","confirmed","success"].includes(String(row.status).toLowerCase())) {
        return { id: data.id, status: "paid", paid: true, paidAt: null, expiresAt: null };
      }
    } catch (err) {
      console.error("[codefy status] purchase_logs lookup falhou", err);
    }

    // Polling leve usa o webhook e o Supabase como fonte do estado atualizado.
    if (data.light) {
      return { id: data.id, status: "pending", paid: false, paidAt: null, expiresAt: null };
    }

    const { toBlackCatId, getBlackCatTransaction, isBlackCatPaid, blackCatAmountInReais } =
      await import("@/lib/blackcat.server");
    const blackcatId = toBlackCatId(data.id);

    let tx: any;
    let status: PixCharge["status"];
    let amount = 0;
    if (blackcatId) {
      const result = await getBlackCatTransaction(blackcatId);
      if (!result.tx) {
        return { id: data.id, status: "pending", paid: false, paidAt: null, expiresAt: null };
      }
      tx = result.tx;
      status = isBlackCatPaid(tx?.status) ? "paid" : normalizeStatus(tx?.status);
      amount = blackCatAmountInReais(tx);
    } else {
      const res = await codefyFetch(
        `/transactions/${encodeURIComponent(data.id)}`,
        { method: "GET" },
      );
      const json = await parseJson(res);
      if (!res.ok) {
        if (res.status === 404) {
          return { id: data.id, status: "pending", paid: false, paidAt: null, expiresAt: null };
        }
        throw new Error(extractError(json, res.status));
      }
      tx = json?.transaction ?? json?.data ?? json;
      status = normalizeStatus(tx?.status);
      amount = Number(tx?.amount ?? 0) || 0;
    }

    if (status === "paid") {
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: existing } = await supabaseAdmin
          .from("purchase_logs")
          .select("status, amount, fbc, fbp, utm_source, utm_medium, utm_campaign, utm_content, utm_term, utm_id, fbclid, gclid, landing_url, referrer, raw_metadata")
          .eq("transaction_id", data.id)
          .maybeSingle();
        const alreadyPaid =
          existing &&
          ["paid","pago","ok","completed","approved","confirmed","success"].includes(
            String(existing.status).toLowerCase(),
          );

        const meta: Record<string, any> = (existing?.raw_metadata as any) || {};
        const fbc: string | undefined = existing?.fbc || meta?.fbc || undefined;
        const fbp: string | undefined = existing?.fbp || meta?.fbp || undefined;
        const utms: Record<string, string> = {};
        const utmKeys = ["utm_source","utm_medium","utm_campaign","utm_content","utm_term","utm_id","fbclid","gclid","landing_url","referrer"] as const;
        for (const k of utmKeys) {
          const v = (existing as any)?.[k] ?? meta?.[k];
          if (typeof v === "string" && v) utms[k] = v;
        }

        const finalAmount = Number(existing?.amount ?? amount) || amount;

        const { error: upErr } = await supabaseAdmin.from("purchase_logs").upsert(
          {
            transaction_id: data.id,
            amount: finalAmount || null,
            currency: "BRL",
            status: "paid",
            fbc: fbc ?? null,
            fbp: fbp ?? null,
            utm_source: utms.utm_source ?? "organico",
            utm_medium: utms.utm_medium ?? null,
            utm_campaign: utms.utm_campaign ?? null,
            utm_content: utms.utm_content ?? null,
            utm_term: utms.utm_term ?? null,
            utm_id: utms.utm_id ?? null,
            fbclid: utms.fbclid ?? null,
            gclid: utms.gclid ?? null,
            landing_url: utms.landing_url ?? null,
            referrer: utms.referrer ?? null,
            raw_metadata: meta,
          },
          { onConflict: "transaction_id" },
        );
        if (upErr) console.error("[codefy status] purchase_logs upsert", upErr);

        if (!alreadyPaid) {
          const { sendCapiEvent } = await import("@/lib/fb-capi.server");
          const origin =
            process.env.PUBLIC_APP_URL?.replace(/\/$/, "") || "https://zapradarbrasil.com.br";
          await sendCapiEvent({
            event_name: "Purchase",
            event_id: `purchase-${data.id}`,
            event_source_url: `${origin}/pix`,
            user_data: {
              fbc,
              fbp,
              client_ip_address: meta?.client_ip || undefined,
              client_user_agent: meta?.client_user_agent || undefined,
              ph: meta?.ph || undefined,
              ge: meta?.ge || undefined,
              country: meta?.country || "br",
              external_id: data.id,
            },
            custom_data: {
              value: finalAmount || undefined,
              currency: "BRL",
              content_ids: [data.id],
              content_type: "product",
              transaction_id: data.id,
              ...utms,
            },
          });
        }
      } catch (err) {
        console.error("[codefy status] erro registrando purchase", err);
      }
    }

    return {
      id: data.id,
      status,
      paid: status === "paid",
      paidAt: status === "paid" ? normalizeDate(tx?.paidAt ?? tx?.paid_at) : null,
      expiresAt: normalizeDate(tx?.pix?.expiresAt ?? tx?.expiresAt ?? tx?.expires_at),
    };
  });
