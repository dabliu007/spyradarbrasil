import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import {
  ArrowLeft,
  Camera,
  Check,
  FileText,
  Lock,
  MapPin,
  Mic,
  MoreVertical,
  Pin,
  Search,
  ShieldCheck,
  Video,
  VolumeX,
  X,
} from "lucide-react";

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

type Media = "photo" | "video" | "audio" | "doc" | "location";

type Chat = {
  id: string;
  name: string;
  avatar: string;
  preview: string;
  minutesAgo: number;
  unread?: number;
  pinned?: boolean;
  hot?: boolean;
  muted?: boolean;
  sentByMe?: boolean;
  read?: boolean;
  isGroup?: boolean;
  media?: Media;
  typing?: boolean;
};

const av = (n: number) => `https://i.pravatar.cc/120?img=${n}`;

const CHATS: Chat[] = [
  { id: "1", name: "Amor da minha vida", avatar: av(47), preview: "Apaga essa conversa agora, tô com medo…", minutesAgo: 3, unread: 12, pinned: true, hot: true, typing: true },
  { id: "2", name: "Contato sem nome", avatar: av(13), preview: "Hoje à noite, mesmo endereço?", minutesAgo: 19, unread: 7, hot: true },
  { id: "3", name: "Reunião especial", avatar: av(32), preview: "Foto", minutesAgo: 48, unread: 3, hot: true, media: "photo" },
  { id: "4", name: "Personal Academia", avatar: av(15), preview: "Mensagem de voz (0:42)", minutesAgo: 112, unread: 2, media: "audio" },
  { id: "5", name: "Amigos do rolê", avatar: av(8), preview: "Léo: bora hoje? ela liberou…", minutesAgo: 176, unread: 24, hot: true, isGroup: true },
  { id: "6", name: "Motorista", avatar: av(11), preview: "Localização em tempo real", minutesAgo: 245, sentByMe: true, read: true, media: "location" },
  { id: "7", name: "Hotel Reservas", avatar: av(22), preview: "Sua reserva foi confirmada", minutesAgo: 390, unread: 1, hot: true, media: "doc" },
  { id: "8", name: "Mãe", avatar: av(5), preview: "Tá tudo bem? Não me respondeu", minutesAgo: 540, muted: true, sentByMe: true, read: true },
  { id: "9", name: "Match", avatar: av(49), preview: "Adorei ontem, quando repete?", minutesAgo: 60 * 26, unread: 5, hot: true },
  { id: "10", name: "Contato apagado", avatar: av(44), preview: "Vídeo", minutesAgo: 60 * 31, unread: 4, hot: true, media: "video" },
  { id: "11", name: "iFood", avatar: av(60), preview: "Seu pedido foi entregue", minutesAgo: 60 * 52, muted: true },
  { id: "12", name: "Banco", avatar: av(68), preview: "PIX enviado para conta desconhecida", minutesAgo: 60 * 77, muted: true },
];

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function formatChatTime(now: Date, minutesAgo: number) {
  const date = new Date(now.getTime() - minutesAgo * 60_000);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const dayMs = 86_400_000;
  if (date.getTime() >= startOfToday) {
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }
  if (date.getTime() >= startOfToday - dayMs) return "Ontem";
  if (date.getTime() >= startOfToday - 6 * dayMs) return WEEKDAYS[date.getDay()];
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

const MEDIA_ICON: Record<Media, typeof Camera> = {
  photo: Camera,
  video: Video,
  audio: Mic,
  doc: FileText,
  location: MapPin,
};

function DoubleCheck({ read }: { read?: boolean }) {
  return (
    <span
      className={`relative inline-flex w-4 shrink-0 ${read ? "text-[#53bdeb]" : "text-[#8696a0]"}`}
      aria-label={read ? "Lida" : "Entregue"}
    >
      <Check className="size-3.5" strokeWidth={2.5} />
      <Check className="size-3.5 -ml-2.5" strokeWidth={2.5} />
    </span>
  );
}

type Filter = "Tudo" | "Não lidas" | "Favoritas" | "Grupos";
const FILTERS: Filter[] = ["Tudo", "Não lidas", "Favoritas", "Grupos"];

function WhatsAppClonadoPage() {
  const { phone, sex } = Route.useSearch();
  const navigate = useNavigate();
  const [paywall, setPaywall] = useState<Chat | null>(null);
  const [filter, setFilter] = useState<Filter>("Tudo");
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const displayPhone = phone || "+55 11 9 0000-0000";
  const totalUnread = CHATS.reduce((a, c) => a + (c.unread || 0), 0);
  const lastSeen = now
    ? now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : "";

  const filtered = CHATS.filter((c) => {
    if (filter === "Não lidas") return !!c.unread;
    if (filter === "Favoritas") return !!c.pinned;
    if (filter === "Grupos") return !!c.isGroup;
    return true;
  });

  const countFor = (f: Filter) =>
    f === "Não lidas"
      ? CHATS.filter((c) => c.unread).length
      : f === "Favoritas"
        ? CHATS.filter((c) => c.pinned).length
        : f === "Grupos"
          ? CHATS.filter((c) => c.isGroup).length
          : 0;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#111b21] text-[#e9edef] font-sans">
      <div className="mx-auto max-w-md">
        <header className="sticky top-0 z-30 bg-[#111b21]">
          <div className="flex items-center gap-2 px-2 pt-3 pb-1">
            <Link
              to="/relatorio"
              search={{ phone, sex, paid: 0 }}
              className="rounded-full p-2 text-[#aebac1] hover:bg-white/5"
              aria-label="Voltar ao relatório"
            >
              <ArrowLeft className="size-5" />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-[22px] font-semibold leading-tight tracking-tight">WhatsApp</h1>
            </div>
            <button className="rounded-full p-2 text-[#aebac1] hover:bg-white/5" aria-label="Câmera">
              <Camera className="size-5" />
            </button>
            <button className="rounded-full p-2 text-[#aebac1] hover:bg-white/5" aria-label="Mais opções">
              <MoreVertical className="size-5" />
            </button>
          </div>

          <div className="px-4 pb-2">
            <div className="flex items-center gap-2 rounded-full bg-[#202c33] px-4 py-2.5 text-[15px] text-[#8696a0]">
              <Search className="size-4 shrink-0" />
              <span className="truncate">Pesquisar</span>
            </div>
          </div>

          <div
            className="flex gap-2 overflow-x-auto px-4 pb-3"
            style={{ scrollbarWidth: "none" }}
            role="tablist"
            aria-label="Filtrar conversas"
          >
            {FILTERS.map((f) => {
              const active = filter === f;
              const count = countFor(f);
              return (
                <button
                  key={f}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(f)}
                  className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13.5px] font-medium transition-colors ${
                    active ? "bg-[#103529] text-[#d9fdd3]" : "bg-[#202c33] text-[#aebac1] hover:bg-[#2a3942]"
                  }`}
                >
                  {f}
                  {count > 0 && <span className="ml-1 opacity-70">{count}</span>}
                </button>
              );
            })}
          </div>
        </header>

        <div className="mx-4 mb-2 flex items-center gap-3 rounded-xl border border-[#25d366]/25 bg-[#25d366]/10 px-3 py-2.5">
          <span className="relative flex size-2.5 shrink-0">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#25d366] opacity-60" />
            <span className="relative inline-flex size-2.5 rounded-full bg-[#25d366]" />
          </span>
          <div className="min-w-0 text-[12.5px] leading-snug">
            <p className="font-semibold text-[#d9fdd3]">Espelhamento ativo · {displayPhone}</p>
            <p className="text-[#8696a0]">
              {totalUnread} mensagens não lidas{lastSeen && ` · sincronizado às ${lastSeen}`}
            </p>
          </div>
        </div>

        <p className="px-4 pb-1 pt-2 text-[12.5px] text-[#8696a0]">
          Toque em uma conversa para abrir o conteúdo.
        </p>

        <main className="pb-24">
          <ul>
            {filtered.map((chat) => {
              const MediaIcon = chat.media ? MEDIA_ICON[chat.media] : null;
              const time = now ? formatChatTime(now, chat.minutesAgo) : "";
              return (
                <li key={chat.id}>
                  <button
                    onClick={() => setPaywall(chat)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[#202c33] active:bg-[#2a3942]"
                  >
                    <div className="relative shrink-0">
                      <div className="size-12 overflow-hidden rounded-full bg-[#2a3942]">
                        <img
                          src={chat.avatar || "/placeholder.svg"}
                          alt=""
                          loading="lazy"
                          draggable={false}
                          className="pointer-events-none size-full scale-125 object-cover blur-[6px] select-none"
                        />
                      </div>
                      {chat.hot && (
                        <span className="absolute -right-0.5 -top-0.5 size-3 rounded-full border-2 border-[#111b21] bg-[#f15c6d]" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 border-b border-[#222d34] pb-2.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-[16.5px] text-[#e9edef] blur-[4px] select-none">
                          {chat.name}
                        </span>
                        <span
                          className={`shrink-0 text-[12px] tabular-nums ${
                            chat.unread ? "font-medium text-[#25d366]" : "text-[#8696a0]"
                          }`}
                        >
                          {time}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-1 text-[14px] text-[#8696a0]">
                          {chat.typing ? (
                            <span className="font-medium text-[#25d366]">digitando…</span>
                          ) : (
                            <>
                              {chat.sentByMe && <DoubleCheck read={chat.read} />}
                              {MediaIcon && <MediaIcon className="size-4 shrink-0" />}
                              <span className="truncate blur-[4px] select-none">{chat.preview}</span>
                            </>
                          )}
                        </span>
                        <span className="flex shrink-0 items-center gap-1.5 text-[#8696a0]">
                          {chat.muted && <VolumeX className="size-4" aria-label="Silenciada" />}
                          {chat.pinned && <Pin className="size-3.5 rotate-45" aria-label="Fixada" />}
                          {chat.unread ? (
                            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#25d366] px-1.5 text-[11px] font-bold text-[#111b21]">
                              {chat.unread}
                            </span>
                          ) : null}
                        </span>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>

          <p className="flex items-center justify-center gap-1.5 px-4 py-6 text-center text-[11.5px] text-[#8696a0]">
            <Lock className="size-3" />
            Suas mensagens pessoais são protegidas com a criptografia de ponta a ponta
          </p>
        </main>
      </div>

      {paywall && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#0b141a]/80 backdrop-blur-sm sm:items-center sm:px-4"
          onClick={() => setPaywall(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="paywall-title"
        >
          <div
            className="relative w-full max-w-md rounded-t-3xl border border-[#2a3942] bg-[#1f2c33] p-6 pb-8 shadow-2xl animate-in slide-in-from-bottom duration-300 sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPaywall(null)}
              className="absolute right-3 top-3 rounded-full p-2 text-[#8696a0] hover:bg-white/5"
              aria-label="Fechar"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="size-12 shrink-0 overflow-hidden rounded-full bg-[#2a3942]">
                <img
                  src={paywall.avatar || "/placeholder.svg"}
                  alt=""
                  className="size-full scale-125 object-cover blur-[6px]"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[15px] font-medium text-[#e9edef] blur-[4px] select-none">
                  {paywall.name}
                </p>
                <p className="text-[12.5px] text-[#25d366]">
                  {paywall.unread ? `${paywall.unread} mensagens novas` : "Conversa bloqueada"}
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#25d366]">
              <Lock className="size-3.5" />
              Licença Spy Radar necessária
            </div>
            <h2 id="paywall-title" className="mt-2 text-balance text-[22px] font-bold leading-tight text-[#e9edef]">
              Ative a licença para abrir esta conversa
            </h2>
            <p className="mt-2 text-pretty text-[14px] leading-relaxed text-[#aebac1]">
              O clone já está sincronizado. Com a Licença Spy Radar você abre conversas, fotos e áudios,
              inclusive os apagados, por 365 dias.
            </p>

            <ul className="mt-4 flex flex-col gap-2 text-[14px] text-[#e9edef]">
              {[
                "Acesso completo ao celular clonado por 365 dias",
                "Mensagens, fotos e áudios, inclusive apagados",
                "Espelhamento ao vivo 24h por dia",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-[#25d366]" strokeWidth={3} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex items-end justify-between rounded-2xl bg-[#111b21] px-4 py-3">
              <div>
                <p className="text-[12px] text-[#8696a0]">Pagamento único via PIX</p>
                <p className="text-[26px] font-bold leading-none text-[#e9edef]">R$ 97,00</p>
              </div>
              <p className="text-right text-[12px] leading-snug text-[#8696a0]">
                válida por
                <br />
                <span className="font-semibold text-[#e9edef]">365 dias</span>
              </p>
            </div>

            <button
              onClick={() => {
                setPaywall(null);
                navigate({ to: "/checkout", search: { phone, sex, amount: 97 } });
              }}
              className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#25d366] text-[15px] font-bold text-[#111b21] transition-transform hover:bg-[#1fbf5b] active:scale-[0.98]"
            >
              <Lock className="size-4" />
              Ativar licença e abrir conversa
            </button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-[12px] text-[#8696a0]">
              <ShieldCheck className="size-3.5" />
              Ativação em segundos · 100% anônimo
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
