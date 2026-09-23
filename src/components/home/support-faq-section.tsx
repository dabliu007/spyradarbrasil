import { useState } from "react";
import { HeartHandshake, Headphones, MapPin, Plus, Minus } from "lucide-react";
import { Container, SectionHeading, GoldButton } from "./primitives";

const supportIndicators = [
  { icon: HeartHandshake, label: "Atendimento 100% sigiloso" },
  { icon: Headphones, label: "Suporte durante todo o processo" },
  { icon: MapPin, label: "Ajuda para configurar o clone" },
];

const faqs = [
  {
    q: "Consigo mesmo clonar o WhatsApp de outra pessoa?",
    a: "Sim. Depois de ativar o Spy Radar, você acompanha as conversas, áudios, fotos e vídeos do WhatsApp em tempo real, direto no seu painel — inclusive mensagens apagadas.",
  },
  {
    q: "A pessoa vai descobrir que estou monitorando?",
    a: "Não. O aplicativo funciona em modo totalmente invisível. A pessoa não recebe nenhuma notificação e não há qualquer ícone ou aviso no celular dela.",
  },
  {
    q: "Preciso pegar o celular da pessoa?",
    a: "Na maioria dos casos, não. A ativação é feita de forma remota a partir do número do celular. Nossa equipe orienta você em todo o passo a passo.",
  },
  {
    q: "Consigo ver a localização em tempo real?",
    a: "Sim. Você acompanha exatamente onde a pessoa está no momento e todo o histórico de lugares por onde ela passou.",
  },
  {
    q: "Funciona em iPhone e Android?",
    a: "Sim, o Spy Radar é compatível com celulares Android e iPhone. Basta seguir as instruções que enviamos após a contratação.",
  },
  {
    q: "E se eu não conseguir descobrir nada?",
    a: "Você tem 30 dias de garantia. Se não conseguir clonar o celular e acompanhar as informações, devolvemos 100% do valor pago.",
  },
  {
    q: "Meus dados e o que eu descobrir ficam em sigilo?",
    a: "Sim. Todo o acesso é criptografado e privado. Somente você tem acesso ao painel com as informações do celular monitorado.",
  },
];

function FaqItem({
  faq,
  open,
  onToggle,
  id,
}: {
  faq: { q: string; a: string };
  open: boolean;
  onToggle: () => void;
  id: string;
}) {
  return (
    <div className="border-b border-[#292929]">
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          id={`${id}-btn`}
          className="flex min-h-[56px] w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:text-[#D9A928] focus-visible:outline-none focus-visible:text-[#D9A928]"
        >
          <span className="text-[15px] font-semibold text-[#F5F5F2] sm:text-base">
            {faq.q}
          </span>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#292929] bg-[#151515] text-[#D9A928]">
            {open ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </span>
        </button>
      </h3>
      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-btn`}
        hidden={!open}
        className="pb-5 pr-12 text-[14px] leading-relaxed text-[#A7A7A7]"
      >
        {faq.a}
      </div>
    </div>
  );
}

export function SupportFaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <>
      {/* Support */}
      <section id="suporte" className="scroll-mt-24 border-t border-[#292929] bg-[#0d0d0d] py-20 sm:py-28">
        <Container className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <figure className="relative overflow-hidden rounded-3xl border border-[#292929]">
            <img
              src="/brand/support.png"
              alt="Especialista de atendimento da Spy Radar Brasil trabalhando"
              className="aspect-[4/3] w-full object-cover"
              loading="lazy"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080808]/50 to-transparent" />
          </figure>

          <div className="flex flex-col items-start">
            <SectionHeading
              eyebrow="Suporte"
              title={
                <>
                  Precisou?
                  <br className="hidden sm:block" /> Tem gente do outro lado
                </>
              }
              subtitle="Nossa equipe te acompanha em cada etapa da ativação do clone, de forma discreta, até você ter tudo funcionando no seu painel."
            />
            <ul className="mt-8 flex flex-col gap-3">
              {supportIndicators.map((item) => (
                <li key={item.label} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#292929] bg-[#1C1C1C]">
                    <item.icon className="h-4 w-4 text-[#D9A928]" strokeWidth={1.5} />
                  </span>
                  <span className="text-[14px] font-medium text-[#F5F5F2]">{item.label}</span>
                </li>
              ))}
            </ul>
            <GoldButton to="/verificar" className="mt-9">
              Falar com o suporte
            </GoldButton>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-24 py-20 sm:py-28">
        <Container className="grid grid-cols-1 gap-12 lg:grid-cols-5 lg:gap-16">
          <div className="lg:col-span-2">
            <SectionHeading
              eyebrow="Dúvidas frequentes"
              title={
                <>
                  Perguntas
                  <br className="hidden sm:block" /> frequentes
                </>
              }
              subtitle="Tudo o que você precisa saber antes de clonar o celular e descobrir a verdade."
            />
          </div>
          <div className="lg:col-span-3">
            {faqs.map((faq, i) => (
              <FaqItem
                key={faq.q}
                id={`faq-${i}`}
                faq={faq}
                open={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
