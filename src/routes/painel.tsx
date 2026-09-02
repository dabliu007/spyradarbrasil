import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getWhatsAppProfilePicture } from "@/lib/wa-profile.functions";
import { useTargetName } from "@/lib/use-target-name";

const searchSchema = z.object({
  phone: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v == null ? "" : String(v))),
  sex: z.enum(["M", "F"]).optional().default("M"),
});

export const Route = createFileRoute("/painel")({
  head: () => ({
    meta: [
      { title: "Painel de Controle — ZapRadar" },
      {
        name: "description",
        content:
          "Painel do ZapRadar com localização em tempo real, fotos, mensagens apagadas, WhatsApp, Instagram e apps bancários do alvo investigado.",
      },
      { property: "og:title", content: "Painel de Controle — ZapRadar" },
      { property: "og:url", content: "https://clonawhats.com/painel" },
      { name: "robots", content: "noindex,follow" },
    ],
    links: [{ rel: "canonical", href: "https://clonawhats.com/painel" }],
  }),
  validateSearch: (s) => searchSchema.parse(s),
  component: PainelPage,
});

type ModuleKey =
  | "location"
  | "photos"
  | "deleted"
  | "whatsapp"
  | "instagram"
  | "banking"
  | "calls"
  | "contacts";

type NavItem = {
  key: ModuleKey | "dashboard";
  label: string;
  icon: React.ReactNode;
  badge?: number;
};

/* ---------- Icons (inline SVG, feather-style) ---------- */
const I = {
  dash: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v10h4v-6h6v6h4V10" />
    </svg>
  ),
  pin: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-6.2-7-11a7 7 0 1114 0c0 4.8-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" strokeLinecap="round" />
    </svg>
  ),
  users: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M13 7a4 4 0 11-8 0 4 4 0 018 0zM21 21v-2a4 4 0 00-3-3.87M17 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  msg: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 01-2 2H8l-5 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  ),
  phone: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.6a2 2 0 01-.5 2.1L8 9.6a16 16 0 006 6l1.2-1.2a2 2 0 012.1-.5c.8.3 1.7.5 2.6.6a2 2 0 011.7 2z" />
    </svg>
  ),
  photo: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 21" />
    </svg>
  ),
  trash: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
    </svg>
  ),
  wpp: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.52 3.48A11.9 11.9 0 0012.05 0C5.5 0 .2 5.3.2 11.86c0 2.09.55 4.13 1.6 5.93L0 24l6.4-1.68a11.83 11.83 0 005.65 1.44c6.55 0 11.85-5.3 11.85-11.86 0-3.17-1.23-6.15-3.4-8.42z" />
    </svg>
  ),
  ig: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  ),
  bank: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10l9-6 9 6M5 10v9h14v-9M9 19v-6M15 19v-6M12 19v-6" />
    </svg>
  ),
  bell: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0" />
    </svg>
  ),
  help: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.1 9a3 3 0 015.8 1c0 2-3 2.5-3 4.5M12 17.5h.01" />
    </svg>
  ),
  crown: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 7l4 4 5-6 5 6 4-4-2 12H5L3 7zm2.5 14h13v2h-13v-2z" />
    </svg>
  ),
  menu: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  ),
  close: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
    </svg>
  ),
};

