import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

/**
 * Integração Black Cat — PIX
 *
 * Base:    https://api.blackcatoficial.com/api
 * Auth:    Header  X-API-Key: <api_key>
 * Valores: em CENTAVOS (integer, ex.: 4700 = R$ 47,00)
 * Fluxo:   POST /sales/create-sale        (paymentMethod: "pix")
 * Status:  GET  /sales/:id/status
 * Webhook: src/routes/api/public/blackcat-webhook.ts
 */

const BASE_URL = "https://api.blackcatoficial.com/api";
const APP_ORIGIN = process.env.PUBLIC_APP_URL?.replace(/\/$/, "") || "https://clonawhats.com";
const AMOUNT = 67.00;
const PRODUCT_DESCRIPTION = "Recupera Relacionamento: Acesso Anual";

// Lista de valores legítimos do funil (checkout, downsells e upsells).
// O front-end envia o valor junto com o pedido de cobrança, então sem essa
// validação um cliente poderia chamar esta função diretamente e gerar um PIX
// de qualquer valor (ex.: R$ 1,00) e, após pago, obter acesso normalmente.
const ALLOWED_PIX_AMOUNTS = [297, 97, 89.82, 87, 67, 63.41, 59.12, 47, 37];
function isAllowedAmount(v: number): boolean {
  return ALLOWED_PIX_AMOUNTS.some((a) => Math.abs(a - v) < 0.01);
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

function getBlackcatApiKey(): string {
  const apiKey =
    process.env.BLACKCAT_API_KEY ||
    process.env.BLACKCAT_SECRET_KEY ||
    process.env.BLACKCAT_PUBLIC_KEY ||
    process.env.BLACKCATHUB_SECRET_KEY ||
    "";
  if (!apiKey) throw new Error("Credencial Black Cat não configurada.");
  return apiKey;
}

function parseRetryAfterMs(res: Response): number | null {
  const h = res.headers.get("retry-after");
  if (!h) return null;
  const secs = Number(h);
  if (Number.isFinite(secs)) return Math.min(Math.max(secs, 0) * 1000, 15000);
  const when = Date.parse(h);
  if (Number.isFinite(when)) return Math.min(Math.max(when - Date.now(), 0), 15000);
  return null;
}

async function blackcatFetch(
  path: string,
  init: RequestInit & { maxRetries?: number } = {},
): Promise<Response> {
  const apiKey = getBlackcatApiKey();
  const { maxRetries = 4, headers, ...rest } = init;
  let lastErr: unknown = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        ...rest,
        headers: {
          Accept: "application/json",
          "X-API-Key": apiKey,
          ...(headers || {}),
        },
      });
      if ((res.status === 429 || res.status >= 500) && attempt < maxRetries) {
        // Respeita Retry-After da Black Cat; senão, backoff exponencial com jitter.
        const retryAfter = res.status === 429 ? parseRetryAfterMs(res) : null;
        const base = Math.min(1000 * 2 ** attempt, 8000);
        const jitter = Math.floor(Math.random() * 400);
        const backoff = (retryAfter ?? base) + jitter;
        await new Promise((r) => setTimeout(r, backoff));
        continue;
      }
      return res;
    } catch (err) {
      lastErr = err;
      if (attempt >= maxRetries) break;
      const jitter = Math.floor(Math.random() * 400);
      await new Promise((r) => setTimeout(r, Math.min(1000 * 2 ** attempt, 8000) + jitter));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Falha de rede na Black Cat");
}

async function parseJson(res: Response): Promise<any> {
  const text = await res.text();
  if (!text) return {};
  try { return JSON.parse(text); } catch { return { _raw: text }; }
}

function extractError(json: any, status: number): string {
  const msg =
    json?.message ||
    json?.error?.message ||
    json?.error ||
    (Array.isArray(json?.errors) ? json.errors.map((e: any) => e?.message || e).join("; ") : null) ||
    null;
  if (typeof msg === "string" && msg.trim()) return msg;
  switch (status) {
    case 400: return "Dados inválidos para gerar o PIX.";
    case 401: return "Credencial Black Cat inválida.";
    case 403: return "Conta Black Cat sem permissão.";
    case 404: return "Recurso não encontrado.";
    case 422: return "Dados de transação inválidos.";
    case 429: return "Muitas requisições. Aguarde um instante.";
    default:  return `Falha na Black Cat (HTTP ${status}).`;
  }
}

