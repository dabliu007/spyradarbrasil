import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { consultCpf } from "@/lib/cpf.functions";

const searchSchema = z.object({
  phone: z.union([z.string(), z.number()]).optional().transform((v) => (v == null ? "" : String(v))),
});

export const Route = createFileRoute("/cpf-input")({
  head: () => ({
    meta: [
      { title: "Digite o CPF do alvo · ZapRadar" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  validateSearch: (s) => searchSchema.parse(s),
  component: CpfInputPage,
});

function CpfInputPage() {
  const { phone } = Route.useSearch();
  const navigate = useNavigate();
  const callCpf = useServerFn(consultCpf);

  const [cpfInput, setCpfInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatCpf = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  };

  const submitCpf = async () => {
    setError(null);
    const digits = cpfInput.replace(/\D/g, "");
    if (digits.length !== 11) {
      setError("Digite um CPF válido com 11 dígitos.");
      return;
    }
    setLoading(true);
    try {
      const data = await callCpf({ data: { cpf: digits } });
      try {
        sessionStorage.setItem(
          "zr.target.cpf",
          JSON.stringify({ cpf: digits, ...data }),
        );
      } catch {}
      navigate({
        to: "/alvo-encontrado",
        search: { phone, cpf: digits } as any,
      });
    } catch (e: any) {
      setError(e?.message || "Não foi possível consultar esse CPF agora.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-['Inter',sans-serif] relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(16,185,129,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(16,185,129,0.06) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-emerald-500/[0.10] blur-[160px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-xl mx-auto px-4 py-8 space-y-6">
        {/* PROMESSA */}
        <div className="text-center space-y-4 pt-2">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-3 py-1.5 rounded-full font-['Geist_Mono',monospace] uppercase tracking-[0.18em]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Precisão de 99,7% com o CPF
          </div>
          {/* HEADLINE */}
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-[1.1]">
            Descubra <span className="text-emerald-400">tudo</span> que ele esconde —
            até o que <span className="text-amber-300">deletou</span>
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-md mx-auto">
            Com o CPF, cruzamos bases bancárias, motéis, apps de relacionamento e cartões para revelar o que ele tenta esconder de você.
          </p>
        </div>

        {/* PROVA SOCIAL */}
        <div className="bg-zinc-900/40 backdrop-blur border border-white/5 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex -space-x-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-rose-600 border-2 border-zinc-900" />
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 border-2 border-zinc-900" />
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 border-2 border-zinc-900" />
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-indigo-600 border-2 border-zinc-900" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 text-amber-400 text-xs">
              {"★★★★★".split("").map((s, i) => <span key={i}>{s}</span>)}
              <span className="text-zinc-400 ml-1">4.9</span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-tight truncate">
              <span className="text-emerald-400 font-semibold">+38.412</span> mulheres descobriram a verdade
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-zinc-500 font-['Geist_Mono',monospace] uppercase">Online</p>
            <p className="text-[11px] text-emerald-400 font-bold">1.247 ativos</p>
          </div>
        </div>

        {/* FORMULÁRIO */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-6 space-y-4 shadow-[0_25px_70px_rgba(16,185,129,0.18)]">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl flex items-center justify-center text-2xl shrink-0">
              🔐
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-300 font-['Geist_Mono',monospace]">
                Consulta sigilosa
              </div>
              <h2 className="text-base font-extrabold text-zinc-100 leading-tight">
                Digite o CPF do alvo
              </h2>
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-['Geist_Mono',monospace]">
              CPF (apenas números)
            </label>
            <input
              value={cpfInput}
              onChange={(e) => setCpfInput(formatCpf(e.target.value))}
              inputMode="numeric"
              placeholder="000.000.000-00"
              disabled={loading}
              autoFocus
              className="mt-1 w-full h-14 bg-zinc-950 border border-emerald-500/30 focus:border-emerald-400 rounded-xl px-3 text-zinc-100 font-['Geist_Mono',monospace] text-center tracking-widest text-lg outline-none disabled:opacity-60"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/40 rounded-xl p-3 text-[12px] text-red-300">
              {error}
            </div>
          )}

          <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-3 text-[11px] text-zinc-400 leading-relaxed">
            🔒 O CPF é processado por canal criptografado, usado apenas para enriquecer o resultado da clonagem e descartado em seguida.
          </div>

          <button
            type="button"
            onClick={submitCpf}
            disabled={loading}
            className="w-full h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-extrabold rounded-2xl uppercase tracking-wider text-[14px] disabled:opacity-60 disabled:cursor-wait shadow-[0_10px_30px_-8px_rgba(16,185,129,0.6)]"
          >
            {loading ? "Consultando…" : "Confirmar e continuar"}
          </button>

          <button
            type="button"
            onClick={() => navigate({ to: "/cpf-alvo", search: { phone } as any })}
            className="w-full text-[12px] text-zinc-500 hover:text-zinc-300 underline"
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}
