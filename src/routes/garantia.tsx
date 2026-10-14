import { createFileRoute } from "@tanstack/react-router";
import { LegalShell } from "./termos";

export const Route = createFileRoute("/garantia")({
  head: () => ({
    meta: [
      { title: "Garantia · SpyRadar Brasil" },
      {
        name: "description",
        content:
          "Garantia incondicional de 7 dias do SpyRadar Brasil: se você não conseguir clonar o celular e ver o que procura, devolvemos 100% do valor.",
      },
      { property: "og:title", content: "Garantia · SpyRadar Brasil" },
      {
        property: "og:description",
        content: "Garantia de satisfação do SpyRadar Brasil.",
      },
      { property: "og:url", content: "https://zapradarbrasil.com.br/garantia" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://zapradarbrasil.com.br/garantia" }],
  }),
  component: GarantiaPage,
});

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-extrabold text-slate-900 mt-6 mb-2">{children}</h2>;
}

function GarantiaPage() {
  return (
    <LegalShell title="Garantia de Satisfação" updated="Atualizado em 06 de julho de 2026">
      <p>
        O <strong>SpyRadar Brasil</strong> oferece uma <strong>garantia
        incondicional</strong> para que você teste o aplicativo clonador sem
        risco. Se dentro do prazo abaixo você não conseguir clonar o celular e
        acompanhar as conversas, fotos, ligações e localização, devolvemos{" "}
        <strong>100% do valor pago</strong>.
      </p>

      <H2>1. Prazo da garantia</H2>
      <p>
        Você tem <strong>7 (sete) dias corridos</strong>, contados a partir da
        confirmação do pagamento, para solicitar o reembolso integral — em
        conformidade com o direito de arrependimento previsto no art. 49 do
        Código de Defesa do Consumidor (Lei nº 8.078/1990) para compras feitas
        pela internet.
      </p>

      <H2>2. O que a garantia cobre</H2>
      <ul>
        <li>Não conseguir ativar o clone do celular alvo.</li>
        <li>Não conseguir visualizar WhatsApp, mensagens, fotos ou localização.</li>
        <li>Insatisfação com o serviço dentro do período de garantia.</li>
      </ul>

      <H2>3. Como solicitar o reembolso</H2>
      <p>
        Basta enviar um e-mail para{" "}
        <strong>
          <a href="mailto:sac@zapradarbrasil.com.br" className="text-yellow-700 hover:underline">
            sac@zapradarbrasil.com.br
          </a>
        </strong>{" "}
        ou chamar no WhatsApp <strong>(11) 96507-2638</strong> informando o
        e-mail e o comprovante de compra. Não pedimos justificativa.
      </p>

      <H2>4. Prazo de devolução do valor</H2>
      <p>
        Após a solicitação, o estorno é processado em até{" "}
        <strong>5 dias úteis</strong>. O prazo para o valor aparecer na sua conta
        pode variar conforme o meio de pagamento (Pix costuma ser mais rápido que
        cartão).
      </p>

      <H2>5. Contato</H2>
      <p>
        Dúvidas sobre a garantia? Fale com o nosso atendimento pelo e-mail{" "}
        <strong>sac@zapradarbrasil.com.br</strong> ou pelo telefone/WhatsApp{" "}
        <strong>(11) 96507-2638</strong>.
      </p>
    </LegalShell>
  );
}
