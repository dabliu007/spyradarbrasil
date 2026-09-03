import { createFileRoute } from "@tanstack/react-router";
import { LegalShell } from "./termos";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade · SpyRadar Brasil" },
      { name: "description", content: "Como o SpyRadar Brasil coleta, utiliza e protege seus dados pessoais em conformidade com a LGPD." },
      { property: "og:title", content: "Política de Privacidade · SpyRadar Brasil" },
      { property: "og:description", content: "Como tratamos seus dados no SpyRadar Brasil." },
      { property: "og:url", content: "https://clonawhats.com/privacidade" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://clonawhats.com/privacidade" }],
  }),
  component: PrivacidadePage,
});

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-extrabold text-slate-900 mt-6 mb-2">{children}</h2>;
}

function PrivacidadePage() {
  return (
    <LegalShell
      title="Política de Privacidade"
      updated="Atualizado em 06 de julho de 2026"
    >
      <p>
        Esta Política de Privacidade descreve como o <strong>SpyRadar Brasil</strong>
        {" "}("nós", "plataforma") coleta, utiliza, armazena e protege dados
        pessoais dos usuários que acessam https://clonawhats.com, em
        conformidade com a <strong>Lei Geral de Proteção de Dados (Lei nº
        13.709/2018 — LGPD)</strong> e demais normas aplicáveis.
      </p>

      <H2>1. Controlador dos dados</H2>
      <p>
        O SpyRadar Brasil é o controlador dos dados pessoais tratados no âmbito da
        plataforma. Solicitações relacionadas a dados pessoais podem ser
        enviadas para <strong>privacidade@whatsradar.com</strong>.
      </p>

      <H2>2. Dados que coletamos</H2>
      <ul>
        <li><strong>Dados de contato e cadastro:</strong> nome, e-mail, telefone/WhatsApp e, quando necessário para pagamento, CPF.</li>
        <li><strong>Dados de pagamento:</strong> valor, meio de pagamento e identificador da transação (nunca armazenamos dados completos de cartão — o processamento é feito por parceiros certificados).</li>
        <li><strong>Dados de navegação:</strong> endereço IP, tipo de dispositivo, sistema operacional, navegador, páginas visitadas, origem do tráfego e parâmetros de campanha (UTMs, fbclid, gclid).</li>
        <li><strong>Cookies e identificadores:</strong> utilizados para funcionamento do site, análise de audiência e mensuração de campanhas publicitárias.</li>
      </ul>

      <H2>3. Finalidades do tratamento</H2>
      <ul>
        <li>Executar o serviço contratado e entregar o conteúdo.</li>
        <li>Processar pagamentos e emitir comprovantes.</li>
        <li>Prevenir fraudes, abusos e proteger a segurança da plataforma.</li>
        <li>Enviar comunicações transacionais (confirmações, avisos, suporte).</li>
        <li>Analisar o uso do site e otimizar campanhas de marketing.</li>
        <li>Cumprir obrigações legais, regulatórias e fiscais.</li>
      </ul>

      <H2>4. Bases legais</H2>
      <p>
        O tratamento de dados ocorre com fundamento nas seguintes bases legais
        da LGPD: (i) execução de contrato ou procedimentos preliminares (art.
        7º, V); (ii) cumprimento de obrigação legal ou regulatória (art. 7º,
        II); (iii) legítimo interesse, respeitados seus direitos (art. 7º, IX);
        e (iv) consentimento, quando aplicável (art. 7º, I), como para cookies
        não essenciais.
      </p>

      <H2>5. Compartilhamento com terceiros</H2>
      <p>
        Compartilhamos dados apenas com prestadores necessários para operar o
        serviço, tais como:
      </p>
      <ul>
        <li><strong>Processadores de pagamento</strong> (para intermediação de Pix/cartão).</li>
        <li><strong>Provedores de hospedagem e infraestrutura em nuvem.</strong></li>
        <li><strong>Ferramentas de análise e publicidade</strong> (por exemplo, Meta Pixel/CAPI e Google Ads), utilizadas para mensurar campanhas de forma agregada, pseudonimizada ou hashed sempre que possível.</li>
      </ul>
      <p>
        Não vendemos dados pessoais. Compartilhamentos com autoridades ocorrem
        apenas mediante requisição legal legítima.
      </p>

      <H2>6. Cookies</H2>
      <p>
        Utilizamos cookies próprios e de terceiros para: (a) manter o site
        funcionando; (b) lembrar preferências; (c) medir audiência; e (d)
        atribuir conversões de campanhas. Você pode desativar cookies nas
        configurações do seu navegador — algumas funcionalidades podem ficar
        limitadas.
      </p>

      <H2>7. Retenção</H2>
      <p>
        Os dados são mantidos pelo tempo necessário para cumprir as finalidades
        descritas e observar prazos legais (por exemplo, guarda fiscal e
        prevenção a fraudes), sendo posteriormente eliminados ou anonimizados.
      </p>

      <H2>8. Segurança</H2>
      <p>
        Adotamos medidas técnicas e administrativas adequadas para proteger os
        dados contra acessos não autorizados, perda, alteração ou destruição —
        incluindo criptografia em trânsito (HTTPS), controles de acesso e
        monitoramento contínuo. Nenhum sistema é 100% infalível; em caso de
        incidente relevante, comunicaremos a ANPD e os titulares afetados
        conforme a LGPD.
      </p>

      <H2>9. Seus direitos (art. 18 da LGPD)</H2>
      <p>Você pode solicitar, a qualquer momento:</p>
      <ul>
        <li>Confirmação da existência de tratamento e acesso aos dados;</li>
        <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
        <li>Anonimização, bloqueio ou eliminação de dados desnecessários;</li>
        <li>Portabilidade dos dados;</li>
        <li>Revogação do consentimento;</li>
        <li>Informação sobre com quem compartilhamos seus dados.</li>
      </ul>
      <p>
        Solicitações devem ser enviadas para <strong>privacidade@whatsradar.com</strong>
        {" "}e serão respondidas nos prazos legais.
      </p>

      <H2>10. Público infantil</H2>
      <p>
        O serviço é destinado exclusivamente a maiores de 18 anos. Não
        coletamos intencionalmente dados de crianças ou adolescentes.
      </p>

      <H2>11. Transferências internacionais</H2>
      <p>
        Alguns provedores podem processar dados fora do Brasil. Nesses casos,
        exigimos que adotem padrões de proteção compatíveis com a LGPD.
      </p>

      <H2>12. Alterações desta Política</H2>
      <p>
        Podemos atualizar esta Política periodicamente. A versão vigente estará
        sempre disponível nesta página, com a respectiva data de atualização.
      </p>

      <H2>13. Encarregado (DPO) e contato</H2>
      <p>
        Para questões sobre privacidade e proteção de dados, entre em contato
        pelo e-mail <strong>privacidade@whatsradar.com</strong>.
      </p>
    </LegalShell>
  );
}
