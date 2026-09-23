import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { CityAutocomplete, MapHackStep } from "./verificar";
import { getInstagramProfile } from "@/lib/ig-profile.functions";
import { consultCpf } from "@/lib/cpf.functions";

const searchSchema = z.object({
  phone: z.union([z.string(), z.number()]).optional().transform((v) => (v == null ? "" : String(v))),
});

export const Route = createFileRoute("/dados-alvo")({
  head: () => ({
    meta: [
      { title: "Dados do alvo · SpyRadar Brasil" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  validateSearch: (s) => searchSchema.parse(s),
  component: DadosAlvoPage,
});

// CPF em stand-by: mantém todo o código no projeto, apenas oculta a etapa de CPF.
// Trocar para `true` reativa a pergunta/consulta de CPF sem nenhuma outra mudança.
const CPF_ENABLED = false;

function DadosAlvoPage() {
  const { phone } = Route.useSearch();
  const navigate = useNavigate();

  const [partnerSex, setPartnerSex] = useState<"M" | "F">("M");
  const [uf, setUf] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [instagram, setInstagram] = useState<string>("");
  const [knowsCpf, setKnowsCpf] = useState<"yes" | "no" | null>(null);
  const [cpfInput, setCpfInput] = useState("");
  const [cpfError, setCpfError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [cities, setCities] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);

  const formatCpf = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  };
  const cpfDigits = cpfInput.replace(/\D/g, "");

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    if (!uf) { setCities([]); return; }
    let cancelled = false;
    setLoadingCities(true);
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`)
      .then((r) => r.json())
      .then((data: Array<{ nome: string }>) => {
        if (cancelled) return;
        setCities(data.map((d) => d.nome).sort((a, b) => a.localeCompare(b, "pt-BR")));
      })
      .catch(() => { if (!cancelled) setCities([]); })
      .finally(() => { if (!cancelled) setLoadingCities(false); });
    return () => { cancelled = true; };
  }, [uf]);

  const cpfReady = !CPF_ENABLED || knowsCpf === "no" || (knowsCpf === "yes" && cpfDigits.length === 11);
  const complete =
    !!uf &&
    city.trim().length >= 2 &&
    (!CPF_ENABLED || !!knowsCpf) &&
    !!phone &&
    cpfReady;

  const fetchInstagram = useServerFn(getInstagramProfile);
  const callCpf = useServerFn(consultCpf);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complete) return;
    setCpfError(null);
    try {
      sessionStorage.setItem("zr.partner.sex", partnerSex);
      sessionStorage.setItem("zr.partner.uf", uf);
      sessionStorage.setItem("zr.partner.city", city.trim());
      if (instagram) sessionStorage.setItem("zr.partner.instagram", instagram);
      sessionStorage.removeItem("zr.partner.ig_profile");
    } catch {}

    if (instagram) {
      fetchInstagram({ data: { username: instagram } })
        .then((r) => {
          if (r?.profile) {
            try { sessionStorage.setItem("zr.partner.ig_profile", JSON.stringify(r.profile)); } catch {}
          }
        })
        .catch(() => {});
    }

    // Se souber o CPF, disparamos a consulta em paralelo à animação do mapa.
    let cpfPromise: Promise<any> | null = null;
    if (knowsCpf === "yes") {
      cpfPromise = callCpf({ data: { cpf: cpfDigits } })
        .then((data) => {
          try {
            sessionStorage.setItem(
              "zr.target.cpf",
              JSON.stringify({ cpf: cpfDigits, ...data }),
            );
          } catch {}
          return data;
        });
    }

    setSubmitting(true);
    window.scrollTo(0, 0);

    const minDelay = new Promise((r) => setTimeout(r, 4200));

    try {
      if (cpfPromise) {
        await Promise.all([cpfPromise, minDelay]);
        navigate({ to: "/alvo-encontrado", search: { phone, cpf: cpfDigits } as any });
      } else {
        await minDelay;
        navigate({
          to: "/verificar",
          search: { phone, autostart: "1", sex: partnerSex, uf, city: city.trim() } as any,
        });
      }
    } catch (err: any) {
      setSubmitting(false);
      setCpfError(err?.message || "Não foi possível consultar esse CPF agora.");
    }
  };

  // Enquanto envia, mostra o MapHackStep (tela de conexão) no visual dark original
  if (submitting) {
    return (
      <div className="min-h-screen w-full bg-[#080808] text-zinc-100 font-['Inter',sans-serif] relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(128,128,128,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(128,128,128,0.07) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-500/[0.06] blur-[140px] rounded-full pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center px-4 py-8 min-h-screen">
          <div className="w-full max-w-lg mt-6">
            <MapHackStep city={city} uf={uf} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white text-slate-900 font-['Inter',sans-serif] relative overflow-hidden">
      {/* subtle mesh background */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_0%,rgba(37,211,102,0.08),transparent_50%),radial-gradient(circle_at_100%_100%,rgba(18,140,126,0.06),transparent_50%)]" />

      <div className="relative z-10 flex flex-col items-center px-4 py-8 min-h-screen">
        <div className="flex items-center justify-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-[#25D366]/30 blur-md rounded-full" />
            <div className="relative w-10 h-10 bg-gradient-to-br from-[#25D366] to-[#128C7E] rounded-xl flex items-center justify-center shadow-lg shadow-yellow-200">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            SpyRadar <span className="text-[#128C7E]">Brasil</span>
          </span>
        </div>

        <div className="w-full max-w-lg mt-6">
          <div className="space-y-6">
            <div className="text-center space-y-3 pt-2">
              <div className="inline-flex items-center gap-2 bg-[#25D366]/10 border border-[#128C7E]/25 text-[#128C7E] text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-[0.18em]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
                Etapa 2 de 3 · Refinando o alvo
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Alguns dados do{" "}
                <span className="text-[#128C7E]">investigado(a)</span>
              </h1>
              <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
                Isso aumenta a precisão do cruzamento com bases sociais, motéis, apps de relacionamento e localização.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-[0_10px_40px_-15px_rgba(18,140,126,0.25)] relative overflow-hidden space-y-5"
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#25D366] to-transparent" />

              {/* Sexo */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  Sexo do parceiro(a) investigado(a)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { v: "M" as const, label: "Homem", emoji: "👨" },
                    { v: "F" as const, label: "Mulher", emoji: "👩" },
                  ].map((opt) => {
                    const active = partnerSex === opt.v;
                    return (
                      <button
                        key={opt.v}
                        type="button"
                        onClick={() => setPartnerSex(opt.v)}
                        className={`h-14 rounded-xl border font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                          active
                            ? "bg-[#25D366]/10 border-[#128C7E] text-[#128C7E] shadow-[0_4px_14px_-4px_rgba(37,211,102,0.5)]"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <span className="text-xl">{opt.emoji}</span>
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Localização */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  Localização atual do investigado
                </label>
                <div className="grid grid-cols-[110px_1fr] gap-2">
                  <select
                    value={uf}
                    onChange={(e) => { setUf(e.target.value); setCity(""); }}
                    className="h-14 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 px-3 text-sm font-bold focus:border-[#128C7E] focus:outline-none focus:ring-2 focus:ring-[#25D366]/20 transition"
                  >
                    <option value="">UF</option>
                    {["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <CityAutocomplete
                    uf={uf}
                    city={city}
                    setCity={setCity}
                    cities={cities}
                    loading={loadingCities}
                    variant="light"
                  />
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                  📡 Usada para triangular as <span className="text-[#128C7E] font-semibold">antenas 4G/5G</span> mais próximas.
                </p>
              </div>

              {/* Instagram — temporariamente removido */}


              {/* CPF conhecido? — em stand-by (CPF_ENABLED=false) */}
              {CPF_ENABLED && (
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  Você sabe o CPF dele(a)?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { v: "yes" as const, label: "Sim, eu sei", emoji: "✅" },
                    { v: "no" as const, label: "Não sei", emoji: "❌" },
                  ].map((opt) => {
                    const active = knowsCpf === opt.v;
                    return (
                      <button
                        key={opt.v}
                        type="button"
                        onClick={() => setKnowsCpf(opt.v)}
                        className={`h-14 rounded-xl border font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                          active
                            ? "bg-[#25D366]/10 border-[#128C7E] text-[#128C7E] shadow-[0_4px_14px_-4px_rgba(37,211,102,0.5)]"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <span className="text-xl">{opt.emoji}</span>
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                  Com o CPF conseguimos cruzar bases privadas (motéis, cartões, apps adultos) e{" "}
                  <span className="text-[#128C7E] font-semibold">dobrar a precisão</span> do resultado.
                </p>

                {knowsCpf === "yes" && (
                  <div className="pt-2 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#128C7E]">
                      CPF do investigado(a)
                    </label>
                    <input
                      value={cpfInput}
                      onChange={(e) => { setCpfInput(formatCpf(e.target.value)); setCpfError(null); }}
                      inputMode="numeric"
                      placeholder="000.000.000-00"
                      autoFocus
                      className="w-full h-14 bg-white border-2 border-[#25D366]/50 focus:border-[#128C7E] rounded-xl px-3 text-slate-900 text-center tracking-widest text-lg outline-none focus:ring-2 focus:ring-[#25D366]/20"
                    />
                    {cpfError && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-[12px] text-red-700">
                        {cpfError}
                      </div>
                    )}
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      🔒 Processado por canal criptografado e descartado após a consulta.
                    </p>
                  </div>
                )}
              </div>
              )}

              <button
                type="submit"
                disabled={!complete}
                className="w-full h-14 bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:brightness-105 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all active:scale-[0.98] relative overflow-hidden group shadow-[0_10px_25px_-8px_rgba(37,211,102,0.5)] disabled:shadow-none uppercase tracking-wider text-[14px]"
              >
                <span className="relative flex items-center justify-center gap-2">
                  QUERO DESCOBRIR A VERDADE
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
              <p className="text-center text-[11px] text-slate-500">
                🔒 Conexão criptografada · Sigilo absoluto
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
