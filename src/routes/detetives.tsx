import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/detetives")({
  head: () => ({
    meta: [
      { title: "Detective Profissional · Descubra a Verdade Que Escondem de Você" },
      {
        name: "description",
        content:
          "Cansado de viver na dúvida? Agência de investigação com +10 anos de experiência. Kits sigilosos de monitoramento: WhatsApp, câmeras, rastreador e acesso completo. Ative em minutos.",
      },
      { name: "robots", content: "index,follow,max-image-preview:large" },
      { name: "theme-color", content: "#070A10" },
      { property: "og:title", content: "Descubra a verdade que escondem de você · Detective Profissional" },
      { property: "og:description", content: "Pare de dormir com dúvidas. Veja conversas, fotos e localização em tempo real. Sigilo absoluto." },
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
    case "bolt":
      return (
        <svg {...common}>
          <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "star":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" width={16} height={16} aria-hidden className={className}>
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
    case "alert":
      return (
        <svg {...common}>
          <path d="M12 3 2 20h20L12 3z" />
          <path d="M12 10v4" />
          <path d="M12 17.5v.01" />
        </svg>
      );
    case "phone":
      return (
        <svg {...common}>
          <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
          <path d="M11 18h2" />
        </svg>
      );
    case "pin":
      return (
        <svg {...common}>
          <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z" />
          <circle cx="12" cy="10" r="2.4" />
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
  precoAntigo: string;
  parcela: string;
  cta: string;
  checkout: string;
  destaque?: boolean;
}

const KITS: Kit[] = [
  {
    id: "primario",
    nome: "Kit Primário",
    tag: "Primeiro passo",
    descricao: "Para quem quer tirar a dúvida do WhatsApp de uma vez por todas.",
    imagem: "/kit-primario.png",
    itens: ["Clonagem completa do WhatsApp", "Conversas, fotos e áudios apagados", "Ativação imediata e sigilosa"],
    preco: "R$ 67",
    precoAntigo: "R$ 127",
    parcela: "ou 12x de R$ 5,58",
    cta: "Quero tirar a dúvida",
    checkout: CHECKOUT_PRIMARIO,
  },
  {
    id: "stalker",
    nome: "Kit Stalker",
    tag: "Mais escolhido",
    descricao: "A escolha de quem quer ver TUDO: mensagens, ambiente e imagem.",
    imagem: "/kit-stalker.png",
    itens: [
      "Tudo do Kit Primário",
      "Caneta espiã com câmera oculta",
      "Câmera escondida via nuvem",
      "Monitoramento do ambiente 24h",
    ],
    preco: "R$ 129,90",
    precoAntigo: "R$ 249,90",
    parcela: "ou 12x de R$ 10,83",
    cta: "Descobrir agora",
    checkout: CHECKOUT_STALKER,
    destaque: true,
  },
  {
    id: "premium",
    nome: "Kit Premium",
    tag: "Prova completa",
    descricao: "O arsenal completo do investigador. Nada passa despercebido.",
    imagem: "/kit-premium.png",
    itens: [
      "Tudo dos kits anteriores",
      "Acesso completo ao celular",
      "Gravador de voz para o carro",
      "Câmera escondida para o carro",
      "Rastreador veicular em tempo real",
    ],
    preco: "R$ 197",
    precoAntigo: "R$ 397",
    parcela: "ou 12x de R$ 16,42",
    cta: "Quero a prova completa",
    checkout: CHECKOUT_PREMIUM,
  },
];

const SINAIS = [
  "Trocou a senha do celular do nada e não te conta mais",
  "Vira a tela pra baixo e sai da sala pra atender",
  "Vive apagando conversas e o histórico de chamadas",
  "Passou a dormir com o celular embaixo do travesseiro",
  "Ficou distante, frio e some por horas sem explicação",
  "Silencia as notificações assim que chega em casa",
];

const EQUIPAMENTOS = [
  { nome: "Caneta Espiã", imagem: "/equip-caneta.png", incluso: "Stalker · Premium" },
  { nome: "Câmera via Nuvem", imagem: "/equip-camera-nuvem.png", incluso: "Stalker · Premium" },
  { nome: "Gravador de Voz", imagem: "/equip-gravador.png", incluso: "Premium" },
  { nome: "Câmera para Carro", imagem: "/equip-camera-carro.png", incluso: "Premium" },
  { nome: "Rastreador Veicular", imagem: "/equip-rastreador.png", incluso: "Premium" },
  { nome: "Acesso ao Celular", imagem: "/equip-celular.png", incluso: "Premium" },
];

const PASSOS = [
  { n: "01", icon: "cart", t: "Escolha o seu kit", s: "Pagamento único e 100% sigiloso. Sem mensalidade, sem pegadinha." },
  { n: "02", icon: "bolt", t: "Ative em minutos", s: "Você recebe o passo a passo simples. Em poucos toques está tudo funcionando." },
  { n: "03", icon: "eye", t: "Veja tudo em tempo real", s: "Conversas, fotos, áudios e localização no seu painel privado, quando quiser." },
];

const DEPOIMENTOS = [
  { nome: "Mariana A.", cidade: "Curitiba · PR", texto: "Eu suspeitava há meses. Em uma noite eu tinha todas as provas na mão. Doeu, mas me libertou.", estrelas: 5 },
  { nome: "Carlos M.", cidade: "São Paulo · SP", texto: "Discrição total. Ativei sem ela perceber e finalmente entendi por que ela sumia à noite.", estrelas: 5 },
  { nome: "Roberto S.", cidade: "Belo Horizonte · MG", texto: "Achei que era paranoia minha. Não era. O rastreador mostrou onde ele realmente estava.", estrelas: 5 },
  { nome: "Juliana T.", cidade: "Rio de Janeiro · RJ", texto: "Suporte me acompanhou em cada passo. Parei de me torturar com achismos e vi a verdade.", estrelas: 5 },
];

const FAQ = [
  { q: "É realmente sigiloso? A pessoa vai desconfiar?", a: "Sim, é 100% discreto. A entrega chega em embalagem neutra e o seu painel de monitoramento é totalmente privado. Ninguém além de você tem acesso." },
  { q: "Funciona em qualquer celular, Android e iPhone?", a: "Funciona nos dois sistemas. Nossos equipamentos e ferramentas são compatíveis com os aparelhos mais usados no Brasil." },
  { q: "É pagamento único ou tem mensalidade?", a: "Pagamento único. Você paga uma vez e usa. Sem cobranças recorrentes, sem surpresas na fatura." },
  { q: "E se eu tiver dificuldade para usar?", a: "Nossa equipe especializada te acompanha no passo a passo. E você ainda conta com 7 dias de garantia para trocas e devoluções." },
];

const NAV = [
  { label: "Sinais", href: "#sinais" },
  { label: "Kits", href: "#kits" },
  { label: "Como funciona", href: "#como" },
  { label: "Dúvidas", href: "#faq" },
];

const GOLD = "#E4B45A";

/* -------------------------------- Componente ------------------------------- */

function DetetivesPage() {
  return (
    <div className="min-h-screen bg-[#070A10] font-sans text-[#F4F6FA] antialiased">
      {/* Barra de status */}
      <div className="border-b border-white/5 bg-black/40">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-x-6 gap-y-1 overflow-hidden px-4 py-2 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: GOLD }} /> Sistema online
          </span>
          <span className="hidden sm:inline">· Sigilo garantido</span>
          <span className="hidden xs:inline">· Ativação imediata</span>
          <span>· Entrega nacional</span>
        </div>
      </div>

      {/* Cabeçalho */}
      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#070A10]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <a href="#topo" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5" style={{ color: GOLD }}>
              <Icon name="shield" className="h-5 w-5" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-extrabold tracking-tight">DETECTIVE</span>
              <span className="block font-mono text-[9px] font-semibold uppercase tracking-[0.35em]" style={{ color: GOLD }}>Profissional</span>
            </span>
          </a>

          <nav className="hidden items-center gap-7 lg:flex">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="text-[13px] font-semibold text-slate-300 transition-colors hover:text-white">
                {item.label}
              </a>
            ))}
          </nav>

          <a
            href="#kits"
            className="inline-flex min-h-9 items-center gap-2 rounded-lg px-4 text-[12px] font-extrabold uppercase tracking-wide text-[#070A10] transition-transform active:scale-95"
            style={{ background: GOLD }}
          >
            <Icon name="lock" className="h-4 w-4" /> Descobrir
          </a>
        </div>
      </header>

      <main id="topo">
        {/* Hero */}
        <section
          className="relative overflow-hidden border-b border-white/8"
          style={{
            backgroundImage:
              "radial-gradient(120% 80% at 80% 0%, rgba(228,180,90,0.10), transparent 55%), linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "auto, 44px 44px, 44px 44px",
          }}
        >
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:py-20 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: GOLD }} /> Agência de investigação · +10 anos
              </span>

              <h1 className="mt-5 text-balance text-[2rem] font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
                A dúvida está te
                <span className="block">consumindo. A verdade</span>
                <span style={{ color: GOLD }}>está no celular dele(a).</span>
              </h1>

              <p className="mt-5 max-w-xl text-pretty text-[15px] leading-relaxed text-slate-300 sm:text-base">
                Mensagens que somem, celular sempre virado pra baixo, senha trocada e o
                {" "}“trabalhando até tarde” virou rotina. Enquanto você se pergunta o que
                está acontecendo, a resposta está a um clique de distância.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#kits"
                  className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-extrabold uppercase tracking-wide text-[#070A10] shadow-[0_10px_40px_-10px_rgba(228,180,90,0.6)] transition-transform active:scale-[0.98]"
                  style={{ background: GOLD }}
                >
                  Quero descobrir a verdade <Icon name="chevronRight" className="h-4 w-4" />
                </a>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl border border-white/15 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-white/5"
                >
                  <Icon name="whatsapp" className="h-4 w-4" style={{ color: GOLD }} /> Falar com um investigador
                </a>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                <span className="flex items-center gap-1.5">
                  <span className="flex" style={{ color: GOLD }}>
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Icon key={i} name="star" />
                    ))}
                  </span>
                  <span className="font-bold">4,9/5</span>
                </span>
                <span className="text-slate-400">1.842 investigações concluídas</span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Icon name="lock" className="h-4 w-4" style={{ color: GOLD }} /> Sigilo absoluto
                </span>
              </div>
            </div>

            {/* Imagem do hero com moldura HUD */}
            <div className="relative mx-auto w-full max-w-md">
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <img
                  src="/detetive-hero.png"
                  alt="Maleta profissional com equipamentos de investigação e monitoramento"
                  className="h-full w-full object-cover"
                />
                {/* Cantos HUD */}
                <span className="pointer-events-none absolute left-3 top-3 h-6 w-6 border-l-2 border-t-2" style={{ borderColor: GOLD }} />
                <span className="pointer-events-none absolute right-3 top-3 h-6 w-6 border-r-2 border-t-2" style={{ borderColor: GOLD }} />
                <span className="pointer-events-none absolute bottom-3 left-3 h-6 w-6 border-b-2 border-l-2" style={{ borderColor: GOLD }} />
                <span className="pointer-events-none absolute bottom-3 right-3 h-6 w-6 border-b-2 border-r-2" style={{ borderColor: GOLD }} />
                <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-slate-300 backdrop-blur">
                  <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full align-middle" style={{ background: GOLD }} /> Monitorando
                </span>
              </div>
              <div className="absolute -right-2 -top-3 rounded-xl px-4 py-2.5 text-center text-[#070A10] shadow-lg" style={{ background: GOLD }}>
                <div className="text-lg font-extrabold leading-none">+10.000</div>
                <div className="font-mono text-[9px] font-bold uppercase tracking-wide">casos atendidos</div>
              </div>
            </div>
          </div>
        </section>

        {/* Agitação — sinais de traição */}
        <section id="sinais" className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em]" style={{ color: "#FF5B52" }}>
              Reconhece algum destes sinais?
            </span>
            <h2 className="mt-3 text-balance text-2xl font-extrabold leading-tight sm:text-4xl">
              Seu instinto vem gritando. Só falta a prova.
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-400">
              Quem não deve, não muda o comportamento do nada. Veja os sinais que apareceram
              em mais de 10.000 investigações reais.
            </p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {SINAIS.map((s) => (
              <div
                key={s}
                className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-4"
              >
                <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md" style={{ background: "rgba(255,91,82,0.12)", color: "#FF5B52" }}>
                  <Icon name="alert" className="h-4 w-4" />
                </span>
                <span className="text-[14px] leading-snug text-slate-200">{s}</span>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-8 max-w-2xl rounded-xl border border-white/8 bg-white/[0.03] p-5 text-center">
            <p className="text-[15px] leading-relaxed text-slate-200">
              <span className="font-bold text-white">Marcou 2 ou mais?</span> Então você já sabe a resposta.
              Continuar na dúvida só machuca mais. Chegou a hora de ter a{" "}
              <span className="font-bold" style={{ color: GOLD }}>certeza</span>.
            </p>
            <a
              href="#kits"
              className="mt-4 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 text-sm font-extrabold uppercase tracking-wide text-[#070A10] transition-transform active:scale-[0.98]"
              style={{ background: GOLD }}
            >
              Ver como descobrir <Icon name="chevronRight" className="h-4 w-4" />
            </a>
          </div>
        </section>

        {/* Kits */}
        <section id="kits" className="border-y border-white/8 bg-white/[0.02]">
          <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em]" style={{ color: GOLD }}>
                Escolha o seu nível de investigação
              </span>
              <h2 className="mt-3 text-2xl font-extrabold leading-tight sm:text-4xl">Kits de investigação</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-slate-400">
                Pagamento único. Ativação imediata. Sigilo absoluto do começo ao fim.
              </p>
            </div>

            <div className="mt-10 grid items-start gap-5 lg:grid-cols-3">
              {KITS.map((kit) => (
                <article
                  key={kit.id}
                  className={`relative flex flex-col overflow-hidden rounded-2xl border bg-[#0C111A] ${
                    kit.destaque ? "shadow-[0_24px_70px_-30px_rgba(228,180,90,0.8)] lg:-mt-3 lg:mb-3" : "border-white/8"
                  }`}
                  style={kit.destaque ? { borderColor: GOLD } : undefined}
                >
                  {kit.destaque && (
                    <div className="py-1.5 text-center font-mono text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#070A10]" style={{ background: GOLD }}>
                      ★ Escolha de 7 em cada 10 clientes
                    </div>
                  )}

                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/30">
                    <img src={kit.imagem || "/placeholder.svg"} alt={`${kit.nome} - equipamentos de investigação`} className="h-full w-full object-cover" />
                    <span className="absolute left-3 top-3 rounded-md border border-white/10 bg-black/60 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-slate-200 backdrop-blur">
                      {kit.tag}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-lg font-extrabold tracking-tight">{kit.nome}</h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-slate-400">{kit.descricao}</p>

                    <ul className="mt-4 space-y-2 text-[13px]">
                      {kit.itens.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-slate-200">
                          <span className="mt-0.5" style={{ color: GOLD }}><Icon name="check" className="h-4 w-4" /></span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto pt-6">
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono text-sm text-slate-500 line-through">{kit.precoAntigo}</span>
                        <span className="rounded px-1.5 py-0.5 font-mono text-[10px] font-bold" style={{ background: "rgba(228,180,90,0.15)", color: GOLD }}>
                          Oferta de hoje
                        </span>
                      </div>
                      <div className="mt-0.5 text-3xl font-extrabold tracking-tight">{kit.preco}</div>
                      <div className="text-xs text-slate-500">{kit.parcela}</div>
                      <button
                        onClick={() => goToCheckout(kit.checkout)}
                        className={`mt-4 flex w-full min-h-13 items-center justify-center gap-2 rounded-xl text-sm font-extrabold uppercase tracking-wide transition-all active:scale-[0.98] ${
                          kit.destaque ? "text-[#070A10]" : "border border-white/15 text-white hover:bg-white/5"
                        }`}
                        style={kit.destaque ? { background: GOLD } : undefined}
                      >
                        {kit.cta} <Icon name="chevronRight" className="h-4 w-4" />
                      </button>
                      <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                        <Icon name="lock" className="h-3.5 w-3.5" /> Compra sigilosa e protegida
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Como funciona */}
        <section id="como" className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em]" style={{ color: GOLD }}>
              Simples como deveria ser
            </span>
            <h2 className="mt-3 text-2xl font-extrabold leading-tight sm:text-4xl">Da dúvida à prova em 3 passos</h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {PASSOS.map((p) => (
              <div key={p.n} className="relative rounded-2xl border border-white/8 bg-white/[0.03] p-6">
                <span className="absolute right-5 top-4 font-mono text-3xl font-extrabold text-white/8">{p.n}</span>
                <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5" style={{ color: GOLD }}>
                  <Icon name={p.icon} className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-base font-extrabold">{p.t}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-slate-400">{p.s}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Equipamentos */}
        <section id="equipamentos" className="border-y border-white/8 bg-white/[0.02]">
          <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em]" style={{ color: GOLD }}>
                Arsenal profissional
              </span>
              <h2 className="mt-3 text-2xl font-extrabold leading-tight sm:text-4xl">Equipamentos que compõem os kits</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-slate-400">
                As mesmas ferramentas usadas por investigadores particulares — agora na sua mão.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {EQUIPAMENTOS.map((eq) => (
                <div key={eq.nome} className="group rounded-xl border border-white/8 bg-[#0C111A] p-3 text-center transition-colors hover:border-white/20">
                  <div className="aspect-square w-full overflow-hidden rounded-lg bg-black/30">
                    <img src={eq.imagem || "/placeholder.svg"} alt={eq.nome} className="h-full w-full object-contain p-2 transition-transform group-hover:scale-105" />
                  </div>
                  <div className="mt-2.5 text-[12px] font-bold leading-tight">{eq.nome}</div>
                  <div className="mt-1 font-mono text-[9px] font-semibold uppercase tracking-wide" style={{ color: GOLD }}>{eq.incluso}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Depoimentos */}
        <section className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em]" style={{ color: GOLD }}>
              Histórias reais
            </span>
            <h2 className="mt-3 text-2xl font-extrabold leading-tight sm:text-4xl">Eles pararam de viver na dúvida</h2>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {DEPOIMENTOS.map((d) => (
              <figure key={d.nome} className="flex flex-col rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                <div className="flex" style={{ color: GOLD }}>
                  {Array.from({ length: d.estrelas }).map((_, i) => (
                    <Icon key={i} name="star" />
                  ))}
                </div>
                <blockquote className="mt-3 flex-1 text-[13px] leading-relaxed text-slate-200">{`“${d.texto}”`}</blockquote>
                <figcaption className="mt-4 flex items-center gap-3 border-t border-white/8 pt-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-bold" style={{ color: GOLD }}>
                    {d.nome.charAt(0)}
                  </span>
                  <span>
                    <span className="block text-[13px] font-bold">{d.nome}</span>
                    <span className="block font-mono text-[10px] uppercase tracking-wide text-slate-500">{d.cidade}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* Garantia */}
        <section className="border-y border-white/8 bg-white/[0.02]">
          <div className="mx-auto grid max-w-6xl gap-4 px-4 py-12 md:grid-cols-3">
            {[
              { icon: "shield", t: "Garantia de 7 dias", s: "Não gostou? Devolvemos. Sem burocracia, sem perguntas." },
              { icon: "lock", t: "Sigilo absoluto", s: "Entrega neutra e painel privado. Ninguém fica sabendo." },
              { icon: "bolt", t: "Ativação imediata", s: "Comprou, ativou. Você começa a ver hoje mesmo." },
            ].map((g) => (
              <div key={g.t} className="flex items-start gap-4 rounded-2xl border border-white/8 bg-[#0C111A] p-5">
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5" style={{ color: GOLD }}>
                  <Icon name={g.icon} className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-sm font-extrabold">{g.t}</div>
                  <div className="mt-0.5 text-[12px] leading-relaxed text-slate-400">{g.s}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-3xl px-4 py-14 md:py-20">
          <div className="text-center">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em]" style={{ color: GOLD }}>
              Antes de você perguntar
            </span>
            <h2 className="mt-3 text-2xl font-extrabold leading-tight sm:text-4xl">Dúvidas frequentes</h2>
          </div>

          <div className="mt-8 space-y-3">
            {FAQ.map((f) => (
              <details key={f.q} className="group rounded-xl border border-white/8 bg-white/[0.03] p-4 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-3 text-[14px] font-bold text-white">
                  {f.q}
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-white/10 text-slate-400 transition-transform group-open:rotate-45" style={{ color: GOLD }}>
                    +
                  </span>
                </summary>
                <p className="mt-3 text-[13px] leading-relaxed text-slate-400">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA final */}
        <section className="px-4 pb-20 pt-2">
          <div
            className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-white/10 p-8 text-center md:p-12"
            style={{
              backgroundImage: "radial-gradient(100% 120% at 50% 0%, rgba(228,180,90,0.14), transparent 60%)",
              backgroundColor: "#0C111A",
            }}
          >
            <h2 className="text-balance text-2xl font-extrabold leading-tight sm:text-4xl">
              A verdade não vai chegar sozinha.
              <span className="block" style={{ color: GOLD }}>Você precisa ir atrás dela.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-slate-300">
              Cada dia na dúvida é mais uma noite de sono perdida. Escolha o seu kit e tenha,
              ainda hoje, a resposta que você tanto procura.
            </p>
            <a
              href="#kits"
              className="mt-7 inline-flex min-h-13 items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-sm font-extrabold uppercase tracking-wide text-[#070A10] shadow-[0_10px_40px_-10px_rgba(228,180,90,0.7)] transition-transform active:scale-[0.98]"
              style={{ background: GOLD }}
            >
              Quero descobrir agora <Icon name="chevronRight" className="h-4 w-4" />
            </a>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 font-mono text-[10px] uppercase tracking-wide text-slate-500">
              <span>Pagamento único</span>
              <span>· Garantia 7 dias</span>
              <span>· Sigilo absoluto</span>
            </div>
          </div>
        </section>
      </main>

      {/* Rodapé */}
      <footer id="contato" className="border-t border-white/8 bg-black/40">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5" style={{ color: GOLD }}>
                <Icon name="shield" className="h-5 w-5" />
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-extrabold text-white">DETECTIVE</span>
                <span className="block font-mono text-[9px] font-semibold uppercase tracking-[0.35em]" style={{ color: GOLD }}>Profissional</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-slate-400">
              Referência nacional em investigação particular há mais de 10 anos. Discrição,
              tecnologia e resultado para quem precisa da verdade.
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-white/5"
            >
              <Icon name="whatsapp" className="h-4 w-4" style={{ color: GOLD }} /> (11) 99999-9999
            </a>
          </div>

          <div>
            <div className="font-mono text-[11px] font-bold uppercase tracking-widest text-white">Navegação</div>
            <ul className="mt-4 space-y-2 text-[13px] text-slate-400">
              {NAV.map((l) => (
                <li key={l.href}><a href={l.href} className="transition-colors hover:text-white">{l.label}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <div className="font-mono text-[11px] font-bold uppercase tracking-widest text-white">Pagamento</div>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Pix", "Visa", "Master", "Elo", "Boleto"].map((p) => (
                <span key={p} className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[10px] font-bold text-slate-300">{p}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-white/8">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-center font-mono text-[10px] uppercase tracking-wide text-slate-600 md:flex-row md:text-left">
            <span>© {new Date().getFullYear()} Detective Profissional</span>
            <span>Uso das ferramentas sob responsabilidade do contratante, conforme a legislação vigente.</span>
          </div>
        </div>
      </footer>

      {/* CTA fixo no mobile */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#070A10]/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-3">
          <div className="leading-tight">
            <div className="font-mono text-[9px] uppercase tracking-wide text-slate-500">Kit Stalker · mais escolhido</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold text-white">R$ 129,90</span>
              <span className="font-mono text-[11px] text-slate-500 line-through">R$ 249,90</span>
            </div>
          </div>
          <button
            onClick={() => goToCheckout(CHECKOUT_STALKER)}
            className="ml-auto flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-[13px] font-extrabold uppercase tracking-wide text-[#070A10] transition-transform active:scale-[0.98]"
            style={{ background: GOLD }}
          >
            Descobrir agora
          </button>
        </div>
      </div>
      {/* Espaçador para o CTA fixo não cobrir o rodapé */}
      <div className="h-20 lg:hidden" aria-hidden />
    </div>
  );
}
