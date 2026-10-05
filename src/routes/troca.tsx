import { createFileRoute } from "@tanstack/react-router";
import { LegalShell } from "./termos";

export const Route = createFileRoute("/troca")({
  head: () => ({
    meta: [
      { title: "Política de Trocas e Devoluções · SpyRadar Brasil" },
      {
        name: "description",
        content:
          "Política de trocas, cancelamento e devolução do SpyRadar Brasil, incluindo o direito de arrependimento previsto no Código de Defesa do Consumidor.",
      },
      { property: "og:title", content: "Política de Trocas e Devoluções · SpyRadar Brasil" },
      {
        property: "og:description",
        content: "Regras de troca, cancelamento e devolução do SpyRadar Brasil.",
      },
      { property: "og:url", content: "https://whatsradar.top/troca" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://whatsradar.top/troca" }],
  }),
  component: TrocaPage,
});

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-extrabold text-slate-900 mt-6 mb-2">{children}</h2>;
}

function TrocaPage() {
  return (
    <LegalShell
      title="Política de Trocas e Devoluções"
      updated="Atualizado em 06 de julho de 2026"
    >
      <p>
        Esta política descreve as regras de <strong>cancelamento, troca e
        devolução</strong> das aquisições feitas no <strong>SpyRadar Brasil</strong>,
        em conformidade com o Código de Defesa do Consumidor (Lei nº 8.078/1990).
      </p>

      <H2>1. Direito de arrependimento</H2>
      <p>
        Por se tratar de compra realizada pela internet, você pode desistir da
        contratação em até <strong>7 (sete) dias corridos</strong> a partir da
        confirmação do pagamento, com direito à devolução integral do valor pago
        (art. 49 do CDC).
      </p>

      <H2>2. Produtos digitais (aplicativo clonador)</H2>
      <p>
        O acesso ao aplicativo e ao painel de monitoramento é liberado
        imediatamente após a confirmação do pagamento. Ainda assim, dentro do
        prazo de 7 dias você pode solicitar o cancelamento e o reembolso — veja
        também a nossa <strong>Garantia de Satisfação</strong>.
      </p>

      <H2>3. Produtos físicos (Kit Detetive)</H2>
      <ul>
        <li>
          <strong>Troca por defeito:</strong> em caso de produto com defeito ou
          avaria no transporte, a troca pode ser solicitada em até 7 dias após o
          recebimento, sem custo.
        </li>
        <li>
          <strong>Arrependimento:</strong> produtos físicos podem ser devolvidos
          em até 7 dias, desde que sem sinais de uso e na embalagem original.
        </li>
        <li>
          O produto deve ser devolvido com todos os acessórios e itens que o
          acompanhavam.
        </li>
      </ul>

      <H2>4. Como solicitar</H2>
      <p>
        Envie um e-mail para{" "}
        <strong>
          <a href="mailto:sac@spyradarbrasil.com" className="text-yellow-700 hover:underline">
            sac@spyradarbrasil.com
          </a>
        </strong>{" "}
        ou chame no WhatsApp <strong>(11) 96507-2638</strong> com o e-mail da
        compra e o número do pedido. Nossa equipe orienta os próximos passos.
      </p>

      <H2>5. Reembolso</H2>
      <p>
        Aprovada a solicitação, o estorno é processado em até{" "}
        <strong>5 dias úteis</strong>. O prazo para o crédito aparecer depende do
        meio de pagamento utilizado.
      </p>

      <H2>6. Contato</H2>
      <p>
        Dúvidas? Fale com o nosso atendimento pelo e-mail{" "}
        <strong>sac@spyradarbrasil.com</strong> ou pelo telefone/WhatsApp{" "}
        <strong>(11) 96507-2638</strong>.
      </p>
    </LegalShell>
  );
}
