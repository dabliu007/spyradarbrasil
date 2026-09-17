import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";

export const Route = createFileRoute("/detetives")({
  head: () => ({
    meta: [
      { title: "SpyRadar Brasil · Kit Investigação Completo · Descubra a Verdade em 24h" },
      {
        name: "description",
        content:
          "O kit definitivo para acabar com a dúvida: clonagem de celular, caneta espiã com 30 dias de bateria e rastreador veicular em tempo real. Sigilo absoluto. Ative hoje.",
      },
      { name: "robots", content: "index,follow,max-image-preview:large" },
      { name: "theme-color", content: "#ffffff" },
      { property: "og:title", content: "SpyRadar Brasil · Kit Investigação Completo · Descubra a verdade que escondem de você" },
      { property: "og:description", content: "Clonagem de celular, caneta espiã e rastreador em tempo real. Pare de viver na dúvida." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "/kit-completo-hero.png" },
    ],
  }),
  component: DetetivesPage,
});

/* -------------------------------------------------------------------------- */
/*  CONFIGURAÇÃO — troque estes valores quando tiver os definitivos           */
/* -------------------------------------------------------------------------- */

/** ⚠️ Link de checkout (provisório) — troque pelo link definitivo do Kit Completo */
const CHECKOUT_URL = "https://checkout.retroplay.top/VCCL1O8SD8PD";
/** ⚠️ WhatsApp (provisório) */
const WHATSAPP_URL = "https://wa.me/5511999999999";

/** ⚠️ Preço do Kit Completo — confirme/ajuste */
const PRICE_FROM = "R$ 397,00";
const PRICE_NOW = "R$ 197,00";
const PRICE_INSTALLMENT = "12x de R$ 19,90";

function goToCheckout() {
  try {
    if (window.top) {
      window.top.location.href = CHECKOUT_URL;
      return;
    }
  } catch {
    /* cross-origin: fallback abaixo */
  }
  window.location.href = CHECKOUT_URL;
}

/* ---------------------------------- Ícones --------------------------------- */

function Icon({ name, className }: { name: string; className?: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className,
  };
  switch (name) {
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <rect x="4" y="10" width="16" height="10" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
      );
    case "chat":
      return (
        <svg {...common}>
          <path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.5A8 8 0 1 1 21 12z" />
        </svg>
      );
    case "pen":
      return (
        <svg {...common}>
          <path d="M12 19l7-7 3 3-7 7-4 1 1-4z" />
          <path d="M18 13l-1.5-1.5" />
          <path d="M2 2l7.5 7.5" />
          <path d="M9.5 9.5L12 12" />
        </svg>
      );
    case "pin":
      return (
        <svg {...common}>
          <path d="M12 21s-6-5.3-6-10a6 6 0 1 1 12 0c0 4.7-6 10-6 10z" />
          <circle cx="12" cy="11" r="2.2" />
        </svg>
      );
    case "bolt":
      return (
        <svg {...common}>
          <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />
        </svg>
      );
    case "battery":
      return (
        <svg {...common}>
          <rect x="3" y="8" width="15" height="8" rx="2" />
          <path d="M21 11v2" />
          <path d="M6 11v2M9 11v2M12 11v2" />
        </svg>
      );
    case "eye":
      return (
        <svg {...common}>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="M20 6L9 17l-5-5" />
        </svg>
      );
    case "star":
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 21.4l1.4-6.8L2.2 9.9l6.9-.8L12 2z" />
        </svg>
      );
    case "arrow":
      return (
        <svg {...common}>
          <path d="M5 12h14" />
          <path d="M13 6l6 6-6 6" />
        </svg>
      );
    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    default:
      return null;
  }
}

