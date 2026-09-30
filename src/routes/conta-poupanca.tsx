import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTargetName } from "@/lib/use-target-name";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { createPixCharge, getPixStatus, type PixCharge } from "@/lib/pix.functions";
import { fbqTrackOnce, getMetaCookies, getPersistedUtms } from "@/lib/tracking";

const POUPANCA_AMOUNT = 297.00;
const POUPANCA_DESCRIPTION = "Recupera Relacionamento: Acesso Anual";
const SALDO_OCULTO = "R$ 32.981,93";

const searchSchema = z.object({
  phone: z.coerce.string().optional().default(""),
  sex: z.enum(["M", "F"]).optional().default("M"),
});

export const Route = createFileRoute("/conta-poupanca")({
  head: () => ({
    meta: [
      { title: "Conta Poupança Oculta Encontrada — SpyRadar Brasil" },
      {
        name: "description",
        content:
          "Uma conta poupança oculta com saldo escondido foi detectada no dispositivo investigado. Libere o acesso agora.",
      },
      { property: "og:title", content: "Conta Poupança Oculta — SpyRadar Brasil" },
      {
        property: "og:description",
        content: "Conta poupança escondida com saldo detectado. Libere o acesso.",
      },
      { property: "og:url", content: "https://clonawhats.com/conta-poupanca" },
      { name: "robots", content: "noindex,follow" },
    ],
    links: [{ rel: "canonical", href: "https://clonawhats.com/conta-poupanca" }],
  }),
  validateSearch: (s) => searchSchema.parse(s),
  component: ContaPoupancaPage,
});

