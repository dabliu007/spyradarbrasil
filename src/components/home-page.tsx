import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Video,
  Mic,
  EyeOff,
  Wifi,
  MonitorPlay,
  Radar,
  Crosshair,
  BatteryFull,
  Droplets,
  MapPin,
  Smartphone,
  History,
  ShieldCheck,
  Cog,
  Users,
  Sparkles,
} from "lucide-react";

type Feature = { icon: React.ComponentType<{ className?: string }>; label: string };

type Product = {
  name: string;
  tagline: string;
  image: string;
  features: Feature[];
};

const products: Product[] = [
  {
    name: "Caneta com Câmera",
    tagline: "Discrição, tecnologia e segurança.",
    image: "/kit/caneta.png",
    features: [
      { icon: Video, label: "Gravação de vídeo" },
      { icon: Mic, label: "Gravação de áudio" },
      { icon: EyeOff, label: "Design discreto" },
    ],
  },
  {
    name: "Mini Câmera Wi-Fi",
    tagline: "Monitoramento discreto e em tempo real.",
    image: "/kit/camera.png",
    features: [
      { icon: Wifi, label: "Acesso remoto" },
      { icon: MonitorPlay, label: "Alta definição HD" },
      { icon: Radar, label: "Detecção de movimento" },
    ],
  },
  {
    name: "Localizador em Tempo Real",
    tagline: "Acompanhe o que realmente importa.",
    image: "/kit/rastreador.png",
    features: [
      { icon: Crosshair, label: "Rastreamento em tempo real" },
      { icon: BatteryFull, label: "Bateria de longa duração" },
      { icon: Droplets, label: "Resistente à água" },
    ],
  },
  {
    name: "Aplicativo de Controle Parental",
    tagline: "Mais tranquilidade para sua família.",
    image: "/kit/app.png",
    features: [
      { icon: MapPin, label: "Localização em tempo real" },
      { icon: Smartphone, label: "Monitoramento de apps" },
      { icon: History, label: "Histórico de atividades" },
    ],
  },
];

const trustBadges: Feature[] = [
  { icon: ShieldCheck, label: "Soluções confiáveis" },
  { icon: Cog, label: "Tecnologia de ponta" },
  { icon: EyeOff, label: "Discrição sempre" },
  { icon: Users, label: "Mais proteção" },
];

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="absolute inset-0 bg-yellow-500/30 blur-md rounded-full" />
        <div className="relative w-11 h-11 bg-zinc-900 border border-zinc-700 rounded-xl flex items-center justify-center shadow-2xl">
          <Radar className="w-6 h-6 text-yellow-400" />
        </div>
      </div>
      <div className="leading-none">
        <div className="text-lg font-bold tracking-tight text-white">
          SPY <span className="text-yellow-500">RADAR</span>
        </div>
        <div className="text-[10px] tracking-[0.4em] text-zinc-500 mt-1">BRASIL</div>
      </div>
    </div>
  );
}

function FreeTestButton({ className = "" }: { className?: string }) {
  return (
    <Link
      to="/verificar"
      className={
        "group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-yellow-400 to-yellow-600 px-8 py-4 text-sm font-bold uppercase tracking-wide text-[#080808] shadow-[0_0_40px_-8px_rgba(217,169,40,0.6)] transition-transform hover:scale-[1.02] active:scale-95 " +
        className
      }
    >
      Fazer Teste Grátis
      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
    </Link>
  );
}

