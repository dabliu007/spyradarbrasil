import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { consultCpf } from "@/lib/cpf.functions";


const searchSchema = z.object({
  phone: z.union([z.string(), z.number()]).optional().transform((v) => (v == null ? "" : String(v))),
});

export const Route = createFileRoute("/cpf-alvo")({
  head: () => ({
    meta: [
      { title: "Adicionar CPF do alvo · SpyRadar Brasil" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  validateSearch: (s) => searchSchema.parse(s),
  component: CpfAlvoPage,
});

function CpfAlvoPage() {
  const { phone } = Route.useSearch();
  const navigate = useNavigate();
  const callCpf = useServerFn(consultCpf);

  const [showModal, setShowModal] = useState(false);
  const [cpfInput, setCpfInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!showModal) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [showModal]);

  const formatCpf = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  };

  const goVerify = (extras: Record<string, string> = {}) => {
    const params = new URLSearchParams({ phone, autostart: "1", ...extras });
    navigate({ to: "/", search: Object.fromEntries(params) as any });
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

      <div className="relative z-10 max-w-xl mx-auto px-4 py-8 space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-zinc-900 border border-emerald-500/40 rounded-xl flex items-center justify-center">
            <span className="text-emerald-400 text-xl">🎯</span>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-400/80 font-['Geist_Mono',monospace]">
              Etapa opcional · Precisão máxima
            </div>
            <div className="text-base font-extrabold">Adicionar CPF do alvo</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-zinc-900/95 to-zinc-900/40 backdrop-blur-xl border border-amber-500/40 rounded-3xl p-5 sm:p-6 space-y-4 shadow-[0_25px_70px_rgba(245,158,11,0.18)]">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 bg-amber-500/15 border border-amber-500/40 rounded-2xl flex items-center justify-center text-2xl shrink-0">
              ⚠️
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-amber-300 font-['Geist_Mono',monospace]">
                Atenção
              </div>
              <h1 className="text-xl font-extrabold leading-tight">
                Quer um resultado <span className="text-amber-300">muito mais assertivo</span>?
              </h1>
            </div>
          </div>

          <p className="text-[14px] text-slate-700 leading-relaxed">
            Com o <span className="text-amber-300 font-semibold">CPF do alvo</span>, conseguimos cruzar bases públicas e privadas e desbloquear informações que ele <span className="font-semibold text-zinc-100">tenta esconder de você</span>:
          </p>

          <ul className="space-y-2">
            {[
              { icon: "💳", txt: "Compras recentes em cartões e carteiras digitais" },
              { icon: "🧾", txt: "Histórico de faturas em estabelecimentos adultos" },
              { icon: "🏨", txt: "Reservas em motéis, hotéis e pousadas" },
              { icon: "📍", txt: "Endereços frequentes e locais visitados" },
              { icon: "💍", txt: "Cadastros em apps de relacionamento e swing" },
            ].map((it, i) => (
              <li
                key={i}
                className="flex items-start gap-3 bg-zinc-950/60 border border-zinc-800 rounded-xl px-3 py-2"
              >
                <span className="text-lg leading-none">{it.icon}</span>
                <span className="text-[13px] text-zinc-200">{it.txt}</span>
              </li>
            ))}
          </ul>

          <div className="bg-emerald-500/10 border border-emerald-500/40 rounded-xl p-3 text-[12px] text-emerald-200 leading-relaxed">
            🔒 100% sigiloso. O CPF é usado <strong>apenas</strong> para refinar a clonagem — o alvo nunca é notificado.
          </div>

          <div className="grid sm:grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => navigate({ to: "/cpf-input", search: { phone } as any })}
              className="h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-extrabold rounded-2xl transition-all active:scale-[0.98] uppercase tracking-wider text-[14px] shadow-[0_10px_30px_-8px_rgba(16,185,129,0.6)]"
            >
              ✅ Sim, adicionar CPF
            </button>
            <button
              onClick={() => goVerify()}
              className="h-14 bg-zinc-900 hover:bg-zinc-800 text-slate-700 font-semibold rounded-2xl transition-all active:scale-[0.98] uppercase tracking-wider text-[13px] border border-zinc-700"
            >
              Não sei o CPF
            </button>
          </div>
          <p className="text-[11px] text-slate-500 text-center">
            Sem o CPF a busca continua normalmente, mas com menos detalhes.
          </p>
        </div>
      </div>

      {showModal && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[2147483646] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in overscroll-contain"
          onClick={() => { if (!loading) { setShowModal(false); setError(null); } }}
          onTouchMove={(e) => e.preventDefault()}
        >
          <div
            className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-[0_25px_70px_rgba(15,23,42,0.25)] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center text-2xl shrink-0">
                🔐
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#128C7E] font-['Geist_Mono',monospace] font-bold">
                  Consulta sigilosa
                </div>
                <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                  Digite o CPF do alvo
                </h3>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-['Geist_Mono',monospace] font-bold">
                CPF (apenas números)
              </label>
              <input
                value={cpfInput}
                onChange={(e) => setCpfInput(formatCpf(e.target.value))}
                inputMode="numeric"
                placeholder="000.000.000-00"
                disabled={loading}
                className="mt-1 w-full h-12 bg-slate-50 border-2 border-slate-200 focus:border-[#25D366] focus:bg-white rounded-xl px-3 text-slate-900 font-['Geist_Mono',monospace] text-center tracking-widest outline-none disabled:opacity-60 placeholder:text-slate-300"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-[12px] text-red-700">
                {error}
              </div>
            )}

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-600 leading-relaxed">
              O CPF é processado por canal criptografado, usado apenas para enriquecer o resultado da clonagem e descartado em seguida.
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setError(null);
                }}
                disabled={loading}
                className="h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl border border-slate-200 disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={submitCpf}
                disabled={loading}
                className="h-12 bg-[#25D366] hover:bg-[#1eb959] text-white font-extrabold rounded-2xl uppercase tracking-wider text-[13px] disabled:opacity-60 disabled:cursor-wait shadow-lg shadow-emerald-200"
              >
                {loading ? "Consultando…" : "Confirmar"}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
