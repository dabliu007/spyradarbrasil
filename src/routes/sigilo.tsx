import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTargetName } from "@/lib/use-target-name";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { createPixCharge, getPixStatus, type PixCharge } from "@/lib/pix.functions";
import { fbqTrackOnce, getMetaCookies, getPersistedUtms } from "@/lib/tracking";

const SIGILO_AMOUNT = 89.82;
const SIGILO_DESCRIPTION = "Recupera Relacionamento: Acesso Anual";

const searchSchema = z.object({
  phone: z.coerce.string().optional().default(""),
  sex: z.enum(["M", "F"]).optional().default("M"),
});

export const Route = createFileRoute("/sigilo")({
  head: () => ({
    meta: [
      { title: "Acesso: Método da Traição" },
      {
        name: "description",
        content:
          "Etapa de sigilo do SpyRadar Brasil: garanta o anonimato total da sua investigação e a liberação confidencial do relatório completo.",
      },
      { property: "og:title", content: "Acesso: Método da Traição" },
      {
        property: "og:description",
        content: "Anonimato total da sua investigação e liberação confidencial do relatório.",
      },
      { property: "og:url", content: "https://zapradarbrasil.com.br/sigilo" },
      { name: "robots", content: "noindex,follow" },
    ],
    links: [{ rel: "canonical", href: "https://zapradarbrasil.com.br/sigilo" }],
  }),
  validateSearch: (s) => searchSchema.parse(s),
  component: SigiloPage,
});

