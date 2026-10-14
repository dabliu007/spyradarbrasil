import { createFileRoute } from "@tanstack/react-router";
import { LegalShell } from "./termos";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato · SpyRadar Brasil" },
      {
        name: "description",
        content:
          "Fale com o time do SpyRadar Brasil: suporte, privacidade, imprensa e questões comerciais. Atendimento por e-mail em até 24h úteis.",
      },
      { property: "og:title", content: "Contato · SpyRadar Brasil" },
      {
        property: "og:description",
        content: "Canais oficiais de contato do SpyRadar Brasil.",
      },
      { property: "og:url", content: "https://zapradarbrasil.com.br/contato" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://zapradarbrasil.com.br/contato" }],
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
        O <strong>SpyRadar Brasil</strong> é operado por{" "}
        <strong>Spy Monitoramento LTDA</strong>, inscrita no CNPJ sob o
        nº <strong>17.722.425/0001-07</strong>. Utilize os canais abaixo para
        falar com nossa equipe — respondemos em até <strong>24 horas úteis</strong>,
        de segunda a sexta, das 9h às 18h (horário de Brasília).
      </p>

      <H2>Atendimento ao cliente (SAC)</H2>
      <p>
        Dúvidas sobre o serviço, pagamentos, acesso ou suporte técnico:{" "}
        <strong>
          <a href="mailto:sac@zapradarbrasil.com.br" className="text-yellow-700 hover:underline">
            sac@zapradarbrasil.com.br
          </a>
        </strong>
      </p>

      <H2>Telefone e WhatsApp</H2>
      <p>
        Atendimento por telefone e WhatsApp:{" "}
        <strong>
          <a href="tel:+5511965072638" className="text-yellow-700 hover:underline">
            (11) 96507-2638
          </a>
        </strong>
      </p>

      <H2>Privacidade e proteção de dados (LGPD)</H2>
      <p>
        Solicitações de titulares de dados, encarregado (DPO) e assuntos
        relacionados à LGPD:{" "}
        <strong>
          <a href="mailto:sac@zapradarbrasil.com.br" className="text-yellow-700 hover:underline">
            sac@zapradarbrasil.com.br
          </a>
        </strong>
      </p>

      <H2>Assuntos jurídicos e institucionais</H2>
      <p>
        Notificações extrajudiciais, imprensa, parcerias e questões contratuais:{" "}
        <strong>
          <a href="mailto:sac@zapradarbrasil.com.br" className="text-yellow-700 hover:underline">
            sac@zapradarbrasil.com.br
          </a>
        </strong>
      </p>

      <H2>Endereço da empresa</H2>
      <p>
        Spy Monitoramento LTDA
        <br />
        CNPJ: 17.722.425/0001-07
        <br />
        Rodovia Curitiba–Paranaguá, BR-277, 793 — Cajuru
        <br />
        Curitiba – PR, CEP 82900-335
      </p>

      <H2>Prazos de resposta</H2>
      <ul>
        <li>Suporte ao cliente: até 24 horas úteis.</li>
        <li>Solicitações de LGPD: até 15 dias corridos, conforme a lei.</li>
        <li>Notificações jurídicas: até 5 dias úteis.</li>
      </ul>

      <p className="text-xs text-slate-500 mt-6">
        O suporte oficial do SpyRadar Brasil acontece exclusivamente pelo e-mail
        e pelo telefone/WhatsApp listados acima — desconfie de qualquer contato
        feito por outros canais em nome da marca.
      </p>
    </LegalShell>
  );
}
