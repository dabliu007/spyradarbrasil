import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useTargetName } from "@/lib/use-target-name";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { createPixCharge } from "@/lib/pix.functions";
import { getBlackCatOriginToken } from "@/lib/blackcat-origin";

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
      { property: "og:url", content: "https://zapradarbrasil.com.br/checkout" },
      { name: "robots", content: "noindex,follow" },
    ],
    links: [{ rel: "canonical", href: "https://zapradarbrasil.com.br/checkout" }],
  }),
  validateSearch: (s) => searchSchema.parse(s),
  component: CheckoutPage,
});

const DEFAULT_AMOUNT = 67.0;
const ANCHOR_AMOUNT = 397;
const DOWNSELL_CHAIN: number[] = [];
const formatBRL = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

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

  const currentAmountRef = useRef(currentAmount);
  useEffect(() => {
    currentAmountRef.current = currentAmount;
  }, [currentAmount]);

  useEffect(() => {
    if (DOWNSELL_CHAIN.length === 0) return;
    try {
      window.history.pushState({ zr: "guard" }, "");
    } catch {}
    const onPop = () => {
      const idx = Math.min(downsellStepRef.current, DOWNSELL_CHAIN.length - 1);
      const offer = DOWNSELL_CHAIN[idx];
      if (offer < currentAmountRef.current) {
        setDownsellOffer(offer);
      }
      try {
        window.history.pushState({ zr: "guard" }, "");
      } catch {}
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const acceptDownsell = () => {
    if (downsellOffer == null) return;
    const newAmount = downsellOffer;
    setCurrentAmount(newAmount);
    downsellStepRef.current = Math.min(downsellStepRef.current + 1, DOWNSELL_CHAIN.length - 1);
    setDownsellOffer(null);
    navigate({ to: "/checkout", search: { phone, sex, amount: newAmount }, replace: true });
  };

  const declineDownsell = () => {
    downsellStepRef.current = Math.min(downsellStepRef.current + 1, DOWNSELL_CHAIN.length - 1);
    setDownsellOffer(null);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (createdRef.current) return;
    createdRef.current = true;
    setGenerating(true);
    setError(null);
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
          originToken: await getBlackCatOriginToken(),
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
      setError(e?.message || "Falha ao gerar PIX. Tente novamente.");
      createdRef.current = false;
    } finally {
      setGenerating(false);
    }
  };

  const reais = Math.floor(currentAmount);
  const centavos = String(Math.round((currentAmount - reais) * 100)).padStart(2, "0");

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-['Inter',sans-serif]">
      <div className="max-w-md mx-auto px-4 py-6 flex flex-col gap-4">
        <h1 className="sr-only">Pagamento PIX do relatório SpyRadar Brasil</h1>

        <div className="flex items-center justify-center gap-2 text-[12px] font-semibold text-slate-500">
          <LockIcon className="w-4 h-4 text-[#128C7E]" />
          Checkout seguro · Pagamento via PIX
        </div>

        <section className="bg-white border border-slate-200 rounded-3xl p-5 shadow-[0_10px_40px_-12px_rgba(15,23,42,0.18)] flex flex-col gap-5">
          <div className="text-center flex flex-col gap-1">
            <h2 className="text-[18px] font-extrabold text-slate-900 leading-tight text-balance">
              Libere o acesso total ao celular {doAlvo}
            </h2>
            <div className="text-[13px] text-slate-400 line-through mt-2">
              de {formatBRL(ANCHOR_AMOUNT)}
            </div>
            <div className="flex items-start justify-center gap-0.5" aria-label={`por ${formatBRL(currentAmount)}`}>
              <span className="text-[#128C7E] text-2xl font-bold mt-1.5">R$</span>
              <span className="text-[#128C7E] text-[56px] leading-none font-extrabold tracking-tight">
                {reais}
              </span>
              <span className="text-[#128C7E] text-2xl font-bold mt-1.5">,{centavos}</span>
            </div>
            <div className="text-[12px] text-slate-500">pagamento único · sem mensalidade</div>
          </div>

          <ul className="flex flex-col gap-2">
            {BENEFITS.map((item) => (
              <li key={item} className="flex items-start gap-2 text-[14px] text-slate-700 leading-snug">
                <CheckIcon className="w-4 h-4 text-[#25D366] mt-0.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {error && (
            <div role="alert" className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleGenerate}>
            <button
              type="submit"
              disabled={generating}
              className="w-full h-14 text-white font-extrabold rounded-2xl transition-all active:scale-[0.98] text-[16px] bg-[#25D366] hover:bg-[#1eb959] disabled:opacity-60 shadow-[0_12px_30px_-8px_rgba(37,211,102,0.7)] flex items-center justify-center gap-2"
            >
              {generating ? (
                "Gerando PIX…"
              ) : (
                <>
                  <LockIcon className="w-5 h-5" />
                  GERAR PIX DE {formatBRL(currentAmount)}
                </>
              )}
            </button>
          </form>

          <div className="flex items-start gap-2 text-[12px] text-slate-500 leading-relaxed">
            <ShieldIcon className="w-5 h-5 text-[#128C7E] shrink-0" />
            <p>
              Liberação automática após o pagamento, sem enviar comprovante. Se não liberar, seu
              dinheiro volta integralmente.
            </p>
          </div>
        </section>

        <p className="text-[11px] text-slate-400 leading-relaxed text-center">
          O SpyRadar Brasil não se responsabiliza pelo mau uso das informações obtidas. O uso é de
          inteira responsabilidade do contratante.
        </p>

        <Link
          to="/relatorio"
          search={{ phone, sex, paid: 0, city: "", uf: "" }}
          className="block w-full text-center text-[11px] font-['Geist_Mono',monospace] uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 transition-colors py-2"
        >
          ← voltar ao relatório
        </Link>
      </div>

      {downsellOffer != null && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm grid place-items-center px-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
            <div className="text-center flex flex-col gap-2">
              <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">
                Última chance de <span className="text-[#25D366]">liberar o acesso</span>
              </h2>
              <div className="py-3">
                <div className="text-sm text-slate-400 line-through">de {formatBRL(currentAmount)}</div>
                <div className="text-5xl font-extrabold text-[#25D366] tracking-tight">
                  {formatBRL(downsellOffer)}
                </div>
              </div>
            </div>
            <button
              onClick={acceptDownsell}
              className="w-full h-14 bg-[#25D366] hover:bg-[#1eb959] text-white font-extrabold rounded-2xl transition-all active:scale-[0.98] text-[15px]"
            >
              Aceitar por {formatBRL(downsellOffer)}
            </button>
            <button
              onClick={declineDownsell}
              className="w-full mt-2 py-2 text-[11px] text-slate-400 hover:text-slate-600 uppercase tracking-wider"
            >
              não, obrigado
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function LockIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className={className} aria-hidden="true">
      <rect x="4" y="10" width="16" height="10" rx="2.5" strokeLinejoin="round" />
      <path d="M8 10V7a4 4 0 018 0v3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShieldIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} className={className} aria-hidden="true">
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
