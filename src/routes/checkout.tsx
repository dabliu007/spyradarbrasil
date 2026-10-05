import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useTargetName } from "@/lib/use-target-name";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { createPixCharge } from "@/lib/pix.functions";

import { fbqTrackOnce, getMetaCookies, getPersistedUtms } from "@/lib/tracking";



const searchSchema = z.object({
  phone: z.coerce.string().optional().default(""),
  sex: z.enum(["M", "F"]).optional().default("M"),
  amount: z.coerce.number().positive().optional(),
});

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Pagamento PIX — SpyRadar Brasil" },
      {
        name: "description",
        content:
          "Etapa de pagamento PIX do SpyRadar Brasil. Liberação automática do relatório após a confirmação, sem envio de comprovante.",
      },
      { property: "og:title", content: "Pagamento PIX — SpyRadar Brasil" },
      {
        property: "og:description",
        content: "Gere seu PIX e libere automaticamente o relatório completo do SpyRadar Brasil.",
      },
      { property: "og:url", content: "https://whatsradar.top/checkout" },
      { name: "robots", content: "noindex,follow" },
    ],
    links: [{ rel: "canonical", href: "https://whatsradar.top/checkout" }],
  }),
  validateSearch: (s) => searchSchema.parse(s),
  component: CheckoutPage,
});

const DEFAULT_AMOUNT = 137.00;
const ANCHOR_AMOUNT = 397;
const DOWNSELL_CHAIN: number[] = [];
const formatBRL = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

const TESTIMONIALS = [
  {
    name: "Mariana S.",
    location: "São Paulo, SP",
    time: "há 3 min",
    text: "Eu tinha certeza que ele mentia. Dois minutos depois do pagamento eu já estava vendo TODAS as conversas apagadas. Doeu, mas hoje eu sei a verdade.",
  },
  {
    name: "Rafael M.",
    location: "Rio de Janeiro, RJ",
    time: "há 11 min",
    text: "Melhor R$ 137,00 que já gastei. Descobri o que estava acontecendo pelas minhas costas sem ela nunca desconfiar de nada. Vale cada centavo.",
  },
  {
    name: "Juliana P.",
    location: "Belo Horizonte, MG",
    time: "há 24 min",
    text: "Fiquei com medo de ser golpe, mas liberou na hora certinho. Consegui ver fotos, áudios e até a localização em tempo real. Recomendo demais.",
  },
  {
    name: "Carlos E.",
    location: "Curitiba, PR",
    time: "há 38 min",
    text: "Passei meses na dúvida, perdendo o sono. Em uma tarde tive todas as respostas. A paz de saber a verdade não tem preço.",
  },
];

const BENEFITS = [
  "Acesso total ao celular clonado por 365 dias",
  "Mensagens, fotos e áudios — inclusive os apagados",
  "Localização em tempo real e apps monitorados",
  "O alvo nunca é notificado do monitoramento",
];

