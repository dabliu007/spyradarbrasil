import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTargetName } from "@/lib/use-target-name";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useRef, useState } from "react";
import { z } from "zod";
import { createPixCharge } from "@/lib/pix.functions";
import { getBlackCatOriginToken } from "@/lib/blackcat-origin";
import { fbqTrackOnce, getMetaCookies, getPersistedUtms } from "@/lib/tracking";
import {
  CHECKOUT_PRICE,
  CheckoutShell,
  LockIcon,
  formatBRL,
} from "@/components/checkout/checkout-shell";

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

function CheckoutPage() {
  const { phone, sex } = Route.useSearch();
  const navigate = useNavigate();
  const createPix = useServerFn(createPixCharge);
  const targetName = useTargetName();
  const title = `Acesso total ao celular ${targetName ? `de ${targetName}` : "do alvo"}`;

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inFlightRef = useRef(false);

  // Links antigos ainda podem trazer ?amount=67; o checkout sempre cobra o preço atual.
  const amount = CHECKOUT_PRICE;

  const generate = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setError(null);
    try {
      const { fbc, fbp } = getMetaCookies();
      const c = await createPix({
        data: {
          product: "checkout",
          amount,
          fbc,
          fbp,
          utms: getPersistedUtms(),
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
      setError(e?.message || "Falha ao gerar o Pix. Tente novamente.");
      inFlightRef.current = false;
    }
  }, [amount, createPix, navigate, phone, sex]);

  const handleGenerate = async () => {
    setLoading(true);
    await generate();
    setLoading(false);
  };

  return (
    <CheckoutShell title={title} amount={amount}>
      <section className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between text-[14px]">
          <span className="text-slate-600">Total a pagar</span>
          <span className="font-extrabold text-[18px] text-[#128C7E] tabular-nums">
            {formatBRL(amount)}
          </span>
        </div>
        {error ? (
          <p role="alert" className="text-[13px] text-red-700 text-center">
            {error}
          </p>
        ) : null}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          aria-busy={loading}
          className="w-full h-14 rounded-xl bg-[#25D366] hover:bg-[#1eb959] disabled:opacity-80 text-white font-bold text-[16px] transition-colors active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Gerando seu Pix…
            </>
          ) : (
            <>
              <LockIcon className="w-5 h-5" />
              {error ? "Tentar novamente" : "Gerar Pix"}
            </>
          )}
        </button>
        <p className="text-[12px] text-slate-500 text-center">
          Pagamento instantâneo · liberação automática após a confirmação
        </p>
      </section>
    </CheckoutShell>
  );
}
