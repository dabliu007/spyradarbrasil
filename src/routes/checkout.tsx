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
          "Etapa de pagamento PIX do SpyRadar Brasil. Liberação automática do relatório após a confirmação, com sigilo total e sem envio de comprovante.",
      },
      { property: "og:title", content: "Pagamento PIX — SpyRadar Brasil" },
      {
        property: "og:description",
        content: "Gere seu PIX e libere automaticamente o relatório completo do SpyRadar Brasil.",
      },
      { property: "og:url", content: "https://clonawhats.com/checkout" },
      { name: "robots", content: "noindex,follow" },
    ],
    links: [{ rel: "canonical", href: "https://clonawhats.com/checkout" }],
  }),
  validateSearch: (s) => searchSchema.parse(s),
  component: CheckoutPage,
});

const DEFAULT_AMOUNT = 47.00;
const DOWNSELL_CHAIN = [57, 47, 37, 27];
const formatBRL = (v: number) =>
  `R$ ${v.toFixed(2).replace(".", ",")}`;

const TESTIMONIALS = [
  {
    name: "Mariana S.",
    location: "São Paulo, SP",
    time: "há 3 min",
    text: "Eu tinha certeza que ele mentia. Em 2 minutos depois do pagamento eu já estava vendo TODAS as conversas apagadas. Doeu, mas hoje eu sei a verdade.",
  },
  {
    name: "Rafael M.",
    location: "Rio de Janeiro, RJ",
    time: "há 11 min",
    text: "Melhor R$ 47 que já gastei. Descobri o que estava acontecendo pelas minhas costas sem ela nunca desconfiar de nada. Vale cada centavo.",
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
    // Push a sentinel state so the first back press fires popstate here
    try { window.history.pushState({ zr: "guard" }, ""); } catch {}
    const onPop = () => {
      const idx = Math.min(downsellStepRef.current, DOWNSELL_CHAIN.length - 1);
      const offer = DOWNSELL_CHAIN[idx];
      // Only offer if it's actually cheaper than what user is on
      if (offer < currentAmountRef.current) {
        setDownsellOffer(offer);
      }
      // Re-arm the guard so subsequent back presses also intercept (eterno)
      try { window.history.pushState({ zr: "guard" }, ""); } catch {}
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep a ref of currentAmount for the popstate closure
  const currentAmountRef = useRef(currentAmount);
  useEffect(() => { currentAmountRef.current = currentAmount; }, [currentAmount]);

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
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-yellow-500/[0.06] blur-[140px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-md mx-auto px-4 py-8 space-y-5">
        <h1 className="sr-only">Pagamento PIX do relatório SpyRadar Brasil</h1>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-slate-100 border border-yellow-300 rounded-xl flex items-center justify-center">
              <span className="text-[#128C7E] text-lg">🔒</span>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#128C7E]/80 font-['Geist_Mono',monospace]">
                Checkout anônimo
              </div>
              <div className="text-sm font-bold">Pagamento via PIX</div>
            </div>
          </div>
          <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-md font-bold bg-yellow-100 text-[#25D366] border border-yellow-200">
            {formatBRL(displayAmount)}
          </span>
        </div>

        {/* Barra de urgência — reserva de acesso */}
        <div className="flex items-center justify-between gap-2 bg-red-50 border border-red-200 rounded-2xl px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600" />
            </span>
            <span className="text-[11px] font-bold text-red-700 uppercase tracking-wide">
              Acesso reservado por
            </span>
          </div>
          <span className="text-base font-extrabold text-red-600 font-['Geist_Mono',monospace] tabular-nums">
            {mm}:{ss}
          </span>
        </div>

        {/* Cartão de pagamento — primeira dobra no mobile */}
        <div className="bg-gradient-to-br from-white/90 to-slate-50/40 backdrop-blur-xl border border-yellow-200 rounded-3xl p-6 space-y-4 shadow-[0_20px_60px_rgba(217,169,40,0.15)]">
          <div className="text-center space-y-1">
            <h2 className="text-base font-extrabold text-slate-900 leading-tight">
              Libere o acesso total ao celular {doAlvo}
            </h2>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#128C7E]/80 font-['Geist_Mono',monospace] pt-1">
              Total a pagar hoje
            </div>
            <div>
              <span className="text-slate-400 text-lg line-through mr-2">R$197</span>
              <span className="text-[#128C7E] text-5xl font-extrabold tracking-tight">R${Math.floor(displayAmount)}</span>
              <span className="text-[#128C7E] text-xl font-bold">,{String(Math.round((displayAmount - Math.floor(displayAmount)) * 100)).padStart(2, "0")}</span>
            </div>
            <div className="text-[12px] text-slate-500">Pagamento único · Liberação imediata após confirmação</div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-300 rounded-xl p-3 text-red-700 text-sm text-center">
              {error}
            </div>
          )}

          {!error && (
            <form onSubmit={handleGenerate} className="space-y-3">
              <button
                type="submit"
                disabled={generating}
                className="w-full h-14 text-white font-extrabold rounded-2xl transition-all active:scale-[0.98] uppercase tracking-wide text-[15px] bg-[#25D366] hover:bg-[#1eb959] disabled:opacity-60 shadow-[0_0_40px_-8px_rgba(37,211,102,0.9)] animate-pulse"
              >
                {generating ? "Gerando PIX…" : `🔓 Gerar PIX de ${formatBRL(displayAmount)}`}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#25D366]" />
                </span>
                <span className="font-semibold text-slate-600 tabular-nums">{liveViewers} pessoas</span>
                gerando o acesso agora
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-[12px] text-slate-700 leading-relaxed">
                <div className="font-bold text-[#128C7E] mb-1">🔐 Sigilo absoluto</div>
                Na cobrança PIX é gerado um <span className="font-semibold text-slate-900">nome e CPF aleatórios</span>, então nenhum dado seu aparece no pagamento.
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <Badge>🛡️ 100% anônimo</Badge>
                <Badge>⚡ Na hora</Badge>
                <Badge>🕵️ Sigilo total</Badge>
              </div>
            </form>
          )}
        </div>

        {/* Prova social — avaliação */}
        <div className="flex items-center justify-center gap-3 text-center">
          <div className="text-amber-500 text-lg leading-none">⭐⭐⭐⭐⭐</div>
          <div className="text-[12px] text-slate-600">
            <span className="font-extrabold text-slate-900">4,9/5</span> · mais de{" "}
            <span className="font-extrabold text-slate-900">18.400</span> acessos liberados
          </div>
        </div>

        {/* Apelo emocional */}
        <div className="bg-white border border-yellow-200 rounded-3xl p-5 space-y-2 shadow-[0_12px_40px_rgba(217,169,40,0.10)]">
          <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
            Pare de perder o sono com a dúvida.
          </h3>
          <p className="text-[13px] text-slate-700 leading-relaxed">
            Cada dia sem saber a verdade é mais uma noite acordado, imaginando o pior. Você merece{" "}
            <span className="font-bold text-slate-900">enxergar tudo com os próprios olhos</span> — mensagens
            apagadas, fotos escondidas e a localização em tempo real. Em minutos a angústia vira{" "}
            <span className="font-bold text-[#128C7E]">certeza</span>, e ninguém nunca vai saber que foi você.
          </p>
        </div>

        {/* Depoimentos */}
        <div className="space-y-3">
          <div className="text-[10px] uppercase tracking-[0.2em] text-[#128C7E]/80 font-['Geist_Mono',monospace] text-center">
            Quem já descobriu a verdade
          </div>
          {TESTIMONIALS.map((t) => (
            <Testimonial key={t.name} {...t} />
          ))}
        </div>

        {/* Resumo do pedido — o que você recebe */}
        <div className="bg-white border border-yellow-200 rounded-3xl p-5 space-y-4 shadow-[0_12px_40px_rgba(217,169,40,0.10)]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#128C7E]/80 font-['Geist_Mono',monospace]">
                Seu pedido
              </div>
              <h2 className="text-base font-extrabold text-slate-900">Licença Spy Radar</h2>
            </div>
            <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-md font-bold bg-[#25D366]/10 text-[#128C7E] border border-[#25D366]/30 whitespace-nowrap">
              365 dias
            </span>
          </div>

          <ul className="space-y-2">
            {[
              "Acesso total ao celular clonado por 365 dias",
              "Mensagens, fotos e áudios — inclusive apagados",
              "Localização em tempo real e apps monitorados",
              "100% anônimo · o alvo nunca é notificado",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-[13px] text-slate-700 leading-snug">
                <span className="text-[#25D366] font-bold mt-0.5">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <span className="text-[13px] font-semibold text-slate-600">Total</span>
            <span className="text-lg font-extrabold text-[#128C7E]">{formatBRL(displayAmount)}</span>
          </div>
        </div>

        {/* Garantia */}
        <div className="flex items-start gap-3 bg-[#25D366]/[0.07] border border-[#25D366]/25 rounded-2xl p-4">
          <span className="text-2xl leading-none">🛡️</span>
          <div>
            <div className="text-sm font-extrabold text-[#128C7E]">Garantia de liberação</div>
            <p className="text-[12px] text-slate-700 leading-relaxed">
              Se o acesso não for liberado após a confirmação do PIX, seu dinheiro volta integralmente. Risco zero para você.
            </p>
          </div>
        </div>

        <ul className="text-[12px] text-slate-500 space-y-1.5">
          <li>1. Abra o app do seu banco e escolha pagar via PIX.</li>
          <li>2. Selecione "Pix Copia e Cola" ou escaneie o QR Code.</li>
          <li>3. Confirme o pagamento de {formatBRL(displayAmount)}.</li>
          <li>4. A liberação é automática — não precisa enviar comprovante.</li>
        </ul>

        {/* Aviso pós-pagamento */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[#128C7E] text-lg">✅</span>
            <h3 className="text-sm font-bold text-[#25D366]">Após o pagamento</h3>
          </div>
          <p className="text-[12px] text-slate-700 leading-relaxed">
            Você terá <span className="text-[#25D366] font-semibold">acesso total ao celular clonado</span> {doAlvo} — mensagens, fotos, localização e aplicativos.
          </p>
          <p className="text-[11px] text-slate-500 leading-relaxed border-t border-yellow-100 pt-2">
            ⚠️ O SpyRadar Brasil <span className="text-slate-500 font-semibold">não se responsabiliza</span> pelo mau uso das informações obtidas. O uso é de inteira responsabilidade do contratante.
          </p>
        </div>



        <Link
          to="/relatorio"
          search={{ phone, sex, paid: 0 }}
          className="block w-full text-center text-[11px] font-['Geist_Mono',monospace] uppercase tracking-[0.2em] text-slate-500 hover:text-slate-500 transition-colors py-3"
        >
          ← voltar ao relatório
        </Link>
      </div>

      {downsellOffer != null && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm grid place-items-center px-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-yellow-200 relative">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-yellow-50 border border-yellow-200 grid place-items-center text-3xl">
                🎁
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#128C7E] font-bold">
                Espera! Oferta exclusiva
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">
                Última chance de <span className="text-[#25D366]">liberar o acesso</span>
              </h2>
              <p className="text-[13px] text-slate-600 leading-snug">
                Você vai perder o clone ativo agora. Liberamos um <strong>desconto único</strong> para você garantir o acesso:
              </p>
              <div className="py-3">
                <div className="text-sm text-slate-400 line-through">
                  De {formatBRL(currentAmount)}
                </div>
                <div className="text-5xl font-extrabold text-[#25D366] tracking-tight">
                  {formatBRL(downsellOffer)}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  pagamento único · liberação imediata
                </div>
              </div>
            </div>

            <button
              onClick={acceptDownsell}
              className="w-full h-14 bg-[#25D366] hover:bg-[#1eb959] text-white font-extrabold rounded-2xl transition-all active:scale-[0.98] shadow-[0_0_40px_-8px_rgba(217,169,40,0.8)] text-[15px] uppercase tracking-wide"
            >
              🔓 Aceitar por {formatBRL(downsellOffer)}
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

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl py-2 text-center text-[10px] text-slate-500 font-semibold">
      {children}
    </div>
  );
}

function Testimonial({
  name,
  location,
  text,
  time,
}: {
  name: string;
  location: string;
  text: string;
  time: string;
}) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-500/30 to-yellow-700/30 border border-yellow-200 grid place-items-center text-yellow-700 text-xs font-bold">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-slate-900 truncate">{name}</span>
            <span className="text-[#128C7E] text-xs">✔</span>
          </div>
          <div className="text-[10px] text-slate-500 font-['Geist_Mono',monospace] uppercase tracking-wider">
            {location} · {time}
          </div>
        </div>
        <div className="text-amber-600 text-[10px]">⭐⭐⭐⭐⭐</div>
      </div>
      <p className="text-[12px] text-slate-700 leading-relaxed">"{text}"</p>
    </div>
  );
}

