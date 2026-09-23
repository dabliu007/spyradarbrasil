import { EyeOff, Zap, Smartphone, MapPin, MessageCircle, ShieldCheck } from "lucide-react";
import { Container, GoldButton, OutlineButton } from "./primitives";

const trustItems = [
  { icon: EyeOff, label: "100% sigiloso" },
  { icon: Smartphone, label: "Sem tocar no aparelho dela(e)" },
  { icon: Zap, label: "Ativação em minutos" },
  { icon: MessageCircle, label: "WhatsApp em tempo real" },
];

export function HeroSection() {
  return (
    <section id="topo" className="relative overflow-hidden pb-8 pt-28 sm:pt-36">
      {/* subtle gold ambience */}
      <div className="pointer-events-none absolute -top-24 right-0 h-[520px] w-[520px] rounded-full bg-[#D9A928]/[0.06] blur-[150px]" />

      <Container className="relative grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col items-start">
          <h1 className="text-balance font-display text-4xl font-extrabold uppercase leading-[1.02] tracking-tight text-[#F5F5F2] sm:text-5xl lg:text-6xl">
            Descubra a verdade e{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(100deg, #B17B13 0%, #D9A928 40%, #FFE078 100%)",
              }}
            >
              acabe com a dúvida da traição
            </span>
            .
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-[#A7A7A7] sm:text-lg">
            Clone o celular que você quiser e acompanhe WhatsApp, mensagens, fotos,
            ligações e localização em tempo real — de forma 100% sigilosa, sem que a
            pessoa desconfie.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <GoldButton to="/verificar">Testar grátis agora</GoldButton>
            <OutlineButton href="#como-funciona">Como funciona</OutlineButton>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] text-[#A7A7A7]">
            <span className="inline-flex items-center gap-2">
              <EyeOff className="h-4 w-4 text-[#D9A928]" /> Totalmente invisível
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#D9A928]" /> Localização ao vivo
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#D9A928]" /> Sigilo garantido
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="relative overflow-hidden rounded-3xl border border-[#292929] bg-[#151515] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
            <img
              src="/brand/hero.png"
              alt="Aplicativo Spy Radar Brasil espelhando a tela de um celular clonado"
              className="aspect-[4/5] w-full object-cover sm:aspect-[5/5]"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between rounded-2xl border border-[#292929] bg-[#080808]/70 px-4 py-3 backdrop-blur-md">
              <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#F5F5F2]">
                Monitoramento ativo em tempo real
              </span>
              <span className="h-2 w-2 rounded-full bg-[#D9A928] shadow-[0_0_12px_2px_rgba(217,169,40,0.6)]" />
            </div>
          </div>
        </div>
      </Container>

      {/* Trust bar */}
      <Container className="relative mt-14">
        <ul className="grid grid-cols-2 gap-x-6 gap-y-6 border-y border-[#292929] py-7 lg:grid-cols-4">
          {trustItems.map((item) => (
            <li key={item.label} className="flex items-center gap-3">
              <item.icon className="h-5 w-5 shrink-0 text-[#D9A928]" strokeWidth={1.5} />
              <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#F5F5F2]">
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
