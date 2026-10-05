import { createFileRoute } from "@tanstack/react-router";
import { LegalShell } from "./termos";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Política de Cookies · SpyRadar Brasil" },
      { name: "description", content: "Como o SpyRadar Brasil utiliza cookies para funcionamento do site, análise e mensuração de campanhas." },
      { property: "og:title", content: "Política de Cookies · SpyRadar Brasil" },
      { property: "og:url", content: "https://whatsradar.top/cookies" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://whatsradar.top/cookies" }],
  }),
  component: CookiesPage,
});

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-extrabold text-slate-900 mt-6 mb-2">{children}</h2>;
}

function CookiesPage() {
  return (
    <LegalShell title="Política de Cookies" updated="Atualizado em 06 de julho de 2026">
      <p>
        Esta Política explica como o <strong>SpyRadar Brasil</strong> utiliza cookies
        e tecnologias semelhantes em https://whatsradar.top, em conformidade
        com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).
      </p>

      <H2>1. O que são cookies</H2>
      <p>
        Cookies são pequenos arquivos de texto armazenados no seu dispositivo
        quando você acessa um site. Eles permitem que a página funcione
        corretamente, lembrem suas preferências e ajudem a mensurar o uso.
      </p>

      <H2>2. Tipos de cookies que usamos</H2>
      <ul>
        <li>
          <strong>Essenciais:</strong> necessários para o funcionamento da
          plataforma, autenticação e segurança.
        </li>
        <li>
          <strong>De desempenho e análise:</strong> ajudam a entender como os
          visitantes utilizam o site, de forma agregada.
        </li>
        <li>
          <strong>De marketing e mensuração:</strong> usados por parceiros como
          Meta Pixel/CAPI e Google Ads para medir a eficácia das campanhas.
        </li>
      </ul>

      <H2>3. Cookies de terceiros</H2>
      <p>
        Alguns cookies são definidos por serviços terceirizados que aparecem
        em nossas páginas — por exemplo, plataformas de anúncios, análise e
        atendimento. Esses terceiros possuem políticas próprias de
        privacidade.
      </p>

      <H2>4. Como gerenciar</H2>
      <p>
        Você pode aceitar, recusar ou apagar cookies diretamente nas
        configurações do seu navegador. Ao desativar cookies, algumas
        funcionalidades da plataforma podem ficar limitadas.
      </p>

      <H2>5. Atualizações</H2>
      <p>
        Esta Política pode ser atualizada periodicamente. A data no topo
        indica a versão vigente.
      </p>

      <H2>6. Contato</H2>
      <p>
        Dúvidas sobre cookies podem ser enviadas para{" "}
        <strong>sac@spyradarbrasil.com</strong>.
      </p>
    </LegalShell>
  );
}
