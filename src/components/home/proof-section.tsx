import { MessageCircle, Images, MapPin } from "lucide-react";
import { Container, SectionHeading } from "./primitives";

const proofs = [
  {
    src: "/provas/whatsapp.png",
    alt: "Print de conversa suspeita no WhatsApp revelada pelo monitoramento",
    icon: MessageCircle,
    title: "Conversas que ela(e) apaga",
    description:
      "Mensagens comprometedoras, combinados escondidos e tudo que foi apagado — recuperado e visível pra você.",
  },
  {
    src: "/provas/galeria.png",
    alt: "Galeria de fotos e vídeos íntimos encontrados no celular monitorado",
    icon: Images,
    title: "Fotos e vídeos guardados",
    description:
      "A galeria completa, incluindo as pastas ocultas: fotos íntimas, viagens e registros que provam a traição.",
  },
  {
    src: "/provas/rastreador.png",
    alt: "Mapa com a localização em tempo real do alvo monitorado",
    icon: MapPin,
    title: "Onde ela(e) está agora",
    description:
      "Localização ao vivo no mapa, histórico de rotas e alertas quando o alvo chega ou sai de um lugar.",
  },
];

export function ProofSection() {
  return (
    <section id="provas" className="scroll-mt-24 py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Provas reais"
          title={
            <>
              A verdade que você procura,
              <br className="hidden sm:block" /> em imagens
            </>
          }
          subtitle="Veja exemplos do que nossos clientes descobrem: conversas, fotos e localização direto na tela do seu celular."
        />

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {proofs.map((item) => (
            <article
              key={item.title}
              className="group overflow-hidden rounded-2xl border border-[#292929] bg-[#151515] transition-colors hover:border-[#D9A928]/40"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[#0C0C0C]">
                <img
                  src={item.src || "/placeholder.svg"}
                  alt={item.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#151515] via-transparent to-transparent"
                  aria-hidden="true"
                />
              </div>
              <div className="p-6 sm:p-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#292929] bg-[#1C1C1C]">
                  <item.icon className="h-5 w-5 text-[#D9A928]" strokeWidth={1.5} />
                </span>
                <h3 className="mt-5 font-display text-lg font-bold text-[#F5F5F2]">
                  {item.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[#A7A7A7]">
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-8 text-center text-[12px] leading-relaxed text-[#6B6B6B]">
          Imagens meramente ilustrativas, produzidas para demonstração. O uso do
          produto é de responsabilidade do adquirente.
        </p>
      </Container>
    </section>
  );
}
