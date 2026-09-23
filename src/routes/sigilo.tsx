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
      { property: "og:url", content: "https://clonawhats.com/sigilo" },
      { name: "robots", content: "noindex,follow" },
    ],
    links: [{ rel: "canonical", href: "https://clonawhats.com/sigilo" }],
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
          data: { amount: SIGILO_AMOUNT, description: SIGILO_DESCRIPTION, fbc, fbp, utms, phone, gender: sex },
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
    <div className="min-h-screen bg-white text-slate-900 font-['Inter',sans-serif] relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(128,128,128,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(128,128,128,0.07) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/[0.06] blur-[140px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-md mx-auto px-4 py-8 space-y-5">
        {/* Header — pagamento aprovado */}
        <div className="bg-yellow-600/15 border border-yellow-300 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-yellow-100 border border-yellow-500/50 flex items-center justify-center text-[#25D366] text-xl">
            ✓
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#128C7E]/80 font-['Geist_Mono',monospace] font-bold">
              Invasão concluída · 100%
            </div>
            <div className="text-sm font-bold text-yellow-800">
              Espelhamento pronto — travado por sigilo
            </div>
          </div>
        </div>

        {/* ALERTA VERMELHO — bloqueio */}
        <div className="bg-red-950/50 border-2 border-red-500/70 rounded-2xl p-4 shadow-[0_0_30px_-8px_rgba(239,68,68,0.7)] animate-pulse">
          <div className="flex items-center gap-2 text-red-700 text-[10px] uppercase tracking-[0.2em] font-['Geist_Mono',monospace] font-bold">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            Acesso bloqueado · protocolo de sigilo ativo
          </div>
          <p className="mt-2 text-[13px] text-red-700 leading-snug">
            O celular {targetName ? `de ${targetName}` : "do alvo"} já foi clonado com sucesso, mas o
            painel está <span className="font-bold text-red-700">criptografado no nosso servidor</span> até
            a liberação do sigilo. Sem essa etapa, todo o conteúdo é <span className="font-bold">apagado
            automaticamente em 15 minutos</span>.
          </p>
        </div>

        {/* Oferta principal — taxa de sigilo */}
        <div className="bg-gradient-to-br from-amber-600/20 to-amber-900/10 border-2 border-amber-500/50 rounded-3xl p-6 shadow-[0_0_40px_-10px_rgba(245,158,11,0.4)]">
          <div className="flex items-start gap-3 mb-3">
            <span className="text-3xl">🛡️</span>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-amber-700 font-['Geist_Mono',monospace] font-bold">
                Etapa obrigatória · sigilo total
              </div>
              <h1 className="text-2xl font-extrabold leading-tight mt-1">
                Ative o <span className="text-amber-600">Modo Sigilo</span> e
                acesse o celular clonado <span className="text-amber-600">100% anônimo</span>
              </h1>
            </div>
          </div>

          <p className="text-[13px] text-slate-800 leading-snug">
            A partir do momento que você abre o painel, todo o tráfego passa a ficar registrado.
            O <span className="text-amber-700 font-bold">Modo Sigilo</span> é a camada que
            <span className="font-bold"> impede qualquer rastro</span> da invasão voltar até você.
          </p>

          {/* Consequências de NÃO pagar */}
          <div className="mt-4 bg-red-950/40 border border-red-300 rounded-xl p-3 space-y-2">
            <div className="text-[11px] uppercase tracking-[0.15em] text-red-700 font-['Geist_Mono',monospace] font-bold">
              ⚠️ Sem o modo sigilo, o risco é REAL:
            </div>
            <ul className="space-y-1.5 text-[12.5px] text-red-700/90 leading-snug">
              <li className="flex gap-2">
                <span className="text-red-600">✗</span>
                <span>{targetName ?? "O alvo"} recebe notificação de novo dispositivo conectado</span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-600">✗</span>
                <span>Seu IP e nome ficam ligados à invasão nos nossos servidores</span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-600">✗</span>
                <span>O painel é destruído em 15 min e <span className="font-bold">os valores pagos não são reembolsáveis</span></span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-600">✗</span>
                <span>Cobrança aparece no seu extrato como "SpyRadar Brasil" (identificável)</span>
              </li>
            </ul>
          </div>

          {/* Benefícios */}
          <div className="mt-4 text-[11px] uppercase tracking-[0.15em] text-amber-700 font-['Geist_Mono',monospace] font-bold">
            ✅ Com o modo sigilo ativo:
          </div>
          <ul className="mt-2 space-y-2 text-[13px] text-slate-800">
            <li className="flex gap-2">
              <span className="text-amber-600">🕵️</span>
              <span>
                <span className="font-bold">100% anônimo</span> — sua consulta nunca vinculada
                ao seu nome, CPF, IP ou celular.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-600">���</span>
              <span>
                <span className="font-bold">Alvo nunca é notificado</span> — bloqueamos qualquer
                alerta de "novo dispositivo" no celular clonado.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-600">🏦</span>
              <span>
                <span className="font-bold">Sigilo bancário total</span> — a cobrança aparece
                como <span className="italic">"ZR Serviços"</span> no seu extrato.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-600">🗑️</span>
              <span>
                <span className="font-bold">Logs zerados em 24h</span> — nenhum funcionário
                nosso consegue rastrear a invasão depois disso.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-600">⚖️</span>
              <span>
                <span className="font-bold">Blindagem jurídica LGPD</span> — sem esse termo
                assinado, somos obrigados a informar a operação ao alvo.
              </span>
            </li>
          </ul>

          {/* Prova social */}
          <div className="mt-4 bg-white/70 border border-amber-200 rounded-xl p-3">
            <div className="flex items-center gap-2 text-[11px] text-amber-700/90">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-yellow-500/70 border-2 border-slate-200" />
                <div className="w-6 h-6 rounded-full bg-amber-500/70 border-2 border-slate-200" />
                <div className="w-6 h-6 rounded-full bg-rose-500/70 border-2 border-slate-200" />
              </div>
              <span>
                <span className="font-bold text-amber-700">98,7%</span> das pessoas ativam
                o Modo Sigilo — <span className="font-bold">é praticamente obrigatório</span>.
              </span>
            </div>
          </div>

          {/* Preço com "de/por" */}
          <div className="mt-5 text-center">
            <div className="text-[10px] uppercase tracking-[0.2em] text-amber-600/80 font-['Geist_Mono',monospace]">
              Valor único · liberação imediata
            </div>
            <div className="mt-1 flex items-end justify-center gap-2">
              <span className="text-slate-500 line-through text-lg font-semibold">R$289,82</span>
              <span className="text-amber-600 text-5xl font-extrabold tracking-tight">R$89,82</span>
              <span className="text-amber-600 text-xl font-bold">,00</span>
            </div>
            <div className="text-[11px] text-[#128C7E] mt-1 font-bold">
              🎁 Desconto de 67% aplicado nesta tela
            </div>
          </div>

          <button
            onClick={() => setShowPix(true)}
            className="mt-5 flex w-full min-h-14 items-center justify-center text-center bg-amber-500 hover:bg-amber-400 text-slate-900 font-extrabold rounded-2xl transition-all active:scale-[0.98] shadow-[0_0_40px_-8px_rgba(245,158,11,0.8)] text-[15px] uppercase tracking-wide"
          >
            🔓 Ativar sigilo e acessar celular clonado
          </button>
          <p className="text-center text-[11px] text-slate-500 mt-3">
            🔒 Pagamento único · sem mensalidade · liberação em segundos
          </p>

          {/* Garantia */}
          <div className="mt-4 bg-yellow-50 border border-yellow-300 rounded-xl p-3 flex items-start gap-2">
            <span className="text-[#128C7E] text-lg">🛡️</span>
            <p className="text-[12px] text-yellow-800 leading-snug">
              <span className="font-bold">Garantia de sigilo:</span> se qualquer rastro da
              investigação for identificado, devolvemos <span className="font-bold">100% do valor</span>{" "}
              + R$500 de indenização.
            </p>
          </div>
        </div>

        {/* PIX */}
        {showPix && (
          <div className="bg-gradient-to-br from-white/90 to-slate-50/40 backdrop-blur-xl border border-amber-200 rounded-3xl p-6 space-y-4 shadow-[0_20px_60px_rgba(245,158,11,0.15)]">
            <div className="text-center space-y-1">
              <div className="text-[10px] uppercase tracking-[0.2em] text-amber-600/80 font-['Geist_Mono',monospace]">
                Taxa de Sigilo
              </div>
              <div>
                <span className="text-amber-600 text-4xl font-extrabold tracking-tight">R$89,82</span>
                <span className="text-amber-600 text-lg font-bold">,00</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-300 rounded-xl p-3 text-red-700 text-sm text-center">
                {error}
              </div>
            )}

            {!charge && !error && (
              <div className="flex flex-col items-center gap-3 py-6">
                <div className="w-10 h-10 border-2 border-amber-200 border-t-amber-400 rounded-full animate-spin" />
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
                    className="mt-2 w-full h-12 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl transition-all active:scale-[0.98] uppercase tracking-wide text-sm"
                  >
                    {copied ? "✅ Copiado!" : "📋 Copiar código PIX"}
                  </button>
                </div>




                <div className="flex items-center justify-center gap-2 text-[12px] text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  {statusLabel}
                </div>
              </>
            )}
          </div>
        )}

        {/* Depoimentos */}
        <div className="space-y-3">
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-['Geist_Mono',monospace] text-center">
            ★★★★★ Quem ativou o sigilo
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-[12.5px] text-slate-800 leading-snug italic">
              "Quase deixei passar a taxa de sigilo. Ainda bem que paguei — o marido
              descobriu que ele tinha 3 conversas paralelas e <span className="font-bold text-amber-700">nunca
              soube que fui eu que investiguei</span>."
            </p>
            <p className="text-[11px] text-slate-500 mt-2">— Camila R., São Paulo/SP · há 2h</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-[12.5px] text-slate-800 leading-snug italic">
              "Uma amiga não pagou o sigilo e o namorado recebeu alerta de dispositivo
              novo. Deu treta. Paga sem pensar, vale MUITO mais que R$89,82."
            </p>
            <p className="text-[11px] text-slate-500 mt-2">— Larissa M., Belo Horizonte/MG · há 40min</p>
          </div>
        </div>

        {/* Reforço final */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
          <p className="text-[12px] text-slate-700 leading-snug">
            🛡️ <span className="font-bold text-amber-700">Por que essa taxa existe?</span>
          </p>
          <p className="text-[12px] text-slate-500 leading-snug">
            Nossos servidores <span className="text-slate-800 font-semibold">criptografam
            e apagam</span> todo o rastro da invasão em 24h. Esse processo tem custo
            operacional e é cobrado apenas de quem realmente acessa o painel do celular clonado.
          </p>
          <p className="text-[12px] text-slate-500 italic">
            Mais de <span className="text-slate-700 font-semibold">94.000 invasões</span>{" "}
            já foram blindadas por essa camada · 0 (zero) casos de vazamento.
          </p>
        </div>
      </div>
    </div>
  );
}
