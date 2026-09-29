import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";

const searchSchema = z.object({
  phone: z.coerce.string().optional().default(""),
  sex: z.enum(["M", "F"]).optional().default("M"),
});

export const Route = createFileRoute("/whatsapp-clonado")({
  head: () => ({
    meta: [
      { title: "WhatsApp Clonado — SpyRadar Brasil" },
      {
        name: "description",
        content:
          "Visualização do WhatsApp clonado do alvo investigado pelo SpyRadar Brasil.",
      },
      { property: "og:title", content: "WhatsApp Clonado — SpyRadar Brasil" },
      { property: "og:url", content: "https://clonawhats.com/whatsapp-clonado" },
      { name: "robots", content: "noindex,follow" },
    ],
    links: [{ rel: "canonical", href: "https://clonawhats.com/whatsapp-clonado" }],
  }),
  validateSearch: (s) => searchSchema.parse(s),
  component: WhatsAppClonadoPage,
});

type Chat = {
  id: string;
  name: string;
  avatar: string; // foto real (borrada na UI)
  preview: string;
  minsAgo: number; // minutos atrás relativo ao horário de acesso do lead
  unread?: number;
  pinned?: boolean;
  hot?: boolean;
  muted?: boolean;
  sentByMe?: boolean; // shows ✓✓ in preview
  read?: boolean; // ✓✓ blue
  isGroup?: boolean;
  isMedia?: "photo" | "video" | "audio" | "doc";
};

// Fotos reais (i.pravatar) — exibidas borradas para preservar identidade
const av = (n: number) => `https://i.pravatar.cc/120?img=${n}`;

// minsAgo é calculado a partir do horário atual de acesso do lead
const CHATS: Chat[] = [
  { id: "1", name: "Amor da minha vida ❤️", avatar: av(47), preview: "Apaga essa conversa agora, tô com medo…", minsAgo: 2, unread: 12, pinned: true, hot: true },
  { id: "2", name: "Contato sem nome", avatar: av(13), preview: "Hoje à noite mesmo endereço?", minsAgo: 9, unread: 7, hot: true },
  { id: "3", name: "Reunião especial", avatar: av(32), preview: "Foto", minsAgo: 18, unread: 3, hot: true, isMedia: "photo" },
  { id: "4", name: "Personal — Academia", avatar: av(15), preview: "Mensagem de voz (0:42)", minsAgo: 41, unread: 2, isMedia: "audio" },
  { id: "5", name: "Amigos do rolê", avatar: av(8), preview: "~ Léo: bora hoje? a mina liberou…", minsAgo: 73, unread: 24, hot: true, isGroup: true },
  { id: "6", name: "Motorista (Uber)", avatar: av(11), preview: "Cheguei no local de sempre", minsAgo: 128, sentByMe: true, read: true },
  { id: "7", name: "Hotel Reservas", avatar: av(22), preview: "Sua reserva foi confirmada", minsAgo: 1500, unread: 1, hot: true },
  { id: "8", name: "Mãe", avatar: av(5), preview: "Filho(a), tá tudo bem?", minsAgo: 1620, muted: true, sentByMe: true, read: true },
  { id: "9", name: "Match (Tinder)", avatar: av(49), preview: "Adorei ontem 😈", minsAgo: 1710, unread: 5, hot: true },
  { id: "10", name: "iFood", avatar: av(60), preview: "Seu pedido foi entregue", minsAgo: 3000, muted: true, sentByMe: true, read: true },
  { id: "11", name: "Match (Bumble)", avatar: av(44), preview: "Quando a gente se vê de novo?", minsAgo: 4400, unread: 4, hot: true },
  { id: "12", name: "Banco", avatar: av(68), preview: "PIX enviado para conta desconhecida", minsAgo: 8000, muted: true },
];

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function useTimeLabeler() {
  // fixa o horário de acesso do lead no mount
  return useMemo(() => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    return (minsAgo: number) => {
      const d = new Date(now.getTime() - minsAgo * 60000);
      const diffDays = Math.floor((startOfDay(now) - startOfDay(d)) / 86400000);
      if (diffDays === 0) return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
      if (diffDays === 1) return "Ontem";
      if (diffDays < 7) return WEEKDAYS[d.getDay()];
      return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
    };
  }, []);
}

function DoubleCheck({ read }: { read?: boolean }) {
  return (
    <svg
      viewBox="0 0 16 11"
      className={`w-4 h-3 shrink-0 ${read ? "text-sky-400" : "text-slate-500"}`}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M11.071.653a.5.5 0 0 1 .076.704l-6 7.5a.5.5 0 0 1-.74.037L1.464 5.95a.5.5 0 1 1 .708-.707l2.557 2.557L10.367.729a.5.5 0 0 1 .704-.076z" />
      <path d="M15.071.653a.5.5 0 0 1 .076.704l-6 7.5a.5.5 0 0 1-.74.037l-.853-.853a.5.5 0 1 1 .708-.707l.467.467L14.367.729a.5.5 0 0 1 .704-.076z" />
    </svg>
  );
}

