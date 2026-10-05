import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";

import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";

import photo1 from "@/assets/photo1.jpg.asset.json";
import photo2 from "@/assets/photo2.jpg.asset.json";
import photo3 from "@/assets/photo3.jpg.asset.json";
import manBeach1 from "@/assets/man-beach-1.jpg.asset.json";
import manBeach2 from "@/assets/man-beach-2.jpg.asset.json";
import manBeach3 from "@/assets/man-beach-3.jpg.asset.json";
import wppVideo from "@/assets/wpp.mp4.asset.json";
import { getWhatsAppProfilePicture } from "@/lib/wa-profile.functions";
import { useTargetName } from "@/lib/use-target-name";

const VIDEO_START_SECONDS = 0; // VSL toca desde o início




export const Route = createFileRoute("/verificar")({
  head: () => ({
    meta: [
      { title: "Verificar Número · SpyRadar Brasil (SpyZap) - Clonar Celular" },
      {
        name: "description",
        content:
          "Verifique o número do WhatsApp do seu marido, esposa, namorado ou namorada no SpyRadar Brasil (SpyZap) e descubra conversas apagadas, fotos ocultas e áudios secretos em minutos.",
      },
      { property: "og:title", content: "Verificar Número · SpyRadar Brasil (SpyZap)" },
      {
        property: "og:description",
        content: "Descubra se ele(a) está te traindo sem ele(a) descobrir. Clone o WhatsApp em minutos, 100% sigiloso.",
      },
      { property: "og:url", content: "https://whatsradar.top/verificar" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Verificar Número · SpyRadar Brasil (SpyZap)" },
      {
        name: "twitter:description",
        content: "Clone o WhatsApp do seu parceiro(a) e veja conversas apagadas, fotos e áudios em minutos.",
      },
    ],
    // Conteúdo idêntico ao da home — consolida sinal de ranqueamento em "/".
    links: [{ rel: "canonical", href: "https://whatsradar.top/" }],
  }),
  component: VerificarPage,
});


type Step = "input" | "map" | "connecting" | "investigating" | "result";

// Tempo até a barra atingir 100% (libera o botão)
const LOAD_DURATION_MS = 5 * 60 * 1000; // 5 minutos

const checklist = [
  { code: "MSG.DEL", title: "Mensagens apagadas", desc: "Conversas excluídas recuperadas" },
  { code: "MED.PRV", title: "Mídia privada", desc: "Fotos e vídeos em conversas privadas" },
  { code: "LST.SEEN", title: "Última conexão real", desc: "Horário exato mesmo se oculto" },
  { code: "CTC.HID", title: "Contatos e grupos ocultos", desc: "Pessoas e grupos em segredo" },
  { code: "GEO.RT", title: "Localização em tempo real", desc: "Geolocalização compartilhada" },
];

export function VerificarPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("input");
  const [phone, setPhone] = useState(""); // raw digits, up to 11 (DDD + número)
  const [partnerSex, setPartnerSex] = useState<"M" | "F">("M");

  const [progress, setProgress] = useState(0);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const targetName = useTargetName();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Auto-start when redirected back from /cpf-alvo with ?phone=...&autostart=1
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    const ph = (sp.get("phone") || "").replace(/\D/g, "").slice(0, 11);
    const autoRaw = (sp.get("autostart") || "").replace(/"/g, "");
    const auto = autoRaw === "1" || autoRaw === "true";
    const urlSex = (sp.get("sex") || "").toUpperCase();
    let storedSex: string | null = null;
    try { storedSex = sessionStorage.getItem("zr.partner.sex"); } catch {}
    const resolvedSex = (urlSex === "F" ? "F" : urlSex === "M" ? "M" : storedSex === "F" ? "F" : storedSex === "M" ? "M" : null);
    if (resolvedSex) setPartnerSex(resolvedSex as "M" | "F");
    if (auto && ph.length >= 10) {
      setPhone(ph);
      setStep("connecting");
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) return;
    navigate({ to: "/dados-alvo", search: { phone } as any });
  };

  const formatPhone = (digits: string) => {
    const d = digits.replace(/\D/g, "").slice(0, 11);
    if (d.length === 0) return "";
    if (d.length <= 2) return `(${d}`;
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10)
      return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  };

  const fullPhone = formatPhone(phone);
  const activeChecks = useMemo(
    () => Math.floor((progress / 100) * checklist.length),
    [progress]
  );

  return (
    <div className="min-h-screen w-full bg-[#080808] text-zinc-100 font-['Inter',sans-serif] selection:bg-yellow-500/30 relative overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(128,128,128,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(128,128,128,0.07) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      {/* Emerald radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-500/[0.06] blur-[140px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center px-4 py-8 min-h-screen">
        <Header />

        <div className="w-full max-w-lg mt-6">
          {step === "input" && (
            <InputStep
              phoneDigits={phone}
              formatted={fullPhone}
              setPhoneDigits={setPhone}
              onSubmit={handleSubmit}
            />
          )}

          {step === "connecting" && (
            <ConnectingStep
              target={targetName ?? "alvo"}
              fullPhone={fullPhone}
              phoneDigits={phone}
              photoUrl={photoUrl}
              setPhotoUrl={setPhotoUrl}
              onDone={() => {
                setStep("investigating");
                setProgress(0);
              }}
            />
          )}

          {step === "investigating" && (
            <InvestigatingStep
              progress={progress}
              setProgress={setProgress}
              fullPhone={fullPhone}
              activeChecks={activeChecks}
              photoUrl={photoUrl}
              onUnlock={() => navigate({ to: "/relatorio", search: { phone: fullPhone, sex: partnerSex } })}
            />
          )}


          {step === "result" && (
            <ResultStep
              fullPhone={fullPhone}
              targetSex={partnerSex}
              onReset={() => {
                setStep("input");
                setPhone("");
              }}
            />
          )}

        </div>



        {step === "input" && <FAQ />}
        <TerminalFooter />
      </div>
    </div>
  );
}

