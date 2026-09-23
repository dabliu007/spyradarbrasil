import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { useTargetName } from "@/lib/use-target-name";
import manBeach1 from "@/assets/man-beach-1.jpg.asset.json";
import manBeach2 from "@/assets/man-beach-2.jpg.asset.json";
import manBeach3 from "@/assets/man-beach-3.jpg.asset.json";
import womanFlirt1 from "@/assets/woman-flirt-1.jpg";
import womanFlirt2 from "@/assets/woman-flirt-2.jpg";
import womanFlirt3 from "@/assets/woman-flirt-3.jpg";
// Evidências do parceiro homem (amante mulher) — servidas de /public para
// evitar o resolver de assets do v0 que troca imports não registrados por placeholder.
const provaH1 = "/prova-h-1.jpg";
const provaH2 = "/prova-h-2.jpg";
const provaH3 = "/prova-h-3.jpg";
const provaH4 = "/prova-h-4.jpg";
const provaH5 = "/prova-h-5.jpg";
const provaH6 = "/prova-h-6.jpg";
// Evidências do amante homem (parceira mulher) — servidas de /public para
// evitar o resolver de assets do v0 que troca imports não registrados por placeholder.
const amanteHExtra1 = "/prova-m-1.jpg";
const amanteHExtra2 = "/prova-m-2.jpg";
const amanteHExtra3 = "/prova-m-3.jpg";
const amanteHExtra4 = "/prova-m-4.jpg";


import phoneChat from "@/assets/phone-chat.jpg.asset.json";
import messengerChat from "@/assets/messenger-chat.png.asset.json";
// Áudios da amante mulher — servidos de /public (blob real), fora do resolver de assets do v0.
const audioAmante1 = "/audio-amante-1.mp3";
const audioAmante2 = "/audio-amante-2.mp3";
const audioAmante3 = "/audio-amante-3.mp3";
// Áudios do amante homem — servidos de /public (blob real), fora do resolver de assets do v0.
const audioAmanteH1 = "/audio-amante-h-1.mp3";
const audioAmanteH2 = "/audio-amante-h-2.mp3";
const audioAmanteH3 = "/audio-amante-h-3.mp3";



const searchSchema = z.object({
  phone: z.coerce.string().optional().default(""),
  sex: z.enum(["M", "F"]).optional().default("M"),
  paid: z.coerce.number().optional().default(0),
  uf: z.coerce.string().optional().default(""),
  city: z.coerce.string().optional().default(""),
});

export const Route = createFileRoute("/relatorio")({
  head: () => ({
    meta: [
      { title: "Relatório de Invasão e Clonagem — SpyRadar Brasil" },
      {
        name: "description",
        content:
          "Pré-visualização do relatório de invasão e clonagem do WhatsApp investigado: mensagens, contatos suspeitos e localizações em tempo real.",
      },
      { property: "og:title", content: "Relatório de Invasão e Clonagem — SpyRadar Brasil" },
      {
        property: "og:description",
        content:
          "Mensagens apagadas, contatos suspeitos e localizações em tempo real do WhatsApp investigado.",
      },
      { property: "og:url", content: "https://clonawhats.com/relatorio" },
      { name: "robots", content: "noindex,follow" },
    ],
    links: [{ rel: "canonical", href: "https://clonawhats.com/relatorio" }],
  }),
  validateSearch: (s) => searchSchema.parse(s),
  component: RelatorioPage,
});

const KIT_ITEMS = [
  { name: "App Clonador", image: "/kit/app.png", desc: "Espelha o WhatsApp e apps do alvo" },
  { name: "Caneta com Câmera", image: "/kit/caneta.png", desc: "Grava vídeo e áudio escondido" },
  { name: "Mini Câmera Wi-Fi", image: "/kit/camera.png", desc: "Monitoramento remoto ao vivo" },
  { name: "Localizador", image: "/kit/rastreador.png", desc: "Rastreio de localização pelo celular" },
];

function AudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);

  const fmt = (t: number) => {
    if (!Number.isFinite(t)) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      el.pause();
      setPlaying(false);
    }
  };

  return (
    <div className="flex items-center gap-2.5">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => {
          const el = e.currentTarget;
          setCurrent(el.currentTime);
          setProgress(el.duration ? (el.currentTime / el.duration) * 100 : 0);
        }}
        onEnded={() => {
          setPlaying(false);
          setProgress(0);
          setCurrent(0);
        }}
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pausar áudio" : "Reproduzir áudio"}
        className="flex-shrink-0 w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-400 transition-colors"
      >
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
      <div className="flex-1 min-w-0">
        <div className="h-1.5 rounded-full bg-zinc-700 overflow-hidden">
          <div className="h-full bg-red-500 transition-[width] duration-150" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <span className="flex-shrink-0 text-[9px] text-zinc-400 font-['Geist_Mono',monospace] tabular-nums">
        {fmt(current)} / {fmt(duration)}
      </span>
    </div>
  );
}

