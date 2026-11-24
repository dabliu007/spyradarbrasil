import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";

const searchSchema = z.object({
  phone: z.union([z.string(), z.number()]).optional().transform((v) => (v == null ? "" : String(v))),
  cpf: z.union([z.string(), z.number()]).optional().transform((v) => (v == null ? "" : String(v))),
});

export const Route = createFileRoute("/alvo-encontrado")({
  head: () => ({
    meta: [
      { title: "Alvo localizado · SpyRadar Brasil" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  validateSearch: (s) => searchSchema.parse(s),
  component: AlvoEncontradoPage,
});

function formatCpfMask(d: string) {
  const x = d.replace(/\D/g, "").padStart(11, "0").slice(-11);
  return `${x.slice(0, 3)}.***.***-${x.slice(9)}`;
}

function formatPhoneMask(d: string) {
  const x = d.replace(/\D/g, "");
  if (x.length < 10) return d;
  const ddd = x.slice(-11, -9) || x.slice(0, 2);
  const last = x.slice(-4);
  return `(${ddd}) *****-${last}`;
}

type IgProfile = {
  username: string | null;
  full_name: string | null;
  biography: string | null;
  followers: number | null;
  following: number | null;
  media_count: number | null;
  is_verified: boolean | null;
  is_private: boolean | null;
  profile_pic_url: string | null;
  user_id: string | null;
};

function fmtNum(n: number | null | undefined) {
  if (n == null) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

function AlvoEncontradoPage() {
  const { phone, cpf } = Route.useSearch();
  const navigate = useNavigate();
  const [data, setData] = useState<{ nome: string; nascimento: string; sexo: "M" | "F" | null } | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [ig, setIg] = useState<IgProfile | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("zr.target.cpf");
      if (raw) {
        const parsed = JSON.parse(raw);
        setData({
          nome: parsed.nome || "—",
          nascimento: parsed.nascimento || "—",
          sexo: parsed.sexo ?? null,
        });
      }
    } catch {}
    try {
      const p = sessionStorage.getItem("zr.target.photo");
      if (p) setPhotoUrl(p);
    } catch {}
    try {
      const raw = sessionStorage.getItem("zr.partner.ig_profile");
      if (raw) setIg(JSON.parse(raw));
    } catch {}
  }, []);

  const firstName = (data?.nome || "ALVO").split(" ")[0];
  const initials = (data?.nome || "AL")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const idade = (() => {
    if (!data?.nascimento) return null;
    const m = data.nascimento.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!m) return null;
    const birth = new Date(+m[3], +m[2] - 1, +m[1]);
    const diff = Date.now() - birth.getTime();
    const age = new Date(diff).getUTCFullYear() - 1970;
    return age > 0 && age < 120 ? age : null;
  })();

  const clonar = () => {
    navigate({
      to: "/",
      search: {
        phone,
        autostart: "1",
        cpf,
        sex: data?.sexo ?? "M",
      } as any,
    });
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
            Alvo localizado · pronto para clonagem
          </div>
          {/* HEADLINE */}
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-[1.1]">
            Encontramos <span className="text-emerald-400">{(data?.nome || "o alvo").split(" ")[0]}</span> —
            tudo pronto para <span className="text-amber-300">expor a verdade</span>
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-md mx-auto">
            Identidade confirmada nas bases nacionais. Inicie a clonagem agora e veja conversas, fotos e localização em tempo real.
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

        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div className="text-[10px] uppercase tracking-[0.25em] text-emerald-400/90 font-['Geist_Mono',monospace]">
            Alvo localizado na base nacional
          </div>
        </div>

        <div className="bg-gradient-to-br from-zinc-900/95 to-zinc-900/40 backdrop-blur-xl border border-emerald-500/40 rounded-3xl p-5 sm:p-6 space-y-5 shadow-[0_25px_70px_rgba(16,185,129,0.18)]">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-500/30 to-emerald-700/20 border border-emerald-500/50 flex items-center justify-center text-xl font-extrabold text-emerald-200 shrink-0">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={data?.nome || "Alvo"}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={() => setPhotoUrl(null)}
                />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-['Geist_Mono',monospace]">
                Identidade confirmada
              </div>
              <div className="text-lg font-extrabold leading-tight truncate">
                {data?.nome || "Carregando…"}
              </div>
              <div className="text-[11px] text-emerald-300 mt-0.5 flex items-center gap-1">
                <span>✓</span> Vínculos sociais e financeiros ativos
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { k: "CPF", v: cpf ? formatCpfMask(cpf) : "—" },
              { k: "Nascimento", v: data?.nascimento || "—" },
              { k: "Idade", v: idade ? `${idade} anos` : "—" },
              { k: "Sexo", v: data?.sexo === "F" ? "Feminino" : data?.sexo === "M" ? "Masculino" : "—" },
              { k: "Telefone vinculado", v: phone ? formatPhoneMask(phone) : "—" },
              { k: "Status", v: "ATIVO" },
            ].map((it) => (
              <div
                key={it.k}
                className="bg-zinc-950/70 border border-zinc-800 rounded-xl px-3 py-2"
              >
                <div className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-['Geist_Mono',monospace]">
                  {it.k}
                </div>
                <div className="text-[13px] font-semibold text-zinc-100 truncate">
                  {it.v}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {[
              "WhatsApp ativo nas últimas 24h",
              "Conversas privadas detectadas",
              "Mídias ocultas no dispositivo",
              "Localizações fora da rotina identificadas",
            ].map((t, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/30 rounded-xl px-3 py-2 text-[12px] text-emerald-200"
              >
                <span className="text-emerald-400">●</span>
                <span>{t}</span>
              </div>
            ))}
          </div>

          <div className="bg-amber-500/10 border border-amber-500/40 rounded-xl p-3 text-[12px] text-amber-200 leading-relaxed">
            ⚠️ <strong>{firstName}</strong> pode estar escondendo informações comprometedoras. Inicie a clonagem agora antes que apague qualquer prova.
          </div>


          {ig && (
            <div className="bg-gradient-to-br from-fuchsia-950/40 to-zinc-950 border border-fuchsia-500/40 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">📸</span>
                <div className="text-[9px] uppercase tracking-[0.2em] text-fuchsia-300 font-['Geist_Mono',monospace] font-bold">
                  Instagram interceptado
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 rounded-full overflow-hidden bg-zinc-900 border border-fuchsia-500/40 shrink-0">
                  {ig.profile_pic_url ? (
                    <img
                      src={ig.profile_pic_url}
                      alt={ig.username || ""}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                      referrerPolicy="no-referrer"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 text-white font-bold text-sm truncate">
                    @{ig.username}
                    {ig.is_verified && <span className="text-sky-400" title="Verificado">✓</span>}
                    {ig.is_private && (
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ml-1">
                        Privado
                      </span>
                    )}
                  </div>
                  {ig.full_name && (
                    <div className="text-[12px] text-zinc-300 truncate">{ig.full_name}</div>
                  )}
                  {ig.biography && (
                    <div className="text-[11px] text-zinc-500 leading-tight line-clamp-2 italic">
                      "{ig.biography}"
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { k: "Posts", v: fmtNum(ig.media_count) },
                  { k: "Seguidores", v: fmtNum(ig.followers) },
                  { k: "Seguindo", v: fmtNum(ig.following) },
                ].map((it) => (
                  <div key={it.k} className="bg-zinc-950/70 border border-fuchsia-500/20 rounded-xl px-2 py-2 text-center">
                    <div className="text-[9px] uppercase tracking-[0.15em] text-fuchsia-300/70 font-['Geist_Mono',monospace]">
                      {it.k}
                    </div>
                    <div className="text-sm font-extrabold text-white">{it.v}</div>
                  </div>
                ))}
              </div>

              <div className="bg-fuchsia-500/10 border border-fuchsia-500/30 rounded-xl p-2.5 text-[11px] text-fuchsia-100 leading-relaxed">
                💬 Após a clonagem, você verá <strong>DMs privadas</strong>, curtidas ocultas, contas secundárias e todas as interações com contas suspeitas.
              </div>
            </div>
          )}




          <button
            onClick={clonar}
            className="w-full h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-extrabold rounded-2xl transition-all active:scale-[0.98] uppercase tracking-wider text-[14px] shadow-[0_10px_30px_-8px_rgba(16,185,129,0.6)]"
          >
            🔓 Clonar celular de: {firstName}
          </button>
          <p className="text-[11px] text-zinc-500 text-center">
            100% sigiloso · o alvo não é notificado
          </p>
        </div>
      </div>
    </div>
  );
}
