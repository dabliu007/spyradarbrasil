import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { z } from "zod";
import { createPixCharge } from "@/lib/pix.functions";
import { getBlackCatOriginToken } from "@/lib/blackcat-origin";
import { isValidCpf, onlyDigits } from "@/lib/cpf";
import { fbqTrackOnce, getMetaCookies, getPersistedUtms } from "@/lib/tracking";

const searchSchema = z.object({
  phone: z.coerce.string().optional().default(""),
  sex: z.enum(["M", "F"]).optional().default("M"),
  amount: z.coerce.number().positive().optional(),
});

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Licença Zap Radar" },
      {
        name: "description",
        content: "Finalize a compra da sua licença Zap Radar com pagamento via PIX. Dados 100% sigilosos.",
      },
      { property: "og:title", content: "Checkout — Licença Zap Radar" },
      { property: "og:url", content: "https://zapradarbrasil.com.br/checkout" },
      { name: "robots", content: "noindex,follow" },
    ],
    links: [{ rel: "canonical", href: "https://zapradarbrasil.com.br/checkout" }],
  }),
  validateSearch: (s) => searchSchema.parse(s),
  component: CheckoutPage,
});

const DEFAULT_AMOUNT = 137.0;
const PRODUCT_NAME = "Licença Zap Radar — Acesso Anual";
const formatBRL = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