function RelatorioPage() {
  const { phone, sex, paid, uf: ufParam, city: cityParam } = Route.useSearch();
  const navigate = useNavigate();
  const locked = !paid;
  const [showLicenseModal, setShowLicenseModal] = useState(false);

  const displayPhone = phone || "(00) 0 0000-0000";
  const [reportId, setReportId] = useState<number | null>(null);
  const [uf, setUf] = useState<string>(ufParam || "");
  const [city, setCity] = useState<string>(cityParam || "");
  useEffect(() => {
    setReportId(Math.floor(Math.random() * 90000 + 10000));
    if (typeof window !== "undefined") {
      if (!ufParam) setUf(sessionStorage.getItem("zr.partner.uf") || "");
      if (!cityParam) setCity(sessionStorage.getItem("zr.partner.city") || "");
    }
  }, [ufParam, cityParam]);
  const regiaoLabel = city ? `${city}${uf ? ` · ${uf}` : ""}` : "sua região";
  const targetName = useTargetName();
  const doAlvo = targetName ? `de ${targetName}` : "do alvo";
  const oAlvo = targetName ?? "o alvo";
  const oAlvoUpper = targetName ?? "O alvo";
  const alvoLabel = targetName ?? "Alvo";

  // Se o parceiro investigado é HOMEM (sex=M) → o amante é MULHER.
  // Se o parceiro investigado é MULHER (sex=F) → o amante é HOMEM.
  const amanteIsWoman = sex === "M";
  const amanteImgs = amanteIsWoman
    ? [womanFlirt1, womanFlirt2, womanFlirt3]
    : [manBeach1.url, manBeach2.url, manBeach3.url];


  // Mensagens cruas (parcialmente censuradas quando bloqueado)
  const mensagensQuentes = [
    { from: "███████", text: `Saudade do cheiro de ontem 🔥 quando a gente se vê de novo?`, time: "23:47", tipo: "recebida" },
    { from: "Alvo", text: `Hoje não dá, ${amanteIsWoman ? "ela" : "ele"} tá em casa. Amanhã eu dou um jeito 😘`, time: "23:49", tipo: "enviada" },
    { from: "███████", text: `Tô com sua ${amanteIsWoman ? "camisa" : "blusa"} aqui ainda… vem buscar 🙈`, time: "00:12", tipo: "recebida" },
    { from: "Alvo", text: "APAGA essa conversa AGORA. Tô morrendo de medo de descobrirem.", time: "00:14", tipo: "enviada" },
    { from: "███████", text: `Relaxa ${amanteIsWoman ? "amor" : "amor"}, ninguém vai descobrir. Te amo ❤���`, time: "00:15", tipo: "recebida" },
    { from: "Alvo", text: `Também te amo. Mais que ${amanteIsWoman ? "ela" : "ele"}, juro.`, time: "00:16", tipo: "enviada" },
  ];


  return (
    <div className="min-h-screen bg-[#080808] text-zinc-100 font-['Inter',sans-serif] relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(128,128,128,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(128,128,128,0.07) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-red-500/[0.06] blur-[140px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-lg mx-auto px-4 py-8 space-y-5">
        <h1 className="sr-only">Relatório de invasão e clonagem do WhatsApp investigado</h1>
        {/* Topo */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-zinc-900 border border-red-500/40 rounded-xl flex items-center justify-center">
              <span className="text-red-400 text-lg">📂</span>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-red-400/80 font-['Geist_Mono',monospace]">
                Relatório #ZR-{reportId ?? "—"}
              </div>
              <div className="text-sm font-bold">
                {alvoLabel}: <span className="font-['Geist_Mono',monospace] text-red-300">{displayPhone}</span>
              </div>
            </div>
          </div>
          <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-md font-bold ${locked ? "bg-red-500/15 text-red-300 border border-red-500/30 animate-pulse" : "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30"}`}>
            {locked ? "🔒 BLOQUEADO" : "✅ LIBERADO"}
          </span>
        </div>

        {/* ALERTA VERMELHO — soco no estômago */}
        <div className="bg-gradient-to-br from-red-600/25 to-red-900/10 border-2 border-red-500/50 rounded-2xl p-5 shadow-[0_0_40px_-10px_rgba(239,68,68,0.6)]">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🚨</span>
            <div className="space-y-2">
              <div className="text-[10px] uppercase tracking-[0.2em] text-red-300 font-['Geist_Mono',monospace] font-bold">
                Resultado da invasão e clonagem
              </div>
              <p className="text-[15px] text-zinc-100 leading-snug font-semibold">
                Encontramos <span className="text-red-400 font-extrabold">indícios FORTES de traição</span> neste WhatsApp.
              </p>
              <p className={`text-[13px] text-zinc-300 leading-snug ${locked ? "blur-[5px] select-none" : ""}`}>
                Mensagens apagadas durante a madrugada, fotos íntimas trocadas com pelo menos <span className="text-red-300 font-bold">3 contatos diferentes</span> e idas frequentes a motéis e hotéis na última semana.
              </p>
              {locked && (
                <p className="text-[12px] text-red-300/90 leading-snug font-bold uppercase tracking-wider">
                  🔒 Detalhes ocultos — desbloqueie para ver
                </p>
              )}
              <p className="text-[13px] text-red-200 leading-snug italic">
                Sentimos muito que você tenha que descobrir assim. Mas é melhor saber a verdade agora.
              </p>
            </div>
          </div>
        </div>

        {/* Sumário com números chocantes */}
        <Section title="O que foi encontrado">
          <SummaryRow label="💬 Mensagens apagadas recuperadas" value="247" locked={locked} highlight />
          <SummaryRow label="🔥 Conversas com teor sexual" value="89" locked={locked} highlight />
          <SummaryRow label="📸 Fotos íntimas trocadas" value="42" locked={locked} highlight />
          <SummaryRow label="🎥 Vídeos privados (visualizar uma vez)" value="11" locked={locked} highlight />
          <SummaryRow label="❤️ Conversas marcadas como 'Amor'" value="3" locked={locked} highlight />
          <SummaryRow label="🏨 Visitas a motéis (últimos 30 dias)" value="6" locked={locked} highlight />
          <SummaryRow label="🌙 Mensagens enviadas entre 23h e 5h" value="318" locked={locked} highlight />
          <SummaryRow label="📍 Último acesso real (não o que aparece)" value="hoje, 02:47" locked={locked} />
        </Section>

        {/* Prévia bombástica de mensagens */}
        <Section title="🔥 Trechos das conversas apagadas">
          <p className="text-[12px] text-zinc-400 -mt-1 mb-2">
            {locked
              ? `Recuperamos 247 conversas que ${oAlvo} achou que tinha apagado. Acesso liberado apenas após desbloqueio.`
              : `Recuperamos conversas que ${oAlvo} achou que tinha apagado para sempre. Veja uma amostra:`}
          </p>
          <div className="space-y-2 relative">
            {(locked ? mensagensQuentes.slice(0, 3) : mensagensQuentes).map((m, i) => (
              <div
                key={i}
                className={`rounded-2xl p-3 border ${
                  m.tipo === "enviada"
                    ? "bg-yellow-900/20 border-yellow-700/30 ml-8"
                    : "bg-zinc-900 border-zinc-800 mr-8"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[11px] font-bold ${m.tipo === "enviada" ? "text-yellow-300" : "text-red-300"}`}>
                    {locked ? "████████" : m.from}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-['Geist_Mono',monospace]">
                    {locked ? "██:██" : m.time}
                  </span>
                </div>
                <p className="text-[13px] text-zinc-100">
                  {m.text}
                </p>
              </div>
            ))}
            {locked && (
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#080808] via-[#080808]/80 to-transparent pointer-events-none" />
            )}
          </div>
          {locked && (
            <div className="text-center pt-2 space-y-1">
              <p className="text-[13px] text-red-300 font-bold">
                + 244 mensagens íntimas bloqueadas
              </p>
              <p className="text-[11px] text-zinc-500 italic">
                Incluindo a conversa marcada como ❤️ "Amor" às 02:47 de hoje
              </p>
            </div>
          )}
        </Section>

        {/* Galeria de mídias reais censuradas */}
        <Section title="📸 Mídias interceptadas">
          <p className="text-[12px] text-zinc-400 -mt-1 mb-2">
            {locked
              ? "42 fotos íntimas e 11 vídeos privados (visualizar uma vez) foram interceptados. Acesso bloqueado."
              : "Fotos e vídeos enviados em modo privado (visualizar uma vez)."}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[amanteImgs[0], amanteImgs[1], amanteImgs[2], amanteImgs[0], amanteImgs[1], amanteImgs[2]].map((src, i) => (
              <div
                key={i}
                className="aspect-square rounded-xl bg-zinc-900 border border-zinc-800 relative overflow-hidden"
              >
                <img
                  src={src}
                  alt=""
                  className={`w-full h-full object-cover ${locked ? "blur-[14px] scale-110 select-none" : ""}`}
                  draggable={false}
                />
                {locked && (
                  <>
                    <div className="absolute inset-0 bg-zinc-950/40" />
                    <span className="absolute inset-0 flex items-center justify-center text-red-300 text-xl">🔒</span>
                    <span className="absolute bottom-1 right-1 text-[8px] font-bold text-red-300 bg-zinc-950/80 px-1 py-0.5 rounded font-['Geist_Mono',monospace]">+18</span>
                  </>
                )}
              </div>
            ))}
          </div>
          <p className="text-[11px] text-zinc-500 text-center pt-1">
            {locked
              ? "⚠️ Conteúdo +18 censurado pelo sistema até o desbloqueio"
              : "⚠️ Conteúdo sensível — recomendamos visualizar sozinho(a)."}
          </p>
        </Section>

        {/* Provas visuais adicionais — apenas quando o parceiro investigado é homem */}
        {amanteIsWoman && (
          <Section title="🚨 Provas visuais adicionais">
            <p className="text-[12px] text-zinc-400 -mt-1 mb-2">
              {locked
                ? "5 evidências fotográficas cruzadas com o número investigado. Rostos e locais censurados até o desbloqueio."
                : "Evidências fotográficas cruzadas com o número investigado."}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[provaH1, provaH2, provaH3, provaH4, provaH5].map((a, i) => (
                <div
                  key={i}
                  className={`${i === 4 ? "col-span-2 aspect-video" : "aspect-square"} rounded-xl bg-zinc-900 border border-red-500/30 relative overflow-hidden`}
                >
                  <img
                    src={a}
                    alt=""
                    className="w-full h-full object-cover select-none pointer-events-none"
                    style={{ filter: "blur(6px) saturate(0.9)", transform: "scale(1.15)" }}
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-zinc-950/30" />
                  <span className="absolute top-1.5 left-1.5 text-[8px] font-bold text-red-200 bg-zinc-950/80 border border-red-500/40 rounded px-1.5 py-0.5 font-['Geist_Mono',monospace] uppercase tracking-wider">
                    Evidência #{String(i + 1).padStart(2, "0")}
                  </span>
                  {locked && (
                    <span className="absolute bottom-1.5 right-1.5 text-[9px] font-bold text-red-300 bg-zinc-950/85 border border-red-500/40 rounded px-1.5 py-0.5 font-['Geist_Mono',monospace]">
                      🔒 +18
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Foto recebida via WhatsApp — enviada pela amante */}
            <div className="mt-3 rounded-2xl border border-red-500/40 bg-gradient-to-br from-zinc-950 to-red-950/20 overflow-hidden shadow-[0_0_30px_rgba(239,68,68,0.15)]">
              <div className="flex items-center justify-between px-3 py-2 border-b border-red-500/30 bg-zinc-950/70">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                  <span className="text-[10px] font-['Geist_Mono',monospace] uppercase tracking-wider text-red-200">
                    📥 Foto recebida · WhatsApp
                  </span>
                </div>
                <span className="text-[9px] text-zinc-500 font-['Geist_Mono',monospace]">03:47</span>
              </div>
              <div className="relative aspect-[4/5] bg-zinc-900 overflow-hidden">
                <img
                  src={provaH6}
                  alt=""
                  className="w-full h-full object-cover select-none pointer-events-none"
                  style={{ filter: "blur(6px) saturate(0.9)", transform: "scale(1.15)" }}
                  draggable={false}
                />
                <div className="absolute inset-0 bg-zinc-950/30" />
                <span className="absolute top-2 left-2 text-[8px] font-bold text-red-200 bg-zinc-950/85 border border-red-500/40 rounded px-1.5 py-0.5 font-['Geist_Mono',monospace] uppercase tracking-wider">
                  Evidência #06
                </span>
                {locked && (
                  <span className="absolute bottom-2 right-2 text-[9px] font-bold text-red-300 bg-zinc-950/85 border border-red-500/40 rounded px-1.5 py-0.5 font-['Geist_Mono',monospace]">
                    🔒 +18
                  </span>
                )}
              </div>
              <div className="px-3 py-2.5 bg-zinc-950/80 border-t border-red-500/20">
                <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-['Geist_Mono',monospace] mb-0.5">
                  Legenda enviada pela amante:
                </div>
                <div className={`text-[14px] italic text-red-100 font-semibold ${locked ? "blur-[4px] select-none" : ""}`}>
                  "me tocando pra vc amor 💦"
                </div>
              </div>
            </div>

            <p className="text-[11px] text-zinc-500 text-center pt-1">
              ⚠️ Imagens borradas para proteção — desbloqueio revela em alta resolução.
            </p>
          </Section>
        )}

        {/* Provas visuais adicionais — apenas quando o parceiro investigado é MULHER (amante é homem) */}
        {!amanteIsWoman && (
          <Section title="🚨 Provas visuais adicionais">
            <p className="text-[12px] text-zinc-400 -mt-1 mb-2">
              {locked
                ? "4 evidências fotográficas recebidas pelo alvo — enviadas pelo amante. Rostos e partes íntimas censurados até o desbloqueio."
                : "Fotos íntimas enviadas pelo amante ao número investigado."}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[amanteHExtra1, amanteHExtra2, amanteHExtra3, amanteHExtra4].map((a, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl bg-zinc-900 border border-red-500/30 relative overflow-hidden"
                >
                  <img
                    src={a}
                    alt=""
                    className="w-full h-full object-cover select-none pointer-events-none"
                    style={{ filter: locked ? "blur(7px) saturate(0.85)" : "blur(3px)", transform: "scale(1.15)" }}
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-zinc-950/40" />
                  <span className="absolute top-1.5 left-1.5 text-[8px] font-bold text-red-200 bg-zinc-950/80 border border-red-500/40 rounded px-1.5 py-0.5 font-['Geist_Mono',monospace] uppercase tracking-wider">
                    Evidência #{String(i + 1).padStart(2, "0")}
                  </span>
                  {locked && (
                    <span className="absolute bottom-1.5 right-1.5 text-[9px] font-bold text-red-300 bg-zinc-950/85 border border-red-500/40 rounded px-1.5 py-0.5 font-['Geist_Mono',monospace]">
                      🔒 +18
                    </span>
                  )}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-zinc-500 text-center pt-2">
              ⚠️ Fotos íntimas do amante enviadas via WhatsApp — censuradas por segurança. Desbloqueio revela em alta resolução.
            </p>
          </Section>
        )}

        {/* COMPROVANTE DE MOTEL + EXTRATO BANCÁRIO */}
        <Section title="💳 Rastros financeiros comprometedores">


          <p className="text-[12px] text-zinc-400 -mt-1 mb-3">
            Cruzamos o CPF vinculado ao número com bases de <span className="text-red-300 font-semibold">gateways de pagamento</span>.
            {amanteIsWoman ? " Ele" : " Ela"} tentou apagar — mas <span className="text-amber-300 font-semibold">nós recuperamos</span>.
          </p>

          {/* Comprovante Motel */}
          <div className="rounded-2xl border border-red-500/40 bg-gradient-to-br from-zinc-950 to-red-950/20 overflow-hidden shadow-[0_0_30px_rgba(239,68,68,0.15)] mb-3">
            <div className="flex items-center justify-between px-3 py-2 border-b border-red-500/30 bg-zinc-950/70">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                <span className="text-[10px] font-['Geist_Mono',monospace] uppercase tracking-wider text-red-200">
                  🏨 Comprovante · Motel
                </span>
              </div>
              <span className="text-[9px] text-zinc-500 font-['Geist_Mono',monospace]">02:14 AM</span>
            </div>
            <div className="relative p-4 bg-white text-zinc-800">
              <div className={locked ? "blur-[5px] select-none" : ""}>
                <div className="text-center border-b border-dashed border-zinc-400 pb-2 mb-2">
                  <div className="text-[13px] font-black tracking-tight">MOTEL ██████████ LTDA</div>
                  <div className="text-[9px] text-zinc-500 font-mono">CNPJ: ██.███.███/0001-██</div>
                  <div className="text-[9px] text-zinc-500 font-mono">Suíte Presidencial · Hidro + Espelhos</div>
                </div>
                <div className="text-[10px] font-mono space-y-0.5">
                  <div className="flex justify-between"><span>Data / Entrada</span><span>██/██/2026 · 23:47</span></div>
                  <div className="flex justify-between"><span>Data / Saída</span><span>██/██/2026 · 05:12</span></div>
                  <div className="flex justify-between"><span>Suíte</span><span>Nº ██ · Pacote 6h</span></div>
                  <div className="flex justify-between"><span>Consumo bar</span><span>R$ 187,00</span></div>
                  <div className="flex justify-between"><span>Adicional casal</span><span>R$ 120,00</span></div>
                  <div className="flex justify-between font-black text-red-700 text-[11px] pt-1 border-t border-dashed border-zinc-400 mt-1">
                    <span>TOTAL PAGO</span><span>R$ 487,00</span>
                  </div>
                  <div className="flex justify-between pt-1"><span>Forma</span><span>PIX · ████ ████ ████</span></div>
                  <div className="flex justify-between"><span>Titular</span><span>█████ ███████ ██████</span></div>
                </div>
              </div>
              {locked && (
                <span className="absolute top-2 right-2 text-[9px] font-bold text-red-700 bg-red-100 border border-red-500/60 rounded px-1.5 py-0.5 font-['Geist_Mono',monospace] rotate-[-8deg] shadow">
                  🔒 CENSURADO
                </span>
              )}
            </div>
            <div className="px-3 py-2 bg-zinc-950/80 border-t border-red-500/20 text-[11px] text-red-200">
              ⚠️ Companhia registrada no check-in: <span className="italic">{locked ? "██████████" : "Não era você"}</span>
            </div>
          </div>

          {/* Extrato bancário */}
          <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-br from-zinc-950 to-amber-950/10 overflow-hidden shadow-[0_0_30px_rgba(245,158,11,0.12)]">
            <div className="flex items-center justify-between px-3 py-2 border-b border-amber-500/30 bg-zinc-950/70">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[10px] font-['Geist_Mono',monospace] uppercase tracking-wider text-amber-200">
                  🏦 Extrato bancário · Últimos 30 dias
                </span>
              </div>
              <span className="text-[9px] text-zinc-500 font-['Geist_Mono',monospace]">SIGILOSO</span>
            </div>
            <div className="p-3 bg-zinc-950/60">
              <div className={`space-y-1.5 ${locked ? "blur-[5px] select-none" : ""}`}>
                {[
                  { d: "██/██", desc: amanteIsWoman ? "PIX · CLUBE ██████ SHOW GIRLS" : "PIX · BAR ██████ NIGHT CLUB", v: "-487,00", tag: "STRIPTEASE" },
                  { d: "██/██", desc: "DÉBITO · MOTEL ██████████", v: "-320,00", tag: "MOTEL" },
                  { d: "██/██", desc: "PIX · ██████ (CONTATO DESCONHECIDO)", v: "-250,00", tag: "TRANSF" },
                  { d: "██/██", desc: "COMPRA · IFOOD BAR ██████ (2 pessoas)", v: "-184,90", tag: "JANTAR" },
                  { d: "██/██", desc: "PIX · CLUBE ██████ PRIVÉ", v: "-620,00", tag: "STRIPTEASE" },
                  { d: "██/██", desc: "DÉBITO · MOTEL ████ ███ SUÍTES", v: "-410,00", tag: "MOTEL" },
                  { d: "██/██", desc: "COMPRA · LINGERIE ██████ (presente)", v: "-289,90", tag: "PRESENTE" },
                  { d: "██/██", desc: "PIX · UBER 03:41 AM (Zona ██████)", v: "-72,40", tag: "MADRUGADA" },
                ].map((t, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px] font-mono border-b border-zinc-800/60 pb-1.5">
                    <span className="text-zinc-500 w-10 shrink-0">{t.d}</span>
                    <span className="flex-1 text-zinc-200 truncate">{t.desc}</span>
                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-red-500/15 border border-red-500/40 text-red-200 uppercase tracking-wider shrink-0">
                      {t.tag}
                    </span>
                    <span className="text-red-300 font-bold w-16 text-right shrink-0">{t.v}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-amber-500/30">
                <span className="text-[10px] text-zinc-400 font-mono uppercase">Gasto suspeito no mês</span>
                <span className="text-[15px] font-black text-red-300">R$ {locked ? "█.███,██" : "2.634,20"}</span>
              </div>
            </div>
            {locked && (
              <div className="px-3 py-2 bg-red-950/40 border-t border-red-500/30 text-[11px] text-red-200 text-center">
                🔒 Nomes de estabelecimentos, valores e horários revelados no desbloqueio
              </div>
            )}
          </div>

          <p className="text-[11px] text-zinc-500 text-center pt-2">
            ⚠️ Dados extraídos de {amanteIsWoman ? "cartão de crédito e PIX vinculados ao CPF" : "conta corrente e PIX vinculados ao CPF"} do alvo.
          </p>
        </Section>





        {/* EVIDÊNCIAS DAS REDES SOCIAIS */}
        <Section title="🕵️ Evidências capturadas nas redes sociais">
          <p className="text-[12px] text-zinc-400 -mt-1 mb-3">
            Perfis ocultos, matches recentes e prints de conversas que {amanteIsWoman ? "ele" : "ela"} <span className="text-red-300 font-semibold">tentou esconder de você</span>.
          </p>


          {/* FACEBOOK MESSENGER */}
          <div className="bg-gradient-to-br from-blue-950/30 to-zinc-950 border border-blue-500/30 rounded-2xl p-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-blue-300 font-bold font-['Geist_Mono',monospace]">💬 Facebook Messenger</span>
              <span className="text-[9px] bg-blue-500/20 text-blue-200 border border-blue-500/30 rounded px-2 py-0.5 font-bold">3 conversas secretas</span>
            </div>
            <div className="rounded-xl overflow-hidden border border-blue-500/20 relative aspect-[4/3] bg-zinc-950">
              <img src={messengerChat.url} alt="" className={`w-full h-full object-contain ${locked ? "blur-[12px] scale-110 select-none" : ""}`} draggable={false} />
              {locked && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2 text-center">
                    <p className="text-[11px] text-blue-200 font-bold">🔒 Print da conversa bloqueado</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* WHATSAPP - print de áudio */}
          <div className="bg-gradient-to-br from-yellow-950/30 to-zinc-950 border border-yellow-500/30 rounded-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-yellow-300 font-bold font-['Geist_Mono',monospace]">🎙️ WhatsApp · Áudios apagados</span>
              <span className="text-[9px] bg-yellow-500/20 text-yellow-200 border border-yellow-500/30 rounded px-2 py-0.5 font-bold">17 áudios</span>
            </div>
            <div className="space-y-2">
              {[
                { dur: "0:47", time: "01:23", lado: "rec" },
                { dur: "1:12", time: "01:24", lado: "env" },
                { dur: "0:23", time: "01:26", lado: "rec" },
              ].map((a, i) => (
                <div key={i} className={`flex items-center gap-2 rounded-xl p-2 ${a.lado === "env" ? "bg-yellow-900/30 border border-yellow-700/30 ml-6" : "bg-zinc-900 border border-zinc-800 mr-6"}`}>
                  <button className="w-8 h-8 rounded-full bg-yellow-500/80 flex items-center justify-center text-zinc-950 text-xs">▶</button>
                  <div className={`flex-1 h-1 bg-zinc-700 rounded-full overflow-hidden ${locked ? "blur-[3px]" : ""}`}>
                    <div className="h-full bg-yellow-400/60 w-1/3" />
                  </div>
                  <span className={`text-[10px] text-zinc-400 font-['Geist_Mono',monospace] ${locked ? "blur-[3px]" : ""}`}>{a.dur}</span>
                  <span className={`text-[10px] text-zinc-500 ${locked ? "blur-[4px]" : ""}`}>{a.time}</span>
                </div>
              ))}
            </div>
            {locked && (
              <p className="text-[10px] text-yellow-300/80 text-center pt-2 font-bold">
                🔒 14 áudios íntimos restantes — apagados após ouvir
              </p>
            )}
          </div>

          {/* ÁUDIOS INTERCEPTADOS · voz do amante/da amante */}
          <div className="mt-3 bg-gradient-to-br from-red-950/40 to-zinc-950 border border-red-500/40 rounded-2xl p-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase tracking-[0.2em] text-red-300 font-bold font-['Geist_Mono',monospace]">
                🔊 Áudios interceptados · voz {amanteIsWoman ? "da amante" : "do amante"}
              </span>
              <span className="text-[9px] bg-red-500/20 text-red-200 border border-red-500/30 rounded px-2 py-0.5 font-bold animate-pulse">DESBLOQUEADO</span>
            </div>
            <p className="text-[11px] text-red-200/90 mb-3 leading-snug">
              Recuperamos <b>3 áudios enviados {amanteIsWoman ? "pela amante" : "pelo amante"}</b> {doAlvo}. Ouça agora — a voz {amanteIsWoman ? "dela" : "dele"} é real:
            </p>
            <div className="space-y-2.5">
              {(amanteIsWoman
                ? [
                { src: audioAmante1, hora: "12:47", label: "Escapadinha no almoço" },
                { src: audioAmante2, hora: "22:14", label: "Agradecendo o presente" },
                { src: audioAmante3, hora: "01:32", label: "Perguntando sobre você" },
                  ]
                : [
                    { src: audioAmanteH1, hora: "12:47", label: "Escapadinha no almoço" },
                    { src: audioAmanteH2, hora: "22:14", label: "Agradecendo o presente" },
                    { src: audioAmanteH3, hora: "01:32", label: "Perguntando sobre você" },
                  ]
              ).map((a, i) => (
                <div key={i} className="bg-zinc-900/80 border border-red-500/20 rounded-xl p-2.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-red-300 font-bold">🎙️ Áudio {i + 1} · {a.label}</span>
                    <span className="text-[9px] text-zinc-500 font-['Geist_Mono',monospace]">{a.hora}</span>
                  </div>
                  <AudioPlayer src={a.src} />
                </div>
              ))}
            </div>
            <p className="text-[10px] text-red-300/80 text-center pt-3 font-bold border-t border-red-500/20 mt-3">
              ⚠️ Essa é a voz {amanteIsWoman ? "da mulher" : "do homem"} que está com {oAlvo}. Existem mais 14 áudios bloqueados.
            </p>
          </div>


        </Section>


        {/* Padrão de comportamento */}
        <Section title="🧠 Padrão de comportamento detectado">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2 text-[13px] text-zinc-300 leading-relaxed">
            <p>
              🔴 <span className="font-bold text-red-300">Picos de atividade</span> no WhatsApp entre <span className="text-red-300 font-bold">23h e 03h</span> — exatamente quando {oAlvo} finge estar dormindo.
            </p>
            <p>
              🔴 <span className="font-bold text-red-300">Conversas deletadas em massa</span> sempre nas manhãs de segunda, quarta e sexta.
            </p>
            <p>
              🔴 <span className="font-bold text-red-300">Modo "arquivar conversa"</span> ativado em pelo menos <span className="text-red-300 font-bold">3 contatos</span> — clássico truque de quem esconde.
            </p>
            <p>
              🔴 <span className="font-bold text-red-300">Localização desligada</span> nos horários em que diz estar "no trabalho" ou "com amigos(as)".
            </p>
          </div>
          {locked && (
            <p className="text-center text-[11px] text-red-300/80 font-bold pt-2 uppercase tracking-wider">
              🔒 4 padrões críticos identificados — bloqueados
            </p>
          )}
        </Section>

        {/* Inteligência detalhada — somente alvo masculino */}
        {amanteIsWoman && (
          <Section title="🕵️ Inteligência comportamental · dossiê íntimo">
            <p className="text-[12px] text-zinc-400 -mt-1 mb-2">
              Cruzamento de horários, geolocalização, extratos PIX e conteúdo das conversas recuperadas.
            </p>
            <div className="bg-gradient-to-b from-red-950/40 to-zinc-950 border border-red-900/50 rounded-xl p-4 space-y-3 text-[13px] text-zinc-200 leading-relaxed">
              <p>
                💼 <span className="font-bold text-red-300">Ele conversa mais com ela durante o expediente</span> — 78% das mensagens trocadas acontecem entre <b>09h e 18h</b>, quando ele diz estar "ocupado no trabalho".
              </p>
              <p>
                🍝 <span className="font-bold text-red-300">Almoçou com ela recentemente</span> e faz <b>visitas esporádicas</b>. O último encontro registrado foi <b>na casa dela</b> — permaneceu por 2h47min.
              </p>
              <p>
                👀 <span className="font-bold text-amber-300">ALERTA:</span> ela pode ser <span className="font-bold text-red-300">alguém conhecido seu</span> — os dados de convivência indicam que ela está <b>dentro do círculo social da sua fam��lia</b>.
              </p>
              <p>
                💸 <span className="font-bold text-red-300">PIX de presente recorrentes</span> enviados pra ela. Recentemente ele comprou uma <b>lingerie de presente</b> (registro em cartão · loja de moda íntima).
              </p>
                <p>
                  🚫 <span className="font-bold text-red-300">Relações sexuais sem preservativo</span> — mencionado <b>múltiplas vezes</b> nas conversas. Ela relatou ter tomado a <span className="font-bold text-amber-300">pílula do dia seguinte pelo menos 4 vezes</span> nos últimos meses.
                </p>
              <p>
                😢 <span className="font-bold text-red-300">Ela tem medo dele largar ela e ficar de vez com você</span> — por isso vive <b>fazendo drama</b> e <b>ameaçando expor o relacionamento</b> pra forçar uma decisão.
              </p>
              <p>
                ��� <span className="font-bold text-red-300">Histórico de reincidência:</span> o cruzamento de dados indica que ele teve <span className="font-bold text-amber-300">pelo menos 2 relacionamentos extraconjugais</span> nos <b>últimos 5 anos</b> — você não é a primeira a ser traída.
              </p>
            </div>
            {locked && (
              <p className="text-center text-[11px] text-red-300/80 font-bold pt-2 uppercase tracking-wider">
                🔒 Dossiê completo com nomes, endereços e prints — desbloqueie agora
              </p>
            )}
          </Section>
        )}



        {/* Localização */}
        <Section title="📍 Histórico real de localização">
          <p className="text-[12px] text-zinc-400 -mt-1 mb-2">
            Locais que {oAlvo} realmente esteve — não o que disse pra você.
          </p>
          <div className={`bg-zinc-950 border border-zinc-800 rounded-xl p-4 ${locked ? "blur-[6px] select-none" : ""}`}>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span>🏨</span>
                <div>
                  <div className="font-semibold text-zinc-100">Motel Status — Quarto 12</div>
                  <div className="text-[11px] text-zinc-500 font-['Geist_Mono',monospace]">22/06 · 22:14 — 01:47 (3h33min)</div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span>🍷</span>
                <div>
                  <div className="font-semibold text-zinc-100">Bar Veloso, Vila Mariana</div>
                  <div className="text-[11px] text-zinc-500 font-['Geist_Mono',monospace]">21/06 · 21:47 — disse estar "na academia"</div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span>🏠</span>
                <div>
                  <div className="font-semibold text-zinc-100">Endereço residencial não identificado</div>
                  <div className="text-[11px] text-zinc-500 font-['Geist_Mono',monospace]">20/06 · 00:32 — 04:18 (Rua Augusta, 1340)</div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span>🏨</span>
                <div>
                  <div className="font-semibold text-zinc-100">Hotel Ibis Paulista</div>
                  <div className="text-[11px] text-zinc-500 font-['Geist_Mono',monospace]">18/06 · 22:09 — pernoite</div>
                </div>
              </li>
            </ul>
          </div>
          {locked && (
            <p className="text-center text-[11px] text-red-300/80 font-bold pt-2 uppercase tracking-wider">
              🔒 4 endereços suspeitos · nomes e horários bloqueados
            </p>
          )}
        </Section>

        {/* Deslocamentos suspeitos em cidades vizinhas */}
        <Section title="🛰️ Deslocamentos fora da cidade">
          <p className="text-[12px] text-zinc-400 -mt-1 mb-2">
            Triangulação de antenas 4G/5G detectou que {oAlvo} esteve pelo menos{" "}
            <span className="text-red-300 font-bold">4 vezes em outras cidades da região de {regiaoLabel}</span>{" "}
            nos últimos 30 dias — sem te avisar.
          </p>
          <div className={`bg-zinc-950 border border-red-500/30 rounded-xl p-4 ${locked ? "blur-[6px] select-none" : ""}`}>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span>🏨</span>
                <div>
                  <div className="font-semibold text-zinc-100">Motel ███████ Prime</div>
                  <div className="text-[11px] text-zinc-500 font-['Geist_Mono',monospace]">
                    Cidade vizinha · a 27km de {city || "sua cidade"} · pernoite
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span>🏨</span>
                <div>
                  <div className="font-semibold text-zinc-100">Motel ██████ Suítes</div>
                  <div className="text-[11px] text-zinc-500 font-['Geist_Mono',monospace]">
                    Rodovia de saída · 2 entradas registradas · 3h42min e 4h11min
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span>🎶</span>
                <div>
                  <div className="font-semibold text-zinc-100">Casa noturna ███████ Club</div>
                  <div className="text-[11px] text-zinc-500 font-['Geist_Mono',monospace]">
                    Sábado · 23:48 até 04:17 — disse estar em casa
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span>💐</span>
                <div>
                  <div className="font-semibold text-zinc-100">Floricultura ███████ Flores</div>
                  <div className="text-[11px] text-zinc-500 font-['Geist_Mono',monospace]">
                    Compra de buquê · entrega em endereço que não é o seu
                  </div>
                </div>
              </li>
            </ul>
          </div>
          {locked && (
            <p className="text-center text-[11px] text-red-300/80 font-bold pt-2 uppercase tracking-wider">
              🔒 2 motéis · 1 casa noturna · 1 floricultura — endereços bloqueados
            </p>
          )}
        </Section>



        {/* Reação humana */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-2">
          <p className="text-[13px] text-zinc-300 leading-snug italic">
            "Eu sei que você desconfiava. Por isso chegou até aqui. <span className="text-red-300 font-semibold">Sua intuição estava certa</span> — e os números acima são só uma prévia."
          </p>
          <p className="text-[12px] text-zinc-500">— Equipe de invasão e clonagem SpyRadar Brasil</p>
        </div>

        {/* BÔNUS — Acesso total 30 dias */}
        {locked && (
          <div className="bg-gradient-to-br from-yellow-950/40 to-zinc-900/80 backdrop-blur-xl border-2 border-yellow-500/40 rounded-3xl p-5 shadow-[0_20px_60px_rgba(217,169,40,0.18)] relative overflow-hidden space-y-3">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent" />
            <div className="flex items-center gap-2">
              <span className="inline-block text-[10px] uppercase tracking-[0.2em] text-yellow-300 font-['Geist_Mono',monospace] font-bold bg-yellow-500/15 border border-yellow-500/40 rounded-full px-3 py-1">
                🎁 Bônus incluso · grátis
              </span>
              <span className="text-[10px] uppercase tracking-wider bg-yellow-500/15 text-yellow-300 border border-yellow-500/30 rounded-md px-2 py-0.5 font-bold font-['Geist_Mono',monospace]">
                30 dias
              </span>
            </div>

            <h2 className="text-[20px] font-extrabold leading-tight text-zinc-100">
              Acesso <span className="text-yellow-400">total e ao vivo</span> ao celular clonado por 30 dias
            </h2>

            <p className="text-[13px] text-zinc-300 leading-snug">
              Direto do <span className="font-semibold text-zinc-100">seu próprio celular</span>, você entra nas contas dele(a) e acompanha <span className="text-yellow-300 font-semibold">cada mensagem em tempo real</span> — sem que ele(a) saiba.
            </p>

            <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-3 space-y-1.5">
              <p className="text-[12px] text-zinc-200 font-semibold mb-1">O que o espelhamento libera:</p>
              <p className="text-[12px] text-zinc-300">✅ WhatsApp — conversas, áudios, fotos e status</p>
              <p className="text-[12px] text-zinc-300">✅ Instagram — DMs, curtidas, perfis salvos, close friends</p>
              <p className="text-[12px] text-zinc-300">✅ Facebook & Messenger — chats e atividade</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-500/15 to-yellow-900/10 border border-yellow-500/40 rounded-xl p-3">
              <p className="text-[12px] text-yellow-100 leading-snug">
                🏦 <span className="font-bold text-yellow-300">Acesso TOTAL às contas bancárias dele(a):</span> você terá total acesso às contas bancárias dele, podendo fazer <span className="font-bold">consulta de saldo, extrato e movimentações com saldo real</span>.
              </p>
            </div>

            <p className="text-[11px] text-yellow-300/90 font-['Geist_Mono',monospace] uppercase tracking-wider">
              Ativado automaticamente após o desbloqueio do relatório
            </p>
          </div>
        )}

        {/* KIT DETETIVE — obrigatório para liberar o acesso */}
        {locked && (
          <div className="bg-gradient-to-br from-yellow-950/40 to-zinc-900/80 backdrop-blur-xl border-2 border-yellow-500/40 rounded-3xl p-5 shadow-[0_20px_60px_rgba(217,169,40,0.18)] relative overflow-hidden space-y-4">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent" />

            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-yellow-300 font-['Geist_Mono',monospace] font-bold bg-yellow-500/15 border border-yellow-500/40 rounded-full px-3 py-1">
                🕵️ Kit Detetive · necessário para liberar
              </div>
              <h2 className="text-[21px] font-extrabold leading-tight text-zinc-100">
                Adquira o <span className="text-yellow-400">Kit Detetive</span> e desbloqueie o celular clonado
              </h2>
              <p className="text-[13px] text-zinc-300 leading-snug">
                O acesso ao celular clonado {doAlvo} é liberado junto com o <span className="text-yellow-300 font-semibold">Kit Detetive completo</span> — o app clonador mais as ferramentas físicas para pegar em flagrante.
              </p>
            </div>

            {/* Itens do kit */}
            <div className="grid grid-cols-2 gap-2.5">
              {KIT_ITEMS.map((item) => (
                <div
                  key={item.name}
                  className="bg-zinc-950/70 border border-yellow-500/20 rounded-2xl p-3 flex flex-col items-center text-center gap-2"
                >
                  <div className="w-full aspect-square rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden relative">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,169,40,0.12),transparent_65%)]" />
                    <img
                      src={item.image}
                      alt={item.name}
                      className="relative w-full h-full object-cover"
                      draggable={false}
                    />
                  </div>
                  <div className="text-[12px] font-bold text-zinc-100 leading-tight">{item.name}</div>
                  <div className="text-[10px] text-zinc-400 leading-snug">{item.desc}</div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-yellow-500/15 to-yellow-900/10 border border-yellow-500/40 rounded-xl p-3">
              <p className="text-[12px] text-yellow-100 leading-snug">
                📱 <span className="font-bold text-yellow-300">Inclui o acesso total ao celular clonado</span> por 365 dias — conversas, fotos, áudios e localização em tempo real, tudo pelo seu próprio celular.
              </p>
            </div>
          </div>
        )}

        {/* CTA — acessar WhatsApp clonado */}
        {locked && (
          <div className="bg-gradient-to-br from-yellow-950/40 to-zinc-900/80 backdrop-blur-xl border-2 border-yellow-500/50 rounded-3xl p-6 shadow-[0_20px_60px_rgba(217,169,40,0.25)] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent" />

            <div className="text-center space-y-3">
              <div className="inline-block text-[10px] uppercase tracking-[0.2em] text-yellow-300 font-['Geist_Mono',monospace] font-bold bg-yellow-500/15 border border-yellow-500/40 rounded-full px-3 py-1">
                💬 Clone pronto · acesso liberado
              </div>

              <h2 className="text-2xl font-extrabold leading-tight">
                O Celular {doAlvo} está <span className="text-yellow-400">espelhado</span> agora
              </h2>

              <p className="text-[13px] text-zinc-300 leading-snug">
                Adquira o <span className="text-yellow-300 font-semibold">Kit Detetive</span> e entre direto nas conversas, mídias, áudios e contatos ocultos {doAlvo}.
                <br />
                <span className="text-yellow-300 font-semibold">Tudo o que ele(a) achou que tinha apagado — está lá.</span>
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowLicenseModal(true)}
              className="mt-5 flex w-full min-h-14 items-center justify-center text-center bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-extrabold rounded-2xl transition-all active:scale-[0.98] shadow-[0_0_40px_-8px_rgba(217,169,40,0.8)] uppercase tracking-wide px-4 py-3 text-[14px] leading-tight sm:text-[16px]"
            >
              📱 Acessar Celular Clonado
            </button>

            <p className="text-center text-[11px] text-zinc-500 mt-3 flex items-center justify-center gap-1.5">
              <span>🔒</span> 100% anônimo · espelhamento em tempo real
            </p>
          </div>
        )}

        {paid ? (
          <div className="bg-yellow-600/15 border border-yellow-500/40 rounded-2xl p-4 text-center text-yellow-200 text-sm font-semibold">
            ✅ Pagamento confirmado — todas as informações foram liberadas.
          </div>
        ) : null}


        <Link
          to="/"
          className="block w-full text-center text-[11px] font-['Geist_Mono',monospace] uppercase tracking-[0.2em] text-zinc-600 hover:text-zinc-400 transition-colors py-4"
        >
          ← voltar
        </Link>
      </div>

      {/* Modal — Ativação de Licença SpyRadar Brasil */}
      {showLicenseModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm grid place-items-center px-4 animate-in fade-in duration-200"
          onClick={() => setShowLicenseModal(false)}
        >
          <div
            className="w-full max-w-sm bg-zinc-950 border border-yellow-500/40 rounded-3xl p-6 shadow-[0_0_60px_-10px_rgba(217,169,40,0.5)] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowLicenseModal(false)}
              className="absolute top-3 right-4 text-zinc-500 hover:text-zinc-100 text-xl"
              aria-label="Fechar"
            >
              ✕
            </button>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-yellow-500/15 border border-yellow-500/40 grid place-items-center text-3xl mb-3">
                🕵️
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-yellow-300 font-bold font-['Geist_Mono',monospace]">
                Kit Detetive necessário
              </div>
              <h2 className="mt-2 text-2xl font-extrabold leading-tight text-zinc-100">
                Adquira o <span className="text-yellow-400">Kit Detetive</span> e acesse o celular clonado por 365 dias
              </h2>
              <p className="mt-3 text-[13.5px] text-zinc-300 leading-snug">
                O clone já está ativo. Para <strong>abrir as conversas, fotos e áudios</strong> em tempo real,
                é necessário adquirir o <strong>Kit Detetive</strong> — que libera o acesso ao celular clonado por <strong>365 dias</strong> e ainda inclui as ferramentas físicas.
              </p>
            </div>

            <ul className="mt-4 space-y-1.5 text-[13px] text-zinc-200">
              <li className="flex gap-2"><span className="text-yellow-400 font-bold">✓</span> <span>Acesso completo ao celular clonado por <strong>365 dias</strong></span></li>
              <li className="flex gap-2"><span className="text-yellow-400 font-bold">✓</span> <span>App Clonador — mensagens, fotos e áudios (inclusive apagados)</span></li>
              <li className="flex gap-2"><span className="text-yellow-400 font-bold">✓</span> <span>Caneta com câmera + Mini câmera Wi-Fi escondidas</span></li>
              <li className="flex gap-2"><span className="text-yellow-400 font-bold">✓</span> <span>Localizador GPS para rastrear em tempo real</span></li>
            </ul>

            <button
              onClick={() => {
                setShowLicenseModal(false);
                navigate({ to: "/checkout", search: { phone, sex } });
              }}
              className="mt-5 w-full h-14 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-extrabold rounded-2xl transition-all active:scale-[0.98] shadow-[0_0_40px_-8px_rgba(217,169,40,0.8)] text-[15px] uppercase tracking-wide"
            >
              🔓 ADQUIRIR KIT DETETIVE
            </button>
            <p className="text-center text-[11px] text-zinc-500 mt-2">
              🔒 PIX R$ 137,00 · ativação em segundos · válido por 365 dias
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-[11px] uppercase tracking-[0.2em] text-red-400/80 font-['Geist_Mono',monospace]">
        {title}
      </h3>
      {children}
    </section>
  );
}

function SummaryRow({
  label,
  value,
  locked,
  highlight,
}: {
  label: string;
  value: string;
  locked: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between bg-zinc-950 border rounded-xl px-4 py-2.5 ${
        highlight ? "border-red-500/30" : "border-zinc-800"
      }`}
    >
      <span className="text-[13px] text-zinc-300">{label}</span>
      <span
        className={`text-sm font-extrabold font-['Geist_Mono',monospace] ${
          highlight ? "text-red-300" : "text-yellow-300"
        } ${locked ? "blur-[7px] select-none" : ""}`}
      >
        {locked ? "███" : value}
      </span>
    </div>
  );
}
