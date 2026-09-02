import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTargetName } from "@/lib/use-target-name";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { createPixCharge, getPixStatus, type PixCharge } from "@/lib/pix.functions";
import depoimento1 from "@/assets/depoimento-1.mp4.asset.json";
import depoimento2 from "@/assets/depoimento-2.mp4.asset.json";
import { fbqTrackOnce, getMetaCookies, getPersistedUtms } from "@/lib/tracking";

const LICENSE_AMOUNT = 137;
const LICENSE_DESCRIPTION = "Recupera Relacionamento: Acesso Anual";

const searchSchema = z.object({
  phone: z.coerce.string().optional().default(""),
  sex: z.enum(["M", "F"]).optional().default("M"),
});

export const Route = createFileRoute("/licenca-zapradar")({
  head: () => ({
    meta: [
      { title: "Licença ZapRadar — Ativação obrigatória" },
      {
        name: "description",
        content:
          "Ative sua Licença ZapRadar para liberar o acesso completo ao celular clonado. Válida por 1 ano com renovação opcional.",
      },
      { property: "og:title", content: "Licença ZapRadar — Ativação obrigatória" },
      {
        property: "og:description",
        content: "Ative sua Licença ZapRadar e libere o acesso ao celular clonado.",
      },
      { property: "og:url", content: "https://clonawhats.com/licenca-zapradar" },
      { name: "robots", content: "noindex,follow" },
    ],
    links: [{ rel: "canonical", href: "https://clonawhats.com/licenca-zapradar" }],
  }),
  validateSearch: (s) => searchSchema.parse(s),
  component: LicencaZapRadarPage,
});