function SigiloPage() {
  const { phone, sex } = Route.useSearch();
  const navigate = useNavigate();
  const createPix = useServerFn(createPixCharge);
  const checkPix = useServerFn(getPixStatus);
  const targetName = useTargetName();

  const [charge, setCharge] = useState<PixCharge | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [statusLabel, setStatusLabel] = useState("Aguardando confirmação…");
  const [showPix, setShowPix] = useState(false);
  const createdRef = useRef(false);

  // Gera PIX da taxa de sigilo apenas quando o usuário confirma
  useEffect(() => {
    if (!showPix || createdRef.current) return;
    createdRef.current = true;
    (async () => {
      try {
        const { fbc, fbp } = getMetaCookies(); const utms = getPersistedUtms();
        const c = await createPix({
          data: { product: "sigilo", amount: SIGILO_AMOUNT, description: SIGILO_DESCRIPTION, fbc, fbp, utms, phone, gender: sex },
        });
        setCharge(c);
        (window as any).dataLayer = (window as any).dataLayer || [];
        (window as any).dataLayer.push({ event: "gerar_pix", valor: c.amount, produto_id: "sigilo", moeda: "BRL" });
        fbqTrackOnce(`ic-sigilo-${c.externalId}`, "InitiateCheckout", {
          value: c.amount,
          currency: "BRL",
          content_ids: [c.externalId],
          content_type: "upsell_sigilo",
          phone,
          gender: sex,
        });
      } catch (e: any) {
        setError(e?.message || "Falha ao gerar PIX");
      }
    })();
  }, [showPix, createPix]);

  // Polling resiliente
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
          setStatusLabel("Sigilo confirmado!");
          (window as any).dataLayer = (window as any).dataLayer || [];
          (window as any).dataLayer.push({ event: "purchase", transaction_id: charge.id, valor: charge.amount, moeda: "BRL" });
          fbqTrackOnce(`purchase-sigilo-${charge.externalId}`, "Purchase", {
            value: charge.amount,
            currency: "BRL",
            content_ids: [charge.externalId],
            content_type: "upsell_sigilo",
          phone,
          gender: sex,
            transaction_id: charge.id,
          });
          const qs = new URLSearchParams({ phone: phone ?? "", sex: sex ?? "M" }).toString();
          window.location.assign(`/nota-fiscal?${qs}`);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-['Inter',sans-serif]">
      <img
        src="/images/sigilo-hero.webp"
        alt="Por que é necessário pagar a Taxa de Sigilo"
        className="w-full h-auto block"
        width={960}
        height={540}
        loading="eager"
        fetchPriority="high"
        decoding="async"
      />

      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        {/* Header — pagamento aprovado */}
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 shrink-0 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-lg">
            ✓
          </div>
          <div className="text-sm font-bold text-emerald-300">
            Espelhamento pronto — travado por sigilo
          </div>
        </div>

        {/* ALERTA — bloqueio */}
        <div className="bg-red-500/10 border border-red-500/40 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-red-400 text-[10px] uppercase tracking-[0.2em] font-['Geist_Mono',monospace] font-bold">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Acesso bloqueado
          </div>
          <p className="mt-2 text-[13px] text-red-200/90 leading-snug">
            O celular {targetName ? `de ${targetName}` : "do alvo"} já foi clonado, mas o painel
            está <span className="font-bold text-red-300">criptografado</span> até a liberação do
            sigilo. Sem essa etapa, o conteúdo é <span className="font-bold">apagado em 15 minutos</span>.
          </p>
        </div>

        {/* Oferta principal — taxa de sigilo */}
        <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-5">
          <div className="text-[10px] uppercase tracking-[0.2em] text-amber-400 font-['Geist_Mono',monospace] font-bold">
            Etapa obrigatória
          </div>
          <h1 className="text-xl font-extrabold leading-tight mt-1 text-white">
            Ative o <span className="text-amber-400">Modo Sigilo</span> e acesse o celular
            clonado <span className="text-amber-400">100% anônimo</span>
          </h1>

          <ul className="mt-4 space-y-2.5 text-[13px] text-slate-300">
            <li className="flex gap-2">
              <span className="text-amber-400 shrink-0">•</span>
              <span>{targetName ?? "O alvo"} não recebe nenhuma notificação de novo dispositivo.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-400 shrink-0">•</span>
              <span>Sua consulta não fica vinculada ao seu nome, CPF ou IP.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-400 shrink-0">•</span>
              <span>A cobrança aparece no extrato como <span className="italic">"ZR Serviços"</span>.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-400 shrink-0">•</span>
              <span>Todos os registros da invasão são apagados dos nossos servidores em 24h.</span>
            </li>
          </ul>

          {/* Preço */}
          <div className="mt-5 text-center">
            <div className="text-[10px] uppercase tracking-[0.2em] text-amber-400/80 font-['Geist_Mono',monospace]">
              Valor único · liberação imediata
            </div>
            <div className="mt-1 text-amber-400 text-4xl font-extrabold tracking-tight">
              R$89,82
            </div>
          </div>

          <button
            onClick={() => setShowPix(true)}
            className="mt-5 flex w-full min-h-14 items-center justify-center text-center bg-amber-500 hover:bg-amber-400 text-slate-900 font-extrabold rounded-2xl transition-all active:scale-[0.98] text-[15px] uppercase tracking-wide"
          >
            Ativar sigilo e acessar celular clonado
          </button>
          <p className="text-center text-[11px] text-slate-500 mt-3">
            Pagamento único · sem mensalidade · liberação em segundos
          </p>

          {/* Garantia */}
          <div className="mt-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-start gap-2">
            <span className="text-emerald-400 text-lg shrink-0">🛡️</span>
            <p className="text-[12px] text-emerald-200/90 leading-snug">
              <span className="font-bold">Garantia de sigilo:</span> se qualquer rastro da
              investigação for identificado, devolvemos 100% do valor + R$500 de indenização.
            </p>
          </div>
        </div>

        {/* PIX */}
        {showPix && (
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-5 space-y-4">
            <div className="text-center space-y-1">
              <div className="text-[10px] uppercase tracking-[0.2em] text-amber-400/80 font-['Geist_Mono',monospace]">
                Taxa de Sigilo
              </div>
              <div className="text-amber-400 text-3xl font-extrabold tracking-tight">R$89,82</div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/40 rounded-xl p-3 text-red-300 text-sm text-center">
                {error}
              </div>
            )}

            {!charge && !error && (
              <div className="flex flex-col items-center gap-3 py-6">
                <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-400 rounded-full animate-spin" />
                <p className="text-sm text-slate-400">Gerando seu código PIX…</p>
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
                  <div className="mt-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] font-['Geist_Mono',monospace] text-slate-300 break-all max-h-24 overflow-y-auto">
                    {charge.pixCopiaCola}
                  </div>
                  <button
                    onClick={copy}
                    className="mt-2 w-full h-12 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl transition-all active:scale-[0.98] uppercase tracking-wide text-sm"
                  >
                    {copied ? "Copiado!" : "Copiar código PIX"}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-[12px] text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
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
