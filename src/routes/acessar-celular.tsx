import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTargetName } from "@/lib/use-target-name";
import { useEffect, useState } from "react";
import { z } from "zod";


const searchSchema = z.object({
  phone: z.coerce.string().optional().default(""),
  sex: z.enum(["M", "F"]).optional().default("M"),
});

export const Route = createFileRoute("/acessar-celular")({
  head: () => ({
    meta: [
      { title: "Acessar Celular Clonado · ZapRadar" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  validateSearch: (s) => searchSchema.parse(s),
  component: AcessarCelularPage,
});

function AcessarCelularPage() {
  const { phone: searchPhone, sex } = Route.useSearch();
  const navigate = useNavigate();

  const [phone, setPhone] = useState(searchPhone || "");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const targetName = useTargetName();
  const doAlvo = targetName ? `de ${targetName}` : "do alvo";

  useEffect(() => {
    if (searchPhone) return;
    try {
      const savedPhone = sessionStorage.getItem("zr.access.phone");
      if (savedPhone) setPhone(savedPhone);
    } catch {}
  }, [searchPhone]);

  const maskPhone = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2) return d;
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotFound(false);
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setError("Digite um número válido com DDD.");
      return;
    }
    if (pin.length < 4) {
      setError("Digite a senha de 4 dígitos.");
      return;
    }
    setLoading(true);
    navigate({ to: "/nota-fiscal", search: { phone: digits, sex } });
  };


  return (
    <div className="min-h-screen bg-white text-slate-900 font-['Inter',sans-serif] relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(16,185,129,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(16,185,129,0.06) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-emerald-500/[0.10] blur-[160px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-md mx-auto px-4 py-8 space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-slate-100 border border-emerald-300 rounded-xl flex items-center justify-center">
            <span className="text-[#128C7E] text-xl">🔓</span>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#128C7E]/80 font-['Geist_Mono',monospace]">
              ZapRadar · Painel Espelhamento
            </div>
            <div className="text-base font-extrabold">Acessar Celular Clonado</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white/95 to-slate-50/40 backdrop-blur-xl border border-emerald-300 rounded-3xl p-5 space-y-4 shadow-[0_25px_70px_rgba(16,185,129,0.18)]">
          <div className="text-center space-y-1">
            <h1 className="text-xl font-extrabold">Entrar no espelhamento</h1>
            <p className="text-[13px] text-slate-500">
              Informe o número clonado e sua senha de acesso para visualizar o dispositivo {doAlvo}.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-['Geist_Mono',monospace]">
                Número clonado (com DDD)
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(maskPhone(e.target.value))}
                inputMode="tel"
                placeholder="(11) 99999-9999"
                className="mt-1 w-full h-12 bg-white border border-emerald-200 focus:border-emerald-400 rounded-xl px-3 text-slate-900 font-['Geist_Mono',monospace] outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-['Geist_Mono',monospace]">
                Senha de acesso (4 dígitos)
              </label>
              <input
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                inputMode="numeric"
                placeholder="••••"
                className="mt-1 w-full h-12 bg-white border border-emerald-200 focus:border-emerald-400 rounded-xl px-3 text-slate-900 tracking-[0.5em] text-center text-xl font-bold outline-none"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-300 rounded-xl p-3 text-[12px] text-red-700">
                {error}
              </div>
            )}

            {notFound && (
              <div className="bg-red-50 border border-red-500/50 rounded-xl p-4 space-y-2">
                <div className="text-[13px] font-extrabold text-red-700 uppercase tracking-wider">
                  ⚠️ Ops, sua compra não foi localizada.
                </div>
                <div className="text-[12px] text-red-700/90 leading-relaxed">
                  Faça o processo de clonagem para que tenha acesso ao celular do seu alvo.
                </div>
                <button
                  type="button"
                  onClick={() => navigate({ to: "/" })}
                  className="mt-1 w-full h-11 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-slate-900 font-extrabold rounded-xl uppercase tracking-wider text-[12px]"
                >
                  🔓 Iniciar clonagem agora
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-900 font-extrabold rounded-2xl transition-all active:scale-[0.98] uppercase tracking-wider text-[15px] shadow-[0_10px_30px_-8px_rgba(16,185,129,0.6)] disabled:opacity-60 disabled:cursor-wait"
            >
              {loading ? "🔎 Verificando…" : "🔓 Entrar no espelhamento"}
            </button>
          </form>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="bg-white border border-slate-200 rounded-xl py-2 text-center text-[10px] text-slate-700 font-semibold">🔒 Sigilo total</div>
            <div className="bg-white border border-slate-200 rounded-xl py-2 text-center text-[10px] text-slate-700 font-semibold">⚡ Tempo real</div>
            <div className="bg-white border border-slate-200 rounded-xl py-2 text-center text-[10px] text-slate-700 font-semibold">🕵️ Indetectável</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-[12px] text-slate-500 leading-relaxed">
          Esqueceu sua senha? Por segurança, a recuperação só é feita pelo painel ZapRadar com confirmação da licença ativa.
        </div>
      </div>
    </div>
  );
}
