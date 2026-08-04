import { createFileRoute, Link } from "@tanstack/react-router";
import { useTargetName } from "@/lib/use-target-name";
import { useEffect, useState } from "react";
import { z } from "zod";

const searchSchema = z.object({
  phone: z.coerce.string().optional().default(""),
  sex: z.enum(["M", "F"]).optional().default("M"),
});

export const Route = createFileRoute("/acesso-liberado")({
  head: () => ({
    meta: [
      { title: "Acesso Liberado — Relatório ZapRadar" },
      {
        name: "description",
        content:
          "Acesso total ao relatório de invasão e clonagem ZapRadar liberado. Conversas, fotos, localização e contas bancárias disponíveis.",
      },
      { property: "og:title", content: "Acesso Liberado — Relatório ZapRadar" },
      {
        property: "og:description",
        content:
          "Todas as etapas foram concluídas. Acesse agora o painel completo com tudo do alvo.",
      },
      { name: "robots", content: "noindex,follow" },
    ],
    links: [{ rel: "canonical", href: "https://clonawhats.com/acesso-liberado" }],
  }),
  validateSearch: (s) => searchSchema.parse(s),
  component: AcessoLiberadoPage,
});

function maskPhone(raw: string) {
  const d = (raw || "").replace(/\D/g, "");
  if (d.length < 10) return raw || "—";
  const ddd = d.slice(0, 2);
  const a = d.slice(2, d.length - 4);
  const b = d.slice(-4);
  return `(${ddd}) ${a}-${b}`;
}