function CheckoutPage() {
  const { phone, sex, amount } = Route.useSearch();
  const navigate = useNavigate();
  const createPix = useServerFn(createPixCharge);
  const targetName = useTargetName();
  const doAlvo = targetName ? `de ${targetName}` : "do alvo";

  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const createdRef = useRef(false);

  const [currentAmount, setCurrentAmount] = useState<number>(amount ?? DEFAULT_AMOUNT);
  const [downsellOffer, setDownsellOffer] = useState<number | null>(null);
  const downsellStepRef = useRef(0);
  const displayAmount = currentAmount;

  // Countdown de urgência (10 min) para reservar o acesso liberado
  const [secondsLeft, setSecondsLeft] = useState(9 * 60 + 43);
  useEffect(() => {
    const t = setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? 9 * 60 + 43 : s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, []);
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  // Contador "ao vivo" de pessoas visualizando/pagando agora
  const [liveViewers, setLiveViewers] = useState(37);
  useEffect(() => {
    const t = setInterval(() => {
      setLiveViewers((v) => {
        const delta = Math.floor(Math.random() * 5) - 2;
        const next = v + delta;
        return Math.min(64, Math.max(23, next));
      });
    }, 3200);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (DOWNSELL_CHAIN.length === 0) return;
    // Push a sentinel state so the first back press fires popstate here
    try {
      window.history.pushState({ zr: "guard" }, "");
    } catch {}
    const onPop = () => {
      const idx = Math.min(downsellStepRef.current, DOWNSELL_CHAIN.length - 1);
      const offer = DOWNSELL_CHAIN[idx];
      // Only offer if it's actually cheaper than what user is on
      if (offer < currentAmountRef.current) {
        setDownsellOffer(offer);
      }
      // Re-arm the guard so subsequent back presses also intercept (eterno)
      try {
        window.history.pushState({ zr: "guard" }, "");
      } catch {}
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep a ref of currentAmount for the popstate closure
  const currentAmountRef = useRef(currentAmount);
  useEffect(() => {
    currentAmountRef.current = currentAmount;
  }, [currentAmount]);

  const acceptDownsell = () => {
    if (downsellOffer == null) return;
    const newAmount = downsellOffer;
    setCurrentAmount(newAmount);
    downsellStepRef.current = Math.min(downsellStepRef.current + 1, DOWNSELL_CHAIN.length - 1);
    setDownsellOffer(null);
    navigate({ to: "/checkout", search: { phone, sex, amount: newAmount }, replace: true });
  };

  const declineDownsell = () => {
    // advance chain so next back offers an even lower price, but stay on page
    downsellStepRef.current = Math.min(downsellStepRef.current + 1, DOWNSELL_CHAIN.length - 1);
    setDownsellOffer(null);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (createdRef.current) return;
    createdRef.current = true;
    setGenerating(true);
    try {
      const { fbc, fbp } = getMetaCookies();
      const utms = getPersistedUtms();
      const c = await createPix({
  data: {
  product: "checkout",
  amount: currentAmount,
          fbc,
          fbp,
          utms,
          phone,
          gender: sex,
        },
      });
      try {
        sessionStorage.setItem("zr.pix." + c.id, JSON.stringify(c));
      } catch {}
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push({
        event: "gerar_pix",
        valor: c.amount,
        produto_id: "relatorio",
        moeda: "BRL",
      });
      fbqTrackOnce(`ic-${c.externalId}`, "InitiateCheckout", {
        value: c.amount,
        currency: "BRL",
        content_ids: [c.externalId],
        content_type: "product",
        phone,
        gender: sex,
      });
      navigate({ to: "/pix", search: { id: c.id, phone, sex } });
    } catch (e: any) {
      setError(e?.message || "Falha ao gerar PIX");
      createdRef.current = false;
    } finally {
      setGenerating(false);
    }
  };

  const reais = Math.floor(displayAmount);
  const centavos = String(Math.round((displayAmount - reais) * 100)).padStart(2, "0");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-['Inter',sans-serif] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(115%_75%_at_50%_-5%,rgba(37,211,102,0.14),transparent_60%)]" />

      <div className="relative z-10 max-w-md mx-auto px-4 pt-4 pb-10 space-y-4">
        <h1 className="sr-only">Pagamento PIX do relatório SpyRadar Brasil</h1>

        {/* Banner topo */}
        <div className="-mx-4 -mt-4 overflow-hidden">
          <img
            src="/images/checkout-hero.png"
            alt="Spy Radar Brasil — Falta pouco para você ter acesso à traição descoberta. Finalize a compra da sua licença."
            className="w-full h-auto block"
            width={1706}
            height={960}
          />
        </div>

        {/* Header de confiança */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#25D366]/10 border border-[#25D366]/25 rounded-lg flex items-center justify-center">
              <LockIcon className="w-4 h-4 text-[#128C7E]" />
            </div>
            <div className="leading-tight">
              <div className="text-[9px] uppercase tracking-[0.18em] text-slate-400 font-['Geist_Mono',monospace]">
                Checkout seguro
              </div>
              <div className="text-[13px] font-bold text-slate-800">Pagamento via PIX</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
            </span>
            <span className="tabular-nums text-red-600 font-['Geist_Mono',monospace] font-bold">
              {mm}:{ss}
            </span>
          </div>
        </div>

        {/* Cartão de pagamento — primeira dobra no mobile */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-[0_10px_40px_-12px_rgba(15,23,42,0.18)] space-y-4">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#128C7E] bg-[#25D366]/10 border border-[#25D366]/20 rounded-full px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
              Acesso liberado na hora
            </div>
            <h2 className="text-[17px] font-extrabold text-slate-900 leading-tight px-2">
              Libere o acesso total ao celular {doAlvo}
            </h2>

            <div className="pt-1">
              <div className="text-[13px] text-slate-400 line-through leading-none">
                de {formatBRL(ANCHOR_AMOUNT)}
              </div>
              <div className="flex items-start justify-center gap-0.5 mt-0.5">
                <span className="text-[#128C7E] text-2xl font-bold mt-1.5">R$</span>
                <span className="text-[#128C7E] text-[56px] leading-none font-extrabold tracking-tight">
                  {reais}
                </span>
                <span className="text-[#128C7E] text-2xl font-bold mt-1.5">,{centavos}</span>
              </div>
              <div className="text-[12px] text-slate-500 mt-1">
                pagamento único · sem mensalidade
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm text-center">
              {error}
            </div>
          )}

          {!error && (
            <form onSubmit={handleGenerate} className="space-y-3">
              <button
                type="submit"
                disabled={generating}
                className="w-full h-14 text-white font-extrabold rounded-2xl transition-all active:scale-[0.98] text-[16px] bg-[#25D366] hover:bg-[#1eb959] disabled:opacity-60 shadow-[0_12px_30px_-8px_rgba(37,211,102,0.7)] flex items-center justify-center gap-2"
              >
                {generating ? (
                  "Processando…"
                ) : (
                  <>
                    <LockIcon className="w-5 h-5" />
                    EFETUAR PAGAMENTO
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#25D366]" />
                </span>
                <span className="font-bold text-slate-700 tabular-nums">{liveViewers} pessoas</span>
                liberando o acesso agora
              </div>

            </form>
          )}
        </div>

        {/* Apelo emocional */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-2 shadow-sm">
          <h3 className="text-[15px] font-extrabold text-slate-900 leading-snug">
            Pare de perder o sono com a dúvida.
          </h3>
          <p className="text-[13px] text-slate-600 leading-relaxed">
            Cada dia sem saber a verdade é mais uma noite acordado imaginando o pior. Você merece{" "}
            <span className="font-bold text-slate-900">enxergar tudo com os próprios olhos</span> —
            mensagens apagadas, fotos escondidas e a localização em tempo real. Em minutos a angústia
            vira <span className="font-bold text-[#128C7E]">certeza</span>, e ninguém nunca vai saber
            que foi você.
          </p>
        </div>

        {/* Depoimentos */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-sm">
          <img
            src="/images/depoimentos.png"
            alt="Depoimentos de clientes da Spy Radar Brasil: mais de 25.000 clientes ativos, avaliação média 4,8 de 5 e 98% recomendam"
            className="w-full h-auto block"
          />
        </div>

        {/* Resumo do pedido */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-['Geist_Mono',monospace]">
                Seu pedido
              </div>
              <h2 className="text-[16px] font-extrabold text-slate-900">Licença Spy Radar</h2>
            </div>
            <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-md font-bold bg-[#25D366]/10 text-[#128C7E] border border-[#25D366]/25 whitespace-nowrap">
              365 dias
            </span>
          </div>

          <ul className="space-y-2">
            {BENEFITS.map((item) => (
              <li key={item} className="flex items-start gap-2 text-[13px] text-slate-700 leading-snug">
                <CheckIcon className="w-4 h-4 text-[#25D366] mt-0.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <span className="text-[13px] font-semibold text-slate-600">Total hoje</span>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 line-through mr-1.5">
                {formatBRL(ANCHOR_AMOUNT)}
              </span>
              <span className="text-[18px] font-extrabold text-[#128C7E]">
                {formatBRL(displayAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Compra protegida */}
        <img
          src="/images/compra-protegida.png"
          alt="Compra protegida — transação 100% segura, satisfação garantida em até 30 dias, ambiente seguro, pagamento protegido, dados criptografados e privacidade garantida. Aceitamos Visa, Mastercard, Elo, American Express, Pix e Boleto."
          className="w-full h-auto rounded-2xl border border-slate-200"
        />

        {/* Garantia */}
        <div className="flex items-start gap-3 bg-[#25D366]/[0.06] border border-[#25D366]/20 rounded-2xl p-4">
          <ShieldIcon className="w-6 h-6 text-[#128C7E] shrink-0" />
          <div>
            <div className="text-[14px] font-extrabold text-[#128C7E]">Garantia de liberação</div>
            <p className="text-[12px] text-slate-600 leading-relaxed">
              Se o acesso não for liberado após a confirmação do PIX, seu dinheiro volta
              integralmente. Risco zero para você.
            </p>
          </div>
        </div>

        {/* Passo a passo */}
        <ol className="text-[12px] text-slate-500 space-y-1.5">
          <li>1. Abra o app do seu banco e escolha pagar via PIX.</li>
          <li>2. Selecione "Pix Copia e Cola" ou escaneie o QR Code.</li>
          <li>3. Confirme o pagamento de {formatBRL(displayAmount)}.</li>
          <li>4. A liberação é automática — não precisa enviar comprovante.</li>
        </ol>

        {/* Aviso pós-pagamento */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckIcon className="w-4 h-4 text-[#25D366]" />
            <h3 className="text-[14px] font-bold text-[#128C7E]">Após o pagamento</h3>
          </div>
          <p className="text-[12px] text-slate-600 leading-relaxed">
            Você terá <span className="text-[#128C7E] font-semibold">acesso total ao celular clonado</span>{" "}
            {doAlvo} — mensagens, fotos, localização e aplicativos.
          </p>
          <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-100 pt-2">
            O SpyRadar Brasil <span className="font-semibold">não se responsabiliza</span> pelo mau uso
            das informações obtidas. O uso é de inteira responsabilidade do contratante.
          </p>
        </div>

        <Link
          to="/relatorio"
          search={{ phone, sex, paid: 0 }}
          className="block w-full text-center text-[11px] font-['Geist_Mono',monospace] uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 transition-colors py-3"
        >
          ← voltar ao relatório
        </Link>
      </div>

      {downsellOffer != null && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm grid place-items-center px-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 relative">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#25D366]/10 border border-[#25D366]/20 grid place-items-center">
                <ShieldIcon className="w-8 h-8 text-[#128C7E]" />
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#128C7E] font-bold">
                Espera! Oferta exclusiva
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">
                Última chance de <span className="text-[#25D366]">liberar o acesso</span>
              </h2>
              <p className="text-[13px] text-slate-600 leading-snug">
                Você vai perder o clone ativo agora. Liberamos um <strong>desconto único</strong> para
                você garantir o acesso:
              </p>
              <div className="py-3">
                <div className="text-sm text-slate-400 line-through">de {formatBRL(currentAmount)}</div>
                <div className="text-5xl font-extrabold text-[#25D366] tracking-tight">
                  {formatBRL(downsellOffer)}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  pagamento único
                </div>
              </div>
            </div>

            <button
              onClick={acceptDownsell}
              className="w-full h-14 bg-[#25D366] hover:bg-[#1eb959] text-white font-extrabold rounded-2xl transition-all active:scale-[0.98] shadow-[0_12px_30px_-8px_rgba(37,211,102,0.7)] text-[15px]"
            >
              Aceitar por {formatBRL(downsellOffer)}
            </button>
            <button
              onClick={declineDownsell}
              className="w-full mt-2 py-2 text-[11px] text-slate-400 hover:text-slate-600 uppercase tracking-wider"
            >
              não, quero perder o acesso
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Stars({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-0.5 ${className}`} aria-label="5 de 5 estrelas">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
          <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.79L10 14.77l-5.2 2.73.99-5.79-4.21-4.1 5.82-.85L10 1.5z" />
        </svg>
      ))}
    </div>
  );
}

function LockIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className={className}>
      <rect x="4" y="10" width="16" height="10" rx="2.5" strokeLinejoin="round" />
      <path d="M8 10V7a4 4 0 018 0v3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShieldIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path
        d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z"
        strokeLinejoin="round"
      />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} className={className}>
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
