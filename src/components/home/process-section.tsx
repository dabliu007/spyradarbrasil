import { Lock, EyeOff, ShieldCheck, Headphones, ShieldHalf } from "lucide-react";
import { Container, SectionHeading, GoldButton, OutlineButton } from "./primitives";

const steps = [
  {
    n: "01",
    title: "Informe o número",
    description: "Digite o número do celular que você quer clonar e monitorar.",
  },
  {
    n: "02",
    title: "Ative o clone",
    description: "Em poucos minutos o espelhamento é ativado, sem precisar tocar no aparelho da pessoa.",
  },
  {
    n: "03",
    title: "Veja tudo em sigilo",
    description: "Acompanhe conversas, fotos, ligações e localização direto do seu painel secreto.",
  },
];

const securityItems = [
  { icon: EyeOff, label: "Modo invisível" },
  { icon: Lock, label: "Sigilo total" },
  { icon: ShieldCheck, label: "Dados protegidos" },
  { icon: Headphones, label: "Suporte discreto" },
];

export function ProcessSection() {
  return (
    <>
      {/* How it works */}
      <section id="como-funciona" className="scroll-mt-24 py-20 sm:py-28">
        <Container>
          <SectionHeading
            eyebrow="Como funciona"
            title={
              <>
                Simples do início
                <br className="hidden sm:block" /> ao fim
              </>
            }
          />

          <div className="mt-14 grid grid-cols-1 gap-y-12 sm:gap-y-0 md:grid-cols-3 md:gap-8">
            {steps.map((step, i) => (
              <div
                key={step.n}
                className={
                  "flex flex-col " +
                  (i > 0 ? "md:border-l md:border-[#292929] md:pl-8" : "")
                }
              >
                <span
                  className="font-display text-6xl font-extrabold leading-none text-transparent sm:text-7xl"
                  style={{ WebkitTextStroke: "1px #8C6515" }}
                >
                  {step.n}
                </span>
                <h3 className="mt-6 font-display text-xl font-bold uppercase tracking-tight text-[#F5F5F2]">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-xs text-[14px] leading-relaxed text-[#A7A7A7]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Security */}
      <section id="seguranca" className="scroll-mt-24 border-y border-[#292929] bg-[#101010] py-20 sm:py-28">
        <Container className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-start">
          <SectionHeading
            eyebrow="Sigilo"
            title={
              <>
                Ninguém vai saber
                <br className="hidden sm:block" /> que você descobriu
              </>
            }
            subtitle="O monitoramento é 100% invisível: a pessoa nunca recebe notificação e nunca desconfia que o celular foi clonado. Tudo fica só entre você e o seu painel."
          />
            <div className="mt-10 grid w-full grid-cols-2 gap-4">
              {securityItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-xl border border-[#292929] bg-[#151515] px-4 py-4"
                >
                  <item.icon className="h-5 w-5 shrink-0 text-[#D9A928]" strokeWidth={1.5} />
                  <span className="text-[13px] font-semibold text-[#F5F5F2]">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <div className="relative flex h-56 w-56 items-center justify-center sm:h-72 sm:w-72">
              <div className="absolute inset-0 rounded-full border border-[#292929]" />
              <div className="absolute inset-6 rounded-full border border-[#292929]" />
              <div className="absolute inset-0 rounded-full bg-[#D9A928]/[0.06] blur-2xl" />
              <ShieldHalf
                className="relative h-24 w-24 text-[#D9A928] sm:h-28 sm:w-28"
                strokeWidth={1}
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Guarantee */}
      <section className="py-20 sm:py-28">
        <Container>
          <div className="flex flex-col items-center gap-10 rounded-3xl border border-[#292929] bg-[#151515] px-6 py-14 text-center sm:px-12 lg:flex-row lg:justify-between lg:gap-16 lg:text-left">
            <div className="flex items-center gap-6">
              <span
                className="font-display text-7xl font-extrabold leading-none sm:text-8xl"
                style={{
                  backgroundImage:
                    "linear-gradient(160deg, #FFE078 0%, #D9A928 50%, #8C6515 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                30
              </span>
              <div className="text-left">
                <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight text-[#F5F5F2] sm:text-3xl">
                  Dias de garantia
                </h2>
                <p className="mt-2 max-w-md text-[14px] leading-relaxed text-[#A7A7A7]">
                  Se você não conseguir clonar o celular e descobrir o que procura, devolvemos
                  100% do seu dinheiro em até 30 dias.
                </p>
              </div>
            </div>
            <OutlineButton href="#faq" withArrow>
              Consultar condições
            </OutlineButton>
          </div>
        </Container>
      </section>
    </>
  );
}