/* ------------------------------ Reveal on scroll --------------------------- */

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // `armed` só fica true DEPOIS que o JS montou no cliente. Enquanto false
  // (SSR e primeira pintura), o conteúdo é renderizado 100% visível — assim,
  // se a hidratação falhar/atrasar, nada fica preso invisível.
  const [armed, setArmed] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Sem IntersectionObserver: mantém visível (nunca esconde).
    if (typeof IntersectionObserver === "undefined") return;

    // Se já está na viewport ao montar, mantém visível (sem flash, sem animar).
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) return;

    // Abaixo da dobra: arma a animação de entrada (esconde e revela no scroll).
    setArmed(true);

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.15 },
    );
    io.observe(el);

    // Rede de segurança: garante que o conteúdo NUNCA fique preso invisível.
    const safety = window.setTimeout(() => setShown(true), 1500);

    return () => {
      io.disconnect();
      window.clearTimeout(safety);
    };
  }, []);

  const hidden = armed && !shown;

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: hidden ? 0 : 1,
        transform: hidden ? "translateY(28px)" : "translateY(0)",
        transition: armed
          ? `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms`
          : "none",
      }}
    >
      {children}
    </div>
  );
}

/* --------------------------------- Página ---------------------------------- */

const KIT_ITEMS = [
  {
    tag: "Módulo 01",
    icon: "chat",
    title: "Clonagem de Celular",
    sub: "WhatsApp e redes sociais",
    desc: "Espelhe as conversas do WhatsApp, Instagram e Facebook em tempo real. Mensagens, áudios e fotos — inclusive o que ele(a) apagou achando que ninguém veria.",
    img: "/equip-celular.png",
    bullets: ["Mensagens apagadas recuperadas", "Áudios e fotos ocultas", "Espelhamento em tempo real"],
  },
  {
    tag: "Módulo 02",
    icon: "pen",
    title: "Caneta Espiã 4K",
    sub: "Grava áudio e vídeo · 30 dias de bateria",
    desc: "Discreta, idêntica a uma caneta comum. Grava tudo em alta definição por onde passa e a bateria dura até 30 dias. A prova que faltava, no seu bolso.",
      img: "/equip-caneta.png",
    bullets: ["Vídeo em alta definição", "Bateria de até 30 dias", "100% discreta e portátil"],
  },
  {
    tag: "Módulo 03",
    icon: "pin",
    title: "Rastreador Veicular",
    sub: "Localização em tempo real",
    desc: "Instale no carro em segundos e acompanhe cada trajeto pelo celular. Descubra para onde ele(a) realmente vai — e quando as histórias não batem.",
    img: "/equip-rastreador.png",
    bullets: ["GPS em tempo real", "Histórico de trajetos", "Instalação em segundos"],
  },
];

const SIGNS = [
  "Esconde a tela e leva o celular até pro banheiro",
  "Ficou distante, frio e some por horas sem explicação",
  "Senhas novas e notificações sempre no silencioso",
  "Chega tarde com desculpas que nunca fecham",
];

const FAQ = [
  {
    q: "É realmente sigiloso? Ele(a) vai descobrir?",
    a: "Sim, é 100% sigiloso. Todo o processo é discreto e nenhuma notificação é enviada ao aparelho monitorado. Seu anonimato é a nossa prioridade absoluta.",
  },
  {
    q: "Quanto tempo para começar a usar?",
    a: "A clonagem é ativada em minutos após a confirmação. Os equipamentos físicos são enviados com envio expresso e sigiloso para todo o Brasil.",
  },
  {
    q: "Preciso de conhecimento técnico?",
    a: "Não. O passo a passo é simples e guiado. Se precisar, nossa equipe te acompanha pelo WhatsApp em cada etapa.",
  },
  {
    q: "E se eu não ficar satisfeito?",
    a: "Você tem 7 dias de garantia incondicional. Se não for para você, devolvemos 100% do valor, sem burocracia.",
  },
];

function DetetivesPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-white font-sans text-[#1d1d1f] antialiased selection:bg-[#0071e3] selection:text-white">
      {/* ------------------------------- Header ------------------------------ */}
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1d1d1f] text-white">
              <Icon name="shield" className="h-4 w-4" />
            </span>
            <span className="font-display text-[15px] font-extrabold tracking-tight">SpyRadar Brasil</span>
          </div>
          <button
            onClick={goToCheckout}
            className="rounded-full bg-[#0071e3] px-4 py-2 text-[13px] font-semibold text-white transition-all hover:bg-[#0060c0] active:scale-95"
          >
            Quero o Kit
          </button>
        </div>
      </header>

      {/* -------------------------------- Hero ------------------------------- */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#f5f5f7] to-white">
        <div className="mx-auto max-w-5xl px-5 pb-4 pt-12 text-center">
          <Reveal>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6e6e73]">
              <Icon name="lock" className="h-3 w-3" /> Sigilo absoluto
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mx-auto mt-5 max-w-[15ch] font-display text-[34px] font-extrabold leading-[1.03] tracking-[-0.03em] text-balance sm:text-6xl">
              Pare de viver{" "}
              <span className="bg-gradient-to-r from-[#0071e3] to-[#42a5ff] bg-clip-text text-transparent">
                na dúvida.
              </span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mx-auto mt-4 max-w-[34ch] text-[16px] leading-relaxed text-[#6e6e73] text-pretty sm:text-xl sm:max-w-lg">
              A incerteza dói mais que a verdade. O Kit Investigação Completo te dá as respostas que
              ele(a) esconde — com total discrição.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-7 flex flex-col items-center gap-3">
              <button
                onClick={goToCheckout}
                className="group inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-full bg-[#0071e3] px-8 py-4 text-[16px] font-semibold text-white shadow-[0_10px_30px_-8px_rgba(0,113,227,0.6)] transition-all hover:bg-[#0060c0] active:scale-[0.97]"
              >
                Descobrir a verdade agora
                <Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <p className="text-[13px] text-[#6e6e73]">
                <span className="text-[#86868b] line-through">{PRICE_FROM}</span>{" "}
                <span className="font-semibold text-[#1d1d1f]">{PRICE_NOW}</span> · {PRICE_INSTALLMENT}
              </p>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <div className="relative mx-auto mt-8 max-w-2xl">
              <div className="pointer-events-none absolute inset-0 -z-10 mx-auto h-3/4 w-3/4 rounded-full bg-[#0071e3]/10 blur-3xl" />
              <img
                src="/kit-completo-hero.png"
                alt="Kit Investigação Completo: celular com clonagem, caneta espiã e rastreador veicular"
                className="mx-auto w-full drop-shadow-2xl"
              />
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="mx-auto -mt-2 flex max-w-md flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12px] font-medium text-[#6e6e73]">
              <span className="inline-flex items-center gap-1.5"><Icon name="bolt" className="h-3.5 w-3.5 text-[#0071e3]" /> Ativação em minutos</span>
              <span className="inline-flex items-center gap-1.5"><Icon name="shield" className="h-3.5 w-3.5 text-[#0071e3]" /> 7 dias de garantia</span>
              <span className="inline-flex items-center gap-1.5"><Icon name="lock" className="h-3.5 w-3.5 text-[#0071e3]" /> Envio discreto</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------ Sinais ------------------------------- */}
      <section className="mx-auto max-w-5xl px-5 py-16 sm:py-24">
        <Reveal className="text-center">
          <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#0071e3]">
            Você reconhece isto?
          </span>
          <h2 className="mx-auto mt-3 max-w-[18ch] font-display text-[26px] font-extrabold leading-tight tracking-[-0.02em] text-balance sm:text-4xl">
            O seu instinto já sabe. Falta a prova.
          </h2>
        </Reveal>
        <div className="mx-auto mt-8 grid max-w-2xl gap-3 sm:grid-cols-2">
          {SIGNS.map((s, i) => (
            <Reveal key={s} delay={i * 80}>
              <div className="flex items-start gap-3 rounded-2xl border border-black/5 bg-[#f5f5f7] p-4">
                <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#0071e3]/10 text-[#0071e3]">
                  <Icon name="eye" className="h-3.5 w-3.5" />
                </span>
                <p className="text-[14px] leading-snug text-[#1d1d1f]">{s}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={160} className="mt-6 text-center">
          <p className="mx-auto max-w-md text-[15px] leading-relaxed text-[#6e6e73] text-pretty">
            Se você marcou <span className="font-semibold text-[#1d1d1f]">um só</span> desses sinais, você
            merece parar de sofrer por antecipação. A verdade liberta — e ela cabe neste kit.
          </p>
        </Reveal>
      </section>

      {/* ----------------------------- O que vem ----------------------------- */}
      <section className="bg-[#f5f5f7] py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-5">
          <Reveal className="text-center">
            <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#0071e3]">
              Tudo em um só kit
            </span>
            <h2 className="mx-auto mt-3 max-w-[16ch] font-display text-[28px] font-extrabold leading-tight tracking-[-0.02em] text-balance sm:text-5xl">
              Três ferramentas. Uma verdade.
            </h2>
          </Reveal>

          <div className="mt-12 space-y-6">
            {KIT_ITEMS.map((item, i) => (
              <Reveal key={item.title} delay={i * 60}>
                <div
                  className={`flex flex-col overflow-hidden rounded-[28px] border border-black/5 bg-white ${
                    i % 2 === 1 ? "sm:flex-row-reverse" : "sm:flex-row"
                  }`}
                >
                  <div className="flex items-center justify-center bg-gradient-to-b from-[#fafafa] to-[#eef0f3] p-8 sm:w-1/2">
                    <img
                      src={item.img}
                      alt={item.title}
                      className="h-44 w-auto object-contain drop-shadow-xl sm:h-56"
                    />
                  </div>
                  <div className="flex flex-col justify-center gap-3 p-7 sm:w-1/2 sm:p-9">
                    <span className="inline-flex w-fit items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0071e3]">
                      <Icon name={item.icon} className="h-3.5 w-3.5" /> {item.tag}
                    </span>
                    <h3 className="font-display text-[22px] font-extrabold leading-tight tracking-[-0.02em] sm:text-3xl">
                      {item.title}
                    </h3>
                    <p className="text-[13px] font-medium text-[#86868b]">{item.sub}</p>
                    <p className="text-[15px] leading-relaxed text-[#6e6e73] text-pretty">{item.desc}</p>
                    <ul className="mt-1 flex flex-col gap-2">
                      {item.bullets.map((b) => (
                        <li key={b} className="flex items-center gap-2 text-[14px] font-medium text-[#1d1d1f]">
                          <Icon name="check" className="h-4 w-4 flex-shrink-0 text-[#0071e3]" /> {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------ Oferta ------------------------------- */}
      <section className="mx-auto max-w-5xl px-5 py-16 sm:py-24">
        <Reveal>
          <div className="relative mx-auto max-w-md overflow-hidden rounded-[32px] border border-black/10 bg-white p-1 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.3)]">
            <div className="rounded-[28px] bg-gradient-to-b from-[#f5f5f7] to-white p-7 text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1d1d1f] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
                <Icon name="star" className="h-3 w-3 text-[#ffd60a]" /> Kit Investigação Completo
              </span>
              <div className="mt-5 flex items-center justify-center gap-2">
                <img src="/equip-celular.png" alt="" className="h-16 w-auto object-contain" />
                <img src="/equip-caneta.png" alt="" className="h-16 w-auto object-contain" />
                <img src="/equip-rastreador.png" alt="" className="h-16 w-auto object-contain" />
              </div>

              <ul className="mx-auto mt-6 flex max-w-[16rem] flex-col gap-2.5 text-left">
                {["Clonagem de celular (WhatsApp + redes)", "Caneta espiã 4K · 30 dias de bateria", "Rastreador veicular em tempo real"].map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-[14px] font-medium text-[#1d1d1f]">
                    <Icon name="check" className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#0071e3]" /> {b}
                  </li>
                ))}
              </ul>

              <div className="mt-7">
                <p className="text-[14px] text-[#86868b] line-through">{PRICE_FROM}</p>
                <p className="font-display text-[44px] font-extrabold leading-none tracking-[-0.03em] text-[#1d1d1f]">
                  {PRICE_NOW}
                </p>
                <p className="mt-1 text-[13px] text-[#6e6e73]">ou {PRICE_INSTALLMENT} no cartão</p>
              </div>

              <button
                onClick={goToCheckout}
                className="group mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0071e3] px-6 py-4 text-[16px] font-semibold text-white shadow-[0_10px_30px_-8px_rgba(0,113,227,0.6)] transition-all hover:bg-[#0060c0] active:scale-[0.97]"
              >
                Garantir meu kit agora
                <Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-[12px] text-[#6e6e73]">
                <Icon name="lock" className="h-3.5 w-3.5" /> Pagamento seguro · Envio sigiloso
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* --------------------------- Como funciona --------------------------- */}
      <section className="bg-[#f5f5f7] py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-5">
          <Reveal className="text-center">
            <h2 className="mx-auto max-w-[16ch] font-display text-[26px] font-extrabold leading-tight tracking-[-0.02em] text-balance sm:text-4xl">
              Simples como deve ser.
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {[
              { n: "1", t: "Garanta o kit", d: "Finalize em minutos com pagamento 100% seguro." },
              { n: "2", t: "Ative e instale", d: "Clonagem em minutos e equipamentos com envio discreto." },
              { n: "3", t: "Veja a verdade", d: "Acompanhe tudo pelo celular, de onde estiver." },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 80}>
                <div className="rounded-3xl border border-black/5 bg-white p-6 text-center">
                  <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#0071e3] font-display text-[18px] font-extrabold text-white">
                    {s.n}
                  </span>
                  <h3 className="mt-4 font-display text-[17px] font-bold tracking-tight">{s.t}</h3>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-[#6e6e73] text-pretty">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------- Depoimentos ---------------------------- */}
      <section className="mx-auto max-w-5xl px-5 py-16 sm:py-24">
        <Reveal className="text-center">
          <div className="flex items-center justify-center gap-1 text-[#ffb300]">
            {Array.from({ length: 5 }).map((_, i) => (
              <Icon key={i} name="star" className="h-4 w-4" />
            ))}
          </div>
          <h2 className="mx-auto mt-3 max-w-[18ch] font-display text-[26px] font-extrabold leading-tight tracking-[-0.02em] text-balance sm:text-4xl">
            Quem descobriu, respira aliviado.
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { n: "Marina S.", c: "São Paulo · SP", t: "Passei meses achando que era loucura minha. O kit me mostrou tudo em 2 dias. Doeu, mas hoje tenho paz." },
            { n: "Rafael T.", c: "Curitiba · PR", t: "O rastreador foi o que abriu meus olhos. As histórias nunca batiam. Agora eu sei — e decidi por mim." },
            { n: "Juliana P.", c: "Rio de Janeiro · RJ", t: "Discreto de verdade. Ninguém desconfiou de nada. Suporte no WhatsApp me acompanhou o tempo todo." },
          ].map((d, i) => (
            <Reveal key={d.n} delay={i * 80}>
              <figure className="flex h-full flex-col rounded-3xl border border-black/5 bg-[#f5f5f7] p-6">
                <div className="flex gap-0.5 text-[#ffb300]">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Icon key={j} name="star" className="h-3.5 w-3.5" />
                  ))}
                </div>
                <blockquote className="mt-3 flex-1 text-[14px] leading-relaxed text-[#1d1d1f] text-pretty">
                  “{d.t}”
                </blockquote>
                <figcaption className="mt-4 text-[13px]">
                  <span className="font-semibold text-[#1d1d1f]">{d.n}</span>
                  <span className="block text-[#86868b]">{d.c}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------ Garantia ----------------------------- */}
      <section className="mx-auto max-w-5xl px-5 pb-16 sm:pb-24">
        <Reveal>
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 rounded-[28px] border border-black/5 bg-gradient-to-b from-[#f5f5f7] to-white p-8 text-center sm:flex-row sm:text-left">
            <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-[#0071e3]/10 text-[#0071e3]">
              <Icon name="shield" className="h-7 w-7" />
            </span>
            <div>
              <h3 className="font-display text-[19px] font-extrabold tracking-tight">Garantia incondicional de 7 dias</h3>
              <p className="mt-1 text-[14px] leading-relaxed text-[#6e6e73] text-pretty">
                Se por qualquer motivo não for para você, devolvemos 100% do valor. Sem perguntas, sem
                burocracia. O risco é todo nosso.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* -------------------------------- FAQ -------------------------------- */}
      <section className="bg-[#f5f5f7] py-16 sm:py-24">
        <div className="mx-auto max-w-2xl px-5">
          <Reveal className="text-center">
            <h2 className="font-display text-[26px] font-extrabold leading-tight tracking-[-0.02em] sm:text-4xl">
              Perguntas frequentes
            </h2>
          </Reveal>
          <div className="mt-8 flex flex-col gap-3">
            {FAQ.map((f, i) => (
              <Reveal key={f.q} delay={i * 50}>
                <div className="overflow-hidden rounded-2xl border border-black/5 bg-white">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
                    aria-expanded={openFaq === i}
                  >
                    <span className="text-[15px] font-semibold text-[#1d1d1f]">{f.q}</span>
                    <span
                      className="flex-shrink-0 text-[#0071e3] transition-transform duration-300"
                      style={{ transform: openFaq === i ? "rotate(45deg)" : "none" }}
                    >
                      <Icon name="plus" className="h-4 w-4" />
                    </span>
                  </button>
                  <div
                    className="grid transition-all duration-300 ease-out"
                    style={{ gridTemplateRows: openFaq === i ? "1fr" : "0fr" }}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-4 text-[14px] leading-relaxed text-[#6e6e73] text-pretty">{f.a}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------ CTA final ---------------------------- */}
      <section className="relative overflow-hidden bg-[#1d1d1f] py-20 text-center text-white sm:py-28">
        <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-[#0071e3]/30 blur-3xl" />
        <div className="relative mx-auto max-w-2xl px-5">
          <Reveal>
            <h2 className="mx-auto max-w-[16ch] font-display text-[30px] font-extrabold leading-[1.05] tracking-[-0.03em] text-balance sm:text-5xl">
              A verdade custa menos que mais uma noite sem dormir.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[16px] leading-relaxed text-white/70 text-pretty">
              Pare de imaginar o pior. Tenha as respostas nas suas mãos — hoje, com sigilo total.
            </p>
            <button
              onClick={goToCheckout}
              className="group mt-8 inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-[16px] font-semibold text-[#1d1d1f] transition-all hover:bg-[#f5f5f7] active:scale-[0.97]"
            >
              Quero descobrir a verdade
              <Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <p className="mt-4 text-[13px] text-white/60">
              <span className="line-through">{PRICE_FROM}</span> · <span className="font-semibold text-white">{PRICE_NOW}</span> · {PRICE_INSTALLMENT}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------ Rodapé ------------------------------- */}
      <footer className="bg-white py-10">
        <div className="mx-auto max-w-5xl px-5 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#1d1d1f] text-white">
              <Icon name="shield" className="h-3.5 w-3.5" />
            </span>
            <span className="font-display text-[14px] font-extrabold tracking-tight">SpyRadar Brasil</span>
          </div>
          <p className="mx-auto mt-4 max-w-md text-[12px] leading-relaxed text-[#86868b] text-pretty">
            Equipamentos de investigação para uso pessoal e legal. Use com responsabilidade e de acordo
            com a legislação vigente.
          </p>
          <a
            href={WHATSAPP_URL}
            className="mt-4 inline-block text-[13px] font-semibold text-[#0071e3]"
          >
            Falar com um especialista no WhatsApp
          </a>
          <p className="mt-6 text-[11px] text-[#c7c7cc]">© {new Date().getFullYear()} SpyRadar Brasil. Todos os direitos reservados.</p>
        </div>
      </footer>

      {/* ------------------------ Barra de compra fixa ----------------------- */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="leading-tight">
            <p className="text-[11px] text-[#86868b] line-through">{PRICE_FROM}</p>
            <p className="font-display text-[18px] font-extrabold tracking-tight">{PRICE_NOW}</p>
          </div>
          <button
            onClick={goToCheckout}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#0071e3] px-5 py-3 text-[15px] font-semibold text-white transition-all hover:bg-[#0060c0] active:scale-[0.97]"
          >
            Quero o Kit <Icon name="arrow" className="h-4 w-4" />
          </button>
        </div>
      </div>
      {/* espaçador para a barra fixa não cobrir o rodapé */}
      <div className="h-20" aria-hidden />
    </div>
  );
}