function AcessoLiberadoPage() {
  const { phone, sex } = Route.useSearch();
  const targetName = useTargetName();
  const alvoLabel = targetName ?? "alvo";
  const [now, setNow] = useState<string>("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    const upd = () =>
      setNow(
        new Date().toLocaleString("pt-BR", {
          dateStyle: "short",
          timeStyle: "medium",
        }),
      );
    upd();
    const id = window.setInterval(upd, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    let v = 0;
    const id = window.setInterval(() => {
      v = Math.min(100, v + Math.random() * 12 + 4);
      setProgress(Math.round(v));
      if (v >= 100) window.clearInterval(id);
    }, 180);
    return () => window.clearInterval(id);
  }, []);

  const alvo = maskPhone(phone);

  return (
    <div className="min-h-screen bg-white text-[#128C7E] font-mono relative overflow-hidden">
      {/* scanlines */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent 0, transparent 2px, #10b981 2px, #10b981 3px)",
        }}
      />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.18)_0%,_transparent_60%)]" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8 space-y-6">
        <header className="border border-emerald-300 bg-white/70 rounded-md p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#128C7E]">zapradar_core.exe</span>
            <span className="text-[#25D366]">{now}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#25D366] mt-3 tracking-tight">
            &gt; ACESSO TOTAL LIBERADO_
          </h1>
          <p className="text-[#128C7E]/80 text-sm mt-2">
            Todas as etapas de verificação, sigilo e licenciamento foram
            concluídas. Você agora tem permissão integral sobre {alvoLabel === "alvo" ? "o alvo " : `${alvoLabel} `}
            <span className="text-emerald-700 font-bold">{alvo}</span>.
          </p>
        </header>

        {/* status bar */}
        <section className="border border-emerald-300 bg-white/70 rounded-md p-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span>SINCRONIZANDO PAINEL...</span>
            <span className="text-[#25D366]">{progress}%</span>
          </div>
          <div className="h-2 w-full bg-emerald-900/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#25D366]/90">
            <li>✓ Relatório de invasão</li>
            <li>✓ Taxa de sigilo</li>
            <li>✓ Taxa de serviços Meta</li>
            <li>✓ Licença ZapRadar ativa</li>
            <li>✓ Controle bancário total</li>
            <li>✓ Espelhamento 30 dias</li>
          </ul>
        </section>

        {/* módulos */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ModuleCard
            icon="💬"
            title="WhatsApp Clonado"
            desc="Todas as conversas, áudios, fotos e vídeos em tempo real."
            to="/painel"
            phone={phone}
            sex={sex}
          />
          <ModuleCard
            icon="📍"
            title="Localização ao Vivo"
            desc="Coordenadas GPS atualizadas a cada 60 segundos."
            unlocked
          />
          <ModuleCard
            icon="📷"
            title="Galeria & Mídia Oculta"
            desc="Fotos privadas, vídeos e arquivos da pasta protegida."
            unlocked
          />
          <ModuleCard
            icon="🏦"
            title="Apps Bancários"
            desc="Pix, transferências e extratos do investigado."
            unlocked
          />
          <ModuleCard
            icon="📲"
            title="SMS & Chamadas"
            desc="Histórico completo de ligações e mensagens."
            unlocked
          />
          <ModuleCard
            icon="📧"
            title="E-mails & Redes"
            desc="Instagram, TikTok, Tinder e contas vinculadas."
            unlocked
          />
        </section>

        {/* dados do alvo */}
        <section className="border border-emerald-300 bg-white/70 rounded-md p-4 text-sm">
          <div className="text-[#128C7E] text-xs mb-2">[ DADOS DO ALVO ]</div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-6 text-[#25D366]">
            <div className="flex justify-between"><dt className="text-[#128C7E]">Número</dt><dd>{alvo}</dd></div>
            <div className="flex justify-between"><dt className="text-[#128C7E]">Sexo</dt><dd>{sex === "F" ? "Feminino" : "Masculino"}</dd></div>
            <div className="flex justify-between"><dt className="text-[#128C7E]">Status</dt><dd className="text-emerald-700">ATIVO</dd></div>
            <div className="flex justify-between"><dt className="text-[#128C7E]">Sessões</dt><dd>4 dispositivos</dd></div>
            <div className="flex justify-between"><dt className="text-[#128C7E]">Última atividade</dt><dd>há 2 min</dd></div>
            <div className="flex justify-between"><dt className="text-[#128C7E]">Validade</dt><dd>30 dias</dd></div>
          </dl>
        </section>

        {/* CTA principal */}
        <section className="text-center space-y-3">
          <Link
            to="/painel"
            search={{ phone, sex }}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-4 bg-[#25D366] text-white font-bold rounded-md shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:bg-emerald-400 transition"
          >
            💬 ABRIR WHATSAPP CLONADO AGORA
          </Link>
          <p className="text-xs text-[#128C7E]/80">
            Seu acesso é vitalício para esta investigação. Painel disponível 24h
            por dia durante 30 dias.
          </p>
        </section>

        <footer className="text-center text-[10px] text-emerald-700 pt-6 border-t border-emerald-900/50">
          zapradar_core v3.7 · sessão protegida · uso restrito ao contratante
        </footer>
      </div>
    </div>
  );
}

function ModuleCard({
  icon,
  title,
  desc,
  to,
  phone,
  sex,
  unlocked,
}: {
  icon: string;
  title: string;
  desc: string;
  to?: "/painel";
  phone?: string;
  sex?: "M" | "F";
  unlocked?: boolean;
}) {
  const inner = (
    <div className="h-full border border-emerald-300 bg-white/70 rounded-md p-4 hover:border-emerald-400 hover:bg-emerald-950/30 transition">
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-[#25D366] rounded-full border border-emerald-300">
          LIBERADO
        </span>
      </div>
      <div className="mt-2 text-emerald-700 font-bold text-sm">{title}</div>
      <div className="text-[#128C7E]/70 text-xs mt-1">{desc}</div>
    </div>
  );
  if (to) {
    return (
      <Link to={to} search={{ phone: phone ?? "", sex: sex ?? "M" }}>
        {inner}
      </Link>
    );
  }
  return <div className={unlocked ? "cursor-default" : ""}>{inner}</div>;
}