function maskCpf(v: string) {
  const d = onlyDigits(v).slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function maskPhone(v: string) {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

type Field = "name" | "email" | "phone" | "cpf";

function validate(values: Record<Field, string>): Partial<Record<Field, string>> {
  const errors: Partial<Record<Field, string>> = {};
  if (values.name.trim().split(/\s+/).length < 2) errors.name = "Digite seu nome completo.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = "Digite um e-mail válido.";
  const p = onlyDigits(values.phone);
  if (p.length < 10 || p.length > 11) errors.phone = "Digite um celular válido com DDD.";
  if (!isValidCpf(values.cpf)) errors.cpf = "Digite um CPF válido.";
  return errors;
}

function CheckoutPage() {
  const { phone, sex, amount } = Route.useSearch();
  const navigate = useNavigate();
  const createPix = useServerFn(createPixCharge);
  const total = amount ?? DEFAULT_AMOUNT;

  const [values, setValues] = useState<Record<Field, string>>({ name: "", email: "", phone: "", cpf: "" });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const createdRef = useRef(false);

  const update = (field: Field, raw: string) => {
    const value = field === "cpf" ? maskCpf(raw) : field === "phone" ? maskPhone(raw) : raw;
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (createdRef.current) return;
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    createdRef.current = true;
    setGenerating(true);
    setError(null);
    try {
      const { fbc, fbp } = getMetaCookies();
      const c = await createPix({
        data: {
          product: "checkout",
          amount: total,
          fbc,
          fbp,
          utms: getPersistedUtms(),
          phone,
          gender: sex,
          customerName: values.name.trim(),
          customerEmail: values.email.trim(),
          customerPhone: `55${onlyDigits(values.phone)}`,
          customerDocument: onlyDigits(values.cpf),
          originToken: await getBlackCatOriginToken(),
        },
      });
      try {
        sessionStorage.setItem("zr.pix." + c.id, JSON.stringify(c));
      } catch {}
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push({ event: "gerar_pix", valor: c.amount, produto_id: "relatorio", moeda: "BRL" });
      fbqTrackOnce(`ic-${c.externalId}`, "InitiateCheckout", {
        value: c.amount,
        currency: "BRL",
        content_ids: [c.externalId],
        content_type: "product",
        phone,
        gender: sex,
      });
      navigate({ to: "/pix", search: { id: c.id, phone, sex } });
    } catch (err: any) {
      setError(err?.message || "Falha ao gerar PIX. Tente novamente.");
      createdRef.current = false;
    } finally {
      setGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f2f4f7] text-slate-900 font-['Inter',sans-serif]">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-extrabold text-[15px] tracking-tight">Zap Radar</span>
          <span className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500">
            <LockIcon className="w-4 h-4 text-[#16a34a]" />
            Compra 100% segura
          </span>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-4 py-5 flex flex-col gap-4">
        <h1 className="sr-only">Finalizar compra da licença Zap Radar</h1>

        <section className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg bg-[#16a34a] grid place-items-center shrink-0" aria-hidden="true">
            <RadarIcon className="w-9 h-9 text-white" />
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <h2 className="text-[15px] font-bold leading-snug text-pretty">{PRODUCT_NAME}</h2>
            <p className="text-[13px] text-slate-500">Pagamento único</p>
            <p className="text-[20px] font-extrabold text-slate-900">{formatBRL(total)}</p>
          </div>
        </section>

        <form onSubmit={handleSubmit} noValidate className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-[16px] font-bold">Seus dados</h2>
            <p className="text-[13px] text-slate-500 leading-relaxed">
              Preencha para receber o acesso à sua licença Zap Radar.
            </p>
          </div>

          <div className="flex gap-2 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0] p-3 text-[13px] text-[#166534] leading-relaxed">
            <ShieldIcon className="w-5 h-5 shrink-0" />
            <p>
              <strong>Seus dados são totalmente sigilosos.</strong> Eles servem só para liberar a sua licença e
              nunca são compartilhados. A pessoa monitorada não é notificada.
            </p>
          </div>

          <Input
            id="name"
            label="Nome completo"
            autoComplete="name"
            placeholder="Digite seu nome completo"
            value={values.name}
            error={errors.name}
            onChange={(v) => update("name", v)}
          />
          <Input
            id="email"
            label="E-mail"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="Digite seu e-mail"
            value={values.email}
            error={errors.email}
            onChange={(v) => update("email", v)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="phone"
              label="Celular"
              type="tel"
              autoComplete="tel-national"
              inputMode="numeric"
              placeholder="(00) 00000-0000"
              value={values.phone}
              error={errors.phone}
              onChange={(v) => update("phone", v)}
            />
            <Input
              id="cpf"
              label="CPF"
              inputMode="numeric"
              placeholder="000.000.000-00"
              value={values.cpf}
              error={errors.cpf}
              onChange={(v) => update("cpf", v)}
            />
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-[13px] font-semibold text-slate-700 mb-2">Forma de pagamento</legend>
            <div className="flex items-center gap-3 rounded-lg border-2 border-[#16a34a] bg-[#f0fdf4] px-4 py-3">
              <span className="w-4 h-4 rounded-full border-[5px] border-[#16a34a] bg-white" aria-hidden="true" />
              <span className="font-bold text-[14px]">PIX</span>
              <span className="ml-auto text-[12px] text-[#166534] font-semibold">Aprovação imediata</span>
            </div>
          </fieldset>

          <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-[14px]">
            <span className="text-slate-600">Total</span>
            <span className="font-extrabold text-[18px]">{formatBRL(total)}</span>
          </div>

          {error && (
            <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={generating}
            className="w-full h-14 rounded-lg bg-[#16a34a] hover:bg-[#15803d] text-white font-extrabold text-[16px] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {generating ? "Gerando PIX…" : "Comprar agora"}
          </button>

          <p className="text-[12px] text-slate-500 text-center leading-relaxed">
            Liberação automática após a confirmação do PIX, sem enviar comprovante.
          </p>
        </form>

        <footer className="flex flex-col items-center gap-2 py-2 text-[11px] text-slate-400 text-center leading-relaxed">
          <span className="flex items-center gap-1.5 font-semibold text-slate-500">
            <LockIcon className="w-3.5 h-3.5" />
            Ambiente criptografado · Pagamento processado por BlackCat
          </span>
          <p>O uso das informações é de inteira responsabilidade do contratante.</p>
        </footer>
      </div>
    </main>
  );
}

function Input({
  id,
  label,
  value,
  error,
  onChange,
  type = "text",
  ...rest
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold text-slate-700">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`h-12 rounded-lg border px-3 text-[15px] bg-white outline-none transition-colors focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 ${
          error ? "border-red-400" : "border-slate-300"
        }`}
        {...rest}
      />
      {error && (
        <span id={`${id}-error`} className="text-[12px] text-red-600">
          {error}
        </span>
      )}
    </div>
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

function RadarIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <path d="M12 12l6-6" strokeLinecap="round" />
    </svg>
  );
}