function MediaIcon({ type }: { type: NonNullable<Chat["isMedia"]> }) {
  const path = {
    photo:
      "M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z",
    video: "M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z",
    audio: "M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5-3c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z",
    doc: "M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z",
  } as const;
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 mr-1 shrink-0 text-slate-500" fill="currentColor" aria-hidden="true">
      <path d={path[type]} />
    </svg>
  );
}

function WhatsAppClonadoPage() {
  const { phone, sex } = Route.useSearch();
  const navigate = useNavigate();
  const [paywall, setPaywall] = useState<Chat | null>(null);
  const [filter, setFilter] = useState<"Tudo" | "Não lidas" | "Favoritas" | "Grupos">("Tudo");
  const timeLabel = useTimeLabeler();

  const displayPhone = phone || "+55 11 9 0000-0000";
  const totalUnread = CHATS.reduce((a, c) => a + (c.unread || 0), 0);

  const filtered = CHATS.filter((c) => {
    if (filter === "Não lidas") return !!c.unread;
    if (filter === "Favoritas") return !!c.pinned;
    if (filter === "Grupos") return !!c.isGroup;
    return true;
  });

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0b141a] text-slate-100 font-['Inter',sans-serif]">
      {/* Topbar estilo WhatsApp */}
      <header className="sticky top-0 z-30 bg-[#1f2c33] border-b border-black/40">
        <div className="max-w-md mx-auto px-3 py-2.5 flex items-center gap-2.5">
          <Link
            to="/relatorio"
            search={{ phone, sex, paid: 0 }}
            className="text-slate-200 p-1.5 -ml-1 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Voltar"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-[17px] font-semibold leading-tight truncate">Conversas</h1>
            <div className="text-[11px] leading-tight flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="truncate">clone ativo · {displayPhone}</span>
            </div>
          </div>
          <button className="p-2 text-slate-300 hover:bg-white/10 rounded-full transition-colors" aria-label="Câmera">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zM9 2 7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" />
            </svg>
          </button>
          <button className="p-2 text-slate-300 hover:bg-white/10 rounded-full transition-colors" aria-label="Mais">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </button>
        </div>

        {/* Aviso clone ativo */}
        <div className="bg-emerald-500/10 border-t border-emerald-500/20">
          <div className="max-w-md mx-auto px-4 py-1.5 flex items-center gap-2 text-[11px] text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium tracking-wide">
              espelhamento ativo · {totalUnread} mensagens não lidas
            </span>
          </div>
        </div>
      </header>

      {/* Banner: Dispositivo Emparelhado */}
      <div className="max-w-md mx-auto px-3 pt-3">
        <div className="rounded-2xl overflow-hidden border border-yellow-500/30 shadow-[0_0_40px_-12px_rgba(217,169,40,0.6)]">
          <img
            src="/images/dispositivo-emparelhado.png"
            alt="Dispositivo emparelhado — para desbloquear as conversas é necessário ser assinante do Spy Radar Brasil"
            loading="eager"
            className="w-full h-auto block select-none"
            draggable={false}
          />
        </div>
      </div>

      {/* Filtros */}
      <div
        className="max-w-md mx-auto px-3 pt-3 pb-1 flex gap-2 overflow-x-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {(["Tudo", "Não lidas", "Favoritas", "Grupos"] as const).map((t) => {
          const active = filter === t;
          const count =
            t === "Não lidas"
              ? CHATS.filter((c) => c.unread).length
              : t === "Favoritas"
              ? CHATS.filter((c) => c.pinned).length
              : t === "Grupos"
              ? CHATS.filter((c) => c.isGroup).length
              : 0;
          return (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`text-[13px] px-3.5 py-1.5 rounded-full whitespace-nowrap font-medium transition-colors ${
                active
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-[#1f2c33] text-slate-400 border border-transparent hover:bg-[#2a3942]"
              }`}
            >
              {t}
              {count > 0 && t !== "Tudo" && (
                <span className="ml-1.5 text-[10px] opacity-80">{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Aviso de interação */}
      <div className="max-w-md mx-auto px-3 pt-2 pb-1">
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-[12px] text-emerald-300 font-medium">
          <span className="text-base leading-none">👆</span>
          <span>Toque em uma conversa para visualizar o conteúdo.</span>
        </div>
      </div>

      {/* Lista de conversas */}
      <main className="max-w-md mx-auto pb-32 pt-1">
        {filtered.map((chat) => (
          <button
            key={chat.id}
            onClick={() => setPaywall(chat)}
            className="w-full flex items-center gap-3 pl-3 pr-3 py-2.5 hover:bg-white/[0.04] active:bg-white/[0.07] text-left transition-colors"
          >
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-[#2a3942]">
                <img
                  src={chat.avatar}
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover select-none pointer-events-none"
                  style={{ filter: "blur(8px)", transform: "scale(1.2)" }}
                  draggable={false}
                />
              </div>
              {chat.hot && (
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-500 border-2 border-[#0b141a] animate-pulse" />
              )}
            </div>

            <div className="flex-1 min-w-0 border-b border-white/[0.06] pb-2.5">
              <div className="flex items-center justify-between gap-2">
                <span
                  className="text-[16px] font-normal text-slate-100 truncate select-none"
                  style={{ filter: "blur(4px)", WebkitUserSelect: "none" }}
                >
                  {chat.name}
                </span>
                <span
                  className={`text-[12px] shrink-0 ${
                    chat.unread ? "text-emerald-400 font-medium" : "text-slate-500"
                  }`}
                >
                  {timeLabel(chat.minsAgo)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 mt-0.5">
                <span className="flex items-center min-w-0 text-[14px] text-slate-400">
                  {chat.sentByMe && (
                    <span className="mr-1 shrink-0">
                      <DoubleCheck read={chat.read} />
                    </span>
                  )}
                  {chat.isMedia && <MediaIcon type={chat.isMedia} />}
                  <span
                    className="truncate select-none"
                    style={{ filter: "blur(5px)", WebkitUserSelect: "none" }}
                  >
                    {chat.preview}
                  </span>
                </span>
                <span className="flex items-center gap-1.5 shrink-0">
                  {chat.muted && (
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-slate-500" fill="currentColor">
                      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                    </svg>
                  )}
                  {chat.pinned && (
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-slate-500" fill="currentColor">
                      <path d="M16 9V4l1-1V2H7v1l1 1v5l-2 2v1h5v7l1 1 1-1v-7h5v-1l-2-2z" />
                    </svg>
                  )}
                  {chat.unread ? (
                    <span className="bg-emerald-500 text-[#0b141a] text-[11px] font-bold rounded-full min-w-5 h-5 px-1.5 grid place-items-center">
                      {chat.unread}
                    </span>
                  ) : null}
                </span>
              </div>
            </div>
          </button>
        ))}

        {/* Aviso final */}
        <div className="px-4 py-6 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <svg viewBox="0 0 24 24" className="w-3 h-3" fill="currentColor">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h2c0-1.66 1.34-3 3-3s3 1.34 3 3v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z" />
          </svg>
          Suas mensagens são criptografadas de ponta a ponta
        </div>
      </main>

      {/* Modal Paywall */}
      {paywall && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center px-4 animate-in fade-in duration-200"
          onClick={() => setPaywall(null)}
        >
          <div
            className="w-full max-w-sm bg-[#111b21] border border-white/10 rounded-3xl p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPaywall(null)}
              className="absolute top-3 right-4 text-slate-400 hover:text-slate-100 text-xl"
              aria-label="Fechar"
            >
              ✕
            </button>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-yellow-500/10 border border-yellow-500/30 grid place-items-center text-3xl mb-3">
                🔒
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-yellow-500 font-bold">
                Licença SpyRadar Brasil necessária
              </div>
              <h2 className="mt-2 text-2xl font-extrabold leading-tight text-slate-50">
                Ative sua licença e acesse o <span className="text-yellow-500">celular clonado por 365 dias</span>
              </h2>
              <p className="mt-3 text-[13.5px] text-slate-300 leading-snug">
                O clone já está ativo. Para <strong className="text-slate-100">abrir as conversas, fotos e áudios</strong> em tempo real,
                é necessário ativar a <strong className="text-slate-100">Licença SpyRadar Brasil</strong> — válida por <strong className="text-slate-100">365 dias</strong>.
              </p>
            </div>

            <ul className="mt-4 space-y-1.5 text-[13px] text-slate-200">
              <li className="flex gap-2"><span className="text-emerald-400 font-bold">✓</span> <span>Acesso completo ao celular clonado por <strong>365 dias</strong></span></li>
              <li className="flex gap-2"><span className="text-emerald-400 font-bold">✓</span> <span>Mensagens, fotos e áudios — inclusive os apagados</span></li>
              <li className="flex gap-2"><span className="text-emerald-400 font-bold">✓</span> <span>Espelhamento ao vivo 24h por dia</span></li>
            </ul>

            <button
              onClick={() => {
                setPaywall(null);
                navigate({ to: "/checkout", search: { phone, sex, amount: 97.0 } });
              }}
              className="mt-5 w-full h-14 bg-emerald-500 hover:bg-emerald-400 text-[#0b141a] font-extrabold rounded-2xl transition-all active:scale-[0.98] shadow-[0_0_40px_-8px_rgba(217,169,40,0.8)] text-[15px] uppercase tracking-wide"
            >
              🔓 ATIVAR LICENÇA AGORA
            </button>
            <p className="text-center text-[11px] text-slate-400 mt-2">
                  🔒 PIX R$ 97,00 · ativação em segundos · válido por 365 dias
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
