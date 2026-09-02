import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/detetives")({
  head: () => ({
    meta: [
      { title: "Agência Vigília · Detetives Particulares há mais de 10 anos" },
      {
        name: "description",
        content:
          "Empresa especialista em investigação particular com mais de 10 anos de experiência. Kits profissionais de monitoramento: clonagem de WhatsApp, câmeras escondidas, rastreadores e mais.",
      },
      { name: "robots", content: "index,follow" },
      { property: "og:title", content: "Agência Vigília · Detetives Particulares" },
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

interface Kit {
  id: string;
  nome: string;
  tag: string;
  imagem: string;
  itens: string[];
  preco: string;
  precoNumero: number;
  checkout: string;
  destaque?: boolean;
}

const KITS: Kit[] = [
  {
    id: "primario",
    nome: "Kit Primário",
    tag: "Essencial",
    imagem: "/kit-primario.png",
    itens: ["Clonagem de WhatsApp"],
    preco: "R$ 67,00",
    precoNumero: 67,
    checkout: CHECKOUT_PRIMARIO,
  },
  {
    id: "stalker",
    nome: "Kit Stalker",
    tag: "Mais vendido",
    imagem: "/kit-stalker.png",
    itens: ["Clonagem de WhatsApp", "Caneta Espiã", "Câmera Escondida via Nuvem"],
    preco: "R$ 129,90",
    precoNumero: 129.9,
    checkout: CHECKOUT_STALKER,
    destaque: true,
  },
  {
    id: "premium",
    nome: "Kit Premium",
    tag: "Completo",
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
    precoNumero: 197,
    checkout: CHECKOUT_PREMIUM,
  },
];

function CheckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="flex-shrink-0"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function DetetivesPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Barra superior */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400 text-lg">
              🕵️
            </span>
            <div className="leading-tight">
              <div className="font-bold tracking-tight">Agência Vigília</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                Investigação Particular
              </div>
            </div>
          </div>
          <a
            href="#kits"
            className="hidden sm:inline-flex items-center rounded-full bg-amber-500 px-4 py-2 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-400"
          >
            Ver kits
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(245,158,11,0.12),_transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-24 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-300">
            +10 anos de experiência no mercado
          </span>
          <h1 className="mt-6 text-balance text-4xl md:text-6xl font-extrabold tracking-tight">
            Descubra a verdade com quem é{" "}
            <span className="text-amber-400">especialista em investigação</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base md:text-lg leading-relaxed text-slate-400">
            Somos uma empresa especializada em detetives particulares, com mais de uma década
            atuando com sigilo absoluto. Escolha o kit ideal e tenha em mãos as ferramentas
            profissionais de monitoramento.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
            <span className="flex items-center gap-2 text-amber-400">
              <CheckIcon /> Sigilo garantido
            </span>
            <span className="flex items-center gap-2 text-amber-400">
              <CheckIcon /> Suporte especializado
            </span>
            <span className="flex items-center gap-2 text-amber-400">
              <CheckIcon /> Ativação imediata
            </span>
          </div>
        </div>
      </section>

      {/* Kits */}
      <section id="kits" className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Escolha seu kit</h2>
          <p className="mt-3 text-slate-400">Ferramentas profissionais para cada nível de investigação.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 items-start">
          {KITS.map((kit) => (
            <article
              key={kit.id}
              className={`relative flex flex-col rounded-3xl border bg-slate-900/60 overflow-hidden transition-transform hover:-translate-y-1 ${
                kit.destaque
                  ? "border-amber-500/60 shadow-[0_0_50px_-12px_rgba(245,158,11,0.45)] md:scale-[1.03]"
                  : "border-slate-800"
              }`}
            >
              {kit.destaque && (
                <div className="absolute right-4 top-4 z-10 rounded-full bg-amber-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-950">
                  {kit.tag}
                </div>
              )}

              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950">
                <img
                  src={kit.imagem || "/placeholder.svg"}
                  alt={`${kit.nome} - equipamentos de investigação`}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
              </div>

              <div className="flex flex-1 flex-col p-6">
                {!kit.destaque && (
                  <span className="mb-2 inline-block w-fit rounded-full border border-slate-700 px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    {kit.tag}
                  </span>
                )}
                <h3 className="text-2xl font-extrabold tracking-tight">{kit.nome}</h3>

                <ul className="mt-5 space-y-3 text-sm">
                  {kit.itens.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-slate-300">
                      <span className="mt-0.5 text-amber-400">
                        <CheckIcon />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex flex-col gap-4 pt-2">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                      Pagamento único
                    </div>
                    <div
                      className={`text-4xl font-extrabold tracking-tight ${
                        kit.destaque ? "text-amber-400" : "text-slate-100"
                      }`}
                    >
                      {kit.preco}
                    </div>
                  </div>
                  <button
                    onClick={() => goToCheckout(kit.checkout)}
                    className={`w-full min-h-13 rounded-2xl py-3.5 text-[15px] font-extrabold uppercase tracking-wide transition-all active:scale-[0.98] ${
                      kit.destaque
                        ? "bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-[0_0_40px_-10px_rgba(245,158,11,0.9)]"
                        : "bg-slate-100 text-slate-950 hover:bg-white"
                    }`}
                  >
                    Comprar agora
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Faixa de confiança */}
      <section className="border-t border-slate-800 bg-slate-900/40">
        <div className="mx-auto max-w-6xl px-4 py-14 grid gap-8 md:grid-cols-3 text-center">
          <div>
            <div className="text-4xl font-extrabold text-amber-400">10+</div>
            <div className="mt-2 text-sm text-slate-400">Anos de experiência no mercado</div>
          </div>
          <div>
            <div className="text-4xl font-extrabold text-amber-400">100%</div>
            <div className="mt-2 text-sm text-slate-400">Sigilo e discrição em cada caso</div>
          </div>
          <div>
            <div className="text-4xl font-extrabold text-amber-400">24h</div>
            <div className="mt-2 text-sm text-slate-400">Ativação e suporte especializado</div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800">
        <div className="mx-auto max-w-6xl px-4 py-8 text-center text-xs text-slate-500">
          Agência Vigília · Investigação Particular. Uso das ferramentas sob responsabilidade do
          contratante, conforme a legislação vigente.
        </div>
      </footer>
    </div>
  );
}
