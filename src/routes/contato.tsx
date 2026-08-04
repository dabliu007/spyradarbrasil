import { createFileRoute } from "@tanstack/react-router";
import { LegalShell } from "./termos";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato · ZapRadar" },
      {
        name: "description",
        content:
          "Fale com o time do ZapRadar: suporte, privacidade, imprensa e questões comerciais. Atendimento por e-mail em até 24h úteis.",
      },
      { property: "og:title", content: "Contato · ZapRadar" },
      {
        property: "og:description",
        content: "Canais oficiais de contato do ZapRadar.",
      },
      { property: "og:url", content: "https://zapradar.online/contato" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://zapradar.online/contato" }],
  }),
  component: ContatoPage,
});

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-extrabold text-slate-900 mt-6 mb-2">{children}</h2>
  );
}

function ContatoPage() {
  return (
    <LegalShell title="Contato" updated="Atualizado em 06 de julho de 2026">
      <p>
        O <strong>ZapRadar</strong> é operado por{" "}
        <strong>TechBiz Forense Digital Ltda</strong>, inscrita no CNPJ sob o
        nº <strong>05.757.597/0001-37</strong>. Utilize os canais abaixo para
        falar com nossa equipe — respondemos em até <strong>24 horas úteis</strong>,
        de segunda a sexta, das 9h às 18h (horário de Brasília).
      </p>

      <H2>Atendimento ao cliente (SAC)</H2>
      <p>
        Dúvidas sobre o serviço, pagamentos, acesso ou suporte técnico:{" "}
        <strong>
          <a href="mailto:sac@whatsradar.com" className="text-emerald-700 hover:underline">
            sac@whatsradar.com
          </a>
        </strong>
      </p>

      <H2>Privacidade e proteção de dados (LGPD)</H2>
      <p>
        Solicitações de titulares de dados, encarregado (DPO) e assuntos
        relacionados à LGPD:{" "}
        <strong>
          <a href="mailto:privacidade@whatsradar.com" className="text-emerald-700 hover:underline">
            privacidade@whatsradar.com
          </a>
        </strong>
      </p>

      <H2>Assuntos jurídicos e institucionais</H2>
      <p>
        Notificações extrajudiciais, imprensa, parcerias e questões contratuais:{" "}
        <strong>
          <a href="mailto:contato@whatsradar.com" className="text-emerald-700 hover:underline">
            contato@whatsradar.com
          </a>
        </strong>
      </p>

      <H2>Endereço da empresa</H2>
      <p>
        TechBiz Forense Digital Ltda
        <br />
        CNPJ: 05.757.597/0001-37
        <br />
        Brasil
      </p>

      <H2>Prazos de resposta</H2>
      <ul>
        <li>Suporte ao cliente: até 24 horas úteis.</li>
        <li>Solicitações de LGPD: até 15 dias corridos, conforme a lei.</li>
        <li>Notificações jurídicas: até 5 dias úteis.</li>
      </ul>

      <p className="text-xs text-slate-500 mt-6">
        O ZapRadar não realiza atendimento por telefone ou WhatsApp. Todo o
        suporte oficial acontece exclusivamente pelos e-mails listados acima —
        desconfie de qualquer contato feito por outros canais em nome da marca.
      </p>
    </LegalShell>
  );
}
