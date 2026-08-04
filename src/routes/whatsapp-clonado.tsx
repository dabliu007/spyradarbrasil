import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";

const searchSchema = z.object({
  phone: z.coerce.string().optional().default(""),
  sex: z.enum(["M", "F"]).optional().default("M"),
});

export const Route = createFileRoute("/whatsapp-clonado")({
  head: () => ({
    meta: [
      { title: "WhatsApp Clonado — ZapRadar" },
      {
        name: "description",
        content:
          "Visualização do WhatsApp clonado do alvo investigado pelo ZapRadar.",
      },
      { property: "og:title", content: "WhatsApp Clonado — ZapRadar" },
      { property: "og:url", content: "https://zapradar.online/whatsapp-clonado" },
      { name: "robots", content: "noindex,follow" },
    ],
    links: [{ rel: "canonical", href: "https://zapradar.online/whatsapp-clonado" }],
  }),
  validateSearch: (s) => searchSchema.parse(s),
  component: WhatsAppClonadoPage,
});

type Chat = {
  id: string;
  name: string;
  avatar: string; // foto real (borrada na UI)
  preview: string;
  time: string;
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

const CHATS: Chat[] = [
  { id: "1", name: "Amor da minha vida ❤️", avatar: av(47), preview: "Apaga essa conversa agora, tô com medo…", time: "23:47", unread: 12, pinned: true, hot: true },
  { id: "2", name: "Contato sem nome", avatar: av(13), preview: "Hoje à noite mesmo endereço?", time: "23:12", unread: 7, hot: true },
  { id: "3", name: "Reunião especial", avatar: av(32), preview: "Foto", time: "22:58", unread: 3, hot: true, isMedia: "photo" },
  { id: "4", name: "Personal — Academia", avatar: av(15), preview: "Mensagem de voz (0:42)", time: "21:30", unread: 2, isMedia: "audio" },
  { id: "5", name: "Amigos do rolê", avatar: av(8), preview: "~ Léo: bora hoje? a mina liberou…", time: "20:11", unread: 24, hot: true, isGroup: true },
  { id: "6", name: "Motorista (Uber)", avatar: av(11), preview: "Cheguei no local de sempre", time: "19:47", sentByMe: true, read: true },
  { id: "7", name: "Hotel Reservas", avatar: av(22), preview: "Sua reserva foi confirmada", time: "Ontem", unread: 1, hot: true },
  { id: "8", name: "Mãe", avatar: av(5), preview: "Filho(a), tá tudo bem?", time: "Ontem", muted: true, sentByMe: true, read: true },
  { id: "9", name: "Match (Tinder)", avatar: av(49), preview: "Adorei ontem 😈", time: "Ontem", unread: 5, hot: true },
  { id: "10", name: "iFood", avatar: av(60), preview: "Seu pedido foi entregue", time: "Qua", muted: true, sentByMe: true, read: true },
  { id: "11", name: "Match (Bumble)", avatar: av(44), preview: "Quando a gente se vê de novo?", time: "Ter", unread: 4, hot: true },
  { id: "12", name: "Banco", avatar: av(68), preview: "PIX enviado para conta desconhecida", time: "Seg", muted: true },
];


function DoubleCheck({ read }: { read?: boolean }) {
  return (
    <svg
      viewBox="0 0 16 11"
      className={`w-4 h-3 shrink-0 ${read ? "text-sky-400" : "text-slate-400"}`}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M11.071.653a.5.5 0 0 1 .076.704l-6 7.5a.5.5 0 0 1-.74.037L1.464 5.95a.5.5 0 1 1 .708-.707l2.557 2.557L10.367.729a.5.5 0 0 1 .704-.076z" />
      <path d="M15.071.653a.5.5 0 0 1 .076.704l-6 7.5a.5.5 0 0 1-.74.037l-.853-.853a.5.5 0 1 1 .708-.707l.467.467L14.367.729a.5.5 0 0 1 .704-.076z" />
    </svg>
  );
}

function MediaIcon({ type }: { type: NonNullable<Chat["isMedia"]> }) {
  const map = {
    photo: { icon: "📷", label: "Foto" },
    video: { icon: "🎥", label: "Vídeo" },
    audio: { icon: "🎤", label: "Áudio" },
    doc: { icon: "📄", label: "Documento" },
  } as const;
  const { icon } = map[type];
  return <span className="text-slate-400 mr-1">{icon}</span>;
}

function WhatsAppClonadoPage() {
  const { phone, sex } = Route.useSearch();
  const navigate = useNavigate();
  const [paywall, setPaywall] = useState<Chat | null>(null);
  const [filter, setFilter] = useState<"Tudo" | "Não lidas" | "Favoritas" | "Grupos">("Tudo");

  const displayPhone = phone || "+55 11 9 0000-0000";
  const totalUnread = CHATS.reduce((a, c) => a + (c.unread || 0), 0);

  const filtered = CHATS.filter((c) => {
    if (filter === "Não lidas") return !!c.unread;
    if (filter === "Favoritas") return !!c.pinned;
    if (filter === "Grupos") return !!c.isGroup;
    return true;
  });

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#efeae2] text-slate-900 font-['Inter',sans-serif]">
      {/* Topbar estilo WhatsApp */}
      <header className="sticky top-0 z-30 bg-[#202c33] shadow-[0_1px_0_rgba(0,0,0,0.4)]">
        <div className="max-w-md mx-auto px-3 py-2.5 flex items-center gap-3">
          <Link
            to="/relatorio"
            search={{ phone, sex, paid: 0 }}
            className="text-slate-700 hover:text-slate-900 p-1.5 -ml-1 rounded-full hover:bg-white/5"
            aria-label="Voltar"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-[17px] font-medium leading-tight truncate text-slate-900">
              WhatsApp
            </h1>
            <div className="text-[11px] text-[#128C7E] leading-tight flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              clone ativo · {displayPhone}
            </div>
          </div>
          <button className="p-2 text-slate-500 hover:bg-white/5 rounded-full" aria-label="Buscar">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27a6.471 6.471 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.471 6.471 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
          </button>
          <button className="p-2 text-slate-500 hover:bg-white/5 rounded-full" aria-label="Mais">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </button>
        </div>

        {/* Aviso clone ativo */}
        <div className="bg-emerald-600/15 border-t border-emerald-100">
          <div className="max-w-md mx-auto px-4 py-1.5 flex items-center gap-2 text-[11px] text-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium tracking-wide">
              espelhamento ativo · {totalUnread} mensagens não lidas
            </span>
          </div>
        </div>
      </header>

      {/* Filtros */}
      <div
        className="max-w-md mx-auto px-3 pt-3 pb-2 flex gap-2 overflow-x-auto"
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
              className={`text-[13px] px-3 py-1 rounded-full whitespace-nowrap font-medium transition-colors ${
                active
                  ? "bg-emerald-600/25 text-[#25D366] border border-emerald-300"
                  : "bg-[#202c33] text-slate-500 border border-transparent hover:bg-[#2a3942]"
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
      <div className="max-w-md mx-auto px-4 pt-3 pb-1">
        <div className="flex items-center gap-2 rounded-lg border border-[#25D366]/30 bg-[#25D366]/10 px-3 py-2 text-[12px] text-[#25D366] font-medium">
          <span className="text-base leading-none">👆</span>
          <span>Clique na conversa para visualizar o conteúdo.</span>
        </div>
      </div>

      {/* Lista de conversas */}
      <main className="max-w-md mx-auto pb-32">
        {filtered.map((chat) => (
          <button
            key={chat.id}
            onClick={() => setPaywall(chat)}
            className="w-full flex items-center gap-3 pl-3 pr-4 py-2.5 hover:bg-white/[0.025] active:bg-white/[0.05] text-left transition-colors"
          >
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-[#374045]">
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
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-500 border-2 border-[#128C7E] animate-pulse" />
              )}
            </div>

            <div className="flex-1 min-w-0 border-b border-white/[0.05] pb-2.5">
              <div className="flex items-center justify-between gap-2">
                <span
                  className="text-[16px] font-normal text-slate-900 truncate select-none"
                  style={{ filter: "blur(4px)", WebkitUserSelect: "none" }}
                >
                  {chat.name}

                </span>
                <span
                  className={`text-[12px] shrink-0 ${
                    chat.unread ? "text-[#128C7E] font-medium" : "text-slate-400"
                  }`}
                >
                  {chat.time}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 mt-0.5">
                <span className="flex items-center min-w-0 text-[14px] text-slate-500">
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
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-slate-400" fill="currentColor">
                      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                    </svg>
                  )}
                  {chat.pinned && (
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-slate-400" fill="currentColor">
                      <path d="M16 9V4l1-1V2H7v1l1 1v5l-2 2v1h5v7l1 1 1-1v-7h5v-1l-2-2z" />
                    </svg>
                  )}
                  {chat.unread ? (
                    <span className="bg-emerald-500 text-slate-900 text-[11px] font-bold rounded-full min-w-5 h-5 px-1.5 grid place-items-center">
                      {chat.unread}
                    </span>
                  ) : null}
                </span>
              </div>
            </div>
          </button>
        ))}

        {/* Aviso final */}
        <div className="px-4 py-6 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <svg viewBox="0 0 24 24" className="w-3 h-3" fill="currentColor">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h2c0-1.66 1.34-3 3-3s3 1.34 3 3v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z" />
          </svg>
          Suas mensagens são criptografadas de ponta a ponta
        </div>
      </main>

      {/* Modal Paywall */}
      {paywall && (
        <div
          className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm grid place-items-center px-4 animate-in fade-in duration-200"
          onClick={() => setPaywall(null)}
        >
          <div
            className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPaywall(null)}
              className="absolute top-3 right-4 text-slate-400 hover:text-slate-900 text-xl"
              aria-label="Fechar"
            >
              ✕
            </button>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 border border-emerald-200 grid place-items-center text-3xl mb-3">
                🔒
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-700 font-bold">
                Licença ZapRadar necessária
              </div>
              <h2 className="mt-2 text-2xl font-extrabold leading-tight text-slate-900">
                Ative sua licença e acesse o <span className="text-emerald-600">celular clonado por 365 dias</span>
              </h2>
              <p className="mt-3 text-[13.5px] text-slate-700 leading-snug">
                O clone já está ativo. Para <strong>abrir as conversas, fotos e áudios</strong> em tempo real,
                é necessário ativar a <strong>Licença ZapRadar</strong> — válida por <strong>365 dias</strong>.
              </p>
            </div>

            <ul className="mt-4 space-y-1.5 text-[13px] text-slate-800">
              <li className="flex gap-2"><span className="text-[#128C7E] font-bold">✓</span> <span>Acesso completo ao celular clonado por <strong>365 dias</strong></span></li>
              <li className="flex gap-2"><span className="text-[#128C7E] font-bold">✓</span> <span>Mensagens, fotos e áudios — inclusive os apagados</span></li>
              <li className="flex gap-2"><span className="text-[#128C7E] font-bold">✓</span> <span>Espelhamento ao vivo 24h por dia</span></li>
            </ul>

            <button
              onClick={() => {
                setPaywall(null);
                navigate({ to: "/checkout", search: { phone, sex, amount: 197.00 } });

              }}
              className="mt-5 w-full h-14 bg-[#25D366] hover:bg-[#1eb959] text-white font-extrabold rounded-2xl transition-all active:scale-[0.98] shadow-[0_0_40px_-8px_rgba(16,185,129,0.8)] text-[15px] uppercase tracking-wide"
            >
              🔓 ATIVAR LICENÇA AGORA
            </button>
            <p className="text-center text-[11px] text-slate-500 mt-2">
              🔒 PIX R$ 197,00 · ativação em segundos · válido por 365 dias
            </p>
          </div>


        </div>
      )}
    </div>
  );
}
