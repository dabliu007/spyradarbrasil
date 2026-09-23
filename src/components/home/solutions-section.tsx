import { MessageCircle, Share2, MapPin, ImageIcon, ArrowUpRight } from "lucide-react";
import { Container, SectionHeading } from "./primitives";

const solutions = [
  {
    icon: MessageCircle,
    name: "WhatsApp Clonado",
    description:
      "Leia todas as conversas, ouça os áudios e veja as fotos do WhatsApp dela(e) em tempo real, inclusive o que for apagado.",
  },
  {
    icon: Share2,
    name: "Mensagens e Redes Sociais",
    description:
      "Acesse SMS, Instagram, Facebook e Messenger sem que a pessoa perceba que está sendo monitorada.",
  },
  {
    icon: MapPin,
    name: "Localização em Tempo Real",
    description:
      "Veja exatamente onde a pessoa está agora e todo o histórico de lugares por onde ela passou.",
  },
  {
    icon: ImageIcon,
    name: "Fotos, Vídeos e Ligações",
    description:
      "Tudo que entra e sai do celular: galeria, câmera e registro completo de chamadas.",
  },
];

export function SolutionsSection() {
  return (
    <section id="solucoes" className="scroll-mt-24 py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="O que você vai descobrir"
          title={
            <>
              Tudo que ela(e) esconde,
              <br className="hidden sm:block" /> na palma da sua mão
            </>
          }
          subtitle="Ao clonar o celular, você acompanha cada movimento em um único painel — de forma discreta e sem deixar rastros."
        />

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {solutions.map((item) => (
            <article
              key={item.name}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#292929] bg-[#151515] p-7 transition-colors hover:border-[#D9A928]/40 sm:p-9"
            >
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#D9A928]/[0.05] blur-3xl opacity-0 transition-opacity group-hover:opacity-100"
                aria-hidden="true"
              />
              <div className="relative flex items-start justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#292929] bg-[#1C1C1C]">
                  <item.icon className="h-6 w-6 text-[#D9A928]" strokeWidth={1.5} />
                </span>
                <ArrowUpRight className="h-5 w-5 text-[#A7A7A7] transition-colors group-hover:text-[#D9A928]" />
              </div>
              <div className="relative mt-8">
                <h3 className="font-display text-xl font-bold text-[#F5F5F2]">
                  {item.name}
                </h3>
                <p className="mt-2 max-w-md text-[14px] leading-relaxed text-[#A7A7A7]">
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
