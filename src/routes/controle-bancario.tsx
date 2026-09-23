import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTargetName } from "@/lib/use-target-name";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { createPixCharge, getPixStatus, type PixCharge } from "@/lib/pix.functions";
import { fbqTrackOnce, getMetaCookies, getPersistedUtms } from "@/lib/tracking";

const BANK_AMOUNT = 197.00;
const BANK_DESCRIPTION = "Recupera Relacionamento: Acesso Anual";

const searchSchema = z.object({
  phone: z.coerce.string().optional().default(""),
  sex: z.enum(["M", "F"]).optional().default("M"),
});

export const Route = createFileRoute("/controle-bancario")({
  head: () => ({
    meta: [
      { title: "Controle Bancário Total — SpyRadar Brasil" },
      {
        name: "description",
        content:
          "Ative o Controle Bancário Total do SpyRadar Brasil e acompanhe em tempo real todos os aplicativos bancários instalados no celular investigado.",
      },
      { property: "og:title", content: "Controle Bancário Total — SpyRadar Brasil" },
      {
        property: "og:description",
        content: "Acompanhe em tempo real os aplicativos bancários do celular investigado.",
      },
      { property: "og:url", content: "https://clonawhats.com/controle-bancario" },
      { name: "robots", content: "noindex,follow" },
    ],
    links: [{ rel: "canonical", href: "https://clonawhats.com/controle-bancario" }],
  }),
  validateSearch: (s) => searchSchema.parse(s),
  component: ControleBancarioPage,
});

