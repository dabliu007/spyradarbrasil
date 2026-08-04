import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useTargetName } from "@/lib/use-target-name";

const searchSchema = z.object({
  phone: z.coerce.string().optional().default(""),
  sex: z.enum(["M", "F"]).optional().default("M"),
  paid: z.coerce.number().optional().default(0),
});

export const Route = createFileRoute("/relatorio-especial")({
  head: () => ({
    meta: [
      { title: "Última chance — Relatório por R$ 47 — ZapRadar" },
      {
        name: "description",
        content:
          "Oferta especial e única do ZapRadar: desbloqueie o relatório completo de invasão e clonagem do WhatsApp investigado por apenas R$ 47.",
      },
      { property: "og:title", content: "Última chance — Relatório por R$ 47 — ZapRadar" },
      {
        property: "og:description",
        content: "Desbloqueie o relatório completo de invasão e clonagem por apenas R$ 47.",
      },
      { property: "og:url", content: "https://zapradar.online/relatorio-especial" },
      { name: "robots", content: "noindex,follow" },
    ],
    links: [{ rel: "canonical", href: "https://zapradar.online/relatorio-especial" }],
  }),
  validateSearch: (s) => searchSchema.parse(s),
  component: RelatorioPage,
});

function RelatorioPage() {
  const { phone, sex, paid } = Route.useSearch();
  const locked = !paid;

  const displayPhone = phone || "(00) 0 0000-0000";
  const [reportId, setReportId] = useState<number | null>(null);
  useEffect(() => { setReportId(Math.floor(Math.random() * 90000 + 10000)); }, []);
  const targetName = useTargetName();
  const oAlvo = targetName ?? "o alvo";
  const alvoLabel = targetName ?? "Alvo";


  // Mensagens cruas (parcialmente censuradas quando bloqueado)
  const mensagensQuentes = [
    { from: "███████", text: "Saudade do cheiro de ontem 🔥 quando a gente se vê de novo?", time: "23:47", tipo: "recebida" },
    { from: "Alvo", text: "Hoje não dá, ele/ela tá em casa. Amanhã eu dou um jeito 😘", time: "23:49", tipo: "enviada" },
    { from: "███████", text: "Tô com sua blusa aqui ainda… vem buscar 🙈", time: "00:12", tipo: "recebida" },
    { from: "Alvo", text: "APAGA essa conversa AGORA. Tô morrendo de medo de descobrirem.", time: "00:14", tipo: "enviada" },
    { from: "███████", text: "Relaxa amor, ninguém vai descobrir. Te amo ❤️", time: "00:15", tipo: "recebida" },
    { from: "Alvo", text: "Também te amo. Mais que ele/ela, juro.", time: "00:16", tipo: "enviada" },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-['Inter',sans-serif] relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(128,128,128,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(128,128,128,0.07) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-red-500/[0.06] blur-[140px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-lg mx-auto px-4 py-8 space-y-5">
        <h1 className="sr-only">Oferta especial do relatório ZapRadar por R$ 47</h1>
        {/* Topo */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-zinc-900 border border-red-500/40 rounded-xl flex items-center justify-center">
              <span className="text-red-400 text-lg">📂</span>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-red-400/80 font-['Geist_Mono',monospace]">
                Relatório #ZR-{reportId ?? "—"}
              </div>
              <div className="text-sm font-bold">
                {alvoLabel}: <span className="font-['Geist_Mono',monospace] text-red-300">{displayPhone}</span>
              </div>
            </div>
          </div>
          <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-md font-bold ${locked ? "bg-red-500/15 text-red-300 border border-red-500/30 animate-pulse" : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"}`}>
            {locked ? "🔒 BLOQUEADO" : "✅ LIBERADO"}
          </span>
        </div>

        {/* OFERTA DOWNSELL — premissa */}
        <div className="bg-gradient-to-br from-amber-600/20 to-amber-900/10 border-2 border-amber-500/50 rounded-2xl p-5 shadow-[0_0_40px_-10px_rgba(245,158,11,0.5)]">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⏳</span>
            <div className="space-y-2">
              <div className="text-[10px] uppercase tracking-[0.2em] text-amber-300 font-['Geist_Mono',monospace] font-bold">
                Última chance · oferta exclusiva
              </div>
              <p className="text-[14px] text-zinc-100 leading-snug font-semibold">
                Já <span className="text-amber-300">geramos o seu relatório</span> e processamos tempo e dinheiro para entregar o que o seu parceiro esconde de você.
              </p>
              <p className="text-[13px] text-zinc-300 leading-snug">
                Se o valor de <span className="line-through text-zinc-500">R$ 50,00</span> é pesado, estamos te ofertando essa condição especial de <span className="text-amber-300 font-extrabold">R$ 47,00</span> para entregar o relatório completo e o acesso total ao dispositivo.
              </p>
              <p className="text-[12px] text-amber-200 leading-snug italic">
                Essa oferta não se repete. Ao sair desta página, ela expira para sempre.
              </p>
            </div>
          </div>
        </div>

        {/* ALERTA VERMELHO — soco no estômago */}
        <div className="bg-gradient-to-br from-red-600/25 to-red-900/10 border-2 border-red-500/50 rounded-2xl p-5 shadow-[0_0_40px_-10px_rgba(239,68,68,0.6)]">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🚨</span>
            <div className="space-y-2">
              <div className="text-[10px] uppercase tracking-[0.2em] text-red-300 font-['Geist_Mono',monospace] font-bold">
                Resultado da invasão e clonagem
              </div>
              <p className="text-[15px] text-zinc-100 leading-snug font-semibold">
                Encontramos <span className="text-red-400 font-extrabold">indícios FORTES de traição</span> neste WhatsApp.
              </p>
              <p className={`text-[13px] text-zinc-300 leading-snug ${locked ? "blur-[5px] select-none" : ""}`}>
                Mensagens apagadas durante a madrugada, fotos íntimas trocadas com pelo menos <span className="text-red-300 font-bold">3 contatos diferentes</span> e idas frequentes a motéis e hotéis na última semana.
              </p>
              {locked && (
                <p className="text-[12px] text-red-300/90 leading-snug font-bold uppercase tracking-wider">
                  🔒 Detalhes ocultos — desbloqueie para ver
                </p>
              )}
              <p className="text-[13px] text-red-200 leading-snug italic">
                Sentimos muito que você tenha que descobrir assim. Mas é melhor saber a verdade agora.
              </p>
            </div>
          </div>
        </div>

        {/* Sumário com números chocantes */}
        <Section title="O que foi encontrado">
          <SummaryRow label="💬 Mensagens apagadas recuperadas" value="247" locked={locked} highlight />
          <SummaryRow label="🔥 Conversas com teor sexual" value="89" locked={locked} highlight />
          <SummaryRow label="📸 Fotos íntimas trocadas" value="42" locked={locked} highlight />
          <SummaryRow label="🎥 Vídeos privados (visualizar uma vez)" value="11" locked={locked} highlight />
          <SummaryRow label="❤️ Conversas marcadas como 'Amor'" value="3" locked={locked} highlight />
          <SummaryRow label="🏨 Visitas a motéis (últimos 30 dias)" value="6" locked={locked} highlight />
          <SummaryRow label="🌙 Mensagens enviadas entre 23h e 5h" value="318" locked={locked} highlight />
          <SummaryRow label="📍 Último acesso real (não o que aparece)" value="hoje, 02:47" locked={locked} />
        </Section>

        {/* Prévia bombástica de mensagens */}
        <Section title="🔥 Trechos das conversas apagadas">
          <p className="text-[12px] text-zinc-400 -mt-1 mb-2">
            {locked
              ? `Recuperamos 247 conversas que ${oAlvo} achou que tinha apagado. Acesso liberado apenas após desbloqueio.`
              : `Recuperamos conversas que ${oAlvo} achou que tinha apagado para sempre. Veja uma amostra:`}
          </p>
          <div className="space-y-2 relative">
            {(locked ? mensagensQuentes.slice(0, 3) : mensagensQuentes).map((m, i) => (
              <div
                key={i}
                className={`rounded-2xl p-3 border ${
                  m.tipo === "enviada"
                    ? "bg-emerald-900/20 border-emerald-700/30 ml-8"
                    : "bg-zinc-900 border-zinc-800 mr-8"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[11px] font-bold ${m.tipo === "enviada" ? "text-emerald-300" : "text-red-300"}`}>
                    {locked ? "████████" : m.from}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-['Geist_Mono',monospace]">
                    {locked ? "██:██" : m.time}
                  </span>
                </div>
                <p className={`text-[13px] text-zinc-100 ${locked ? "blur-[6px] select-none" : ""}`}>
                  {m.text}
                </p>
              </div>
            ))}
            {locked && (
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#09090b] via-[#09090b]/80 to-transparent pointer-events-none" />
            )}
          </div>
          {locked && (
            <div className="text-center pt-2 space-y-1">
              <p className="text-[13px] text-red-300 font-bold">
                + 244 mensagens íntimas bloqueadas
              </p>
              <p className="text-[11px] text-zinc-500 italic">
                Incluindo a conversa marcada como ❤️ "Amor" às 02:47 de hoje
              </p>
            </div>
          )}
        </Section>

        {/* Galeria censurada */}
        <Section title="📸 Mídias interceptadas">
          <p className="text-[12px] text-zinc-400 -mt-1 mb-2">
            {locked
              ? "42 fotos íntimas e 11 vídeos privados (visualizar uma vez) foram interceptados. Acesso bloqueado."
              : "Fotos e vídeos enviados em modo privado (visualizar uma vez)."}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-800 relative overflow-hidden flex items-center justify-center"
              >
                <div className={`absolute inset-0 ${locked ? "backdrop-blur-2xl bg-zinc-950/60" : ""}`} />
                <span className={`relative text-2xl ${locked ? "opacity-30" : "opacity-60"}`}>
                  {i % 2 === 0 ? "🔞" : "🎥"}
                </span>
                {locked && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="text-red-300 text-xl">🔒</span>
                  </span>
                )}
              </div>
            ))}
          </div>
          <p className="text-[11px] text-zinc-500 text-center pt-1">
            {locked
              ? "⚠️ Conteúdo +18 censurado pelo sistema até o desbloqueio"
              : "⚠️ Conteúdo sensível — recomendamos visualizar sozinho(a)."}
          </p>
        </Section>

        {/* Padrão de comportamento */}
        <Section title="🧠 Padrão de comportamento detectado">
          <div className={`bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2 text-[13px] text-zinc-300 leading-relaxed ${locked ? "blur-[5px] select-none" : ""}`}>
            <p>
              🔴 <span className="font-bold text-red-300">Picos de atividade</span> no WhatsApp entre <span className="text-red-300 font-bold">23h e 03h</span> — exatamente quando {oAlvo} finge estar dormindo.
            </p>
            <p>
              🔴 <span className="font-bold text-red-300">Conversas deletadas em massa</span> sempre nas manhãs de segunda, quarta e sexta.
            </p>
            <p>
              🔴 <span className="font-bold text-red-300">Modo "arquivar conversa"</span> ativado em pelo menos <span className="text-red-300 font-bold">3 contatos</span> — clássico truque de quem esconde.
            </p>
            <p>
              🔴 <span className="font-bold text-red-300">Localização desligada</span> nos horários em que diz estar "no trabalho" ou "com amigos(as)".
            </p>
          </div>
          {locked && (
            <p className="text-center text-[11px] text-red-300/80 font-bold pt-2 uppercase tracking-wider">
              🔒 4 padrões críticos identificados — bloqueados
            </p>
          )}
        </Section>

        {/* Localização */}
        <Section title="📍 Histórico real de localização">
          <p className="text-[12px] text-zinc-400 -mt-1 mb-2">
            Locais que {oAlvo} realmente esteve — não o que disse pra você.
          </p>
          <div className={`bg-zinc-950 border border-zinc-800 rounded-xl p-4 ${locked ? "blur-[6px] select-none" : ""}`}>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span>🏨</span>
                <div>
                  <div className="font-semibold text-zinc-100">Motel Status — Quarto 12</div>
                  <div className="text-[11px] text-zinc-500 font-['Geist_Mono',monospace]">22/06 · 22:14 — 01:47 (3h33min)</div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span>🍷</span>
                <div>
                  <div className="font-semibold text-zinc-100">Bar Veloso, Vila Mariana</div>
                  <div className="text-[11px] text-zinc-500 font-['Geist_Mono',monospace]">21/06 · 21:47 — disse estar "na academia"</div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span>🏠</span>
                <div>
                  <div className="font-semibold text-zinc-100">Endereço residencial não identificado</div>
                  <div className="text-[11px] text-zinc-500 font-['Geist_Mono',monospace]">20/06 · 00:32 — 04:18 (Rua Augusta, 1340)</div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span>🏨</span>
                <div>
                  <div className="font-semibold text-zinc-100">Hotel Ibis Paulista</div>
                  <div className="text-[11px] text-zinc-500 font-['Geist_Mono',monospace]">18/06 · 22:09 — pernoite</div>
                </div>
              </li>
            </ul>
          </div>
          {locked && (
            <p className="text-center text-[11px] text-red-300/80 font-bold pt-2 uppercase tracking-wider">
              🔒 4 endereços suspeitos · nomes e horários bloqueados
            </p>
          )}
        </Section>

        {/* Reação humana */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-2">
          <p className="text-[13px] text-zinc-300 leading-snug italic">
            "Eu sei que você desconfiava. Por isso chegou até aqui. <span className="text-red-300 font-semibold">Sua intuição estava certa</span> — e os números acima são só uma prévia."
          </p>
          <p className="text-[12px] text-zinc-500">— Equipe de invasão e clonagem ZapRadar</p>
        </div>

        {/* BÔNUS — Acesso total 30 dias */}
        {locked && (
          <div className="bg-gradient-to-br from-emerald-950/40 to-zinc-900/80 backdrop-blur-xl border-2 border-emerald-500/40 rounded-3xl p-5 shadow-[0_20px_60px_rgba(16,185,129,0.18)] relative overflow-hidden space-y-3">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
            <div className="flex items-center gap-2">
              <span className="inline-block text-[10px] uppercase tracking-[0.2em] text-emerald-300 font-['Geist_Mono',monospace] font-bold bg-emerald-500/15 border border-emerald-500/40 rounded-full px-3 py-1">
                🎁 Bônus incluso · grátis
              </span>
              <span className="text-[10px] uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-md px-2 py-0.5 font-bold font-['Geist_Mono',monospace]">
                30 dias
              </span>
            </div>

            <h2 className="text-[20px] font-extrabold leading-tight text-zinc-100">
              Acesso <span className="text-emerald-400">total e ao vivo</span> ao celular clonado por 30 dias
            </h2>

            <p className="text-[13px] text-zinc-300 leading-snug">
              Direto do <span className="font-semibold text-zinc-100">seu próprio celular</span>, você entra nas contas dele(a) e acompanha <span className="text-emerald-300 font-semibold">cada mensagem em tempo real</span> — sem que ele(a) saiba.
            </p>

            <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-3 space-y-1.5">
              <p className="text-[12px] text-zinc-200 font-semibold mb-1">O que o espelhamento libera:</p>
              <p className="text-[12px] text-zinc-300">✅ WhatsApp — conversas, áudios, fotos e status</p>
              <p className="text-[12px] text-zinc-300">✅ Instagram — DMs, curtidas, perfis salvos, close friends</p>
              <p className="text-[12px] text-zinc-300">✅ Facebook & Messenger — chats e atividade</p>
              <p className="text-[12px] text-zinc-500 italic pt-1">⚠️ Restrito a redes sociais. Demais aplicativos do aparelho não são acessados.</p>
            </div>

            <p className="text-[11px] text-emerald-300/90 font-['Geist_Mono',monospace] uppercase tracking-wider">
              Ativado automaticamente após o desbloqueio do relatório
            </p>
          </div>
        )}

        {/* CTA bloqueio — versão emocional */}
        {locked && (
          <div className="bg-gradient-to-br from-red-950/40 to-zinc-900/80 backdrop-blur-xl border-2 border-red-500/50 rounded-3xl p-6 shadow-[0_20px_60px_rgba(239,68,68,0.25)] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-400/60 to-transparent" />

            <div className="text-center space-y-3">
              <div className="inline-block text-[10px] uppercase tracking-[0.2em] text-red-300 font-['Geist_Mono',monospace] font-bold bg-red-500/15 border border-red-500/40 rounded-full px-3 py-1">
                ⚠️ Você merece saber a verdade
              </div>

              <h2 className="text-2xl font-extrabold leading-tight">
                Quer ver <span className="text-red-400">TUDO</span> que estão escondendo de você?
              </h2>

              <p className="text-[13px] text-zinc-300 leading-snug">
                Cada mensagem. Cada foto. Cada localização. Cada nome.
                <br />
                <span className="text-red-300 font-semibold">Sem censura. Sem desculpa. Sem mentira.</span>
              </p>

              <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-3 text-left space-y-1.5 my-2">
                <p className="text-[12px] text-zinc-300">✅ 247 mensagens apagadas — liberadas</p>
                <p className="text-[12px] text-zinc-300">✅ 42 fotos íntimas — descensuradas</p>
                <p className="text-[12px] text-zinc-300">✅ 11 vídeos privados — para download</p>
                <p className="text-[12px] text-zinc-300">✅ Nomes e telefones reais dos amantes</p>
                <p className="text-[12px] text-zinc-300">✅ Mapa completo de localizações</p>
                <p className="text-[12px] text-zinc-300">✅ Relatório em PDF + envio no seu WhatsApp</p>
                <p className="text-[12px] text-emerald-300 font-semibold">🎁 BÔNUS: 30 dias de espelhamento WhatsApp, Instagram e Facebook</p>
              </div>


              <div className="flex items-center justify-center gap-2">
                <span className="text-zinc-500 line-through text-lg">R$ 50</span>
                <span className="text-red-400 text-3xl font-extrabold">R$ 47,00</span>
                <span className="text-[10px] uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/40 rounded-md px-2 py-0.5 font-bold">
                  -51%
                </span>
              </div>
              <p className="text-[11px] text-red-300/80 font-['Geist_Mono',monospace] uppercase tracking-wider">
                Última oferta · não se repete se você sair daqui
              </p>
            </div>

            <a
              href="https://checkout.ticto.app/O020FD0E8"
              className="mt-5 flex w-full min-h-14 items-center justify-center text-center bg-red-600 hover:bg-red-500 text-white font-extrabold rounded-2xl transition-all active:scale-[0.98] shadow-[0_0_40px_-8px_rgba(239,68,68,0.8)] uppercase tracking-wide px-4 py-3 text-[13px] leading-tight sm:text-[15px]"
            >
              🔓 DESBLOQUEAR AGORA POR R$ 47,00
            </a>

            <p className="text-center text-[11px] text-zinc-500 mt-3 flex items-center justify-center gap-1.5">
              <span>🔒</span> 100% anônimo · PIX · Liberação imediata
            </p>
            <p className="text-center text-[11px] text-zinc-600 mt-1 italic">
              Mais barato do que continuar sendo enganado(a).
            </p>
          </div>
        )}

        {paid ? (
          <div className="bg-emerald-600/15 border border-emerald-500/40 rounded-2xl p-4 text-center text-emerald-200 text-sm font-semibold">
            ✅ Pagamento confirmado — todas as informações foram liberadas.
          </div>
        ) : null}

        <Link
          to="/"
          className="block w-full text-center text-[11px] font-['Geist_Mono',monospace] uppercase tracking-[0.2em] text-zinc-600 hover:text-zinc-400 transition-colors py-4"
        >
          ← voltar
        </Link>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-[11px] uppercase tracking-[0.2em] text-red-400/80 font-['Geist_Mono',monospace]">
        {title}
      </h3>
      {children}
    </section>
  );
}

function SummaryRow({
  label,
  value,
  locked,
  highlight,
}: {
  label: string;
  value: string;
  locked: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between bg-zinc-950 border rounded-xl px-4 py-2.5 ${
        highlight ? "border-red-500/30" : "border-zinc-800"
      }`}
    >
      <span className="text-[13px] text-zinc-300">{label}</span>
      <span
        className={`text-sm font-extrabold font-['Geist_Mono',monospace] ${
          highlight ? "text-red-300" : "text-emerald-300"
        } ${locked ? "blur-[7px] select-none" : ""}`}
      >
        {locked ? "███" : value}
      </span>
    </div>
  );
}