function ContaPoupancaPage() {
  const { phone, sex } = Route.useSearch();
  const navigate = useNavigate();
  const createPix = useServerFn(createPixCharge);
  const checkPix = useServerFn(getPixStatus);
  const targetName = useTargetName();
  const doAlvo = targetName ? `de ${targetName}` : "do alvo";
  const dele = sex === "F" ? "dela" : "dele";

  const [charge, setCharge] = useState<PixCharge | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [statusLabel, setStatusLabel] = useState("Aguardando confirmação…");
  const [showPix, setShowPix] = useState(false);
  const createdRef = useRef(false);

  useEffect(() => {
    if (!showPix || createdRef.current) return;
    createdRef.current = true;
    (async () => {
      try {
        const { fbc, fbp } = getMetaCookies();
        const utms = getPersistedUtms();
        const c = await createPix({
          data: { product: "conta_poupanca", amount: POUPANCA_AMOUNT, description: POUPANCA_DESCRIPTION, fbc, fbp, utms, phone, gender: sex },
        });
        setCharge(c);
        (window as any).dataLayer = (window as any).dataLayer || [];
        (window as any).dataLayer.push({ event: "gerar_pix", valor: c.amount, produto_id: "conta_poupanca", moeda: "BRL" });
        fbqTrackOnce(`ic-poupanca-${c.externalId}`, "InitiateCheckout", {
          value: c.amount,
          currency: "BRL",
          content_ids: [c.externalId],
          content_type: "upsell_conta_poupanca",
          phone,
          gender: sex,
        });
      } catch (e: any) {
        setError(e?.message || "Falha ao gerar PIX");
      }
    })();
  }, [showPix, createPix, phone, sex]);

  const paidRef = useRef(false);
  useEffect(() => {
    if (!charge?.id) return;
    let cancelled = false;
    let pollCount = 0;
    const tick = async (force = false) => {
      if (paidRef.current || cancelled) return;
      const light = !force && pollCount++ % 6 !== 5;
      try {
        const s = await checkPix({ data: { id: charge.id, light } });
        if (cancelled) return;
        if (s.paid) {
          paidRef.current = true;
          setStatusLabel("Conta poupança liberada!");
          (window as any).dataLayer = (window as any).dataLayer || [];
          (window as any).dataLayer.push({ event: "purchase", transaction_id: charge.id, valor: charge.amount, moeda: "BRL" });
          fbqTrackOnce(`purchase-poupanca-${charge.externalId}`, "Purchase", {
            value: charge.amount,
            currency: "BRL",
            content_ids: [charge.externalId],
            content_type: "upsell_conta_poupanca",
            phone,
            gender: sex,
            transaction_id: charge.id,
          });
          const qs = new URLSearchParams({ phone: phone ?? "", sex: sex ?? "M" }).toString();
          window.location.assign(`/acesso-liberado?${qs}`);
        } else {
          setStatusLabel("Aguardando confirmação…");
        }
      } catch {}
    };
    tick();
    const id = window.setInterval(() => tick(), 4000);
    const onVis = () => { if (document.visibilityState === "visible") tick(true); };
    const onFocus = () => tick(true);
    window.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      window.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", onFocus);
    };
  }, [charge?.id, charge?.amount, charge?.externalId, checkPix, navigate, phone, sex]);

  const copy = async () => {
    if (!charge?.pixCopiaCola) return;
    try {
      await navigator.clipboard.writeText(charge.pixCopiaCola);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const qrImgSrc =
    charge?.qrCodeBase64 ||
    (charge?.pixCopiaCola
      ? `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=0&data=${encodeURIComponent(charge.pixCopiaCola)}`
      : "");

  const skip = () => {
    const qs = new URLSearchParams({ phone: phone ?? "", sex: sex ?? "M" }).toString();
    window.location.assign(`/acesso-liberado?${qs}`);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-['Inter',sans-serif] relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(128,128,128,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(128,128,128,0.07) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/[0.10] blur-[140px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-md mx-auto px-4 py-6 space-y-5">
        {/* Alerta topo */}
        <div className="bg-amber-500 text-white text-center text-[11px] font-bold uppercase tracking-wider py-2 rounded-lg animate-pulse shadow-[0_0_20px_rgba(245,158,11,0.6)]">
          💰 Conta poupança oculta detectada
        </div>

        {/* HEADLINE PRINCIPAL */}
        <div className="text-center space-y-2">
          <div className="inline-block bg-yellow-100 border border-yellow-300 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-yellow-700 font-['Geist_Mono',monospace] font-bold">
            🚨 Descoberta durante a varredura bancária
          </div>
          <h1 className="text-3xl font-extrabold leading-[1.05] tracking-tight">
            Encontramos uma <span className="text-yellow-700">conta poupança escondida</span> {doAlvo}
          </h1>
          <p className="text-sm text-slate-700 leading-snug px-2">
            Um saldo oculto de{" "}
            <span className="text-yellow-700 font-extrabold">{SALDO_OCULTO}</span>{" "}
            estava escondido no celular {dele}. Essa conta <span className="font-bold">não aparece</span> nos apps normais — ela foi ocultada de propósito.
          </p>
        </div>

        {/* Cartão saldo detectado */}
        <div className="bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-3xl p-5 text-white shadow-[0_20px_60px_-10px_rgba(217,169,40,0.6)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-yellow-100/80 font-['Geist_Mono',monospace] font-bold">
                Conta Poupança · Oculta
              </div>
              <div className="text-sm font-bold text-white/90 mt-0.5">Ag. 0001 · CC ████-█</div>
            </div>
            <div className="text-[10px] bg-red-500 text-white font-bold px-2 py-1 rounded uppercase tracking-widest animate-pulse">🔒 Bloqueada</div>
          </div>
          <div className="text-center py-2">
            <div className="text-[10px] uppercase tracking-[0.25em] text-yellow-100/80 font-['Geist_Mono',monospace]">
              Saldo detectado
            </div>
            <div className="text-4xl sm:text-5xl font-extrabold tracking-tight mt-1">
              {SALDO_OCULTO}
            </div>
            <div className="text-[11px] text-yellow-100/90 mt-1">
              💎 Dinheiro escondido · fora da conta corrente
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20 space-y-1.5 text-[12px] font-['Geist_Mono',monospace] text-yellow-50/90">
            <div className="flex justify-between"><span>Última movimentação</span><span className="font-bold">há 6 dias</span></div>
            <div className="flex justify-between"><span>Depósitos últimos 90d</span><span className="font-bold">R$ 12.4██,██</span></div>
            <div className="flex justify-between"><span>Tipo</span><span className="font-bold">Poupança oculta</span></div>
          </div>
        </div>

        {/* Explicação da oferta */}
        <div className="bg-white border-2 border-yellow-500/60 rounded-3xl p-5 shadow-[0_0_40px_-10px_rgba(217,169,40,0.4)]">
          <div className="flex items-start gap-3 mb-3">
            <span className="text-3xl">🔓</span>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-yellow-700 font-['Geist_Mono',monospace] font-bold">
                Liberação total desta poupança
              </div>
              <h2 className="text-xl font-extrabold leading-tight mt-1">
                Pague uma vez e receba <span className="text-yellow-700">acesso completo</span> ao saldo escondido
              </h2>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-3 text-[12px] text-yellow-800 leading-snug">
            💡 <span className="font-bold">Não é só ver.</span> Com a liberação você:
            transfere via PIX, saca, movimenta e até esvazia essa conta antes que {dele === "dela" ? "ela" : "ele"} perceba.
          </div>

          <div className="mt-3 bg-amber-50 border border-amber-300 rounded-xl p-3 text-[12px] text-amber-900 leading-snug">
            🏦 <span className="font-bold">Bônus incluso:</span> além da poupança oculta, você recebe acesso a{" "}
            <span className="font-extrabold">TODOS os bancos</span> instalados no celular {dele} — Nubank, Itaú, Bradesco, C6, Inter, Caixa, Mercado Pago, PicPay e todos os outros. Saldo, extrato e movimentação em tempo real.
          </div>

          <ul className="mt-4 space-y-2 text-[13px] text-slate-800">
            <li className="flex gap-2">
              <span className="text-yellow-700">💸</span>
              <span><span className="font-bold">Transfira todo o saldo</span> da poupança para a sua conta em poucos cliques.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-yellow-700">🏦</span>
              <span><span className="font-bold">Acesso a TODOS os bancos</span> do celular — corrente, poupança, investimentos e carteiras digitais.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-yellow-700">📊</span>
              <span><span className="font-bold">Extrato completo</span> de cada conta — descubra de onde vem cada centavo escondido.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-yellow-700">🕵️</span>
              <span><span className="font-bold">Rastreamento de depósitos e PIX</span> — remetentes, datas, valores e mensagens.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-yellow-700">🔕</span>
              <span><span className="font-bold">Modo silencioso</span> — {dele === "dela" ? "ela" : "ele"} não recebe notificação da liberação.</span>
            </li>
          </ul>

          {/* Justificativa do custo */}
          <div className="mt-4 bg-slate-50 border border-slate-300 rounded-xl p-3 text-[12px] text-slate-700 leading-snug">
            ⚙️ <span className="font-bold">Por que essa taxa?</span> A liberação exige o uso de{" "}
            <span className="font-bold">programas especializados de hacking bancário</span> (bypass de tokens, quebra de biometria e descriptografia dos apps). O valor cobre exclusivamente o custo desses softwares — nada fica para nós.
          </div>


          {/* Ancoragem de valor */}
          <div className="mt-5 bg-yellow-50/60 border border-yellow-200 rounded-2xl p-4">
            <div className="text-center space-y-1">
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-['Geist_Mono',monospace]">
                Retorno médio dos clientes
              </div>
              <div className="text-yellow-700 text-sm font-extrabold">
                +200× o valor da liberação
              </div>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="text-slate-500 line-through text-lg">R$ 497,00</span>
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">-70%</span>
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-yellow-700/80 font-['Geist_Mono',monospace]">
                Taxa única de liberação
              </div>
              <div>
                <span className="text-yellow-700 text-5xl font-extrabold tracking-tight">R$ 297,00</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Menos de 0,5% do saldo oculto detectado
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setShowPix(true);
              setTimeout(() => document.getElementById("pix-box")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
            }}
            className="mt-5 flex w-full min-h-14 items-center justify-center text-center bg-yellow-600 hover:bg-yellow-700 text-[#080808] font-extrabold rounded-2xl transition-all active:scale-[0.98] shadow-[0_0_40px_-4px_rgba(217,169,40,0.9)] text-[15px] uppercase tracking-wide"
          >
            🔓 Liberar poupança de {SALDO_OCULTO}
          </button>
          <p className="text-center text-[11px] text-slate-500 mt-3">
            🔒 Pagamento único · liberação em segundos · 100% anônimo
          </p>

          <button
            onClick={skip}
            className="mt-3 w-full text-center text-[11px] text-slate-400 underline hover:text-slate-600"
          >
            Não quero acesso ao dinheiro escondido, continuar sem liberar
          </button>
        </div>

        {showPix && (
          <div id="pix-box" className="bg-white border-2 border-yellow-500/60 rounded-3xl p-5 shadow-[0_0_40px_-10px_rgba(217,169,40,0.5)]">
            <div className="text-center mb-3">
              <div className="text-[10px] uppercase tracking-[0.25em] text-yellow-700 font-['Geist_Mono',monospace] font-bold">
                Pagamento PIX · R$ 297,00
              </div>
              <div className="text-sm text-slate-700 mt-1">{statusLabel}</div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-300 text-red-700 rounded-xl p-3 text-[12px] text-center">
                {error}
              </div>
            )}

            {!error && !charge && (
              <div className="text-center text-slate-500 text-[13px] py-6">Gerando código PIX…</div>
            )}

            {charge && (
              <div className="space-y-3">
                {qrImgSrc && (
                  <div className="flex justify-center">
                    <img src={qrImgSrc} alt="QR Code PIX" className="w-56 h-56 rounded-xl border border-slate-200 bg-white" />
                  </div>
                )}
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-['Geist_Mono',monospace] mb-1">
                    PIX copia e cola
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-[11px] font-mono break-all text-slate-700 max-h-24 overflow-auto">
                    {charge.pixCopiaCola}
                  </div>
                </div>
                <button
                  onClick={copy}
                  className="w-full h-12 bg-yellow-600 hover:bg-yellow-700 text-[#080808] font-bold rounded-2xl transition-all active:scale-[0.98] text-[14px] uppercase tracking-wide"
                >
                  {copied ? "✓ Copiado!" : "📋 Copiar código PIX"}
                </button>
                <div className="text-center text-[11px] text-slate-500">
                  Liberação automática assim que o pagamento for confirmado.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Garantia */}
        <div className="bg-white border border-yellow-200 rounded-2xl p-4 flex gap-3 items-start">
          <span className="text-3xl">🛡️</span>
          <div>
            <div className="text-sm font-extrabold text-yellow-700">Garantia total de 7 dias</div>
            <p className="text-[12px] text-slate-700 leading-snug mt-1">
              Se a poupança liberada não corresponder ao saldo detectado, devolvemos{" "}
              <span className="font-bold text-yellow-700">100% do valor pago hoje</span>.
            </p>
          </div>
        </div>

        {/* Depoimentos */}
        <div className="space-y-3">
          <div className="text-center text-[10px] uppercase tracking-[0.3em] text-slate-500 font-['Geist_Mono',monospace] font-bold">
            ✦ Quem liberou · pegou o dinheiro de volta ✦
          </div>
          {[
            { n: "Aline P. · SP", t: "Encontrei R$ 18 mil escondidos numa poupança que eu nem sabia que existia. Transferi tudo antes dele bloquear." },
            { n: "Vanessa L. · BA", t: "R$ 42 mil guardados em segredo. Recuperei o que era meu por direito." },
            { n: "Camila S. · PR", t: "Paguei R$ 297 e resgatei mais de R$ 25 mil. Foi o melhor investimento da minha vida." },
          ].map((d, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-3">
              <div className="flex items-center gap-2 text-yellow-700 text-xs mb-1">★★★★★ <span className="text-slate-500 text-[11px]">· {d.n}</span></div>
              <p className="text-[12px] text-slate-700 italic leading-snug">"{d.t}"</p>
            </div>
          ))}
        </div>

        <div className="text-center text-[10px] text-slate-400 pt-2">
          🔒 Operação sigilosa · {dele === "dela" ? "ela" : "ele"} não recebe nenhum aviso
        </div>
      </div>
    </div>
  );
}