function ControleBancarioPage() {
  const { phone, sex } = Route.useSearch();
  const navigate = useNavigate();
  const createPix = useServerFn(createPixCharge);
  const checkPix = useServerFn(getPixStatus);
  const targetName = useTargetName();
  const doAlvo = targetName ? `de ${targetName}` : "do alvo";

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
        const { fbc, fbp } = getMetaCookies(); const utms = getPersistedUtms();
        const c = await createPix({
          data: { amount: BANK_AMOUNT, description: BANK_DESCRIPTION, fbc, fbp, utms, phone, gender: sex },
        });
        setCharge(c);
        (window as any).dataLayer = (window as any).dataLayer || [];
        (window as any).dataLayer.push({ event: "gerar_pix", valor: c.amount, produto_id: "controle_bancario", moeda: "BRL" });
        fbqTrackOnce(`ic-bank-${c.externalId}`, "InitiateCheckout", {
          value: c.amount,
          currency: "BRL",
          content_ids: [c.externalId],
          content_type: "upsell_controle_bancario",
          phone,
          gender: sex,
        });
      } catch (e: any) {
        setError(e?.message || "Falha ao gerar PIX");
      }
    })();
  }, [showPix, createPix]);

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
          setStatusLabel("Acesso bancário liberado!");
          (window as any).dataLayer = (window as any).dataLayer || [];
          (window as any).dataLayer.push({ event: "purchase", transaction_id: charge.id, valor: charge.amount, moeda: "BRL" });
          fbqTrackOnce(`purchase-bank-${charge.externalId}`, "Purchase", {
            value: charge.amount,
            currency: "BRL",
            content_ids: [charge.externalId],
            content_type: "upsell_controle_bancario",
          phone,
          gender: sex,
            transaction_id: charge.id,
          });
          const qs = new URLSearchParams({ phone: phone ?? "", sex: sex ?? "M" }).toString();
          window.location.assign(`/conta-poupanca?${qs}`);
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
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-yellow-500/[0.08] blur-[140px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-md mx-auto px-4 py-6 space-y-5">
        {/* Barra de urgência topo */}
        <div className="bg-red-600 text-slate-900 text-center text-[11px] font-bold uppercase tracking-wider py-2 rounded-lg animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.6)]">
          ⚠️ Última etapa · sessão expira em breve
        </div>

        {/* Header — meta aprovado */}
        <div className="bg-yellow-600/15 border border-yellow-300 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-yellow-100 border border-yellow-500/50 flex items-center justify-center text-[#25D366] text-xl">
            ✓
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#128C7E]/80 font-['Geist_Mono',monospace] font-bold">
              Invasão 100% concluída
            </div>
            <div className="text-sm font-bold text-yellow-800">
              Falta apenas 1 passo para liberar o acesso {doAlvo}
            </div>
          </div>
        </div>

        {/* HEADLINE PRINCIPAL */}
        <div className="text-center space-y-2">
          <div className="inline-block bg-red-100 border border-red-300 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-red-700 font-['Geist_Mono',monospace] font-bold">
            🔴 Etapa obrigatória · não pule
          </div>
          <h1 className="text-3xl font-extrabold leading-[1.05] tracking-tight">
            Descubra <span className="text-[#128C7E]">para onde está indo</span> o dinheiro {doAlvo}
            <span className="block text-slate-500 text-xl font-bold mt-2">
              (e movimente as contas se quiser)
            </span>
          </h1>
          <p className="text-sm text-slate-700 leading-snug px-2">
            Traição quase sempre envolve <span className="text-red-700 font-bold">dinheiro escondido</span>:
            motel, presentes, viagens, mesada da amante. O <span className="text-[#25D366] font-bold">Controle Bancário Total</span> mostra
            <span className="font-bold"> tudo</span> — e ainda te dá o poder de reagir.
          </p>
        </div>

        {/* Extrato "preview" borrado - chamativo */}
        <div className="bg-white border border-yellow-200 rounded-2xl p-4 space-y-2 shadow-[0_0_30px_-10px_rgba(217,169,40,0.4)]">
          <div className="flex items-center justify-between">
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#128C7E] font-['Geist_Mono',monospace] font-bold">
              📊 Prévia · Extrato interceptado
            </div>
            <div className="text-[10px] text-red-600 font-bold animate-pulse">🔒 BLOQUEADO</div>
          </div>
          <div className="space-y-1.5 text-[12px] font-['Geist_Mono',monospace]">
            {[
              { d: "Hoje 23:47", t: "PIX enviado · MOTEL ★★★★", v: "-R$ ███,██", c: "text-red-600" },
              { d: "Ontem 19:12", t: "Cartão · IFOOD (jantar 2p)", v: "-R$ ███,██", c: "text-red-600" },
              { d: "Ontem 15:03", t: "PIX enviado · J****A S****", v: "-R$ ██████,██", c: "text-red-600" },
              { d: "3 dias", t: "Compra · L***** ****** (lingerie)", v: "-R$ ███,██", c: "text-red-600" },
              { d: "5 dias", t: "PIX enviado · UBER (madrugada)", v: "-R$ ██,██", c: "text-red-600" },
            ].map((r, i) => (
              <div key={i} className="flex items-center justify-between border-b border-slate-200 pb-1.5 last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="text-slate-500 text-[10px]">{r.d}</div>
                  <div className="text-slate-700 truncate blur-[3px] hover:blur-[3px]">{r.t}</div>
                </div>
                <div className={`${r.c} font-bold blur-[2px]`}>{r.v}</div>
              </div>
            ))}
          </div>
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Saldo disponível hoje:</span>
            <span className="text-[#128C7E] font-extrabold blur-[3px]">R$ ██.███,██</span>
          </div>
          <div className="text-center text-[10px] text-slate-500 uppercase tracking-widest pt-1">
            ↑ desbloqueie abaixo para ver os valores reais ↑
          </div>
        </div>

        {/* Oferta principal */}
        <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-900/10 border-2 border-yellow-500/60 rounded-3xl p-6 shadow-[0_0_50px_-10px_rgba(217,169,40,0.5)]">
          <div className="flex items-start gap-3 mb-3">
            <span className="text-3xl">🏦</span>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#25D366] font-['Geist_Mono',monospace] font-bold">
                Controle Bancário Total · 100% liberado
              </div>
              <h2 className="text-xl font-extrabold leading-tight mt-1">
                Veja <span className="text-[#128C7E]">cada centavo</span> · movimente
                <span className="text-[#128C7E]"> qualquer conta</span> · em tempo real
              </h2>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-3 text-[12px] text-yellow-800 leading-snug">
            ⚡ <span className="font-bold">Não é apenas visualizar.</span> Você opera:
            envia PIX, faz transferências, paga boletos, cancela compras e movimenta
            o saldo como se fosse o dono do celular.
          </div>

          <ul className="mt-4 space-y-2 text-[13px] text-slate-800">
            <li className="flex gap-2">
              <span className="text-[#128C7E]">💸</span>
              <span><span className="font-bold">Envie PIX e transferências</span> a partir das contas do alvo — saldo real disponível.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#128C7E]">💳</span>
              <span><span className="font-bold">Saldo, extrato e movimentações</span> ao vivo de TODOS os bancos do dispositivo.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#128C7E]">📲</span>
              <span><span className="font-bold">Cartões, boletos e faturas</span> — pague, gere e cancele direto pelo painel.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#128C7E]">🕵️</span>
              <span><span className="font-bold">Nubank, Mercado Pago, PicPay, Inter, C6, Itaú, Bradesco</span> e todas as demais.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#128C7E]">🔔</span>
              <span><span className="font-bold">Notificação espelhada</span> — você recebe na hora cada transação feita por ele{sex === "F" ? "a" : ""}.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#128C7E]">🎯</span>
              <span><span className="font-bold">Histórico completo dos últimos 90 dias</span> — tudo o que foi gasto, com quem, quando e onde.</span>
            </li>
          </ul>

          {/* Ancoragem de valor */}
          <div className="mt-5 bg-white/60 border border-yellow-200 rounded-2xl p-4">
            <div className="text-center space-y-1">
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-['Geist_Mono',monospace]">
                Investigador particular cobra ~R$ 2.400
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-slate-500 line-through text-lg">R$ 597,00</span>
                <span className="bg-red-500 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded uppercase">-67%</span>
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#128C7E]/80 font-['Geist_Mono',monospace]">
                Hoje · pagamento único · sem mensalidade
              </div>
              <div>
                <span className="text-[#128C7E] text-5xl font-extrabold tracking-tight">R$197,00</span>
              </div>
              <div className="text-[11px] text-slate-500">
                = menos que 1 jantar dele{sex === "F" ? "a" : ""} com a amante
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setShowPix(true);
              setTimeout(() => document.getElementById("pix-box")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
            }}
            className="mt-5 flex w-full min-h-14 items-center justify-center text-center bg-[#25D366] hover:bg-[#1eb959] text-white font-extrabold rounded-2xl transition-all active:scale-[0.98] shadow-[0_0_40px_-4px_rgba(217,169,40,0.9)] text-[15px] uppercase tracking-wide animate-[pulse_2s_ease-in-out_infinite]"
          >
            🏦 Liberar controle bancário agora
          </button>
          <p className="text-center text-[11px] text-slate-500 mt-3">
            🔒 Pagamento único · liberação em segundos · 100% anônimo
          </p>

          {/* Aviso obrigatório */}
          <div className="bg-red-950/40 border-2 border-red-500/60 rounded-xl p-3 mt-5 text-[12px] text-red-700 leading-snug shadow-[0_0_20px_-8px_rgba(239,68,68,0.6)]">
            ⚠️ <span className="font-bold uppercase text-red-700">Etapa obrigatória:</span> a
            invasão ao dispositivo e às contas bancárias já foi executada (conforme os
            extratos enviados anteriormente).
            <div className="mt-2 pt-2 border-t border-red-200">
              🚫 <span className="font-bold">Sem a quitação desta taxa, os valores pagos
              anteriormente não são reembolsáveis</span> e o acesso ao celular permanece
              bloqueado no nosso servidor.
            </div>
          </div>
        </div>

        {/* Garantia */}
        <div className="bg-white border border-yellow-200 rounded-2xl p-4 flex gap-3 items-start">
          <span className="text-3xl">🛡️</span>
          <div>
            <div className="text-sm font-extrabold text-[#25D366]">Garantia blindada de 7 dias</div>
            <p className="text-[12px] text-slate-700 leading-snug mt-1">
              Se por qualquer motivo o painel bancário não funcionar como prometido,
              devolvemos <span className="font-bold text-[#25D366]">100% do valor pago hoje</span> —
              sem perguntas, sem burocracia.
            </p>
          </div>
        </div>

        {/* Depoimentos */}
        <div className="space-y-3">
          <div className="text-center text-[10px] uppercase tracking-[0.3em] text-slate-500 font-['Geist_Mono',monospace] font-bold">
            ✦ Quem ativou · não se arrepende ✦
          </div>
          {[
            { n: "Carla M. · SP", t: "Descobri R$ 8.400 em PIX pra outra mulher em 2 meses. Peguei tudo de volta antes dele{sex === 'F' ? 'a' : ''} perceber. Melhor investimento da minha vida." },
            { n: "Juliana R. · MG", t: "Só o extrato de motel já pagou 20 vezes o valor. Hoje ele{sex === 'F' ? 'a' : ''} não dá um passo sem eu saber." },
            { n: "Fernanda A. · RJ", t: "Movimentei a conta antes dele{sex === 'F' ? 'a' : ''} bloquear. Recuperei o dinheiro do divórcio ANTES do divórcio começar." },
          ].map((d, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-3">
              <div className="flex items-center gap-2 text-[#128C7E] text-xs mb-1">★★★★★ <span className="text-slate-500 text-[11px]">· {d.n}</span></div>
              <p className="text-[12px] text-slate-700 italic leading-snug">"{d.t}"</p>
            </div>
          ))}
        </div>

        {/* Escassez */}
        <div className="bg-amber-50 border border-amber-500/40 rounded-xl p-3 text-center">
          <div className="text-[10px] uppercase tracking-[0.2em] text-amber-700 font-['Geist_Mono',monospace] font-bold">
            🕒 Janela de liberação ativa
          </div>
          <p className="text-[12px] text-amber-800 mt-1 leading-snug">
            O acesso bancário é liberado por <span className="font-bold">apenas 24 horas</span> por questões de segurança.
            Após esse período, uma nova invasão precisará ser paga do zero.
          </p>
        </div>

        {/* CTA repetido */}
        {!showPix && (
          <button
            onClick={() => setShowPix(true)}
            className="flex w-full min-h-14 items-center justify-center text-center bg-[#25D366] hover:bg-[#1eb959] text-white font-extrabold rounded-2xl transition-all active:scale-[0.98] shadow-[0_0_40px_-4px_rgba(217,169,40,0.9)] text-[15px] uppercase tracking-wide"
          >
            🔓 Quero ver tudo agora · R$ 197
          </button>
        )}

        {/* PIX */}
        {showPix && (
          <div id="pix-box" className="bg-gradient-to-br from-white/90 to-slate-50/40 backdrop-blur-xl border-2 border-yellow-500/50 rounded-3xl p-6 space-y-4 shadow-[0_20px_60px_rgba(217,169,40,0.25)]">
            <div className="text-center space-y-1">
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#128C7E]/80 font-['Geist_Mono',monospace]">
                Controle Bancário Total
              </div>
              <div>
                <span className="text-[#128C7E] text-4xl font-extrabold tracking-tight">R$197,00</span>
              </div>
              <div className="text-[11px] text-slate-500">Escaneie o QR ou copie o código PIX</div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-300 rounded-xl p-3 text-red-700 text-sm text-center">
                {error}
              </div>
            )}

            {!charge && !error && (
              <div className="flex flex-col items-center gap-3 py-6">
                <div className="w-10 h-10 border-2 border-yellow-200 border-t-yellow-400 rounded-full animate-spin" />
                <p className="text-sm text-slate-500">Gerando seu código PIX…</p>
              </div>
            )}

            {charge && (
              <>
                <div className="bg-white p-3 rounded-2xl mx-auto w-fit">
                  {qrImgSrc ? (
                    <img src={qrImgSrc} alt="QR Code PIX" className="w-56 h-56 block" />
                  ) : (
                    <div className="w-56 h-56 grid place-items-center text-slate-500 text-xs">
                      QR indisponível
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-['Geist_Mono',monospace]">
                    PIX Copia e Cola
                  </label>
                  <div className="mt-1 bg-white border border-slate-200 rounded-xl p-3 text-[11px] font-['Geist_Mono',monospace] text-slate-700 break-all max-h-24 overflow-y-auto">
                    {charge.pixCopiaCola}
                  </div>
                  <button
                    onClick={copy}
                    className="mt-2 w-full h-12 bg-[#25D366] hover:bg-[#1eb959] text-white font-bold rounded-xl transition-all active:scale-[0.98] uppercase tracking-wide text-sm"
                  >
                    {copied ? "✅ Copiado!" : "📋 Copiar código PIX"}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-[12px] text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                  {statusLabel}
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