function PainelPage() {
  const { phone, sex } = Route.useSearch();
  const navigate = useNavigate();
  const targetName = useTargetName();
  const [openModule, setOpenModule] = useState<ModuleKey | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await getWhatsAppProfilePicture({ data: { phone } });
        if (alive && res?.link) setPhotoUrl(res.link);
      } catch {}
    })();
    return () => {
      alive = false;
    };
  }, [phone]);

  const formattedPhone = useMemo(() => {
    const d = phone.replace(/\D/g, "");
    if (d.length !== 11) return phone || "—";
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }, [phone]);

  const nav: NavItem[] = [
    { key: "dashboard", label: "Dashboard", icon: I.dash },
    { key: "location", label: "Localização", icon: I.pin, badge: 3 },
    { key: "contacts", label: "Contatos", icon: I.users },
    { key: "deleted", label: "Mensagens", icon: I.msg, badge: 47 },
    { key: "calls", label: "Chamadas", icon: I.phone },
    { key: "photos", label: "Fotos & Mídia", icon: I.photo, badge: 12 },
    { key: "whatsapp", label: "WhatsApp", icon: I.wpp, badge: 28 },
    { key: "instagram", label: "Instagram", icon: I.ig, badge: 9 },
    { key: "banking", label: "Apps Bancários", icon: I.bank, badge: 7 },
  ];

  const goUpsell = () => {
    setOpenModule(null);
      navigate({
        to: "/checkout",
        search: { phone, sex, amount: 67.00 } as any,
      });
  };

  const activeKey = openModule;
  const activeLabel =
    nav.find((n) => n.key === openModule)?.label ?? "Detalhes";

  return (
    <div className="min-h-screen w-full bg-slate-100 text-slate-800 font-['Inter',sans-serif]">
      {/* Top bar */}
      <header className="bg-[#1f2937] text-white h-14 flex items-center px-3 sm:px-5 gap-3 sticky top-0 z-40 shadow-sm">
        <button
          className="lg:hidden p-1.5 -ml-1 rounded hover:bg-white/10"
          onClick={() => setSidebarOpen(true)}
          aria-label="menu"
        >
          {I.menu}
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-black text-white text-sm">
            Z
          </div>
          <span className="font-extrabold text-[15px] tracking-tight hidden sm:block">
            ZapRadar
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2 pl-3 ml-1 border-l border-white/10 text-[12px] text-white/70">
          <span>ID:</span>
          <span className="text-white font-mono">
            {(phone.replace(/\D/g, "") || "0000000").slice(-7)}
          </span>
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <button
            onClick={goUpsell}
            className="bg-emerald-500 hover:bg-emerald-400 text-white text-[11px] sm:text-[12px] font-bold px-3 sm:px-4 h-9 rounded-md flex items-center gap-1.5 shadow-sm"
          >
            {I.crown}
            <span className="hidden xs:inline sm:inline">DESBLOQUEAR TUDO</span>
            <span className="xs:hidden sm:hidden">PREMIUM</span>
          </button>
          <button className="hidden sm:flex text-white/70 hover:text-white p-1.5 rounded relative">
            {I.bell}
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-500" />
          </button>
          <button className="hidden sm:flex text-white/70 hover:text-white p-1.5 rounded">
            {I.help}
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={
            "bg-white border-r border-slate-200 w-64 shrink-0 flex-col fixed lg:static inset-y-0 left-0 top-0 lg:top-auto z-50 lg:z-auto transition-transform duration-200 " +
            (sidebarOpen ? "translate-x-0 flex" : "-translate-x-full lg:translate-x-0 lg:flex hidden lg:flex")
          }
          style={{ height: "calc(100vh)", top: 0 }}
        >
          {/* mobile close */}
          <div className="lg:hidden flex items-center justify-between h-14 px-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-emerald-500 flex items-center justify-center font-black text-white text-xs">
                Z
              </div>
              <span className="font-extrabold text-[14px]">ZapRadar</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="p-1">
              {I.close}
            </button>
          </div>

          {/* target pill */}
          <div className="p-4 border-b border-slate-100">
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-2">
              Alvo monitorado
            </div>
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-full bg-slate-200 overflow-hidden shrink-0">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt=""
                    className="w-full h-full object-cover"
                    style={{ filter: "blur(4px)" }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500">
                    {sex === "F" ? "👩" : "👨"}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-bold text-slate-800 truncate">
                  {targetName ?? "Alvo #1"}
                </div>
                <div className="text-[10px] text-slate-500 font-mono truncate">
                  +55 {formattedPhone}
                </div>
              </div>
              <span className="text-[9px] font-bold uppercase bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">
                on
              </span>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-3">
            <div className="px-4 pb-2 text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
              Recursos
            </div>
            {nav.map((item) => {
              const isDash = item.key === "dashboard";
              const active = isDash && !openModule;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    if (isDash) {
                      setOpenModule(null);
                    } else {
                      setOpenModule(item.key as ModuleKey);
                    }
                    setSidebarOpen(false);
                  }}
                  className={
                    "w-full flex items-center gap-3 px-4 py-2.5 text-[13px] transition-colors relative " +
                    (active
                      ? "text-emerald-600 bg-emerald-50 font-semibold border-l-[3px] border-emerald-500 pl-[13px]"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900")
                  }
                >
                  <span className={active ? "text-emerald-600" : "text-slate-500"}>
                    {item.icon}
                  </span>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge ? (
                    <span className="text-[10px] font-bold bg-rose-500 text-white rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          {/* Premium banner */}
          <div className="p-3 border-t border-slate-100">
            <button
              onClick={goUpsell}
              className="w-full rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-3 text-left shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center gap-2 mb-1">
                {I.crown}
                <span className="text-[11px] font-extrabold uppercase tracking-wider">
                  Upgrade Premium
                </span>
              </div>
              <p className="text-[11px] leading-snug text-emerald-50">
                Desbloqueie todos os módulos e monitore em tempo real.
              </p>
            </button>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/40 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main */}
        <main className="flex-1 min-w-0 p-3 sm:p-5 space-y-4">
          {/* Location card */}
          <Card
            title="Localização"
            action={
              <button
                onClick={() => setOpenModule("location")}
                className="text-emerald-600 hover:text-emerald-700 text-[11px] font-bold uppercase tracking-wider"
              >
                Ver tudo
              </button>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="space-y-3">
                <li className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                  {I.pin} Localização atual
                </li>
                {[
                  { p: "Motel Le Charme · Alphaville", t: "22:47", hot: true },
                  { p: "Rest. Figueira Rubaiyat, SP", t: "20:12" },
                  { p: "Av. Paulista, 1230 · Trabalho", t: "12:20" },
                ].map((l, i) => (
                  <li key={i} className="flex items-start gap-3 text-[12px]">
                    <span className={"mt-0.5 w-2 h-2 rounded-full shrink-0 " + (l.hot ? "bg-rose-500" : "bg-slate-300")} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-700 leading-tight blur-sm select-none">
                        {l.p}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Hoje · {l.t}
                      </div>
                    </div>
                    <span className="text-[9px] font-bold uppercase bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded shrink-0">
                      🔒
                    </span>
                  </li>
                ))}
              </ul>
              <div className="relative">
                <MiniMap />
                <div className="absolute inset-0 backdrop-blur-md bg-white/30 rounded-lg flex items-center justify-center">
                  <span className="text-[11px] font-bold uppercase bg-white/90 text-slate-700 px-3 py-1.5 rounded shadow-sm flex items-center gap-1.5">
                    🔒 Bloqueado
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Device info */}
            <Card title="Informações do dispositivo">
              <dl className="text-[12px] divide-y divide-slate-100">
                {[
                  ["Modelo", "iPhone 14 Pro"],
                  ["Sistema", "iOS 17.5.2"],
                  ["Operadora", "Vivo"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2">
                    <dt className="text-slate-500">{k}</dt>
                    <dd className="text-slate-800 font-medium font-mono text-[11px]">
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
            </Card>

            {/* Account */}
            <Card title="Conta">
              <div className="space-y-3 text-[12px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Plano</span>
                  <span className="bg-slate-200 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    Free trial
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Renovação automática</span>
                  <span className="w-9 h-5 bg-slate-200 rounded-full relative">
                    <span className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow" />
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Válido até</span>
                  <span className="text-slate-800 font-medium font-mono text-[11px]">
                    hoje, 23:59
                  </span>
                </div>
                <button
                  onClick={goUpsell}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-[12px] uppercase tracking-wider h-11 rounded-md mt-2 shadow-sm"
                >
                  Renovar / Fazer upgrade
                </button>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card
              title="Mais contatados (chamadas)"
              action={
                <button
                  onClick={() => setOpenModule("calls")}
                  className="text-emerald-600 hover:text-emerald-700 text-[11px] font-bold uppercase tracking-wider"
                >
                  Ver tudo
                </button>
              }
            >
              <TopList
                items={[
                  { name: "Amor ❤️", meta: "9 chamadas", pct: 100, color: "bg-emerald-500", hot: true, blur: true },
                  { name: "Contato sem nome", meta: "5 chamadas", pct: 60, color: "bg-emerald-400", hot: true, blur: true },
                  { name: "Personal", meta: "2 chamadas", pct: 25, color: "bg-emerald-300", blur: true },
                ]}
              />
            </Card>
            <Card
              title="Mais contatados (mensagens)"
              action={
                <button
                  onClick={() => setOpenModule("deleted")}
                  className="text-emerald-600 hover:text-emerald-700 text-[11px] font-bold uppercase tracking-wider"
                >
                  Ver tudo
                </button>
              }
            >
              <TopList
                items={[
                  { name: "Amor ❤️", meta: "128 msgs · 47 apagadas", pct: 100, color: "bg-rose-500", hot: true, blur: true },
                  { name: "Match (Tinder)", meta: "62 msgs", pct: 55, color: "bg-rose-400", hot: true, blur: true },
                  { name: "Contato sem nome", meta: "38 msgs", pct: 32, color: "bg-rose-300", blur: true },
                ]}
              />
            </Card>
          </div>

          {/* Galeria de fotos borradas */}
          <Card
            title="Galeria de fotos"
            action={
              <button
                onClick={() => setOpenModule("photos")}
                className="text-emerald-600 hover:text-emerald-700 text-[11px] font-bold uppercase tracking-wider"
              >
                Ver tudo
              </button>
            }
          >
            <div className="text-[12px] text-slate-600 mb-3">
              <span className="text-emerald-600 font-bold">184 arquivos</span> na pasta protegida ·{" "}
              <span className="text-amber-600 font-semibold">12 novos hoje</span>
            </div>
            <BlurredGallery sex={sex} />
            <button
              onClick={() => setOpenModule("photos")}
              className="mt-3 w-full text-[11px] font-bold uppercase tracking-wider text-emerald-600 hover:text-emerald-700 border border-emerald-200 hover:border-emerald-300 bg-emerald-50/40 rounded-md py-2.5"
            >
              🔓 Ver galeria completa
            </button>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Apps activity donut */}
            <Card title="Atividade nos apps">
              <div className="flex items-center gap-5">
                <DonutChart
                  segments={[
                    { v: 42, c: "#10b981" }, // WhatsApp
                    { v: 22, c: "#ec4899" }, // Instagram
                    { v: 18, c: "#f59e0b" }, // Tinder
                    { v: 10, c: "#0ea5e9" }, // Banks
                    { v: 8, c: "#94a3b8" }, // Others
                  ]}
                  centerLabel="6h 32m"
                  centerSub="hoje"
                />
                <ul className="flex-1 space-y-2 text-[12px]">
                  {[
                    { l: "WhatsApp", v: "42%", c: "#10b981" },
                    { l: "Instagram", v: "22%", c: "#ec4899" },
                    { l: "Tinder / Match", v: "18%", c: "#f59e0b" },
                    { l: "Apps bancários", v: "10%", c: "#0ea5e9" },
                    { l: "Outros", v: "8%", c: "#94a3b8" },
                  ].map((r) => (
                    <li key={r.l} className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: r.c }}
                      />
                      <span className="flex-1 text-slate-600">{r.l}</span>
                      <span className="text-slate-800 font-semibold font-mono">
                        {r.v}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>

            {/* Social apps */}
            <Card
              title="Redes sociais monitoradas"
              action={
                <button
                  onClick={() => setOpenModule("instagram")}
                  className="text-emerald-600 hover:text-emerald-700 text-[11px] font-bold uppercase tracking-wider"
                >
                  Ver tudo
                </button>
              }
            >
              <ul className="grid grid-cols-2 gap-2 text-[12px]">
                {[
                  { l: "WhatsApp", v: "28 chats", c: "#25D366", k: "whatsapp" as ModuleKey, icon: <SocialIcon.whatsapp /> },
                  { l: "Instagram", v: "9 DMs", c: "linear-gradient(135deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5)", k: "instagram" as ModuleKey, icon: <SocialIcon.instagram /> },
                  { l: "Tinder", v: "5 matches", c: "#FF6B6B", k: "instagram" as ModuleKey, icon: <SocialIcon.tinder /> },
                  { l: "TikTok", v: "37 vídeos", c: "#000000", k: "instagram" as ModuleKey, icon: <SocialIcon.tiktok /> },
                  { l: "Facebook", v: "12 msgs", c: "#1877F2", k: "instagram" as ModuleKey, icon: <SocialIcon.facebook /> },
                  { l: "Apps bancários", v: "R$ 1.270", c: "#8b5cf6", k: "banking" as ModuleKey, icon: <SocialIcon.bank /> },
                ].map((it) => (
                  <li key={it.l}>
                    <button
                      onClick={() => setOpenModule(it.k)}
                      className="w-full flex items-center gap-2.5 border border-slate-100 rounded-lg px-2.5 py-2 hover:border-emerald-300 hover:bg-emerald-50/30 transition"
                    >
                      <span
                        className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-white"
                        style={{ background: it.c }}
                      >
                        {it.icon}
                      </span>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="font-semibold text-slate-700 truncate">
                          {it.l}
                        </div>
                        <div className="text-[10px] text-slate-400">{it.v}</div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <footer className="text-center text-[10px] text-slate-400 py-4">
            zapradar_core v4.2 · sessão protegida · uso restrito ao contratante ·{" "}
            <span className="font-mono">{now.toLocaleTimeString("pt-BR")}</span>
          </footer>
        </main>
      </div>

      {/* Modal */}
      <Dialog open={!!activeKey} onOpenChange={(o) => !o && setOpenModule(null)}>
        <DialogContent className="max-w-lg bg-white border border-slate-200 text-slate-800 p-0 gap-0 max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="p-4 border-b border-slate-100 shrink-0">
            <DialogTitle className="text-[15px] font-bold">
              {activeLabel}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto bg-slate-50">
            {activeKey && <ModulePreview mod={activeKey} sex={sex} />}
          </div>
          <div className="shrink-0 border-t border-slate-100 bg-white p-4 space-y-2">
            <div className="text-center text-[12px] text-slate-600">
              🔒 Ative a{" "}
              <span className="text-emerald-600 font-bold">Licença Premium</span>{" "}
              para ver todo o conteúdo em tempo real.
            </div>
            <button
              onClick={goUpsell}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold py-3.5 rounded-md text-[13px] uppercase tracking-wider shadow-sm"
            >
              Desbloquear agora
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bloqueio obrigatório — licença */}
      <Dialog open={true}>
        <DialogContent
          className="max-w-md bg-white border border-slate-200 text-slate-800 p-0 gap-0 overflow-hidden [&>button]:hidden"
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white px-6 pt-6 pb-5 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-white/15 border border-white/30 flex items-center justify-center mb-3 text-2xl">
              💚
            </div>
            <DialogTitle className="text-[18px] font-extrabold">
              Você merece saber a verdade
            </DialogTitle>
            <p className="text-[13px] text-emerald-50 mt-2 leading-snug">
              Noites sem dormir, o coração apertado, aquela sensação de que algo está errado… você não está louco(a). Sua intuição está te avisando por um motivo.
            </p>
          </div>

          <div className="p-5 space-y-4">
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-[12px] text-rose-800">
              <div className="font-bold mb-1 flex items-center gap-1.5">
                <span>💔</span> Pare de sofrer na dúvida
              </div>
              <div className="text-rose-700 leading-snug">
                Encontramos atividades suspeitas neste número. Continuar no escuro só machuca mais. Em minutos você tem a prova que precisa para tomar a decisão certa pela sua vida.
              </div>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-[12px] text-amber-800 flex gap-2">
              <span>⚠️</span>
              <div>
                <div className="font-bold mb-0.5">Licença não detectada</div>
                <div className="text-amber-700 leading-snug">
                  Os dados do alvo já estão sincronizados em nosso servidor — só falta liberar o seu acesso para ver tudo agora.
                </div>
              </div>
            </div>

            <ul className="text-[12px] text-slate-700 space-y-2">
              {[
                "Descubra com quem ele(a) fala escondido de você",
                "Mensagens apagadas — o que tentaram esconder",
                "Fotos e vídeos da galeria protegida",
                "Instagram, Tinder, TikTok e Facebook em tempo real",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <div className="rounded-md bg-slate-50 border border-slate-200 p-3 text-[11px] text-slate-600 italic leading-snug text-center">
              "Preferi pagar e descobrir a verdade do que passar mais uma noite chorando sem saber." — Ana C., São Paulo
            </div>


            <button
              onClick={goUpsell}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold py-3.5 rounded-md text-[13px] uppercase tracking-wider shadow-sm"
            >
              🪪 Ativar minha licença agora
            </button>
            <div className="text-center text-[10px] text-slate-400">
              Pagamento único · Ativação imediata via Pix
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------- Reusable pieces ---------- */

function Card({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white border border-slate-200 rounded-xl shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <header className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <h3 className="text-[13px] font-bold text-slate-700">{title}</h3>
        {action}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

function TopList({
  items,
}: {
  items: {
    name: string;
    meta: string;
    pct: number;
    color: string;
    hot?: boolean;
    blur?: boolean;
  }[];
}) {
  return (
    <ul className="space-y-3 text-[12px]">
      {items.map((it, i) => (
        <li key={i}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0">
                {it.name[0]}
              </div>
              <span
                className={
                  "font-semibold text-slate-700 truncate " +
                  (it.blur ? "blur-[3px] select-none" : "")
                }
              >
                {it.name}
              </span>
              {it.hot && (
                <span className="text-[9px] font-bold uppercase bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded">
                  hot
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 font-mono ml-2 shrink-0">
              {it.meta}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div className={"h-full " + it.color} style={{ width: it.pct + "%" }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function MiniMap() {
  return (
    <div className="relative rounded-lg overflow-hidden border border-slate-200 aspect-[16/10] bg-slate-100">
      <svg viewBox="0 0 400 260" className="w-full h-full block">
        <rect width="400" height="260" fill="#eef2f7" />
        {/* faux roads */}
        <path d="M0 60 L400 90" stroke="#cbd5e1" strokeWidth="6" fill="none" />
        <path d="M0 160 L400 140" stroke="#cbd5e1" strokeWidth="8" fill="none" />
        <path d="M80 0 L120 260" stroke="#cbd5e1" strokeWidth="6" fill="none" />
        <path d="M260 0 L240 260" stroke="#cbd5e1" strokeWidth="5" fill="none" />
        <path d="M0 210 L400 220" stroke="#dbeafe" strokeWidth="10" fill="none" />
        {/* blocks */}
        <rect x="140" y="70" width="90" height="60" fill="#e2e8f0" rx="4" />
        <rect x="270" y="150" width="80" height="55" fill="#e2e8f0" rx="4" />
        <rect x="30" y="170" width="70" height="35" fill="#e2e8f0" rx="4" />
        {/* pin */}
        <g transform="translate(200 120)">
          <circle r="24" fill="#10b981" opacity="0.15" />
          <circle r="12" fill="#10b981" opacity="0.3" />
          <path d="M0 -18 C -10 -18 -14 -8 -6 4 L 0 14 L 6 4 C 14 -8 10 -18 0 -18 Z" fill="#10b981" />
          <circle r="4" cy="-8" fill="#ffffff" />
        </g>
      </svg>
      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-emerald-600 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        GPS ao vivo
      </div>
      <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-mono text-slate-600">
        -23.561 · -46.686
      </div>
    </div>
  );
}

function DonutChart({
  segments,
  centerLabel,
  centerSub,
}: {
  segments: { v: number; c: string }[];
  centerLabel: string;
  centerSub: string;
}) {
  const total = segments.reduce((a, b) => a + b.v, 0);
  const r = 44;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="relative w-32 h-32 shrink-0">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#f1f5f9" strokeWidth="14" />
        {segments.map((s, i) => {
          const len = (s.v / total) * c;
          const el = (
            <circle
              key={i}
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke={s.c}
              strokeWidth="14"
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[15px] font-extrabold text-slate-800 leading-none">
          {centerLabel}
        </div>
        <div className="text-[10px] uppercase tracking-widest text-slate-400 mt-1">
          {centerSub}
        </div>
      </div>
    </div>
  );
}

/* ---------- Module previews (light theme) ---------- */

function ModulePreview({ mod, sex }: { mod: ModuleKey; sex: "M" | "F" }) {
  if (mod === "location") return <LocationPreview />;
  if (mod === "photos") return <PhotosPreview sex={sex} />;
  if (mod === "deleted") return <DeletedPreview sex={sex} />;
  if (mod === "whatsapp") return <WhatsAppPreview sex={sex} />;
  if (mod === "instagram") return <InstagramPreview sex={sex} />;
  if (mod === "banking") return <BankingPreview />;
  if (mod === "calls") return <CallsPreview sex={sex} />;
  if (mod === "contacts") return <ContactsPreview />;
  return null;
}

function LocationPreview() {
  const points = [
    { t: "22:47", place: "Motel Le Charme · Alphaville", tag: "SUSPEITO", hot: true },
    { t: "20:12", place: "Restaurante Figueira Rubaiyat" },
    { t: "18:03", place: "Academia SmartFit — Vila Nova", blur: true },
    { t: "12:20", place: "Trabalho · Av. Paulista, 1230", blur: true },
  ];
  return (
    <div className="p-4 space-y-3">
      <MiniMap />
      <ul className="space-y-1.5">
        {points.map((p, i) => (
          <li
            key={i}
            className={
              "flex items-center gap-3 rounded-lg border px-3 py-2 text-[12px] bg-white " +
              (p.hot ? "border-rose-200" : "border-slate-100")
            }
          >
            <span className="font-mono text-[11px] text-slate-400 w-12 shrink-0">
              {p.t}
            </span>
            <span
              className={
                "flex-1 text-slate-700 " + (p.blur ? "blur-sm select-none" : "")
              }
            >
              {p.place}
            </span>
            {p.tag && (
              <span className="text-[9px] font-bold uppercase bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded">
                {p.tag}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PhotosPreview({ sex }: { sex: "M" | "F" }) {
  return (
    <div className="p-4 space-y-3">
      <div className="text-[12px] text-slate-600">
        <span className="text-emerald-600 font-bold">184 arquivos</span> na pasta protegida ·{" "}
        <span className="text-amber-600">12 novos hoje</span>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {Array.from({ length: 9 }).map((_, i) => {
          const hidden = i > 1;
          return (
            <div
              key={i}
              className="relative aspect-square rounded-md overflow-hidden bg-slate-200 border border-slate-100"
            >
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, hsl(${(i * 47) % 360} 40% 70%), hsl(${(i * 47 + 60) % 360} 40% 55%))`,
                  filter: hidden ? "blur(10px)" : "blur(4px)",
                }}
              />
              {hidden && (
                <div className="absolute inset-0 flex items-center justify-center text-lg">
                  🔒
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-[11px] text-rose-700">
        ⚠️ Foto {sex === "F" ? "com terceiro" : "com terceira pessoa"} detectada há 3h — enviada e apagada em seguida.
      </div>
    </div>
  );
}

function DeletedPreview({ sex }: { sex: "M" | "F" }) {
  const pron = sex === "F" ? "Ela" : "Ele";
  const msgs = [
    { from: pron, text: "apaga isso agora, tô com medo dele(a) ver", time: "23:47", hot: true },
    { from: "???", text: "relaxa amor, deletei tudo aqui também 😘", time: "23:47", hot: true },
    { from: pron, text: "hoje mesmo endereço?", time: "23:12" },
    { from: "???", text: "te espero às 22h. traz aquele vinho.", time: "23:12", blur: true },
    { from: pron, text: "não posso demorar, ele(a) tá desconfiando", time: "23:13", blur: true },
  ];
  return (
    <div className="p-4 space-y-2">
      <div className="text-[12px] text-slate-600">
        <span className="text-rose-600 font-bold">47 mensagens</span> apagadas nas últimas 24h
      </div>
      <div className="space-y-1.5">
        {msgs.map((m, i) => (
          <div
            key={i}
            className={
              "rounded-lg border px-3 py-2 text-[12px] bg-white " +
              (m.hot ? "border-rose-200" : "border-slate-100")
            }
          >
            <div className="flex items-center justify-between text-[10px] mb-0.5">
              <span
                className={
                  m.from === pron
                    ? "text-emerald-600 font-bold"
                    : "text-amber-600 font-bold"
                }
              >
                {m.from}
              </span>
              <span className="font-mono text-slate-400">
                {m.time} · apagada
              </span>
            </div>
            <div
              className={"text-slate-800 " + (m.blur ? "blur-sm select-none" : "")}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WhatsAppPreview({ sex: _sex }: { sex: "M" | "F" }) {
  const chats = [
    { name: "Amor ❤️", last: "apaga tudo agora, tá vendo", time: "23:47", unread: 12, hot: true },
    { name: "Contato sem nome", last: "hoje mesmo lugar?", time: "23:12", unread: 7, hot: true },
    { name: "Match (Tinder)", last: "adorei ontem 😈", time: "22:58", unread: 5, hot: true, blur: true },
    { name: "Personal", last: "áudio (0:42)", time: "21:30", unread: 2, blur: true },
    { name: "Hotel Reservas", last: "sua reserva foi confirmada", time: "Ontem", unread: 1, blur: true },
  ];
  return (
    <div className="p-4 space-y-2">
      <div className="text-[12px] text-slate-600">
        <span className="text-emerald-600 font-bold">28 conversas</span> ativas · última há 2 min
      </div>
      <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white overflow-hidden">
        {chats.map((c, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5">
            <div
              className="w-10 h-10 rounded-full shrink-0"
              style={{
                background: `linear-gradient(135deg, hsl(${i * 60} 60% 60%), hsl(${i * 60 + 40} 60% 45%))`,
                filter: "blur(3px)",
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="text-[13px] font-semibold text-slate-800 truncate">
                  {c.name}
                </div>
                <div className="text-[10px] font-mono text-slate-400">{c.time}</div>
              </div>
              <div
                className={
                  "text-[11px] truncate " +
                  (c.hot ? "text-rose-500" : "text-slate-500") +
                  (c.blur ? " blur-sm select-none" : "")
                }
              >
                {c.last}
              </div>
            </div>
            {c.unread && (
              <span className="text-[10px] font-bold bg-emerald-500 text-white rounded-full px-1.5 py-0.5 min-w-5 text-center">
                {c.unread}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function InstagramPreview({ sex }: { sex: "M" | "F" }) {
  const dms = [
    { name: sex === "F" ? "@lucas.zn" : "@carol.mel", last: "vc é maravilhoso(a) 🔥", time: "2h", hot: true },
    { name: "@match_privado", last: "me manda aquela foto de novo…", time: "5h", hot: true, blur: true },
    { name: "@close.friend.03", last: "vídeo enviado", time: "ontem", blur: true },
  ];
  return (
    <div className="p-4 space-y-3">
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { v: "9", l: "DMs privados" },
          { v: "34", l: "curtidas ocultas" },
          { v: "17", l: "close friends" },
        ].map((s) => (
          <div key={s.l} className="rounded-lg bg-white border border-slate-200 py-2">
            <div className="text-[16px] font-bold text-pink-600">{s.v}</div>
            <div className="text-[9px] uppercase tracking-widest text-slate-400">
              {s.l}
            </div>
          </div>
        ))}
      </div>
      <div className="text-[12px] text-slate-600">📥 Direct Messages recentes</div>
      <div className="space-y-1.5">
        {dms.map((d, i) => (
          <div
            key={i}
            className={
              "flex items-center gap-3 rounded-lg border px-3 py-2 bg-white " +
              (d.hot ? "border-pink-200" : "border-slate-100")
            }
          >
            <div className="w-9 h-9 rounded-full shrink-0 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600" />
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-bold text-slate-800 truncate">
                {d.name}
              </div>
              <div
                className={
                  "text-[11px] text-slate-600 truncate " +
                  (d.blur ? "blur-sm select-none" : "")
                }
              >
                {d.last}
              </div>
            </div>
            <div className="text-[10px] font-mono text-slate-400">{d.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BankingPreview() {
  const tx = [
    { app: "Nubank", type: "Pix enviado", who: "MARIA S. R.", val: "-R$ 850,00", time: "22:47", hot: true },
    { app: "Itaú", type: "Pix enviado", who: "HOTEL PARADISE LTDA", val: "-R$ 420,00", time: "20:12", hot: true },
    { app: "Nubank", type: "Compra", who: "IFOOD *RESTAURANTE", val: "-R$ 187,00", time: "21:03" },
    { app: "PicPay", type: "Pix enviado", who: "J. P. OLIVEIRA", val: "-R$ 1.200,00", time: "ontem", blur: true },
    { app: "Inter", type: "Transferência", who: "CONTA DESCONHECIDA", val: "-R$ 2.050,00", time: "ontem", blur: true, hot: true },
  ];
  return (
    <div className="p-4 space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-white border border-cyan-200 p-3">
          <div className="text-[10px] uppercase tracking-widest text-cyan-600">
            Total suspeito (30d)
          </div>
          <div className="text-[18px] font-bold text-cyan-700 mt-0.5">
            R$ 4.707,00
          </div>
        </div>
        <div className="rounded-lg bg-white border border-rose-200 p-3">
          <div className="text-[10px] uppercase tracking-widest text-rose-600">
            Pix para desconhecidos
          </div>
          <div className="text-[18px] font-bold text-rose-700 mt-0.5">7</div>
        </div>
      </div>
      <div className="text-[12px] text-slate-600">💳 Movimentações recentes</div>
      <div className="space-y-1.5">
        {tx.map((t, i) => (
          <div
            key={i}
            className={
              "flex items-center gap-3 rounded-lg border px-3 py-2 text-[12px] bg-white " +
              (t.hot ? "border-rose-200" : "border-slate-100")
            }
          >
            <div className="w-9 h-9 rounded-lg shrink-0 bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
              {t.app.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-800 truncate">
                {t.type}
              </div>
              <div
                className={
                  "text-[11px] text-slate-500 truncate " +
                  (t.blur ? "blur-sm select-none" : "")
                }
              >
                {t.who}
              </div>
            </div>
            <div className="text-right">
              <div
                className={
                  "font-bold " + (t.hot ? "text-rose-600" : "text-slate-800")
                }
              >
                {t.val}
              </div>
              <div className="text-[10px] font-mono text-slate-400">{t.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CallsPreview({ sex: _sex }: { sex: "M" | "F" }) {
  const calls = [
    { name: "Amor ❤️", dur: "42:18", dir: "recebida", time: "23:14", hot: true },
    { name: "Contato sem nome", dur: "18:02", dir: "efetuada", time: "22:40", hot: true, blur: true },
    { name: "Personal", dur: "03:10", dir: "efetuada", time: "20:03" },
    { name: "Match (Tinder)", dur: "12:55", dir: "recebida", time: "ontem", hot: true, blur: true },
  ];
  return (
    <div className="p-4 space-y-2">
      <div className="text-[12px] text-slate-600">
        <span className="text-emerald-600 font-bold">18 chamadas</span> nas últimas 24h
      </div>
      <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white overflow-hidden">
        {calls.map((c, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5 text-[12px]">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              {I.phone}
            </div>
            <div className="flex-1 min-w-0">
              <div className={"font-semibold text-slate-800 truncate " + (c.blur ? "blur-sm select-none" : "")}>
                {c.name}
              </div>
              <div className="text-[10px] text-slate-400 capitalize">
                {c.dir} · {c.time}
              </div>
            </div>
            <div className="font-mono text-slate-600 text-[11px]">{c.dur}</div>
            {c.hot && (
              <span className="text-[9px] font-bold uppercase bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded">
                hot
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactsPreview() {
  const items = [
    { name: "Amor ❤️", info: "salvo · 128 msgs · foto", hot: true },
    { name: "Contato sem nome", info: "não salvo · 62 msgs", hot: true, blur: true },
    { name: "Match (Tinder)", info: "salvo · 44 msgs · foto", hot: true, blur: true },
    { name: "Personal", info: "salvo · 20 msgs" },
    { name: "Mãe", info: "salvo · 12 msgs" },
  ];
  return (
    <div className="p-4 space-y-2">
      <div className="text-[12px] text-slate-600">
        <span className="text-emerald-600 font-bold">184 contatos</span> · 12 marcados como suspeitos
      </div>
      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white overflow-hidden">
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-3 px-3 py-2.5 text-[12px]">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-[10px]">
              {c.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className={"font-semibold text-slate-800 truncate " + (c.blur ? "blur-sm select-none" : "")}>
                {c.name}
              </div>
              <div className="text-[10px] text-slate-400">{c.info}</div>
            </div>
            {c.hot && (
              <span className="text-[9px] font-bold uppercase bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded">
                suspeito
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Social brand icons (inline SVG) ---------- */
const SocialIcon = {
  whatsapp: () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M17.5 14.3c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.2-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5H8c-.2 0-.5.1-.7.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 4.9L2 22l5.3-1.3c1.4.8 3 1.3 4.7 1.3 5.5 0 10-4.5 10-10S17.5 2 12 2z" />
    </svg>
  ),
  instagram: () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  ),
  tinder: () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M13.4 2.2c.1 1.3-.3 2.4-1.1 3.4-.9 1-1.9 1.6-2.9 1.9-.1-2.1.9-3.9 3-5.5.4-.3.7-.4 1-.4.1.2 0 .4 0 .6zm4.8 8.6c-.7-2.4-2.2-4.3-4.5-5.4.8 1.4 1 2.8.5 4.4-.6-.5-1.2-1.1-1.7-1.7-1.6-2-2.3-4.3-2.2-6.9-2.2 1-4 2.6-5.2 4.8-1.3 2.2-1.7 4.6-1.1 7.1.8 3.6 3.2 6 6.8 6.8 3.7.9 6.9-.2 9.2-3.3 1.4-1.9 1.7-4 .8-6.3-.7-.2-1.7 0-2.6.5z" />
    </svg>
  ),
  tiktok: () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M16.6 5.8c-1-.6-1.7-1.6-1.9-2.8h-3v11.6c0 1.5-1.2 2.7-2.7 2.7s-2.7-1.2-2.7-2.7 1.2-2.7 2.7-2.7c.3 0 .6.1.9.2v-3c-.3 0-.6-.1-.9-.1-3.2 0-5.7 2.6-5.7 5.7s2.6 5.7 5.7 5.7 5.7-2.6 5.7-5.7V9.4c1.2.9 2.7 1.4 4.3 1.4v-3c-.8 0-1.6-.4-2.4-2z" />
    </svg>
  ),
  facebook: () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.7c0-.9.3-1.5 1.6-1.5h1.7V4.3c-.3 0-1.3-.1-2.5-.1-2.5 0-4.1 1.5-4.1 4.2v2.4H7.5v3.2h2.6V22h3.4z" />
    </svg>
  ),
  bank: () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10l9-6 9 6M5 10v9h14v-9M9 19v-6M15 19v-6M12 19v-6" />
    </svg>
  ),
};

/* ---------- Blurred gallery for dashboard ---------- */
function BlurredGallery({ sex }: { sex: "M" | "F" }) {
  // Different color palette by sex to hint different content
  const palette =
    sex === "F"
      ? [[220, 40], [340, 55], [10, 60], [280, 45], [30, 55], [200, 50], [350, 60], [260, 45]]
      : [[350, 55], [20, 60], [340, 50], [15, 55], [300, 45], [355, 60], [25, 55], [345, 50]];
  const label = sex === "F" ? "Conteúdo íntimo detectado" : "Conteúdo adulto detectado";
  return (
    <div>
      <div className="grid grid-cols-4 gap-1.5">
        {palette.map(([h, s], i) => {
          const heavy = i > 1;
          return (
            <div
              key={i}
              className="relative aspect-square rounded-md overflow-hidden bg-slate-200 border border-slate-100"
            >
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, hsl(${h} ${s}% 68%), hsl(${(h + 40) % 360} ${s}% 45%))`,
                  filter: heavy ? "blur(12px)" : "blur(6px)",
                }}
              />
              {heavy && (
                <div className="absolute inset-0 flex items-center justify-center text-base">
                  🔒
                </div>
              )}
              {i === 0 && (
                <span className="absolute top-1 left-1 text-[8px] font-bold uppercase bg-rose-500 text-white px-1 py-0.5 rounded">
                  novo
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-[11px] text-rose-700 flex items-center gap-2">
        <span>⚠️</span>
        <span className="font-semibold">{label}</span>
        <span className="ml-auto font-mono text-[10px] text-rose-500">+6 arquivos</span>
      </div>
    </div>
  );
}
