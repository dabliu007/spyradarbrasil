import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { getPixStatus } from "@/lib/pix.functions";

const searchSchema = z.object({
  tx: z.coerce.string().optional().default(""),
  phone: z.coerce.string().optional().default(""),
  sex: z.enum(["M", "F"]).optional().default("M"),
});

export const Route = createFileRoute("/entrega")({
  head: () => ({
    meta: [
      { title: "Resultado da Análise · SpyRadar Brasil" },
      { name: "description", content: "Resultado final da análise do telefone rastreado pelo SpyRadar Brasil." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  validateSearch: (s) => searchSchema.parse(s),
  loaderDeps: ({ search }) => ({ tx: search.tx }),
  loader: async ({ deps }) => {
    if (!deps.tx) return { paid: false };
    try {
      const s = await getPixStatus({ data: { id: deps.tx } });
      return { paid: s.paid };
    } catch {
      return { paid: false };
    }
  },
  component: EntregaPage,
});

function formatPhone(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
}

function EntregaPage() {
  const { paid } = Route.useLoaderData();
  const { phone: initialPhone } = Route.useSearch();

  return (
    <main className="min-h-screen bg-white text-slate-900 font-['Inter',sans-serif]">
      <div className="max-w-xl mx-auto px-4 py-10 flex flex-col gap-6">
        <header className="flex flex-col gap-1 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-[#128C7E]">SpyRadar Brasil</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-balance">Resultado final da análise</h1>
        </header>
        {paid ? <PhoneCheck initialPhone={initialPhone} /> : <Locked />}
      </div>
    </main>
  );
}

function Locked() {
  return (
    <section className="border border-emerald-300 bg-emerald-50 rounded-xl p-6 flex flex-col gap-4 text-center">
      <h2 className="text-lg font-extrabold">Resultado bloqueado</h2>
      <p className="text-sm leading-relaxed text-slate-700">
        O resultado só é liberado após a confirmação de todas as etapas de pagamento.
        Se você já pagou, aguarde alguns instantes e recarregue esta página.
      </p>
      <Link to="/" className="self-center rounded-lg bg-[#128C7E] px-5 py-3 text-sm font-bold text-white">
        Voltar ao início
      </Link>
    </section>
  );
}

const SCAN_STEPS = [
  "Conectando ao dispositivo…",
  "Analisando conversas e mídias…",
  "Cruzando contatos e localizações…",
  "Gerando resultado final…",
];

function PhoneCheck({ initialPhone }: { initialPhone: string }) {
  const [phone, setPhone] = useState(formatPhone(initialPhone));
  const [stage, setStage] = useState<"input" | "scanning" | "done">("input");
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setError("Digite um telefone válido com DDD.");
      return;
    }
    setError(null);
    setStage("scanning");
    setStep(0);
    SCAN_STEPS.forEach((_, i) => {
      window.setTimeout(() => {
        if (i === SCAN_STEPS.length - 1) {
          window.setTimeout(() => setStage("done"), 1200);
        }
        setStep(i);
      }, i * 1200);
    });
  };

  if (stage === "scanning") {
    return (
      <section className="border border-slate-200 rounded-xl p-6 flex flex-col gap-4" aria-live="polite">
        <p className="text-sm font-bold text-[#128C7E]">Analisando {phone}</p>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#25D366] transition-all duration-1000"
            style={{ width: `${((step + 1) / SCAN_STEPS.length) * 100}%` }}
          />
        </div>
        <p className="text-sm text-slate-600">{SCAN_STEPS[step]}</p>
      </section>
    );
  }

  if (stage === "done") {
    return (
      <section className="border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col gap-4" aria-live="polite">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Telefone analisado: {phone}</p>
        <p className="text-lg font-extrabold leading-snug text-pretty">
          Não foram encontrados indícios de traição nesse telefone.
        </p>
        <p className="text-base leading-relaxed text-slate-700">Tente novamente daqui 30 dias.</p>
        <p className="text-base leading-relaxed text-slate-700">
          Atenciosamente,
          <br />
          <span className="font-bold text-slate-900">Spy Radar Brasil</span>
        </p>
      </section>
    );
  }

  return (
    <form onSubmit={submit} className="border border-slate-200 rounded-xl p-6 flex flex-col gap-4">
      <label htmlFor="entrega-phone" className="text-sm font-bold">
        Telefone do rastreado
      </label>
      <input
        id="entrega-phone"
        type="tel"
        inputMode="numeric"
        autoComplete="off"
        placeholder="(11) 91234-5678"
        value={phone}
        onChange={(e) => setPhone(formatPhone(e.target.value))}
        className="rounded-lg border border-slate-300 px-4 py-3 text-base outline-none focus:border-[#128C7E] focus:ring-2 focus:ring-[#128C7E]/30"
        aria-invalid={!!error}
        aria-describedby={error ? "entrega-phone-error" : undefined}
      />
      {error && (
        <p id="entrega-phone-error" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <button type="submit" className="rounded-lg bg-[#25D366] px-5 py-3 text-base font-extrabold text-white">
        Ver resultado
      </button>
    </form>
  );
}
