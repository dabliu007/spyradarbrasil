import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/detetives")({
  head: () => ({
    meta: [
      { title: "Detective Profissional · Equipamentos para Investigação Discreta" },
      {
        name: "description",
        content:
          "Empresa especialista em investigação particular com mais de 10 anos de experiência. Kits profissionais de monitoramento: clonagem de WhatsApp, câmeras escondidas, rastreadores e mais.",
      },
      { name: "robots", content: "index,follow" },
      { property: "og:title", content: "Detective Profissional · Equipamentos para Investigação" },
      { property: "og:description", content: "Kits profissionais de investigação e monitoramento. Mais de 10 anos de experiência." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: DetetivesPage,
});

/**
 * LINKS DE CHECKOUT DE CADA KIT
 * ⚠️ Provisórios: todos apontam para o checkout atual.
 * Troque cada URL abaixo pelo link definitivo de cada kit quando disponível.
 */
const CHECKOUT_PRIMARIO = "https://checkout.retroplay.top/VCCL1O8SD8PD";
const CHECKOUT_STALKER = "https://checkout.retroplay.top/VCCL1O8SD8PD";
const CHECKOUT_PREMIUM = "https://checkout.retroplay.top/VCCL1O8SD8PD";

/** Link do WhatsApp (provisório) */
const WHATSAPP_URL = "https://wa.me/5511999999999";

function goToCheckout(url: string) {
  // Em preview o app roda dentro de um iframe; navegar a janela de topo
  // garante o redirecionamento para o checkout externo (com fallback).
  try {
    if (window.top) {
      window.top.location.href = url;
      return;
    }
  } catch {
    // cross-origin: cai no fallback abaixo
  }
  window.location.href = url;
}

/* ---------------------------------- Ícones --------------------------------- */

function Icon({ name, className }: { name: string; className?: string }) {
  const common = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className,
  };
  switch (name) {
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
        </svg>
      );
    case "check":
      return (
        <svg {...common} strokeWidth={3}>
          <path d="M20 6 9 17l-5-5" />
        </svg>
      );
    case "truck":
      return (
        <svg {...common}>
          <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" />
          <circle cx="7" cy="18" r="1.6" />
          <circle cx="17" cy="18" r="1.6" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
          <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
        </svg>
      );
    case "card":
      return (
        <svg {...common}>
          <rect x="3" y="5.5" width="18" height="13" rx="2" />
          <path d="M3 9.5h18" />
        </svg>
      );
    case "refresh":
      return (
        <svg {...common}>
          <path d="M4 12a8 8 0 0 1 14-5.3L20 9M20 12a8 8 0 0 1-14 5.3L4 15" />
          <path d="M20 4v5h-5M4 20v-5h5" />
        </svg>
      );
    case "star":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" width={18} height={18} aria-hidden className={className}>
          <path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7z" />
        </svg>
      );
    case "eye":
      return (
        <svg {...common}>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
          <circle cx="12" cy="12" r="2.6" />
        </svg>
      );
    case "cpu":
      return (
        <svg {...common}>
          <rect x="6" y="6" width="12" height="12" rx="2" />
          <path d="M9 1.5v3M15 1.5v3M9 19.5v3M15 19.5v3M1.5 9h3M1.5 15h3M19.5 9h3M19.5 15h3" />
        </svg>
      );
    case "headset":
      return (
        <svg {...common}>
          <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
          <rect x="3" y="13" width="4" height="6" rx="1.5" />
          <rect x="17" y="13" width="4" height="6" rx="1.5" />
          <path d="M20 19a4 4 0 0 1-4 3h-2" />
        </svg>
      );
    case "medal":
      return (
        <svg {...common}>
          <circle cx="12" cy="9" r="5" />
          <path d="M9 13.5 7.5 22l4.5-2.5L16.5 22 15 13.5" />
        </svg>
      );
    case "scale":
      return (
        <svg {...common}>
          <path d="M12 3v18M6 21h12M4 8l4-3 4 3M4 8l-2 5a3 3 0 0 0 6 0zM20 8l-4-3-4 3M20 8l2 5a3 3 0 0 1-6 0z" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" width={20} height={20} aria-hidden className={className}>
          <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.8 4.9-1.3A10 10 0 1 0 12 2zm0 2a8 8 0 1 1-4.2 14.8l-.3-.2-2.9.8.8-2.8-.2-.3A8 8 0 0 1 12 4zm-2.5 3.6c-.2 0-.5.1-.7.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 5 4.3 2.4 1 2.9.8 3.5.7.6-.1 1.8-.7 2-1.5.3-.7.3-1.4.2-1.5-.1-.1-.3-.2-.6-.4l-1.9-.9c-.3-.1-.5-.2-.7.2l-.9 1.2c-.2.2-.3.2-.6.1-1.7-.7-2.8-1.7-3.7-3.2-.2-.4 0-.5.2-.7l.5-.7c.1-.2.1-.4 0-.6l-.9-2c-.2-.5-.4-.4-.6-.4z" />
        </svg>
      );
    case "chevronLeft":
      return (
        <svg {...common}>
          <path d="m15 18-6-6 6-6" />
        </svg>
      );
    case "chevronRight":
      return (
        <svg {...common}>
          <path d="m9 18 6-6-6-6" />
        </svg>
      );
    case "cart":
      return (
        <svg {...common}>
          <circle cx="9" cy="20" r="1.4" />
          <circle cx="18" cy="20" r="1.4" />
          <path d="M2 3h3l2.4 12.4a1.5 1.5 0 0 0 1.5 1.2h8.2a1.5 1.5 0 0 0 1.5-1.2L21 7H6" />
        </svg>
      );
    case "play":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" width={22} height={22} aria-hidden className={className}>
          <path d="M8 5v14l11-7z" />
        </svg>
      );
    default:
      return null;
  }
}

