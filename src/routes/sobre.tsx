import { createFileRoute } from "@tanstack/react-router";
import { LegalShell } from "./termos";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre o SpyRadar Brasil · Quem somos" },
      {
        name: "description",
        content:
          "Conheça o SpyRadar Brasil: uma plataforma independente de análise digital e conteúdo informativo, operada pela TechBiz Forense Digital Ltda.",
      },
      { property: "og:title", content: "Sobre o SpyRadar Brasil · Quem somos" },
      {
        property: "og:description",
        content:
          "Missão, valores e responsáveis pela plataforma SpyRadar Brasil.",
      },
      { property: "og:url", content: "https://clonawhats.com/sobre" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://clonawhats.com/sobre" }],
  }),
  component: SobrePage,
});

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-extrabold text-slate-900 mt-6 mb-2">{children}</h2>
  );
}

function SobrePage() {
  return (
    <LegalShell title="Sobre o SpyRadar Brasil" updated="Atualizado em 06 de julho de 2026">
      <p>
        O <strong>SpyRadar Brasil</strong> é uma plataforma digital independente
        voltada à <strong>análise de conteúdo e comportamento em
        relacionamentos</strong>, com foco em oferecer material informativo,
        reflexivo e de entretenimento para pessoas maiores de 18 anos.
      </p>

      <H2>Quem opera o SpyRadar Brasil</H2>
      <p>
        A plataforma é mantida por <strong>TechBiz Forense Digital Ltda</strong>,
        pessoa jurídica de direito privado inscrita no CNPJ sob o nº{" "}
        <strong>05.757.597/0001-37</strong>, com sede no Brasil.
      </p>

      <H2>Nossa proposta</H2>
      <p>
        Reunimos, em um único ambiente, materiais educativos e ferramentas de
        análise que auxiliam o usuário a refletir sobre sinais de
        comportamento em relacionamentos. Todo o conteúdo apresentado tem
        caráter <strong>ilustrativo, informativo e de entretenimento</strong> —
        não realizamos nenhuma forma de interceptação, invasão, clonagem,
        monitoramento ou acesso não autorizado a dispositivos, contas ou
        dados pessoais de terceiros.
      </p>

      <H2>Compromissos editoriais</H2>
      <ul>
        <li>
          <strong>Transparência:</strong> deixamos claro que somos uma
          plataforma independente, sem qualquer vínculo com Meta, WhatsApp,
          Instagram, Google, TikTok, Facebook ou suas subsidiárias.
        </li>
        <li>
          <strong>Privacidade:</strong> tratamos dados pessoais em conformidade
          com a LGPD (Lei nº 13.709/2018). Detalhes na nossa{" "}
          <a href="/privacidade" className="text-yellow-700 hover:underline">
            Política de Privacidade
          </a>
          .
        </li>
        <li>
          <strong>Uso responsável:</strong> nossos serviços são destinados
          exclusivamente a maiores de 18 anos e devem ser utilizados dentro dos
          limites da lei.
        </li>
        <li>
          <strong>Suporte:</strong> mantemos canais oficiais de atendimento por
          e-mail com prazo de resposta em até 24h úteis.
        </li>
      </ul>

      <H2>Falar conosco</H2>
      <p>
        Para dúvidas, sugestões ou solicitações, acesse a página de{" "}
        <a href="/contato" className="text-yellow-700 hover:underline">
          Contato
        </a>{" "}
        ou envie um e-mail para{" "}
        <strong>
          <a href="mailto:sac@whatsradar.com" className="text-yellow-700 hover:underline">
            sac@whatsradar.com
          </a>
        </strong>
        .
      </p>
    </LegalShell>
  );
}