export function HomePage() {
  return (
    <div className="min-h-screen w-full bg-[#080808] text-zinc-100 font-['Inter',sans-serif] selection:bg-yellow-500/30 relative overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(128,128,128,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(128,128,128,0.06) 1px, transparent 1px)",
          backgroundSize: "34px 34px",
        }}
      />
      {/* Gold radial glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-yellow-500/[0.07] blur-[160px] rounded-full pointer-events-none" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col px-4 py-6 sm:px-6">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-zinc-800/80 pb-6">
          <Logo />
          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-[11px] font-semibold tracking-[0.3em] text-zinc-400">MAIS VERDADE</span>
            <span className="text-[11px] font-semibold tracking-[0.3em] text-yellow-500">PARA VOCÊ</span>
          </div>
        </header>

        {/* Hero */}
        <section className="flex flex-col items-center py-14 text-center sm:py-20">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/[0.06] px-4 py-1.5">
            <Sparkles className="h-3.5 w-3.5 text-yellow-400" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-yellow-300">
              Kit Detetive Spy Radar Brasil
            </span>
          </div>

          <h1 className="text-balance text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
              Tecnologia que vai
            </span>
            <br />
            <span className="bg-gradient-to-b from-yellow-200 via-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              além do digital
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-zinc-400 sm:text-lg">
            Conheça o <span className="font-semibold text-yellow-500">Kit Detetive</span> da Spy Radar Brasil —
            equipamentos profissionais de investigação e monitoramento com a máxima discrição.
          </p>

          <div className="mt-9 flex flex-col items-center gap-3">
            <FreeTestButton />
            <p className="text-xs text-zinc-500">
              Você tem direito a <span className="font-semibold text-zinc-300">1 pesquisa gratuita</span>. Sem cartão de crédito.
            </p>
          </div>
        </section>

        {/* Products */}
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <article
              key={product.name}
              className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-950 transition-colors hover:border-yellow-500/40"
            >
              <div className="border-b border-zinc-800/70 p-5">
                <h2 className="text-base font-bold uppercase tracking-wide text-white">{product.name}</h2>
                <p className="mt-1 text-xs leading-relaxed text-zinc-500">{product.tagline}</p>
              </div>

              <div className="relative aspect-square overflow-hidden bg-black">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,169,40,0.18),transparent_65%)]" />
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={`${product.name} — Kit Detetive Spy Radar Brasil`}
                  className="relative h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              <ul className="flex flex-1 flex-col gap-3 p-5">
                {product.features.map((feature) => (
                  <li key={feature.label} className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-yellow-500/30 bg-yellow-500/10">
                      <feature.icon className="h-4 w-4 text-yellow-400" />
                    </span>
                    <span className="text-sm text-zinc-300">{feature.label}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        {/* Trust badges */}
        <section className="mt-10 grid grid-cols-2 gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 sm:grid-cols-4">
          {trustBadges.map((badge) => (
            <div key={badge.label} className="flex flex-col items-center gap-2 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-yellow-500/30 bg-yellow-500/10">
                <badge.icon className="h-5 w-5 text-yellow-400" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-300">{badge.label}</span>
            </div>
          ))}
        </section>

        {/* Final CTA */}
        <section className="mt-12 flex flex-col items-center rounded-2xl border border-yellow-500/20 bg-gradient-to-b from-yellow-500/[0.08] to-transparent px-6 py-12 text-center">
          <h2 className="text-balance text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
            Comece com uma pesquisa <span className="text-yellow-500">gratuita</span>
          </h2>
          <p className="mt-3 max-w-md text-pretty text-sm text-zinc-400">
            Informe o número do investigado e receba uma prévia da nossa investigação. Rápido, sigiloso e sem
            compromisso.
          </p>
          <FreeTestButton className="mt-7" />
        </section>

        {/* Footer */}
        <footer className="mt-14 flex flex-col items-center gap-6 border-t border-zinc-800/80 pt-10 text-center">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-zinc-400">
            Informação gera <span className="text-yellow-500">liberdade</span>
          </div>
          <p className="max-w-2xl text-[11px] leading-relaxed text-zinc-600">
            Utilize os dispositivos de acordo com a legislação aplicável e mediante autorização quando necessária. A
            Spy Radar Brasil não se responsabiliza pelo uso indevido dos equipamentos.
          </p>
          <Logo />
        </footer>
      </div>
    </div>
  );
}