/* ---------------------------------- Dados ---------------------------------- */

interface Kit {
  id: string;
  nome: string;
  tag: string;
  descricao: string;
  imagem: string;
  itens: string[];
  preco: string;
  parcela: string;
  checkout: string;
  destaque?: boolean;
}

const KITS: Kit[] = [
  {
    id: "primario",
    nome: "Kit Primário",
    tag: "Essencial",
    descricao: "Ideal para começar. Clonagem de WhatsApp com ativação imediata.",
    imagem: "/kit-primario.png",
    itens: ["Clonagem de WhatsApp"],
    preco: "R$ 67,00",
    parcela: "ou 12x de R$ 5,58",
    checkout: CHECKOUT_PRIMARIO,
  },
  {
    id: "stalker",
    nome: "Kit Stalker",
    tag: "Mais vendido",
    descricao: "O mais escolhido. Monitoramento completo de mensagens e ambiente.",
    imagem: "/kit-stalker.png",
    itens: ["Clonagem de WhatsApp", "Caneta Espiã", "Câmera Escondida via Nuvem"],
    preco: "R$ 129,90",
    parcela: "ou 12x de R$ 10,83",
    checkout: CHECKOUT_STALKER,
    destaque: true,
  },
  {
    id: "premium",
    nome: "Kit Premium",
    tag: "Completo",
    descricao: "Solução profissional completa para investigação e monitoramento veicular.",
    imagem: "/kit-premium.png",
    itens: [
      "Clonagem de WhatsApp",
      "Caneta Espiã",
      "Câmera Escondida via Nuvem",
      "Gravador de Voz para Carro",
      "Câmera Escondida para Carro",
      "Rastreador para Carro",
      "Acesso ao Celular Completo",
    ],
    preco: "R$ 197,00",
    parcela: "ou 12x de R$ 16,42",
    checkout: CHECKOUT_PREMIUM,
  },
];

const EQUIPAMENTOS = [
  { nome: "Caneta Espiã", imagem: "/equip-caneta.png", incluso: "Kits Stalker e Premium" },
  { nome: "Câmera Escondida via Nuvem", imagem: "/equip-camera-nuvem.png", incluso: "Kits Stalker e Premium" },
  { nome: "Gravador de Voz para Carro", imagem: "/equip-gravador.png", incluso: "Kit Premium" },
  { nome: "Câmera Escondida para Carro", imagem: "/equip-camera-carro.png", incluso: "Kit Premium" },
  { nome: "Rastreador para Carro", imagem: "/equip-rastreador.png", incluso: "Kit Premium" },
  { nome: "Acesso ao Celular Completo", imagem: "/equip-celular.png", incluso: "Kit Premium" },
];