export function normalizeStatus(raw: any): PixCharge["status"] {
  const s = String(raw ?? "pending").toLowerCase().trim();
  if (["ok","paid","pago","completed","approved","success","confirmed","authorized","settled","captured","complete","finished","done"].includes(s)) return "paid";
  if (["expired","expirado"].includes(s)) return "expired";
  if (["failed","falha","cancelled","canceled","cancelado","rejected","recusado","refused","refunded","estornado","charged_back","chargeback","med"].includes(s)) return "cancelled";
  return "pending";
}

/* -------------------------------------------------------------------------- */
/*  Extrai PIX da resposta                                                     */
/* -------------------------------------------------------------------------- */

function pickPixCode(body: any): string {
  return (
    body?.pix_code ||
    body?.pixCode ||
    body?.pix?.qrcode ||
    body?.pix?.payload ||
    body?.qrcode ||
    ""
  );
}
function pickQrImage(body: any): string | null {
  const candidate =
    body?.qr_code_url ||
    body?.qrCodeUrl ||
    body?.qr_code_base64 ||
    body?.qrCodeBase64 ||
    body?.qr_code_image ||
    body?.qrCodeImage ||
    null;

  if (typeof candidate !== "string" || !candidate.trim()) return null;
  const v = candidate.trim();

  // A Codefy (e vários gateways) devolvem o PRÓPRIO payload PIX ("copia e cola")
  // nesses campos, não uma imagem. Um payload PIX começa com "0002" e contém
  // "br.gov.bcb.pix". Nesse caso, retornamos null para o frontend gerar o QR
  // a partir do payload. Só tratamos como imagem quando for realmente uma
  // imagem (data URI de imagem, base64 puro ou URL http de imagem).
  const looksLikePixPayload =
    v.startsWith("0002") || /br\.gov\.bcb\.pix/i.test(v);
  if (looksLikePixPayload) return null;

  if (v.startsWith("data:image/")) return v;
  if (/^https?:\/\//i.test(v)) return v;
  // base64 puro (sem prefixo) -> monta data URI de imagem PNG
  if (/^[A-Za-z0-9+/=\s]+$/.test(v) && v.length > 100) {
    return `data:image/png;base64,${v.replace(/\s+/g, "")}`;
  }
  return null;
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
  }) => ({
    externalId:
      input?.externalId?.trim() ||
      `cs-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
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

    const callbackUrl = `${APP_ORIGIN}/api/public/blackcat-webhook`;

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
    if (!isAllowedAmount(Number(data.amount))) {
      console.error("[blackcat] valor de PIX rejeitado (fora da allowlist):", data.amount);
      throw new Error("Valor de pagamento inválido.");
    }

    // Black Cat exige valores em CENTAVOS (integer)
    const amountCents = Math.max(100, Math.round(Number(data.amount) * 100));

    const txBody: Record<string, any> = {
      amount: amountCents,
      currency: "BRL",
      paymentMethod: "pix",
      postbackUrl: callbackUrl,
      externalRef: data.externalId,
      // metadata é STRING na Black Cat (guardamos os detalhes no Supabase)
      metadata: JSON.stringify({ external_id: data.externalId, ...data.utms }).slice(0, 2000),
      customer: {
        name: clientName,
        email: synth.email,
        phone: clientPhone,
        document: { number: clientDocument, type: "cpf" },
      },
      items: [
        {
          title: data.description,
          unitPrice: amountCents,
          quantity: 1,
          tangible: false,
        },
      ],
      pix: { expiresInDays: 1 },
      // UTMs top-level (a Black Cat armazena em transaction.metadata.utm)
      ...(data.utms.utm_source ? { utm_source: data.utms.utm_source } : {}),
      ...(data.utms.utm_medium ? { utm_medium: data.utms.utm_medium } : {}),
      ...(data.utms.utm_campaign ? { utm_campaign: data.utms.utm_campaign } : {}),
      ...(data.utms.utm_content ? { utm_content: data.utms.utm_content } : {}),
      ...(data.utms.utm_term ? { utm_term: data.utms.utm_term } : {}),
    };

    const payRes = await blackcatFetch("/sales/create-sale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(txBody),
    });
    const payJson = await parseJson(payRes);
    if (!payRes.ok || payJson?.success === false) {
      console.error("[blackcat] create pix error", payRes.status, JSON.stringify(payJson).slice(0, 1200));
      throw new Error(extractError(payJson, payRes.status));
    }

    const body = payJson?.data ?? payJson?.transaction ?? payJson;
    const identifier: string = String(
      body?.transactionId ?? body?.id ?? body?.transaction_id ?? data.externalId,
    );
    // Black Cat retorna os dados PIX em body.paymentData.{qrCode,copyPaste,qrCodeBase64,expiresAt}
    const paymentData = body?.paymentData ?? {};
    const pixCode = paymentData?.copyPaste || paymentData?.qrCode || pickPixCode(body);
    // qrCodeBase64 costuma vir como data URI de imagem PNG
    const qrImage = pickQrImage({ qrCodeBase64: paymentData?.qrCodeBase64 }) ?? pickQrImage(body);
    const expiresAt: string | null =
      paymentData?.expiresAt ?? body?.expires_at ?? body?.expiresAt ?? null;

    if (!pixCode) {
      console.error("[blackcat] pix sem código:", JSON.stringify(body).slice(0, 1200));
      throw new Error("Gateway não retornou o código PIX.");
    }

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
      console.error("[blackcat] purchase_logs pre-insert falhou", err);
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
      console.error("[blackcat] utmify waiting_payment falhou", err);
    }

    return {
      id: identifier,
      txid: identifier,
      externalId: data.externalId,
      amount: Number(data.amount),
      status: normalizeStatus(body?.status),
      pixCopiaCola: pixCode,
      qrCodeBase64: qrImage,
      expiresAt,
    };
  });

export const getPixStatus = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string; light?: boolean }) => ({
    id: String(input?.id ?? "").trim(),
    // Modo leve: só consulta o Supabase (alimentado pelo webhook do gateway),
    // sem tocar na Black Cat. Usado pelo polling frequente para não saturar o
    // rate limit da Black Cat e liberar capacidade para a geração de novos PIX.
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
      console.error("[blackcat status] purchase_logs lookup falhou", err);
    }

    // Polling leve não consulta a Black Cat: retorna pendente e deixa o webhook
    // confirmar o pagamento via Supabase. Isso reduz drasticamente as chamadas
    // à Black Cat e evita o 429 na geração de PIX.
    if (data.light) {
      return { id: data.id, status: "pending", paid: false, paidAt: null, expiresAt: null };
    }

    const res = await blackcatFetch(
      `/sales/${encodeURIComponent(data.id)}/status`,
      { method: "GET" },
    );
    const json = await parseJson(res);

    if (!res.ok) {
      if (res.status === 404) {
        return { id: data.id, status: "pending", paid: false, paidAt: null, expiresAt: null };
      }
      throw new Error(extractError(json, res.status));
    }

    const tx = json?.data ?? json?.transaction ?? json;
    const rawStatus = tx?.status ?? tx?.payment_status;
    const status = normalizeStatus(rawStatus);
    console.log("[blackcat status]", { id: data.id, rawStatus, normalized: status });

    if (status === "paid") {
      try {
        // Black Cat retorna amount em CENTAVOS -> converte para reais
        const amount = (Number(tx?.amount ?? 0) || 0) / 100;
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
        if (upErr) console.error("[blackcat status] purchase_logs upsert", upErr);

        if (!alreadyPaid) {
          const { sendCapiEvent } = await import("@/lib/fb-capi.server");
          const origin =
            process.env.PUBLIC_APP_URL?.replace(/\/$/, "") || "https://www.whatsradar.com";
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
        console.error("[blackcat status] erro registrando purchase", err);
      }
    }

    return {
      id: String(tx?.id ?? tx?.transactionId ?? data.id),
      status,
      paid: status === "paid",
      paidAt: status === "paid" ? (tx?.paid_at ?? tx?.paidAt ?? tx?.updatedAt ?? null) : null,
      expiresAt: tx?.expires_at ?? tx?.expiresAt ?? null,
    };
  });
