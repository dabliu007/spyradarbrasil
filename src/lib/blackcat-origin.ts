declare global {
  interface Window {
    BlackCatOrigem?: { token: () => Promise<string> };
  }
}

export const BLACKCAT_PUBLIC_KEY =
  "pk_live_5ddc76e33e9fcd397ca5945ee8759a1d15bad594d49ef5d596a71ecd86795e5c";

export const BLACKCAT_ORIGIN_SCRIPT_SRC = `https://psmservices.blackmasterx.com/origem/v1.js?chave=${BLACKCAT_PUBLIC_KEY}`;

/**
 * Obtém o token de origem gerado pelo script da BlackCat. O script carrega de
 * forma assíncrona, então aguarda até `timeoutMs` por ele antes de desistir.
 * Sem esse token a BlackCat recusa a venda.
 */
export async function getBlackCatOriginToken(timeoutMs = 5000): Promise<string | undefined> {
  if (typeof window === "undefined") return undefined;
  const deadline = Date.now() + timeoutMs;
  while (!window.BlackCatOrigem && Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 150));
  }
  if (!window.BlackCatOrigem) {
    console.warn("[blackcat] script de origem não carregou");
    return undefined;
  }
  try {
    const token = await window.BlackCatOrigem.token();
    return typeof token === "string" && token ? token : undefined;
  } catch (err) {
    console.warn("[blackcat] falha ao obter token de origem", err);
    return undefined;
  }
}