const DEPOIMENTOS = [
  { nome: "Carlos M.", cidade: "São Paulo · SP", texto: "Excelente qualidade e discrição. O kit me ajudou demais. Recomendo!", estrelas: 5 },
  { nome: "Mariana A.", cidade: "Curitiba · PR", texto: "Ativação rápida e suporte de verdade. Loja séria e confiável!", estrelas: 5 },
  { nome: "Roberto S.", cidade: "Belo Horizonte · MG", texto: "Uso as ferramentas no dia a dia. Nunca me deixaram na mão.", estrelas: 5 },
  { nome: "Juliana T.", cidade: "Rio de Janeiro · RJ", texto: "Discrição total e atendimento excelente. Me senti segura o tempo todo.", estrelas: 5 },
];

const FEATURES = [
  { icon: "medal", titulo: "Qualidade Premium", texto: "Equipamentos testados e aprovados" },
  { icon: "cpu", titulo: "Tecnologia Avançada", texto: "O que há de mais moderno em investigação" },
  { icon: "headset", titulo: "Suporte Especializado", texto: "Equipe pronta para te ajudar" },
  { icon: "shield", titulo: "Garantia Estendida", texto: "Cobertura em todos os produtos" },
  { icon: "eye", titulo: "Discrição Absoluta", texto: "Sua privacidade sempre protegida" },
  { icon: "scale", titulo: "Legalidade Total", texto: "Uso conforme a legislação vigente" },
];

const NAV = [
  { label: "Kits Detetive", href: "#kits" },
  { label: "Equipamentos", href: "#equipamentos" },
  { label: "Sobre Nós", href: "#sobre" },
  { label: "Contato", href: "#contato" },
];

/* -------------------------------- Componente ------------------------------- */

function DetetivesPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-[#14202e]">
      {/* Barra de anúncio */}
      <div className="bg-[#14202e] text-slate-200">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-1 px-4 py-2 text-center text-[11px] font-medium tracking-wide">
          <span className="flex items-center gap-1.5"><Icon name="lock" className="h-3.5 w-3.5 text-[#c19a3a]" /> Site 100% seguro</span>
          <span className="flex items-center gap-1.5"><Icon name="truck" className="h-3.5 w-3.5 text-[#c19a3a]" /> Entrega para todo Brasil</span>
          <span className="flex items-center gap-1.5"><Icon name="card" className="h-3.5 w-3.5 text-[#c19a3a]" /> Até 12x no cartão</span>
          <span className="flex items-center gap-1.5"><Icon name="refresh" className="h-3.5 w-3.5 text-[#c19a3a]" /> 7 dias para trocas e devoluções</span>
        </div>
      </div>

      {/* Cabeçalho */}
      <header className="sticky top-0 z-30 border-b border-[#e5e3de] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5">
          <a href="#topo" className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#14202e] text-[#c19a3a]">
              <Icon name="shield" className="h-6 w-6" />
            </span>
            <span className="leading-tight">
              <span className="block text-base font-extrabold tracking-tight">DETECTIVE</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.35em] text-[#c19a3a]">Profissional</span>
            </span>
          </a>

          <nav className="hidden items-center gap-7 lg:flex">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="text-[13px] font-bold uppercase tracking-wide text-[#14202e] transition-colors hover:text-[#c19a3a]">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-[#e5e3de] px-4 py-2 text-sm text-slate-400 md:flex">
              <Icon name="search" className="h-4 w-4" />
              <span>Buscar produtos...</span>
            </div>
            <a href="#kits" className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f4f1] text-[#14202e] transition-colors hover:bg-[#eceae4]">
              <Icon name="cart" className="h-5 w-5" />
            </a>
          </div>
        </div>
      </header>

      <main id="topo">
        {/* Hero */}
        <section className="border-b border-[#e5e3de]">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:py-16 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center rounded-sm border-l-2 border-[#c19a3a] bg-[#f5f4f1] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-[#c19a3a]">
                Loja Oficial
              </span>
              <h1 className="mt-5 text-balance text-4xl font-extrabold uppercase leading-[1.05] tracking-tight md:text-5xl">
                Equipamentos profissionais
                <span className="mt-1 block text-[#c19a3a]">para investigação discreta</span>
              </h1>
              <p className="mt-5 max-w-lg text-pretty text-base leading-relaxed text-slate-600">
                Kits completos e ferramentas de alta performance para investigação, segurança e
                coleta de evidências. Empresa especialista em detetives particulares há mais de 10 anos.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
                {[
                  { icon: "eye", t: "Discrição total", s: "Sua privacidade em 1º lugar" },
                  { icon: "medal", t: "Equipamentos testados", s: "Qualidade comprovada" },
                  { icon: "truck", t: "Entrega rápida", s: "Para todo o Brasil" },
                  { icon: "lock", t: "Compra segura", s: "Seus dados protegidos" },
                ].map((b) => (
                  <div key={b.t}>
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#e5e3de] text-[#c19a3a]">
                      <Icon name={b.icon} className="h-5 w-5" />
                    </span>
                    <div className="mt-2 text-[13px] font-bold leading-tight">{b.t}</div>
                    <div className="text-[11px] leading-tight text-slate-500">{b.s}</div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#kits"
                  className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-[#14202e] px-6 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#1e2d40]"
                >
                  Ver kits detetive <Icon name="chevronRight" className="h-4 w-4" />
                </a>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-[#14202e]/20 px-6 text-sm font-bold uppercase tracking-wide text-[#14202e] transition-colors hover:bg-[#f5f4f1]"
                >
                  <Icon name="whatsapp" className="h-4 w-4" /> Falar no WhatsApp
                </a>
              </div>

              <div className="mt-6 flex items-center gap-2 text-sm">
                <span className="flex text-[#c19a3a]">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Icon key={i} name="star" />
                  ))}
                </span>
                <span className="font-semibold">4,9/5</span>
                <span className="text-slate-500">com base em 1.842 avaliações</span>
              </div>
            </div>

            {/* Imagem do hero */}
            <div className="relative">
              <div className="overflow-hidden rounded-2xl border border-[#e5e3de] bg-[#f5f4f1]">
                <img
                  src="/detetive-hero.png"
                  alt="Maleta profissional com equipamentos de investigação e monitoramento"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute right-4 top-4 rounded-xl bg-[#c19a3a] px-5 py-3 text-center text-[#14202e] shadow-lg">
                <div className="text-xl font-extrabold leading-none">+10.000</div>
                <div className="text-[10px] font-bold uppercase tracking-wide">Clientes atendidos</div>
              </div>
              <div className="mt-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Loja especializada · referência nacional em equipamentos
              </div>
            </div>
          </div>
        </section>

        {/* Faixa de estatísticas */}
        <section className="bg-[#f5f4f1]">
          <div className="mx-auto max-w-6xl px-4 py-10">
            <div className="grid grid-cols-2 gap-6 rounded-2xl border border-[#e5e3de] bg-white p-8 md:grid-cols-4">
              {[
                { icon: "medal", v: "+10.000", l: "Clientes", s: "Em todo o Brasil" },
                { icon: "star", v: "4,9/5", l: "Avaliação", s: "Clientes satisfeitos" },
                { icon: "shield", v: "+10 anos", l: "De mercado", s: "Referência no segmento" },
                { icon: "lock", v: "100%", l: "Compra segura", s: "Seus dados protegidos" },
              ].map((st) => (
                <div key={st.l} className="flex flex-col items-center text-center md:flex-row md:items-start md:gap-3 md:text-left">
                  <span className="mb-2 text-[#c19a3a] md:mb-0"><Icon name={st.icon} className="h-8 w-8" /></span>
                  <div>
                    <div className="text-2xl font-extrabold leading-none">{st.v}</div>
                    <div className="text-xs font-bold uppercase tracking-wide text-[#c19a3a]">{st.l}</div>
                    <div className="text-[11px] text-slate-500">{st.s}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Depoimentos */}
        <section className="mx-auto max-w-6xl px-4 py-6">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {DEPOIMENTOS.map((d) => (
              <figure key={d.nome} className="rounded-xl border border-[#e5e3de] bg-white p-5">
                <figcaption className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#14202e] text-sm font-bold text-[#c19a3a]">
                    {d.nome.charAt(0)}
                  </span>
                  <span>
                    <span className="block text-sm font-bold">{d.nome}</span>
                    <span className="block text-[11px] text-slate-500">{d.cidade}</span>
                  </span>
                </figcaption>
                <p className="mt-3 text-[13px] leading-relaxed text-slate-600">{d.texto}</p>
                <div className="mt-3 flex text-[#c19a3a]">
                  {Array.from({ length: d.estrelas }).map((_, i) => (
                    <Icon key={i} name="star" />
                  ))}
                </div>
              </figure>
            ))}
          </div>
        </section>

        {/* Kits */}
        <section id="kits" className="mx-auto max-w-6xl px-4 py-14">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-extrabold uppercase tracking-tight md:text-4xl">Kits Detetive em destaque</h2>
            <p className="mt-3 text-slate-500">Kits completos com tudo que você precisa para investigações profissionais.</p>
          </div>

          <div className="grid items-start gap-6 md:grid-cols-3">
            {KITS.map((kit) => (
              <article
                key={kit.id}
                className={`relative flex flex-col overflow-hidden rounded-2xl border bg-white transition-transform hover:-translate-y-1 ${
                  kit.destaque ? "border-[#c19a3a] shadow-[0_20px_50px_-24px_rgba(193,154,58,0.7)] md:-mt-2" : "border-[#e5e3de]"
                }`}
              >
                <div className="absolute left-4 top-4 z-10 rounded-md bg-[#c19a3a] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[#14202e]">
                  {kit.tag}
                </div>

                <div className="aspect-[4/3] w-full overflow-hidden bg-[#f5f4f1]">
                  <img src={kit.imagem || "/placeholder.svg"} alt={`${kit.nome} - equipamentos de investigação`} className="h-full w-full object-cover" />
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-xl font-extrabold uppercase tracking-tight">{kit.nome}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-slate-500">{kit.descricao}</p>

                  <ul className="mt-4 space-y-2 text-[13px]">
                    {kit.itens.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-slate-700">
                        <span className="mt-0.5 text-[#c19a3a]"><Icon name="check" className="h-4 w-4" /></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-6">
                    <div className="text-3xl font-extrabold tracking-tight">{kit.preco}</div>
                    <div className="text-xs text-slate-500">{kit.parcela}</div>
                    <button
                      onClick={() => goToCheckout(kit.checkout)}
                      className={`mt-4 flex w-full min-h-12 items-center justify-center gap-2 rounded-lg text-sm font-extrabold uppercase tracking-wide transition-all active:scale-[0.98] ${
                        kit.destaque
                          ? "bg-[#c19a3a] text-[#14202e] hover:bg-[#d4ac48]"
                          : "bg-[#14202e] text-white hover:bg-[#1e2d40]"
                      }`}
                    >
                      Comprar agora <Icon name="cart" className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Equipamentos */}
        <section id="equipamentos" className="bg-[#f5f4f1]">
          <div className="mx-auto max-w-6xl px-4 py-14">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-extrabold uppercase tracking-tight md:text-4xl">Equipamentos em destaque</h2>
              <p className="mt-3 text-slate-500">Ferramentas que compõem os nossos kits profissionais.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {EQUIPAMENTOS.map((eq) => (
                <div key={eq.nome} className="rounded-xl border border-[#e5e3de] bg-white p-4 text-center">
                  <div className="aspect-square w-full overflow-hidden rounded-lg bg-[#f5f4f1]">
                    <img src={eq.imagem || "/placeholder.svg"} alt={eq.nome} className="h-full w-full object-contain p-2" />
                  </div>
                  <div className="mt-3 text-[13px] font-bold leading-tight">{eq.nome}</div>
                  <div className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-[#c19a3a]">{eq.incluso}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Diferenciais */}
        <section id="sobre" className="mx-auto max-w-6xl px-4 py-14">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
            {FEATURES.map((f) => (
              <div key={f.titulo} className="text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#f5f4f1] text-[#c19a3a]">
                  <Icon name={f.icon} className="h-7 w-7" />
                </span>
                <div className="mt-3 text-[13px] font-extrabold uppercase tracking-wide">{f.titulo}</div>
                <div className="mt-1 text-[11px] leading-tight text-slate-500">{f.texto}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Depoimentos em destaque */}
        <section className="bg-[#f5f4f1]">
          <div className="mx-auto max-w-6xl px-4 py-14">
            <h2 className="mb-10 text-center text-3xl font-extrabold uppercase tracking-tight md:text-4xl">
              Depoimentos de quem confia
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {DEPOIMENTOS.map((d) => (
                <figure key={d.nome} className="overflow-hidden rounded-xl border border-[#e5e3de] bg-white">
                  <div className="relative flex aspect-video items-center justify-center bg-[#14202e]">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur">
                      <Icon name="play" className="ml-0.5" />
                    </span>
                    <span className="absolute bottom-2 left-1/2 flex -translate-x-1/2 text-[#c19a3a]">
                      {Array.from({ length: d.estrelas }).map((_, i) => (
                        <Icon key={i} name="star" />
                      ))}
                    </span>
                  </div>
                  <figcaption className="p-4">
                    <p className="text-[13px] italic leading-relaxed text-slate-600">{`"${d.texto}"`}</p>
                    <p className="mt-2 text-[12px] font-bold">{`${d.nome} · ${d.cidade}`}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* Garantias */}
        <section className="bg-[#14202e] text-white">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
            {[
              { icon: "shield", t: "Garantia incondicional", s: "7 dias para trocas e devoluções sem burocracia" },
              { icon: "lock", t: "Compra 100% segura", s: "Seus dados protegidos com criptografia" },
              { icon: "truck", t: "Ativação segura", s: "Entrega e ativação discretas para todo o Brasil" },
            ].map((g) => (
              <div key={g.t} className="flex items-center gap-4">
                <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-[#c19a3a]">
                  <Icon name={g.icon} className="h-6 w-6" />
                </span>
                <div>
                  <div className="text-sm font-extrabold uppercase tracking-wide">{g.t}</div>
                  <div className="text-[12px] text-slate-400">{g.s}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Rodapé */}
      <footer id="contato" className="bg-[#0f1822] text-slate-300">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-[#c19a3a]">
                <Icon name="shield" className="h-6 w-6" />
              </span>
              <span className="leading-tight">
                <span className="block text-base font-extrabold text-white">DETECTIVE</span>
                <span className="block text-[10px] font-semibold uppercase tracking-[0.35em] text-[#c19a3a]">Profissional</span>
              </span>
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-slate-400">
              Referência nacional em equipamentos para investigação particular. Mais de 10 anos de experiência e sigilo absoluto.
            </p>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-white">Institucional</div>
            <ul className="mt-4 space-y-2 text-[13px]">
              {["Sobre nós", "Como comprar", "Formas de pagamento", "Prazo de entrega", "Trocas e devoluções"].map((l) => (
                <li key={l}><a href="#sobre" className="transition-colors hover:text-[#c19a3a]">{l}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-white">Atendimento</div>
            <ul className="mt-4 space-y-2 text-[13px] text-slate-400">
              <li className="flex items-center gap-2"><Icon name="whatsapp" className="h-4 w-4 text-[#c19a3a]" /> WhatsApp: (11) 99999-9999</li>
              <li>E-mail: contato@detectiveprofissional.com.br</li>
              <li>Seg. a Sex.: 8h às 18h</li>
              <li>Sábado: 8h às 12h</li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-white">Formas de pagamento</div>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Visa", "Master", "Elo", "Hipercard", "Pix", "Boleto"].map((p) => (
                <span key={p} className="rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-bold">{p}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-[11px] text-slate-500 md:flex-row">
            <span>© {new Date().getFullYear()} Detective Profissional. Todos os direitos reservados.</span>
            <span>Uso das ferramentas sob responsabilidade do contratante, conforme a legislação vigente.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