/* -------------------- FAQ -------------------- */
const FAQ_ITEMS = [
  {
    q: "Como clonar o celular e WhatsApp do marido?",
    a: "Informe o número do WhatsApp do seu marido no SpyRadar Brasil. Em minutos você recebe acesso a conversas apagadas, fotos ocultas, áudios e localização em tempo real — 100% sigiloso, ele não recebe nenhuma notificação.",
  },
  {
    q: "Como clonar o celular e WhatsApp da esposa?",
    a: "Basta digitar o número do WhatsApp da sua esposa. O SpyRadar Brasil (também conhecido como WhatsRadar, ZapSpy e SpyZap) faz o espelhamento do aparelho e você acessa mensagens, mídia e localização sem que ela desconfie.",
  },
  {
    q: "Como descobrir a traição do meu namorado clonando o celular dele?",
    a: "Ao clonar o WhatsApp do seu namorado pelo SpyRadar Brasil, você visualiza conversas apagadas, fotos e vídeos escondidos, áudios enviados e recebidos e a localização em tempo real — provas concretas de uma possível traição.",
  },
  {
    q: "Como descobrir a traição da minha namorada clonando o celular dela?",
    a: "O SpyRadar Brasil permite clonar o celular da sua namorada em poucos minutos. Você acompanha as conversas do WhatsApp, mídia oculta e por onde ela está passando em tempo real, tudo com total discrição.",
  },
  {
    q: "A pessoa clonada é notificada?",
    a: "Não. O processo do SpyRadar Brasil é totalmente sigiloso — a pessoa alvo não recebe nenhum alerta, notificação ou aviso de que o WhatsApp dela foi espelhado.",
  },
  {
    q: "Quanto tempo demora para clonar o WhatsApp?",
    a: "Em média o processo leva até 5 minutos. Assim que o espelhamento termina, você já pode acessar o painel com todas as conversas, mídia e localização.",
  },
  {
    q: "Preciso ter acesso ao celular do alvo?",
    a: "Não. Você precisa apenas do número de WhatsApp da pessoa. Todo o processo é feito remotamente, sem instalar nada no celular dela.",
  },
  {
    q: "É seguro usar o SpyRadar Brasil / WhatsRadar / ZapSpy / SpyZap?",
    a: "Sim. Utilizamos conexão criptografada e pagamento 100% seguro. Os dados coletados ficam disponíveis apenas para você, no seu painel privado.",
  },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="w-full max-w-lg mt-10 px-2 space-y-4">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[10px] font-bold px-3 py-1.5 rounded-full font-['Geist_Mono',monospace] uppercase tracking-[0.18em]">
          FAQ · Perguntas frequentes
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight text-white">
          Como clonar o celular e o{" "}
          <span className="text-yellow-400">WhatsApp</span>
        </h2>
        <p className="text-[13px] text-zinc-400 leading-relaxed">
          Tire as principais dúvidas sobre como descobrir uma traição usando
          o SpyRadar Brasil.
        </p>
      </div>

      <div className="space-y-2">
        {FAQ_ITEMS.map((item, i) => {
          const isOpen = open === i;
          return (
            <div
              key={item.q}
              className="bg-zinc-900/50 backdrop-blur border border-white/10 rounded-2xl overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-3 text-left px-4 py-3.5 hover:bg-zinc-800/40 transition-colors"
              >
                <span className="text-[13px] font-semibold text-zinc-100 leading-snug">
                  {item.q}
                </span>
                <span
                  className={`shrink-0 w-6 h-6 rounded-full border border-yellow-500/40 bg-yellow-500/10 text-yellow-300 flex items-center justify-center text-sm transition-transform ${
                    isOpen ? "rotate-45" : ""
                  }`}
                  aria-hidden
                >
                  +
                </span>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 -mt-1 text-[12.5px] text-zinc-400 leading-relaxed">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}


/* -------------------- HEADER -------------------- */
function Header() {
  return (
    <div className="flex items-center justify-center gap-3 group cursor-default">
      <div className="relative">
        <div className="absolute inset-0 bg-yellow-500/30 blur-md rounded-full" />
        <div className="relative w-10 h-10 bg-zinc-900 border border-zinc-700 rounded-xl flex items-center justify-center shadow-2xl">
          <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      <span className="text-xl font-bold tracking-tight text-white">
        SpyRadar <span className="text-yellow-500">Brasil</span>
      </span>
    </div>
  );
}

function TerminalFooter() {
  return (
    <div className="w-full max-w-lg mt-8 px-2 space-y-3">
      <div className="bg-zinc-900/50 backdrop-blur-xl border border-amber-500/20 rounded-xl p-4 flex gap-3">
        <div className="w-8 h-8 shrink-0 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
          <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <p className="text-[11px] leading-relaxed text-zinc-400">
          Esta ferramenta foi desenvolvida por agentes internos da empresa <span className="text-zinc-200 font-semibold">Meta</span>. Todo o processo de invasão e clonagem quebra os mais altos parâmetros de segurança da plataforma e, por isso, <span className="text-amber-400 font-semibold">não deve ser usada sem moderação</span>.
        </p>
      </div>
      <div className="bg-zinc-900/40 backdrop-blur border border-zinc-800 rounded-xl p-4 text-center space-y-1">
        <div className="text-[11px] font-['Geist_Mono',monospace] text-yellow-400 uppercase tracking-[0.18em] font-bold">
          Spy Monitoramento LTDA
        </div>
        <div className="text-[11px] text-zinc-400">
          CNPJ: 17.722.425/0001-07
        </div>
        <div className="text-[10px] text-zinc-500 leading-relaxed pt-1">
          Focada em soluções de monitoramento e análise de evidências.<br />
          Sede em Curitiba — PR.
        </div>
      </div>
      <div className="flex justify-between text-[10px] font-['Geist_Mono',monospace] text-zinc-600 uppercase tracking-[0.2em] pointer-events-none">
        <span>[ System.Status: Ready ]</span>
        <span>BR-SP1 · v4.2</span>
      </div>
    </div>
  );
}


/* -------------------- INPUT -------------------- */
function InputStep({
  phoneDigits, formatted, setPhoneDigits,
  onSubmit,
}: {
  phoneDigits: string;
  formatted: string;
  setPhoneDigits: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const complete = phoneDigits.length >= 10;

  return (
    <div className="space-y-6">
      {/* PROMESSA — compacta para caber input na 1ª dobra */}
      <div className="text-center space-y-3 pt-1">
        <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[10px] font-bold px-3 py-1.5 rounded-full font-['Geist_Mono',monospace] uppercase tracking-[0.18em]">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
          Resultado em até 5 minutos · 100% sigiloso
        </div>

        {/* HEADLINE */}
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-[1.1]">
          Descubra hoje se você está sendo{" "}
          <span className="text-yellow-400">corno(a)</span>.
        </h1>
      </div>

      {/* INPUT — primeira dobra no mobile */}
      <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />

        <div className="space-y-5">
          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
              Comece a investigação agora
            </h2>
            <p className="text-[13px] sm:text-sm text-zinc-400 leading-relaxed">
              Informe o número do WhatsApp do alvo.{" "}
              <span className="text-yellow-400/80 italic">Ele não receberá nenhuma notificação.</span>
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 font-['Geist_Mono',monospace]">
                Número do WhatsApp · Brasil
              </label>
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="off"
                placeholder="(11) 90000-0000"
                value={formatted}
                onChange={(e) => setPhoneDigits(e.target.value.replace(/\D/g, "").slice(0, 11))}
                className="w-full h-14 bg-zinc-950 border border-zinc-800 rounded-xl px-4 font-['Geist_Mono',monospace] text-white text-lg focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/30 transition-all placeholder:text-zinc-700 tracking-wider"
              />
              <p className="text-[11px] text-zinc-500 leading-relaxed pt-1">
                Digite apenas os números — DDD + celular com 9 dígitos.
              </p>
            </div>

            <button
              type="submit"
              disabled={!complete}
              className="w-full h-14 bg-yellow-600 hover:bg-yellow-500 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-[#080808] font-bold rounded-2xl transition-all active:scale-[0.98] relative overflow-hidden group shadow-[0_0_30px_-5px_rgba(217,169,40,0.4)] disabled:shadow-none"
            >
              <span className="relative flex items-center justify-center gap-2">
                CONTINUAR
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>

            <p className="text-center text-[11px] text-zinc-500">
              🔒 Conexão criptografada · Pagamento 100% seguro
            </p>
          </form>
        </div>
      </div>

      {/* SUBHEADLINE + micro benefícios */}
      <div className="text-center space-y-3">
        <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-md mx-auto">
          Clone o WhatsApp dele e tenha acesso a{" "}
          <span className="text-white font-semibold">conversas apagadas, fotos ocultas, áudios secretos e localização em tempo real</span>{" "}
          — sem que ele jamais desconfie.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {["Conversas apagadas", "Fotos no privado", "Áudios secretos", "Localização ao vivo"].map((b) => (
            <span
              key={b}
              className="text-[10px] font-semibold text-yellow-300/90 bg-yellow-500/5 border border-yellow-500/20 px-2.5 py-1 rounded-full"
            >
              ✓ {b}
            </span>
          ))}
        </div>
      </div>

      {/* MATÉRIA NA TV — Brasil Agora */}
      <div className="rounded-2xl overflow-hidden border border-yellow-500/20 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        <img
          src="/images/tv-brasil-agora.webp"
          alt="Reportagem de TV sobre a Spy Radar Brasil, responsável por descobrir mais de 2.831 traições em 2026"
          className="w-full h-auto block"
          width={960}
          height={640}
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* PROVA SOCIAL — ratings + ativos */}
      <div className="bg-zinc-900/40 backdrop-blur border border-white/5 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex -space-x-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-rose-600 border-2 border-zinc-900" />
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 border-2 border-zinc-900" />
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 border-2 border-zinc-900" />
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-indigo-600 border-2 border-zinc-900" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 text-amber-400 text-xs">
            {"★★★★★".split("").map((s, i) => <span key={i}>{s}</span>)}
            <span className="text-zinc-400 ml-1">4.9</span>
          </div>
          <p className="text-[11px] text-zinc-500 leading-tight truncate">
            <span className="text-yellow-400 font-semibold">+38.412</span> mulheres descobriram a verdade
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-zinc-500 font-['Geist_Mono',monospace] uppercase">Online agora</p>
          <p className="text-[11px] text-yellow-400 font-bold animate-pulse">1.247 ativos</p>
        </div>
      </div>

      {/* DEPOIMENTOS reais de clientes (imagem) */}
      <div className="space-y-3">
        <p className="text-center text-[10px] text-zinc-500 font-['Geist_Mono',monospace] uppercase tracking-[0.2em]">
          Quem usou, descobriu
        </p>
        <div className="overflow-hidden rounded-2xl border border-yellow-500/20 shadow-[0_0_40px_-12px_rgba(234,179,8,0.35)]">
          <img
            src="/images/depoimentos-whatsapp.webp"
            alt="Depoimentos reais de clientes da Spy Radar Brasil em conversas de WhatsApp, com avaliações de 5 estrelas e selo de cliente verificado"
            className="w-full h-auto block"
            width={960}
            height={1440}
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>

      {/* GARANTIA / URGÊNCIA */}
      <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/30 rounded-2xl p-4 text-center space-y-1">
        <p className="text-[10px] font-bold text-yellow-400 uppercase tracking-[0.2em] font-['Geist_Mono',monospace]">
          ⚠ Não fique mais no escuro
        </p>
        <p className="text-sm text-zinc-200 leading-relaxed">
          Cada dia que passa é uma <span className="text-white font-bold">nova mentira</span> que você acredita.
          A verdade está a <span className="text-yellow-400 font-bold">um clique</span> de distância.
        </p>
      </div>

      {/* PROVA SOCIAL — destaque na mídia (matérias reais) */}
      <PressSection />
    </div>
  );
}

/* -------------------- IMPRENSA / NA MÍDIA -------------------- */
const PRESS_ITEMS = [
  {
    outlet: "g1",
    img: "/images/imprensa-g1.webp",
    headline: "Spy Radar Brasil ganha destaque por reunir informações públicas em um único relatório",
    section: "Tecnologia",
  },
  {
    outlet: "UOL",
    img: "/images/imprensa-uol.webp",
    headline: "Spy Radar Brasil se destaca por reunir informações públicas em um único relatório",
    section: "Tecnologia",
  },
  {
    outlet: "R7",
    img: "/images/imprensa-r7.webp",
    headline: "Spy Radar Brasil ganha destaque por facilitar o acesso a informações públicas",
    section: "Tecnologia",
  },
];

function PressSection() {
  return (
    <section className="space-y-4">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[10px] font-bold px-3 py-1.5 rounded-full font-['Geist_Mono',monospace] uppercase tracking-[0.18em]">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
          Na mídia
        </div>
        <h2 className="text-xl font-extrabold tracking-tight text-white leading-tight">
          Você já viu a <span className="text-yellow-400">Spy Radar</span> por aí
        </h2>
        <p className="text-[12.5px] text-zinc-400 leading-relaxed max-w-sm mx-auto">
          Grandes portais de notícias já destacaram a plataforma pela forma prática de reunir informações públicas.
        </p>
      </div>

      <div className="space-y-3">
        {PRESS_ITEMS.map((item) => (
          <figure
            key={item.outlet}
            className="group bg-zinc-900/50 backdrop-blur border border-white/10 rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.4)]"
          >
            <div className="relative overflow-hidden">
              <img
            src={item.img || "/placeholder.svg"}
            alt={`Matéria do portal ${item.outlet}: ${item.headline}`}
            loading="lazy"
            decoding="async"
            width={960}
            height={640}
            className="w-full h-auto block"
          />
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>
            <figcaption className="flex items-center justify-between gap-3 px-4 py-3 border-t border-white/5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="shrink-0 inline-flex items-center gap-1 text-yellow-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20h9M3 20h.01M4 4h16v10H4z" />
                  </svg>
                </span>
                <p className="text-[11px] text-zinc-400 truncate">
                  <span className="text-zinc-200 font-bold">{item.outlet}</span>
                  <span className="text-zinc-600"> · {item.section}</span>
                </p>
              </div>
              <span className="shrink-0 inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full uppercase tracking-wide font-['Geist_Mono',monospace]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Publicado
              </span>
            </figcaption>
          </figure>
        ))}
      </div>

      <p className="text-center text-[10px] text-zinc-600 leading-relaxed px-4">
        Imagens ilustrativas de divulgação. As reportagens abordam o uso de plataformas de consulta de informações públicas.
      </p>
    </section>
  );
}


export function CityAutocomplete({
  uf,
  city,
  setCity,
  cities,
  loading,
  variant = "dark",
}: {
  uf: string;
  city: string;
  setCity: (v: string) => void;
  cities: string[];
  loading: boolean;
  variant?: "dark" | "light";
}) {
  const [query, setQuery] = useState(city);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(city); }, [city]);
  useEffect(() => { setQuery(""); }, [uf]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const norm = (s: string) =>
    s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const matches = useMemo(() => {
    if (query.trim().length < 3) return [];
    const q = norm(query.trim());
    return cities.filter((c) => norm(c).includes(q)).slice(0, 8);
  }, [query, cities]);

  const disabled = !uf || loading;
  const placeholder = !uf
    ? "Selecione a UF primeiro"
    : loading
    ? "Carregando cidades..."
    : "Digite 3 letras da cidade";

  const pick = (c: string) => {
    setCity(c);
    setQuery(c);
    setOpen(false);
  };

  const light = variant === "light";
  const inputCls = light
    ? "w-full h-14 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 px-3 text-sm font-medium focus:border-[#128C7E] focus:outline-none focus:ring-2 focus:ring-[#25D366]/20 transition disabled:opacity-60 placeholder:text-slate-400"
    : "w-full h-14 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3 text-sm font-medium focus:border-yellow-500/60 focus:outline-none transition disabled:opacity-60";
  const listCls = light
    ? "absolute z-30 left-0 right-0 mt-1 max-h-64 overflow-auto rounded-xl bg-white border border-slate-200 shadow-xl"
    : "absolute z-30 left-0 right-0 mt-1 max-h-64 overflow-auto rounded-xl bg-zinc-950 border border-zinc-800 shadow-2xl";
  const itemBase = "px-3 py-2.5 text-sm cursor-pointer";
  const itemActive = light ? "bg-[#25D366]/10 text-[#128C7E]" : "bg-yellow-500/15 text-yellow-200";
  const itemIdle = light ? "text-slate-700 hover:bg-slate-50" : "text-zinc-200 hover:bg-zinc-900";
  const emptyCls = light
    ? "absolute z-30 left-0 right-0 mt-1 rounded-xl bg-white border border-slate-200 px-3 py-2.5 text-sm text-slate-500 shadow-xl"
    : "absolute z-30 left-0 right-0 mt-1 rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2.5 text-sm text-zinc-500";

  return (
    <div ref={wrapRef} className="relative">
      <input
        type="text"
        value={query}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => {
          setQuery(e.target.value);
          setCity("");
          setOpen(true);
          setHighlight(0);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!open || matches.length === 0) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((h) => Math.min(h + 1, matches.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => Math.max(h - 1, 0));
          } else if (e.key === "Enter") {
            e.preventDefault();
            pick(matches[highlight]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        className={inputCls}
      />
      {open && matches.length > 0 && (
        <ul className={listCls}>
          {matches.map((c, i) => (
            <li
              key={c}
              onMouseDown={(e) => { e.preventDefault(); pick(c); }}
              onMouseEnter={() => setHighlight(i)}
              className={`${itemBase} ${i === highlight ? itemActive : itemIdle}`}
            >
              {c}
            </li>
          ))}
        </ul>
      )}
      {open && !loading && uf && query.trim().length >= 3 && matches.length === 0 && (
        <div className={emptyCls}>
          Nenhuma cidade encontrada
        </div>
      )}
    </div>
  );
}



function ConnectingStep({
  target,
  fullPhone,
  phoneDigits,
  photoUrl,
  setPhotoUrl,
  onDone,
}: {
  target: string;
  fullPhone: string;
  phoneDigits: string;
  photoUrl: string | null;
  setPhotoUrl: (url: string | null) => void;
  onDone: () => void;
}) {
  const TOTAL_MS = 10_000;
  const [progress, setProgress] = useState(0);
  const [lines, setLines] = useState<{ text: string; tone: "dim" | "ok" | "warn" | "info" }[]>([]);
  const fetchPhoto = useServerFn(getWhatsAppProfilePicture);
  const scrollRef = useRef<HTMLDivElement>(null);
  const firstName = target.split(/\s+/)[0] ?? target;

  useEffect(() => {
    let cancelled = false;
    fetchPhoto({ data: { phone: phoneDigits } })
      .then((r) => {
        if (cancelled) return;
        if (r?.link) {
          setPhotoUrl(r.link);
          try { sessionStorage.setItem("zr.target.photo", r.link); } catch {}
        }
      })
      .catch((e) => {
        console.error("[wa-profile] client err", e);
      });
    return () => {
      cancelled = true;
    };
  }, [phoneDigits, fetchPhoto, setPhotoUrl]);

  const script = useMemo(
    () => [
      { delay: 0,    tone: "info" as const, text: "$ ./zapradar --target " + fullPhone + " --mode stealth" },
      { delay: 200,  tone: "dim" as const,  text: "[boot] inicializando módulo de interceptação v4.21.7..." },
      { delay: 500,  tone: "info" as const, text: "[net]  abrindo túnel TLS 1.3 -> edge-mtls.meta.com:443" },
      { delay: 900,  tone: "ok" as const,   text: "[net]  ✓ handshake (cipher: TLS_AES_256_GCM_SHA384)" },
      { delay: 1400, tone: "ok" as const,   text: "[auth] ✓ token aceito por mtls-edge-77" },
      { delay: 2000, tone: "warn" as const, text: "[fw]   contornando firewall WAF/cloudflare ..." },
      { delay: 2600, tone: "ok" as const,   text: "[fw]   ✓ bypass concluído (regra: 0xA3F1)" },
      { delay: 3200, tone: "ok" as const,   text: "[meta] ✓ sessão estabelecida #" + Math.random().toString(16).slice(2, 10).toUpperCase() },
      { delay: 3900, tone: "info" as const, text: "[wa]   localizando dispositivo " + (target === "alvo" ? "alvo" : "de " + firstName) + "..." },
      { delay: 4600, tone: "ok" as const,   text: "[wa]   ✓ dispositivo encontrado (Android 14 · WhatsApp 2.25.x)" },
      { delay: 5300, tone: "warn" as const, text: "[inj]  injetando payload de espelhamento ..." },
      { delay: 6000, tone: "ok" as const,   text: "[inj]  ✓ payload aceito · pid=49213" },
      { delay: 6700, tone: "info" as const, text: "[sync] sincronizando histórico (E2E descriptografado)" },
      { delay: 7300, tone: "dim" as const,  text: "       mensagens .......... 100%" },
      { delay: 7800, tone: "dim" as const,  text: "       mídia privada ...... 100%" },
      { delay: 8300, tone: "dim" as const,  text: "       localização ........ 100%" },
      { delay: 8800, tone: "dim" as const,  text: "       contatos ocultos ... 100%" },
      { delay: 9400, tone: "ok" as const,   text: "[done] ✓ canal seguro pronto. redirecionando..." },
    ],
    [fullPhone, firstName],
  );

  useEffect(() => {
    const timers: number[] = [];
    script.forEach((entry) => {
      timers.push(
        window.setTimeout(() => {
          setLines((prev) => [...prev, { text: entry.text, tone: entry.tone }]);
        }, entry.delay),
      );
    });
    const start = Date.now();
    const tick = window.setInterval(() => {
      const p = Math.min(100, ((Date.now() - start) / TOTAL_MS) * 100);
      setProgress(p);
      if (p >= 100) window.clearInterval(tick);
    }, 100);
    const finish = window.setTimeout(onDone, TOTAL_MS);
    return () => {
      timers.forEach(window.clearTimeout);
      window.clearInterval(tick);
      window.clearTimeout(finish);
    };
  }, [script, onDone]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const toneClass = {
    dim: "text-zinc-500",
    ok: "text-yellow-400",
    warn: "text-amber-300",
    info: "text-sky-300",
  };

  return (
    <div className="space-y-6">
      {/* PROMESSA */}
      <div className="text-center space-y-3 pt-2">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-bold px-3 py-1.5 rounded-full font-['Geist_Mono',monospace] uppercase tracking-[0.18em]">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          ⚠ Clonagem em andamento · NÃO feche esta página
        </div>
        {/* HEADLINE */}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-[1.1]">
          Em segundos você vai ver <span className="text-yellow-400">TUDO</span> que {target === "alvo" ? "ele" : firstName} {" "}
          escondeu de você
        </h1>
        {/* SUBHEADLINE */}
        <p className="text-sm text-zinc-300 leading-relaxed max-w-md mx-auto">
          <span className="text-white font-semibold">Conversas apagadas</span>, fotos íntimas no privado, áudios safados e localização ao vivo —{" "}
          <span className="text-yellow-400 font-semibold">prontos para você ler agora.</span>
        </p>

        {/* STATS — autoridade */}
        <div className="grid grid-cols-3 gap-2 max-w-md mx-auto pt-2">
          <div className="bg-zinc-900/60 border border-white/5 rounded-xl px-2 py-2">
            <div className="text-yellow-400 font-bold text-base font-['Geist_Mono',monospace]">98,7%</div>
            <div className="text-[9px] text-zinc-500 uppercase tracking-wider leading-tight">Taxa de acerto</div>
          </div>
          <div className="bg-zinc-900/60 border border-white/5 rounded-xl px-2 py-2">
            <div className="text-yellow-400 font-bold text-base font-['Geist_Mono',monospace]">+38mil</div>
            <div className="text-[9px] text-zinc-500 uppercase tracking-wider leading-tight">Traições expostas</div>
          </div>
          <div className="bg-zinc-900/60 border border-white/5 rounded-xl px-2 py-2">
            <div className="text-yellow-400 font-bold text-base font-['Geist_Mono',monospace]">30s</div>
            <div className="text-[9px] text-zinc-500 uppercase tracking-wider leading-tight">Tempo médio</div>
          </div>
        </div>
      </div>

      {/* PROVA SOCIAL — barra de notificações */}
      <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl px-3 py-2.5 flex items-center gap-2.5">
        <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse shrink-0" />
        <p className="text-[11px] text-zinc-300 leading-tight flex-1 min-w-0">
          <span className="text-yellow-400 font-bold">Mariana, RJ</span> acabou de descobrir 47 mensagens apagadas há 2 min
        </p>
      </div>


      <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden space-y-5">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />

      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[10px] font-bold px-3 py-1 rounded-full font-['Geist_Mono',monospace] uppercase tracking-[0.18em]">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
          Conectando-se a servidores Meta
        </span>
        <span className="font-['Geist_Mono',monospace] text-[11px] text-zinc-500">
          {Math.floor(progress)}%
        </span>
      </div>

      <h2 className="text-[18px] font-semibold text-zinc-100 leading-snug">
        Estabelecendo canal seguro com o{" "}
        <span className="text-yellow-400">dispositivo {target === "alvo" ? "do alvo" : `de ${firstName}`}</span>.
      </h2>


      {/* Foto de perfil capturada */}
      <div className="flex items-center gap-3 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3">
        <div className="relative">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-yellow-400/60 bg-zinc-800 flex items-center justify-center">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Foto de perfil do alvo"
                width={56}
                height={56}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
                style={{ filter: progress < 80 ? "blur(8px)" : "blur(0px)", transition: "filter 600ms" }}
                referrerPolicy="no-referrer"
                onError={() => setPhotoUrl(null)}
              />
            ) : (
              <svg viewBox="0 0 24 24" className="w-7 h-7 text-zinc-500" fill="currentColor">
                <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5Z" />
              </svg>
            )}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-yellow-400 border-2 border-zinc-900 animate-pulse" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-['Geist_Mono',monospace] uppercase tracking-[0.18em] text-yellow-400">
            {photoUrl ? "Perfil interceptado" : "Capturando perfil..."}
          </div>
          <div className="text-xs text-zinc-400 font-['Geist_Mono',monospace] truncate">
            {fullPhone}
          </div>
        </div>
      </div>




      {/* Terminal */}
      <div className="rounded-xl border border-zinc-800 bg-black/80 overflow-hidden shadow-inner">
        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-zinc-800 bg-zinc-950">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
          <span className="ml-2 font-['Geist_Mono',monospace] text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            zapradar@meta-edge — bash
          </span>
        </div>
        <div
          ref={scrollRef}
          className="h-56 overflow-y-auto p-3 font-['Geist_Mono',monospace] text-[12px] leading-relaxed"
        >
          {lines.map((l, i) => (
            <div key={i} className={toneClass[l.tone]}>
              {l.text}
            </div>
          ))}
          <div className="text-yellow-400 inline-flex items-center">
            <span>▌</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-500 to-yellow-300 transition-[width] duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[10px] font-['Geist_Mono',monospace] uppercase tracking-[0.18em] text-zinc-500">
          Não feche esta janela — a interceptação será perdida.
        </p>
      </div>
    </div>
    </div>
  );
}


function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3">
      <span className="text-[10px] font-['Geist_Mono',monospace] uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </span>
      <span className="font-['Geist_Mono',monospace] text-sm text-zinc-100 text-right truncate">
        {value}
      </span>
    </div>
  );
}



/* -------------------- LIVE TERMINAL -------------------- */
function LiveTerminal({ progress, fullPhone }: { progress: number; fullPhone: string }) {
  const [lines, setLines] = useState<{ text: string; tone: "dim" | "ok" | "warn" | "info" }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef(false);

  const pool = useMemo(
    () => [
      { tone: "info" as const, text: () => `[scan] varrendo partição /data/whatsapp/msgstore.db ...` },
      { tone: "dim" as const,  text: () => `       sqlite> SELECT * FROM messages WHERE deleted=1 LIMIT 50;` },
      { tone: "ok" as const,   text: () => `[scan] ✓ ${rand(12, 87)} mensagens apagadas recuperadas` },
      { tone: "info" as const, text: () => `[media] indexando /sdcard/WhatsApp/Media/Private/ ...` },
      { tone: "ok" as const,   text: () => `[media] ✓ ${rand(4, 31)} arquivos privados localizados (img/vid)` },
      { tone: "warn" as const, text: () => `[geo]  triangulando torre BTS · cell-id 0x${randHex(4)}` },
      { tone: "ok" as const,   text: () => `[geo]  ✓ última posição -23.${rand(100, 999)}, -46.${rand(100, 999)}` },
      { tone: "info" as const, text: () => `[net]  capturando pacote TLS · seq=${rand(10000, 99999)}` },
      { tone: "dim" as const,  text: () => `       0x${randHex(8)}  ${randHex(2)} ${randHex(2)} ${randHex(2)} ${randHex(2)}  ${randHex(2)} ${randHex(2)} ${randHex(2)} ${randHex(2)}   .....${String.fromCharCode(65 + rand(0,25))}.` },
      { tone: "info" as const, text: () => `[auth] solicitando handshake mtls-edge-${rand(10, 99)}` },
      { tone: "ok" as const,   text: () => `[auth] ✓ token renovado (ttl 600s)` },
      { tone: "warn" as const, text: () => `[fw]   tentativa de bloqueio detectada · aplicando bypass` },
      { tone: "ok" as const,   text: () => `[fw]   ✓ regra 0x${randHex(4)} contornada` },
      { tone: "info" as const, text: () => `[chat] descriptografando conversa #${rand(100, 999)} ...` },
      { tone: "ok" as const,   text: () => `[chat] ✓ chave AES recuperada (Curve25519)` },
      { tone: "info" as const, text: () => `[ctc]  enumerando contatos ocultos do dispositivo` },
      { tone: "ok" as const,   text: () => `[ctc]  ✓ ${rand(2, 14)} contatos arquivados identificados` },
      { tone: "info" as const, text: () => `[grp]  varrendo grupos silenciados ...` },
      { tone: "ok" as const,   text: () => `[grp]  ✓ ${rand(1, 7)} grupos secretos mapeados` },
      { tone: "info" as const, text: () => `[ses]  monitorando alvo ${fullPhone}` },
      { tone: "dim" as const,  text: () => `       checksum: 0x${randHex(8)} ok` },
    ],
    [fullPhone],
  );

  // Mantém o progress num ref para o efeito de streaming não reiniciar a cada timeupdate do vídeo.
  const progressRef = useRef(progress);
  useEffect(() => { progressRef.current = progress; }, [progress]);

  // Stream contínuo: dispara um burst de linhas a cada 3s, sem nunca parar.
  useEffect(() => {
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      const burst = rand(1, 3);
      setLines((prev) => {
        const next = [...prev];
        for (let i = 0; i < burst; i++) {
          const entry = pool[Math.floor(Math.random() * pool.length)];
          next.push({ tone: entry.tone, text: entry.text() });
        }
        if (progressRef.current >= 100 && !doneRef.current) {
          doneRef.current = true;
          next.push({ tone: "ok", text: "[done] ✓ scanning 100% — relatório pronto para desbloqueio" });
        }
        return next.length > 80 ? next.slice(next.length - 80) : next;
      });
    };
    tick(); // primeira linha imediata
    const id = window.setInterval(tick, 3000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [pool]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [lines]);

  const toneClass = {
    dim: "text-zinc-500",
    ok: "text-yellow-400",
    warn: "text-amber-300",
    info: "text-sky-300",
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-black/80 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-zinc-800 bg-zinc-950">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
        <span className="ml-2 font-['Geist_Mono',monospace] text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          zapradar@meta-edge — live capture
        </span>
        <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-['Geist_Mono',monospace] text-yellow-400">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
          LIVE
        </span>
      </div>
      <div
        ref={scrollRef}
        className="h-60 overflow-y-auto p-3 font-['Geist_Mono',monospace] text-[11.5px] leading-relaxed"
      >
        {lines.map((l, i) => (
          <div key={i} className={toneClass[l.tone]}>{l.text}</div>
        ))}
        <div className="text-yellow-400">▌</div>
      </div>
    </div>
  );
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randHex(n: number) {
  let s = "";
  for (let i = 0; i < n; i++) s += "0123456789ABCDEF"[Math.floor(Math.random() * 16)];
  return s;
}


function InvestigatingStep({
  progress, setProgress, fullPhone, activeChecks, photoUrl, onUnlock,
}: {
  progress: number;
  setProgress: (v: number) => void;
  fullPhone: string;
  activeChecks: number;
  photoUrl: string | null;
  onUnlock: () => void;
}) {
  const ready = progress >= 100;
  const UNLOCK_AT_MS = 2 * 60 * 1000; // 2 minutos — tempo para assistir a VSL
  const videoRef = useRef<HTMLVideoElement>(null);
  const targetName = useTargetName();
  const doAlvo = targetName ? `de ${targetName}` : "do alvo";
  const oAlvo = targetName ?? "o alvo";
  const [partnerPronoun, setPartnerPronoun] = useState<"ele" | "ela">("ele");
  useEffect(() => {
    try {
      const s = sessionStorage.getItem("zr.partner.sex");
      if (s === "F") setPartnerPronoun("ela");
    } catch {}
  }, []);
  const unlockedRef = useRef(false);
  const setProgressRef = useRef(setProgress);
  const onUnlockRef = useRef(onUnlock);
  useEffect(() => { setProgressRef.current = setProgress; }, [setProgress]);
  useEffect(() => { onUnlockRef.current = onUnlock; }, [onUnlock]);

  useEffect(() => {
    const start = Date.now();
    const id = window.setInterval(() => {
      const pct = Math.min(100, ((Date.now() - start) / UNLOCK_AT_MS) * 100);
      setProgressRef.current(pct);
      if (pct >= 100) {
        window.clearInterval(id);
        if (!unlockedRef.current) {
          unlockedRef.current = true;
          onUnlockRef.current();
        }
      }
    }, 100);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [muted, setMuted] = useState(true);
  const handleVideoLoaded = () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      v.currentTime = VIDEO_START_SECONDS;
      v.muted = true;
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    } catch {}
  };
  const unmute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    setMuted(false);
    v.play().catch(() => {});
  };


  return (
    <div className="space-y-5">
      {/* Status bar topo */}
      <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-500 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500" />
          </span>
          <span className="text-[10px] font-['Geist_Mono',monospace] uppercase tracking-[0.18em] text-yellow-400">
            Live · Analyzing
          </span>
        </div>
        <span className="text-[10px] font-['Geist_Mono',monospace] uppercase tracking-[0.18em] text-zinc-500">
          Não feche esta página
        </span>
      </div>

      {/* PROMESSA */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-bold px-3 py-1.5 rounded-full font-['Geist_Mono',monospace] uppercase tracking-[0.18em]">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.4} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Acesso total liberado em ~2 minutos
        </div>

        {/* HEADLINE */}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-[1.1] px-2">
          Veja o que <span className="text-yellow-400">{targetName ?? (partnerPronoun === "ela" ? "ela" : "ele")}</span> esconde de você no WhatsApp
        </h1>

        {/* SUBHEADLINE */}
        <p className="text-sm text-zinc-300 leading-relaxed max-w-md mx-auto px-2">
          Assista ao vídeo enquanto a clonagem é finalizada.
        </p>
      </div>


      {/* VSL — vídeo enquanto a clonagem finaliza */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <video
          ref={videoRef}
          src={wppVideo.url}
          playsInline
          muted={muted}
          onLoadedMetadata={handleVideoLoaded}
          onCanPlay={handleVideoLoaded}
          className="w-full h-auto block"
        />
        {muted && (
          <button
            type="button"
            onClick={unmute}
            className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] group"
            aria-label="Ativar som do vídeo"
          >
            <span className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-[#080808] text-sm font-bold px-4 py-2.5 rounded-full shadow-lg shadow-yellow-500/30 transition-all group-active:scale-95">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8.03v7.94A4.5 4.5 0 0 0 16.5 12zM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06a9 9 0 0 0 0-17.54z" />
              </svg>
              Toque para ativar o som
            </span>
          </button>
        )}
      </div>





      {/* Barra de progresso */}
      <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between text-[11px] font-['Geist_Mono',monospace] uppercase tracking-[0.18em]">
          <span className="text-yellow-400">Processando</span>
          <span className="text-zinc-400">{Math.floor(progress)}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-500 to-yellow-300 transition-[width] duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* CTA libera ao chegar em 100% */}
      {ready && (
        <button
          onClick={onUnlock}
          className="w-full bg-yellow-600 hover:bg-yellow-500 text-[#080808] font-bold py-4 rounded-2xl shadow-[0_0_30px_-5px_rgba(217,169,40,0.5)] animate-fade-in text-[15px] leading-tight relative overflow-hidden"
        >
          <span className="relative flex items-center justify-center gap-2">
            🔓 Veja o que encontramos no WhatsApp invadido
          </span>
        </button>
      )}





      {/* Card status do alvo */}
      <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />

        <div className="flex items-center gap-4">
          {/* Avatar com foto interceptada (ou shimmer enquanto carrega) */}
          <div className="relative w-14 h-14 shrink-0">
            <div className="absolute inset-0 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center overflow-hidden">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Foto de perfil do alvo"
                  width={56}
                  height={56}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <>
                  <svg className="w-6 h-6 text-zinc-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z" />
                  </svg>
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent" />
                </>
              )}
            </div>
            <div className="absolute -inset-1 rounded-full border border-transparent border-t-yellow-500 border-r-yellow-500/60 animate-spin" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-['Geist_Mono',monospace] uppercase tracking-[0.2em] text-zinc-500 mb-0.5">
              Target ID
            </div>
            <div className="font-['Geist_Mono',monospace] text-white truncate text-sm">{fullPhone}</div>
          </div>

          <div className="text-right">
            <div className="text-3xl font-bold text-yellow-400 leading-none font-['Geist_Mono',monospace] tabular-nums">
              {String(Math.floor(progress)).padStart(2, "0")}
              <span className="text-zinc-600 text-lg">%</span>
            </div>
            <div className="text-[9px] font-['Geist_Mono',monospace] uppercase tracking-[0.2em] text-zinc-500 mt-1">
              Scanning
            </div>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="mt-5">
          <div className="w-full bg-zinc-950 border border-zinc-800 rounded-full h-1.5 overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-200 shadow-[0_0_10px_rgba(217,169,40,0.6)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-[9px] font-['Geist_Mono',monospace] uppercase tracking-[0.2em] text-zinc-500">
            <span>0x00 INIT</span>
            <span className="text-yellow-400/70">Triangulação forense</span>
            <span>0xFF DONE</span>
          </div>
        </div>
      </div>

      {/* Checklist de módulos */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-2">
          <span className="text-[10px] font-['Geist_Mono',monospace] uppercase tracking-[0.2em] text-zinc-500">
            Módulos de extração
          </span>
          <span className="text-[10px] font-['Geist_Mono',monospace] uppercase tracking-[0.2em] text-zinc-500">
            {activeChecks}/{checklist.length}
          </span>
        </div>
        {checklist.map((item, i) => {
          const done = i < activeChecks;
          const running = i === activeChecks && !done && progress < 100;
          return (
            <div
              key={item.code}
              className={`flex items-center gap-3 bg-zinc-900/50 backdrop-blur-xl border rounded-xl p-3.5 transition-all ${
                done ? "border-yellow-500/30" : running ? "border-yellow-500/20" : "border-white/5 opacity-50"
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-['Geist_Mono',monospace] text-[9px] font-bold tracking-tight border ${
                done ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400" : "bg-zinc-950 border-zinc-800 text-zinc-600"
              }`}>
                {item.code.split(".")[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-zinc-100 text-[14px]">{item.title}</div>
                <div className="text-[11px] text-zinc-500 font-['Geist_Mono',monospace]">{item.desc}</div>
              </div>
              {done ? (
                <div className="w-6 h-6 rounded-full bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 flex items-center justify-center text-xs font-bold">
                  ✓
                </div>
              ) : running ? (
                <div className="w-6 h-6 rounded-full border-2 border-zinc-800 border-t-yellow-500 animate-spin" />
              ) : (
                <div className="w-6 h-6 rounded-full border border-zinc-800" />
              )}
            </div>
          );
        })}
      </div>

      {/* CTA final */}
      {ready && (
        <button
          onClick={onUnlock}
          className="w-full bg-yellow-600 hover:bg-yellow-500 text-[#080808] font-bold py-4 rounded-2xl shadow-[0_0_30px_-5px_rgba(217,169,40,0.5)] animate-fade-in text-[15px] leading-tight relative overflow-hidden group"
        >
          <span className="relative flex items-center justify-center gap-2">
            🔓 Veja o que encontramos no WhatsApp invadido
          </span>
        </button>
      )}

      {/* Rodapé anonimato */}
      <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-yellow-400">Esta ferramenta é 100% anônima</div>
          <div className="text-[11px] text-zinc-500">Não responda mensagens para se manter discreto.</div>
        </div>
      </div>
    </div>
  );
}

/* -------------------- RESULT -------------------- */
function ResultStep({ fullPhone, targetSex, onReset }: { fullPhone: string; targetSex: "M" | "F"; onReset: () => void }) {
  const navigate = useNavigate();
  const targetName = useTargetName();
  const oAlvo = targetName ?? "O alvo";
  // Se o alvo é homem (M) → contatos suspeitos mulheres. Se é mulher (F) → contatos suspeitos homens.
  const suspects =
    targetSex === "F"
      ? ["Gabriel", "Lucas", "Felipe", "Caio", "Rodrigo"]
      : ["Ana", "Carla", "Gabriela", "Mariana", "Vitória"];
  // Countdown urgência 10 minutos
  const [secondsLeft, setSecondsLeft] = useState(10 * 60);
  useEffect(() => {
    const id = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  const ctaRef = useRef<HTMLDivElement | null>(null);
  const scrollToCta = () =>
    ctaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

  const handleCheckout = () => {
    navigate({ to: "/relatorio", search: { phone: fullPhone, sex: targetSex } });
  };

  return (
    <div className="space-y-4 -mt-2">
      {/* Barra de urgência */}
      <div className="rounded-2xl overflow-hidden border border-red-500/30 shadow-[0_10px_40px_-10px_rgba(239,68,68,0.4)]">
        <div className="bg-gradient-to-b from-red-600 to-red-700 px-4 py-3 text-center">
          <div className="text-white font-bold text-sm flex items-center justify-center gap-2">
            <span>⚠</span> ATENÇÃO
          </div>
          <p className="text-white/95 text-[12px] leading-snug mt-0.5">
            Finalize o pagamento antes que todos os dados encontrados sejam{" "}
            <span className="font-bold">excluídos para sempre!</span>
          </p>
        </div>
        <div className="bg-zinc-950 px-4 py-2.5 flex items-center justify-center gap-2 font-['Geist_Mono',monospace]">
          <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-400">
            Excluindo dados em
          </span>
          <span className="text-red-500 text-xl font-bold tabular-nums">
            {mm}:{ss}
          </span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-400">
            min
          </span>
        </div>
      </div>

      {/* Banner sucesso */}
      <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-500/10 border border-yellow-500/40 rounded-2xl p-4 text-center">
        <div className="text-yellow-300 font-bold text-[15px] flex items-center justify-center gap-2">
          ✅ Espionagem 100% concluída!
        </div>
        <p className="text-zinc-300 text-[13px] mt-1 leading-snug">
          Encontramos conteúdo comprometedor no WhatsApp de{" "}
          <span className="text-yellow-400 font-semibold font-['Geist_Mono',monospace]">
            {fullPhone}
          </span>{" "}
          ↓
        </p>
      </div>

      {/* Card: Mensagens apagadas */}
      <FindingCard
        badge="MENSAGENS APAGADAS ENCONTRADAS"
        badgeColor="red"
        title={
          <>
            Recuperamos <span className="text-yellow-400">mensagens excluídas</span> do
            WhatsApp de{" "}
            <span className="text-yellow-400 font-['Geist_Mono',monospace]">
              {fullPhone}
            </span>
          </>
        }
        desc={
          <>
            Conversas que foram apagadas mas que{" "}
            <span className="text-zinc-100 font-semibold">
              nosso sistema conseguiu recuperar.
            </span>{" "}
            {oAlvo} não sabe que as temos.
          </>
        }
      >
        <FakeChat />
      </FindingCard>

      {/* Card: Fotos privadas */}
      <FindingCard
        badge="FOTOS PRIVADAS INTERCEPTADAS"
        badgeColor="amber"
        title={
          <>
            Encontramos <span className="text-yellow-400">fotos enviadas em privado</span>{" "}
            por{" "}
            <span className="text-yellow-400 font-['Geist_Mono',monospace]">
              {fullPhone}
            </span>
          </>
        }
        desc={
          <>
            Imagens enviadas em conversas privadas que{" "}
            <span className="text-zinc-100 font-semibold">
              desaparecem após serem abertas.
            </span>{" "}
            Já as guardamos para você.
          </>
        }
      >
        <BlurredPhotoGrid targetSex={targetSex} />
      </FindingCard>

      {/* Card: Contatos suspeitos */}
      <FindingCard
        badge="CONTATOS SUSPEITOS IDENTIFICADOS"
        badgeColor="amber"
        title={
          <>
            <span className="text-yellow-400">{suspects.length} contatos suspeitos</span>{" "}
            interagindo de forma íntima com{" "}
            <span className="text-yellow-400 font-['Geist_Mono',monospace]">{fullPhone}</span>
          </>
        }
        desc={
          <>
            Identificamos conversas frequentes e fora de horários comuns com:{" "}
            <span className="text-zinc-100 font-semibold">
              {suspects.slice(0, -1).join(", ")} e {suspects[suspects.length - 1]}.
            </span>
          </>
        }
      >
        <SuspectsList names={suspects} />
      </FindingCard>

      {/* Card: Vídeos privados interceptados */}
      <FindingCard
        badge="VÍDEOS PRIVADOS INTERCEPTADOS"
        badgeColor="red"
        title={
          <>
            Recuperamos <span className="text-yellow-400">vídeos enviados em privado</span>{" "}
            por{" "}
            <span className="text-yellow-400 font-['Geist_Mono',monospace]">
              {fullPhone}
            </span>
          </>
        }
        desc={
          <>
            Vídeos enviados em modo{" "}
            <span className="text-zinc-100 font-semibold">"visualizar uma vez"</span> e
            mensagens temporárias que foram interceptados antes de serem apagados.
          </>
        }
      >
        <BlurredVideoGrid targetSex={targetSex} />
      </FindingCard>

      {/* Card: Última conexão */}
      <FindingCard
        badge="ÚLTIMA CONEXÃO DETECTADA"
        badgeColor="yellow"
        title={
          <>
            <span className="text-yellow-400 font-['Geist_Mono',monospace]">
              {fullPhone}
            </span>{" "}
            esteve online em um{" "}
            <span className="text-yellow-400">horário diferente do que disse</span>
          </>
        }
        desc={
          <>
            Detectamos o horário exato da última conexão de{" "}
            <span className="font-['Geist_Mono',monospace]">{fullPhone}</span> mesmo que
            tenha o status{" "}
            <span className="text-zinc-100 font-semibold">"visto por último"</span> oculto.
          </>
        }
      >
        <LockedBox label="Dados bloqueados" />
      </FindingCard>

      {/* Card: Localização */}
      <FindingCard
        badge="LOCALIZAÇÃO SUSPEITA DETECTADA"
        badgeColor="violet"
        title={
          <>
            <span className="text-yellow-400 font-['Geist_Mono',monospace]">
              {fullPhone}
            </span>{" "}
            compartilhou sua{" "}
            <span className="text-yellow-400">localização em segredo</span> ontem à noite
          </>
        }
        desc={
          <>
            Detectamos que{" "}
            <span className="font-['Geist_Mono',monospace]">{fullPhone}</span> esteve em um
            lugar diferente do que te disse.{" "}
            <span className="text-zinc-100 font-semibold">
              O mapa exato está bloqueado
            </span>{" "}
            até que você confirme seu acesso.
          </>
        }
      >
        <LockedBox label="Localização bloqueada" />
      </FindingCard>

      {/* CTA final - oferta */}
      <div
        ref={ctaRef}
        className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 backdrop-blur-xl border border-yellow-500/30 rounded-3xl p-6 shadow-[0_20px_60px_rgba(217,169,40,0.15)] relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent" />

        <div className="text-center space-y-1 mb-5">
          <div className="flex items-center justify-center gap-2">
            <div className="w-7 h-7 bg-zinc-950 border border-yellow-500/40 rounded-lg flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              SpyRadar <span className="text-yellow-500">Brasil</span>
            </span>
          </div>
          <p className="text-[14px] text-zinc-300 leading-snug pt-2">
            Com o <span className="text-yellow-400 font-semibold">SpyRadar Brasil</span> você
            terá acesso completo ao WhatsApp clonado por apenas:
          </p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 text-center">
          <div className="text-zinc-500 text-sm line-through decoration-red-500/80 decoration-2">
            De: R$ 297,00
          </div>
          <div className="mt-1">
            <span className="text-yellow-400 text-5xl font-extrabold tracking-tight">
              R$50
            </span>
            <span className="text-yellow-400 text-xl font-bold">,00</span>
          </div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-yellow-400/70 mt-1 font-['Geist_Mono',monospace]">
            Pagamento único · Acesso imediato
          </div>
        </div>

        <button
          onClick={handleCheckout}
          className="mt-4 w-full h-14 bg-yellow-600 hover:bg-yellow-500 text-[#080808] font-extrabold rounded-2xl transition-all active:scale-[0.98] shadow-[0_0_40px_-8px_rgba(217,169,40,0.7)] text-[16px] uppercase tracking-wide animate-pulse-slow"
        >
          🔓 Desbloquear Relatório Agora
        </button>

        <p className="text-center text-[11px] text-zinc-500 mt-3 flex items-center justify-center gap-1.5">
          <span>🔒</span> 100% anônimo · Sem rastros · Acesso imediato
        </p>
      </div>

      {/* Selos confiança */}
      <div className="grid grid-cols-3 gap-2">
        <TrustBadge icon="🛡️" label="Compra segura" />
        <TrustBadge icon="⚡" label="Liberação na hora" />
        <TrustBadge icon="🕵️" label="Sigilo total" />
      </div>


      <button
        onClick={onReset}
        className="w-full text-[11px] font-['Geist_Mono',monospace] uppercase tracking-[0.2em] text-zinc-600 hover:text-zinc-400 transition-colors pb-20"
      >
        ← Invadir outro número
      </button>
    </div>
  );
}

function FindingCard({
  badge,
  badgeColor,
  title,
  desc,
  children,
}: {
  badge: string;
  badgeColor: "red" | "amber" | "yellow" | "violet";
  title: React.ReactNode;
  desc: React.ReactNode;
  children: React.ReactNode;
}) {
  const colors: Record<string, string> = {
    red: "bg-red-500/10 border-red-500/40 text-red-400",
    amber: "bg-amber-500/10 border-amber-500/40 text-amber-400",
    yellow: "bg-yellow-500/10 border-yellow-500/40 text-yellow-400",
    violet: "bg-violet-500/10 border-violet-500/40 text-violet-300",
  };
  return (
    <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-[0_10px_30px_rgba(0,0,0,0.4)] space-y-3">
      <span
        className={`inline-flex items-center gap-1.5 ${colors[badgeColor]} border text-[10px] font-bold px-3 py-1 rounded-full font-['Geist_Mono',monospace] uppercase tracking-[0.15em]`}
      >
        {badge}
      </span>
      <h3 className="text-[17px] font-bold text-zinc-100 leading-snug">{title}</h3>
      <p className="text-[13px] text-zinc-400 leading-relaxed">{desc}</p>
      <div className="pt-1">{children}</div>
    </div>
  );
}

function FakeChat() {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 relative overflow-hidden">
      <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
        <div className="w-7 h-7 rounded-full bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z" />
          </svg>
        </div>
        <div>
          <div className="text-[12px] text-zinc-100 font-semibold">Contato oculto</div>
          <div className="text-[10px] text-yellow-400">online</div>
        </div>
      </div>
      <div className="space-y-2 pt-3 select-none">
        <div className="bg-zinc-800/80 h-3 w-2/3 rounded blur-[3px]" />
        <div className="ml-auto bg-yellow-700/40 h-3 w-1/2 rounded blur-[3px]" />
        <div className="bg-zinc-800/80 h-3 w-3/5 rounded blur-[3px]" />
        <div className="ml-auto bg-yellow-700/40 h-3 w-2/5 rounded blur-[3px]" />
        <div className="bg-zinc-800/80 h-3 w-1/2 rounded blur-[3px]" />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent flex items-end justify-center pb-2">
        <div className="flex items-center gap-1.5 text-zinc-300 text-[11px] font-semibold">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Conversa bloqueada
        </div>
      </div>
    </div>
  );
}

function BlurredPhotoGrid({ targetSex }: { targetSex: "M" | "F" }) {
  const base =
    targetSex === "F"
      ? [manBeach1.url, manBeach2.url, manBeach3.url]
      : [photo1.url, photo2.url, photo3.url];
  const photos = [base[0], base[1], base[2], base[1], base[2], base[0]];
  return (
    <div className="grid grid-cols-3 gap-1.5 bg-zinc-950 border border-zinc-800 rounded-xl p-2">
      {photos.map((src, i) => (
        <div
          key={i}
          className="aspect-square rounded-md relative overflow-hidden flex items-center justify-center bg-zinc-900"
        >
          <img
            src={src}
            alt=""
            width={200}
            height={200}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "blur(6px)", transform: "scale(1.1)" }}
          />
          <div className="absolute inset-0 bg-black/10" />
          <svg className="w-5 h-5 text-white/90 relative z-10 drop-shadow" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        </div>
      ))}
    </div>
  );
}

function SuspectsList({ names }: { names: string[] }) {
  // gera horários e contagens fake plausíveis
  const meta = names.map((_, i) => ({
    msgs: 47 + i * 13 + ((i * 7) % 11),
    last: ["23:48", "01:12", "02:37", "00:54", "22:19"][i % 5],
  }));
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl divide-y divide-zinc-800/80">
      {names.map((name, i) => {
        const initial = name.charAt(0).toUpperCase();
        const hidden = name.charAt(0) + "•".repeat(Math.max(2, name.length - 2)) + name.charAt(name.length - 1);
        return (
          <div key={name} className="flex items-center gap-3 px-3 py-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-500/30 to-yellow-700/30 border border-yellow-500/30 flex items-center justify-center text-yellow-300 font-bold text-sm">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-zinc-100 text-[13px] font-semibold truncate select-none" style={{ filter: "blur(3px)" }}>
                  {hidden}
                </span>
                <span className="text-[9px] uppercase tracking-[0.15em] font-['Geist_Mono',monospace] text-amber-400 border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 rounded">
                  íntimo
                </span>
              </div>
              <div className="text-[11px] text-zinc-500 font-['Geist_Mono',monospace] mt-0.5">
                {meta[i].msgs} msgs · última {meta[i].last}
              </div>
            </div>
            <svg className="w-4 h-4 text-zinc-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      })}
    </div>
  );
}

function BlurredVideoGrid({ targetSex }: { targetSex: "M" | "F" }) {
  const base =
    targetSex === "F"
      ? [manBeach1.url, manBeach2.url, manBeach3.url]
      : [photo1.url, photo2.url, photo3.url];
  const videos = [base[2], base[0], base[1], base[0]];
  return (
    <div className="grid grid-cols-2 gap-1.5 bg-zinc-950 border border-zinc-800 rounded-xl p-2">
      {videos.map((src, i) => (
        <div
          key={i}
          className="aspect-video rounded-md relative overflow-hidden flex items-center justify-center bg-zinc-900"
        >
          <img
            src={src}
            alt=""
            width={320}
            height={180}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "blur(7px)", transform: "scale(1.1)" }}
          />
          <div className="absolute inset-0 bg-black/15" />
          <div className="relative z-10 flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full bg-black/60 border border-white/30 flex items-center justify-center backdrop-blur-sm">
              <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 4l10 6-10 6V4z" />
              </svg>
            </div>
            <div className="text-[9px] font-mono text-white/80 bg-black/50 px-1.5 py-0.5 rounded">
              {String(Math.floor(Math.random() * 2)).padStart(1, "0")}:{String(Math.floor(Math.random() * 59)).padStart(2, "0")}
            </div>
          </div>
          <div className="absolute top-1 left-1 bg-red-600/90 text-white text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
            <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
            REC
          </div>
        </div>
      ))}
    </div>
  );
}

function LockedBox({ label }: { label: string }) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl h-32 flex flex-col items-center justify-center gap-2 text-zinc-300">
      <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center">
        <svg className="w-5 h-5 text-zinc-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="text-[12px] font-semibold">{label}</div>
    </div>
  );
}

function TrustBadge({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-2.5 text-center">
      <div className="text-base">{icon}</div>
      <div className="text-[10px] text-zinc-400 mt-0.5 leading-tight">{label}</div>
    </div>
  );
}

/* -------------------- MAP HACK STEP -------------------- */
export function MapHackStep({ city, uf }: { city: string; uf: string }) {
  const label = city ? `${city}${uf ? ` · ${uf}` : ""}` : "região selecionada";
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 900);
    const t2 = setTimeout(() => setPhase(2), 2100);
    const t3 = setTimeout(() => setPhase(3), 3300);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[10px] font-bold px-3 py-1.5 rounded-full font-['Geist_Mono',monospace] uppercase tracking-[0.18em]">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
          Triangulando antenas 4G/5G
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          Hackeando antenas da região de{" "}
          <span className="text-yellow-400">{label}</span>
        </h2>
        <p className="text-[12px] text-zinc-400 font-['Geist_Mono',monospace] uppercase tracking-[0.14em]">
          {phase < 1 && "> localizando sinal..."}
          {phase === 1 && "> conectando às antenas próximas..."}
          {phase === 2 && "> interceptando pacotes de rede..."}
          {phase >= 3 && "> alvo triangulado com sucesso ✓"}
        </p>
      </div>

      <div className="relative rounded-2xl overflow-hidden border border-yellow-500/30 bg-zinc-950 shadow-[0_20px_60px_-20px_rgba(217,169,40,0.35)]">
        {/* Fake map surface */}
        <div className="relative w-full h-[300px]">
          {/* Streets grid */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: "#0a1a12",
              backgroundImage: [
                "linear-gradient(rgba(217,169,40,0.10) 1px, transparent 1px)",
                "linear-gradient(90deg, rgba(217,169,40,0.10) 1px, transparent 1px)",
                "linear-gradient(45deg, rgba(217,169,40,0.06) 1px, transparent 1px)",
              ].join(","),
              backgroundSize: "24px 24px, 24px 24px, 60px 60px",
            }}
          />
          {/* Diagonal streets */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300" preserveAspectRatio="none">
            <path d="M0,240 L400,60" stroke="rgba(217,169,40,0.25)" strokeWidth="2" fill="none" />
            <path d="M0,80 L400,220" stroke="rgba(217,169,40,0.20)" strokeWidth="1.5" fill="none" />
            <path d="M50,0 L200,300" stroke="rgba(217,169,40,0.18)" strokeWidth="1.5" fill="none" />
            <path d="M320,0 L180,300" stroke="rgba(217,169,40,0.18)" strokeWidth="1.5" fill="none" />
            {/* Route highlight */}
            <path
              d="M40,260 Q140,180 200,150 T360,50"
              stroke="rgba(217,169,40,0.9)"
              strokeWidth="2.5"
              strokeDasharray="6 6"
              fill="none"
              className="animate-pulse"
            />
          </svg>

          {/* Radar sweep */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-56 h-56">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="absolute inset-0 rounded-full border border-yellow-400/40"
                  style={{
                    animation: `ping 2.4s cubic-bezier(0,0,0.2,1) ${i * 0.6}s infinite`,
                  }}
                />
              ))}
              <div className="absolute inset-0 rounded-full border-2 border-yellow-500/50" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1/2 origin-bottom-left"
                  style={{
                    background:
                      "conic-gradient(from 0deg, rgba(217,169,40,0.5), transparent 40%)",
                    animation: "spin 2.2s linear infinite",
                  }}
                />
              </div>
              {/* Center pin */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full shadow-[0_0_20px_rgba(217,169,40,0.9)] animate-pulse" />
              </div>
            </div>
          </div>

          {/* Antenna markers */}
          {[
            { top: "18%", left: "22%" },
            { top: "28%", left: "78%" },
            { top: "72%", left: "18%" },
            { top: "78%", left: "70%" },
            { top: "48%", left: "88%" },
          ].map((pos, i) => (
            <div
              key={i}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ top: pos.top, left: pos.left, animationDelay: `${i * 0.25}s` }}
            >
              <div className="relative">
                <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(217,169,40,0.9)]" />
                <div className="absolute inset-0 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-ping opacity-70" />
              </div>
            </div>
          ))}

          {/* Coords HUD */}
          <div className="absolute top-2 left-2 text-[10px] font-['Geist_Mono',monospace] text-yellow-300/90 bg-black/40 backdrop-blur px-2 py-1 rounded border border-yellow-500/20">
            LAT −23.55{Math.floor(phase * 1.7)}° · LON −46.63{Math.floor(phase * 2.3)}°
          </div>
          <div className="absolute top-2 right-2 text-[10px] font-['Geist_Mono',monospace] text-yellow-300/90 bg-black/40 backdrop-blur px-2 py-1 rounded border border-yellow-500/20">
            SIG {60 + phase * 10}%
          </div>
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-['Geist_Mono',monospace] text-yellow-300/80">
            <span className="bg-black/50 backdrop-blur px-2 py-1 rounded border border-yellow-500/20">
              📡 {3 + phase} antenas conectadas
            </span>
            <span className="bg-black/50 backdrop-blur px-2 py-1 rounded border border-yellow-500/20">
              {phase >= 3 ? "TRAVA GPS ✓" : "escaneando..."}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900/60 border border-yellow-500/20 rounded-xl p-3 space-y-2">
        {[
          { label: "Localizando torre principal", ok: phase >= 1 },
          { label: `Conectando com antenas de ${city || "sua região"}`, ok: phase >= 2 },
          { label: "Interceptando IMSI do dispositivo alvo", ok: phase >= 3 },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-[12px] font-['Geist_Mono',monospace]">
            <span className={s.ok ? "text-yellow-400" : "text-zinc-600"}>
              {s.ok ? "✓" : "○"}
            </span>
            <span className={s.ok ? "text-zinc-200" : "text-zinc-500"}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
