import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useTargetName } from "@/lib/use-target-name";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { getPixStatus, type PixCharge } from "@/lib/pix.functions";
import { fbqTrackOnce } from "@/lib/tracking";
import {
  CHECKOUT_PRICE,
  CheckIcon,
  CheckoutShell,
  CopyIcon,
  PixPanelSkeleton,
  formatBRL,
} from "@/components/checkout/checkout-shell";

const searchSchema = z.object({
  id: z.coerce.string().min(1),
  phone: z.coerce.string().optional().default(""),
  sex: z.enum(["M", "F"]).optional().default("M"),
});

export const Route = createFileRoute("/pix")({
  head: () => ({
    meta: [
      { title: "PIX gerado — pague agora e desbloqueie o acesso" },
      {
        name: "description",
        content:
          "Seu PIX foi gerado. Pague em segundos e libere o acesso completo imediatamente — sigilo total, sem comprovante.",
      },
      { name: "robots", content: "noindex,follow" },
    ],
  }),
  validateSearch: (s) => searchSchema.parse(s),
  component: PixPage,
});

const STORAGE_PREFIX = "zr.pix.";

function PixPage() {
  const { id, phone, sex } = Route.useSearch();
  const navigate = useNavigate();
  const checkPix = useServerFn(getPixStatus);
  const targetName = useTargetName();
  const [charge, setCharge] = useState<PixCharge | null>(null);
  const [copied, setCopied] = useState(false);
  const [statusLabel, setStatusLabel] = useState("Aguardando pagamento…");
  const [seconds, setSeconds] = useState(15 * 60); // 15 min de urgência
  const paidRef = useRef(false);

  // Recupera o charge salvo no sessionStorage pelo checkout
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_PREFIX + id);
      if (raw) setCharge(JSON.parse(raw));
    } catch {}
  }, [id]);

  // Sem charge no storage (refresh perdeu o QR) → volta ao checkout,
  // MAS só depois de checar se o pagamento já foi confirmado — assim
  // um usuário que reabre a aba do PIX ainda é redirecionado.
  useEffect(() => {
    if (charge || !id) return;
    let cancelled = false;
    (async () => {
      try {
        const s = await checkPix({ data: { id } });
        if (cancelled) return;
        if (s.paid) {
          paidRef.current = true;
          navigate({ to: "/sigilo", search: { phone, sex } });
          return;
        }
      } catch {}
      if (!cancelled) navigate({ to: "/checkout", search: { phone, sex } });
    })();
    return () => {
      cancelled = true;
    };
  }, [charge, id, checkPix, navigate, phone, sex]);

  // Cronômetro de urgência
  useEffect(() => {
    const t = window.setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(t);
  }, []);

  const [checking, setChecking] = useState(false);
  const [checkMsg, setCheckMsg] = useState<string | null>(null);
  const tickRef = useRef<((force?: boolean) => Promise<boolean>) | null>(null);

  // Polling de status
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    let pollCount = 0;
    // `force` = consulta completa à Codefy (fallback). Ticks normais usam o
    // modo leve (só Supabase/webhook) para não saturar o rate limit da Codefy.
    const tick = async (force = false): Promise<boolean> => {
      if (paidRef.current) return true;
      if (cancelled) return false;
      // A cada 6 ticks (~24s) faz uma consulta completa à Codefy como fallback,
      // caso o webhook não tenha chegado; os demais ticks são leves.
      const light = !force && pollCount++ % 3 !== 2;
      try {
        const s = await checkPix({ data: { id, light } });
        if (cancelled) return false;
        if (s.paid) {
          paidRef.current = true;
          setStatusLabel("Pagamento confirmado! Redirecionando…");
          (window as any).dataLayer = (window as any).dataLayer || [];
          (window as any).dataLayer.push({
            event: "purchase",
            transaction_id: id,
            valor: charge?.amount,
            moeda: "BRL",
          });
          fbqTrackOnce(
            `purchase-${id}`,
            "Purchase",
            {
              value: charge?.amount,
              currency: "BRL",
              content_ids: [id],
              content_type: "product",
              transaction_id: id,
            },
            { eventId: `purchase-${id}` }
          );
          try { sessionStorage.removeItem(STORAGE_PREFIX + id); } catch {}
          navigate({ to: "/sigilo", search: { phone, sex } });
          return true;
        }
        setStatusLabel("Aguardando pagamento…");
        return false;
      } catch {
        return false;
      }
    };
    tickRef.current = tick;
    tick();
    const iv = window.setInterval(() => tick(), 4000);
    // Retomar a aba/foco força uma consulta completa à Codefy (fallback rápido).
    const onVis = () => { if (document.visibilityState === "visible") tick(true); };
    const onFocus = () => tick(true);
    window.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      window.clearInterval(iv);
      window.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", onFocus);
    };
  }, [id, charge?.amount, checkPix, navigate, phone, sex]);

  const copy = async () => {
    if (!charge?.pixCopiaCola) return;
    try {
      await navigator.clipboard.writeText(charge.pixCopiaCola);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleAlreadyPaid = async () => {
    if (checking || paidRef.current) return;
    setChecking(true);
    setCheckMsg("Verificando pagamento no banco…");
    try {
      const paid = await tickRef.current?.(true);
      if (!paid) {
        setCheckMsg("Ainda não identificamos seu pagamento. Aguarde alguns segundos e tente novamente.");
      }
    } catch {
      setCheckMsg("Não foi possível verificar agora. Tente novamente em instantes.");
    } finally {
      setChecking(false);
      setTimeout(() => setCheckMsg(null), 6000);
    }
  };

  const qrImgSrc = useMemo(() => {
    if (!charge) return "";
    return (
      charge.qrCodeBase64 ||
      (charge.pixCopiaCola
        ? `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=0&data=${encodeURIComponent(charge.pixCopiaCola)}`
        : "")
    );
  }, [charge]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const amount = charge?.amount ?? CHECKOUT_PRICE;
  const title = `Acesso total ao celular ${targetName ? `de ${targetName}` : "do alvo"}`;

  return (
    <CheckoutShell title={title} amount={amount} timer={`${mm}:${ss}`}>
      {!charge ? (
        <PixPanelSkeleton label="Carregando seu Pix…" />
      ) : (
        <section
          aria-label="Pague com Pix"
          className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-4"
        >
          <div className="flex flex-col items-center gap-1 text-center">
            <h2 className="text-[17px] font-bold">Seu Pix de {formatBRL(amount)} está pronto</h2>
            <p className="text-[13px] text-slate-500">Escaneie o QR Code ou copie o código abaixo</p>
          </div>

          <div className="mx-auto p-2 rounded-xl border border-slate-200">
            {qrImgSrc ? (
              <img src={qrImgSrc} alt="QR Code do Pix" width={208} height={208} className="w-52 h-52 block" />
            ) : (
              <div className="w-52 h-52 grid place-items-center text-slate-500 text-xs">QR indisponível</div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="pix-code" className="text-[12px] font-semibold text-slate-600">
              Pix Copia e Cola
            </label>
            <input
              id="pix-code"
              readOnly
              value={charge.pixCopiaCola}
              onFocus={(e) => e.currentTarget.select()}
              className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-[12px] font-['Geist_Mono',monospace] text-slate-600 truncate"
            />
            <button
              type="button"
              onClick={copy}
              className="w-full h-14 rounded-xl bg-[#25D366] hover:bg-[#1eb959] text-white font-extrabold text-[16px] flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
            >
              {copied ? <CheckIcon className="w-5 h-5" /> : <CopyIcon className="w-5 h-5" />}
              {copied ? "Código copiado" : "Copiar código Pix"}
            </button>
            <span className="sr-only" aria-live="polite">
              {copied ? "Código Pix copiado" : ""}
            </span>
          </div>

          <div
            role="status"
            className="flex items-center justify-center gap-2 text-[13px] text-slate-600 rounded-xl bg-slate-50 py-2.5"
          >
            <span className="relative flex w-2.5 h-2.5">
              <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-60 animate-ping" />
              <span className="relative w-2.5 h-2.5 rounded-full bg-[#25D366]" />
            </span>
            {statusLabel}
          </div>

          <button
            type="button"
            onClick={handleAlreadyPaid}
            disabled={checking}
            className="w-full h-12 rounded-xl border border-[#128C7E] text-[#128C7E] hover:bg-[#E7F6EF] font-bold text-[14px] transition-colors disabled:opacity-60 disabled:cursor-wait"
          >
            {checking ? "Verificando…" : "Já fiz o pagamento"}
          </button>
          {checkMsg && <p className="text-center text-[12px] text-slate-500 -mt-2">{checkMsg}</p>}

          <p className="text-center text-[11px] text-slate-400">
            Beneficiário: Masterfy ·{" "}
            <Link to="/checkout" search={{ phone, sex }} className="underline hover:text-slate-600">
              gerar novo Pix
            </Link>
          </p>
        </section>
      )}
    </CheckoutShell>
  );
}