function LicencaZapRadarPage() {
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
          data: { amount: LICENSE_AMOUNT, description: LICENSE_DESCRIPTION, fbc, fbp, utms, phone, gender: sex },
        });
        setCharge(c);
        (window as any).dataLayer = (window as any).dataLayer || [];
        (window as any).dataLayer.push({
          event: "gerar_pix",
          valor: c.amount,
          produto_id: "licenca_zapradar",
          moeda: "BRL",
        });
        fbqTrackOnce(`ic-license-${c.externalId}`, "InitiateCheckout", {
          value: c.amount,
          currency: "BRL",
          content_ids: [c.externalId],
          content_type: "upsell_licenca_zapradar",
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
          setStatusLabel("Licença ativada!");
          (window as any).dataLayer = (window as any).dataLayer || [];
          (window as any).dataLayer.push({
            event: "purchase",
            transaction_id: charge.id,
            valor: charge.amount,
            moeda: "BRL",
          });
          fbqTrackOnce(`purchase-license-${charge.externalId}`, "Purchase", {
            value: charge.amount,
            currency: "BRL",
            content_ids: [charge.externalId],
            content_type: "upsell_licenca_zapradar",
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
    const onVis = () => {
      if (document.visibilityState === "visible") tick(true);
    };
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
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/[0.08] blur-[140px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-md mx-auto px-4 py-8 space-y-5">
        {/* Depoimentos em vídeo — prova social */}
        <div className="bg-gradient-to-br from-emerald-600/15 to-slate-50/40 border border-emerald-200 rounded-2xl p-4 shadow-[0_0_30px_-12px_rgba(16,185,129,0.5)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#25D366] font-['Geist_Mono',monospace] font-bold">
              ▶ Depoimentos reais
            </div>
            <div className="text-amber-600 text-xs">★★★★★</div>
          </div>
          <p className="text-[12px] text-slate-700 leading-snug">
            Veja quem já desbloqueou a Licença ZapRadar e descobriu a verdade:
          </p>
          <div className="grid grid-cols-1 gap-3">
            <video
              src={depoimento1.url}
              controls
              playsInline
              preload="metadata"
              className="w-full aspect-[9/16] rounded-xl bg-white border border-emerald-100 object-cover"
            />
            <video
              src={depoimento2.url}
              controls
              playsInline
              preload="metadata"
              className="w-full aspect-[9/16] rounded-xl bg-white border border-emerald-100 object-cover"
            />
          </div>
          <div className="text-[11px] text-slate-500 text-center pt-1">
            🔒 Identidades preservadas a pedido dos clientes
          </div>
        </div>



        {/* Header — taxa meta aprovada */}
        <div className="bg-emerald-600/15 border border-emerald-300 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-500/50 flex items-center justify-center text-[#25D366] text-xl">
            ✓
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#128C7E]/80 font-['Geist_Mono',monospace] font-bold">
              Taxa Meta confirmada
            </div>
            <div className="text-sm font-bold text-emerald-800">
              Falta apenas 1 passo para liberar o acesso
            </div>
          </div>
        </div>

        {/* Alerta — pendência de licença */}
        <div className="bg-amber-50 border border-amber-500/50 rounded-2xl p-4">
          <div className="text-[10px] uppercase tracking-[0.2em] text-amber-700 font-['Geist_Mono',monospace] font-bold mb-1">
            ⚠ Ativação pendente
          </div>
          <p className="text-[13px] text-amber-800/90 leading-snug">
            Para liberar o acesso ao celular clonado é{" "}
            <span className="font-bold">obrigatória a ativação da Licença ZapRadar</span>.
            Sem a licença, o espelhamento permanece bloqueado em nosso servidor.
          </p>
        </div>

        {/* Oferta principal */}
        <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-900/10 border-2 border-emerald-500/50 rounded-3xl p-6 shadow-[0_0_40px_-10px_rgba(16,185,129,0.4)]">
          <div className="flex items-start gap-3 mb-3">
            <span className="text-3xl">🪪</span>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#25D366] font-['Geist_Mono',monospace] font-bold">
                Licença oficial · válida por 1 ano
              </div>
              <h1 className="text-2xl font-extrabold leading-tight mt-1">
                <span className="text-[#128C7E]">Licença ZapRadar</span> — acesso liberado ao celular {doAlvo}
              </h1>
            </div>
          </div>

          <p className="text-[13px] text-slate-800 leading-snug">
            A licença é o que <span className="text-[#25D366] font-bold">desbloqueia o espelhamento</span>{" "}
            do dispositivo clonado em seu painel. Sem ela, nenhum dado pode ser exibido por exigência
            do nosso sistema de segurança.
          </p>

          <ul className="mt-4 space-y-2 text-[13px] text-slate-800">
            <li className="flex gap-2">
              <span className="text-[#128C7E]">📱</span>
              <span>
                <span className="font-bold">Acesso completo ao celular</span> clonado — mensagens,
                mídias, ligações, localização e apps.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#128C7E]">📅</span>
              <span>
                <span className="font-bold">Validade de 12 meses</span> a partir da ativação,
                com renovação opcional ao final do período.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#128C7E]">🔄</span>
              <span>
                <span className="font-bold">Renovação simples</span> — basta renovar a licença
                quando expirar para manter o acesso ativo.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#128C7E]">🛡️</span>
              <span>
                <span className="font-bold">Garantia de 7 dias</span> após a assinatura da licença
                em caso de arrependimento.
              </span>
            </li>
          </ul>


          <div className="mt-5 text-center">
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#128C7E]/80 font-['Geist_Mono',monospace]">
              Pagamento único · 1 ano de licença
            </div>
            <div className="mt-1">
              <span className="text-[#128C7E] text-5xl font-extrabold tracking-tight">R$137</span>
              <span className="text-[#128C7E] text-xl font-bold">,00</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Ativação imediata · acesso liberado em segundos
            </div>
          </div>

          <button
            onClick={() => setShowPix(true)}
            className="mt-5 flex w-full min-h-14 items-center justify-center text-center bg-[#25D366] hover:bg-[#1eb959] text-white font-extrabold rounded-2xl transition-all active:scale-[0.98] shadow-[0_0_40px_-8px_rgba(16,185,129,0.8)] text-[15px] uppercase tracking-wide"
          >
            🪪 Ativar minha licença agora
          </button>
          <p className="text-center text-[11px] text-slate-500 mt-3">
            🔒 Pagamento seguro · garantia de 7 dias após a assinatura
          </p>
        </div>

        {/* PIX */}
        {showPix && (
          <div className="bg-gradient-to-br from-white/90 to-slate-50/40 backdrop-blur-xl border border-emerald-200 rounded-3xl p-6 space-y-4 shadow-[0_20px_60px_rgba(16,185,129,0.15)]">
            <div className="text-center space-y-1">
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#128C7E]/80 font-['Geist_Mono',monospace]">
                Licença ZapRadar · 1 ano
              </div>
              <div>
                <span className="text-[#128C7E] text-4xl font-extrabold tracking-tight">R$137</span>
                <span className="text-[#128C7E] text-lg font-bold">,00</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-300 rounded-xl p-3 text-red-700 text-sm text-center">
                {error}
              </div>
            )}

            {!charge && !error && (
              <div className="flex flex-col items-center gap-3 py-6">
                <div className="w-10 h-10 border-2 border-emerald-200 border-t-emerald-400 rounded-full animate-spin" />
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
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
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
