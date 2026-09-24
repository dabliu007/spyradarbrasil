import { Users, HeartHandshake, TrendingUp } from "lucide-react";
import { Container, SectionHeading, GoldButton } from "./primitives";

const humanIndicators = [
  { icon: Users, label: "Milhares de casos resolvidos" },
  { icon: HeartHandshake, label: "Atendimento 100% sigiloso" },
  { icon: TrendingUp, label: "Tecnologia sempre atualizada" },
];

export function ExperienceSection() {
  return (
    <>
      {/* Quem Somos */}
      <section id="sobre" className="scroll-mt-24 border-y border-[#292929] bg-[#0d0d0d] py-20 sm:py-28">
        <Container className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <figure className="relative order-2 overflow-hidden rounded-3xl border border-[#292929] lg:order-1">
            <img
              src="/time/equipe-spy-radar.png"
              alt="Equipe da Spy Radar Brasil reunida no escritório em Curitiba"
              className="aspect-[4/3] w-full object-cover"
              loading="lazy"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080808]/60 to-transparent" />
            <figcaption className="absolute bottom-4 left-4 rounded-full border border-[#292929] bg-[#080808]/70 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#F5F5F2] backdrop-blur-md">
              Time Spy Radar Brasil
            </figcaption>
          </figure>

          <div className="order-1 flex flex-col items-start lg:order-2">
            <SectionHeading
              eyebrow="Quem Somos"
              title={
                <>
                  Um time inteiro
                  <br className="hidden sm:block" /> por trás da sua verdade
                </>
              }
              subtitle="A Spy Radar Brasil é uma empresa especializada em tecnologia de monitoramento e investigação discreta. Nossa equipe existe para acabar com a sua dúvida: já ajudamos milhares de pessoas a flagrar traições, espionar conversas e recuperar a paz — sempre com sigilo absoluto."
            />

            <ul className="mt-8 flex flex-col gap-3">
              {humanIndicators.map((item) => (
                <li key={item.label} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#292929] bg-[#1C1C1C]">
                    <item.icon className="h-4 w-4 text-[#D9A928]" strokeWidth={1.5} />
                  </span>
                  <span className="text-[14px] font-medium text-[#F5F5F2]">{item.label}</span>
                </li>
              ))}
            </ul>

            <GoldButton to="/verificar" className="mt-9">
              Quero descobrir a verdade
            </GoldButton>
          </div>
        </Container>
      </section>
    </>
  );
}
