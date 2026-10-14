import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de Uso · SpyRadar Brasil" },
      { name: "description", content: "Termos de uso do SpyRadar Brasil: regras, responsabilidades e limitações de uso da plataforma." },
      { property: "og:title", content: "Termos de Uso · SpyRadar Brasil" },
      { property: "og:description", content: "Termos de uso do SpyRadar Brasil." },
      { property: "og:url", content: "https://zapradarbrasil.com.br/termos" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://zapradarbrasil.com.br/termos" }],
  }),
  component: TermosPage,
});

function TermosPage() {
  return <LegalShell title="Termos de Uso" updated="Atualizado em 06 de julho de 2026">
    <p>
      Estes Termos de Uso ("Termos") regulam o acesso e a utilização do site
      <strong> SpyRadar Brasil</strong> ("SpyRadar Brasil", "nós", "plataforma"), acessível em
      https://zapradarbrasil.com.br. Ao acessar ou utilizar a plataforma, você declara
      ter lido, entendido e concordado integralmente com estes Termos. Caso não
      concorde, você não deve utilizar o serviço.
    </p>

    <H2>1. Natureza do serviço</H2>
    <p>
      O SpyRadar Brasil é um serviço digital de <strong>entretenimento e conteúdo
      informativo</strong> destinado exclusivamente a pessoas maiores de 18
      (dezoito) anos. As demonstrações, prints, áudios, vídeos e relatórios
      exibidos na plataforma têm caráter <strong>ilustrativo e ficcional</strong>,
      sendo utilizados para fins de apresentação de conteúdo, análise
      comportamental e reflexão sobre relacionamentos.
    </p>
    <p>
      O SpyRadar Brasil <strong>não</strong> intercepta, clona, invade, monitora ou
      acessa dispositivos, contas, mensagens, chamadas ou dados pessoais de
      terceiros. Nenhuma comunicação privada é obtida sem consentimento.
    </p>

    <H2>2. Cadastro e uso adequado</H2>
    <ul>
      <li>Você declara ser maior de 18 anos e ter capacidade civil plena.</li>
      <li>As informações fornecidas devem ser verdadeiras, próprias e atualizadas.</li>
      <li>É proibido utilizar a plataforma para fins ilícitos, fraudulentos, discriminatórios ou que violem direitos de terceiros.</li>
      <li>É proibido tentar burlar mecanismos técnicos, de segurança ou de cobrança.</li>
    </ul>

    <H2>3. Pagamentos e entrega</H2>
    <p>
      Todos os valores exibidos estão em Reais (BRL) e podem ser cobrados via
      Pix ou outras formas ofertadas na página de pagamento. O acesso ao
      conteúdo contratado é liberado após a confirmação do pagamento pelo
      provedor.
    </p>
    <p>
      Devido à natureza digital e imediata do serviço, o conteúdo é entregue e
      consumido no ato da confirmação do pagamento, não sendo aplicável a
      devolução dos valores pagos.
    </p>

    <H2>4. Propriedade intelectual</H2>
    <p>
      Todo o conteúdo do SpyRadar Brasil — incluindo marca, layout, textos, imagens,
      código-fonte, ícones e materiais audiovisuais — é protegido pela
      legislação de propriedade intelectual e pertence ao SpyRadar Brasil ou é
      utilizado sob licença. É proibida a reprodução, distribuição ou uso
      comercial sem autorização por escrito.
    </p>

    <H2>5. Limitação de responsabilidade</H2>
    <p>
      O SpyRadar Brasil oferece a plataforma "no estado em que se encontra". Não
      garantimos que o serviço estará livre de interrupções, indisponibilidades
      ou erros. Não somos responsáveis por decisões pessoais, familiares,
      profissionais ou emocionais tomadas pelo usuário com base no conteúdo
      apresentado, que possui caráter ilustrativo e de entretenimento.
    </p>
    <p>
      Você é o único responsável por eventuais consequências decorrentes de
      qualquer uso indevido da plataforma ou de tentativas de acessar dados de
      terceiros sem autorização, o que caracteriza infração à Lei nº 12.737/2012
      ("Lei Carolina Dieckmann"), à Lei nº 12.965/2014 ("Marco Civil da
      Internet") e à Lei nº 13.709/2018 ("LGPD").
    </p>

    <H2>6. Alterações destes Termos</H2>
    <p>
      Estes Termos podem ser atualizados a qualquer momento. A versão vigente
      estará sempre disponível nesta página, e o uso continuado da plataforma
      após alterações representa aceitação da nova versão.
    </p>

    <H2>7. Legislação aplicável e foro</H2>
    <p>
      Estes Termos são regidos pelas leis da República Federativa do Brasil.
      Fica eleito o foro do domicílio do consumidor para dirimir controvérsias
      decorrentes destes Termos, com renúncia expressa a qualquer outro, por
      mais privilegiado que seja.
    </p>

    <H2>8. Contato</H2>
    <p>
      Dúvidas, solicitações ou reclamações podem ser encaminhadas para
      <strong> sac@zapradarbrasil.com.br</strong> ou pelo telefone/WhatsApp{" "}
      <strong>(11) 96507-2638</strong>.
    </p>
  </LegalShell>;
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-extrabold text-slate-900 mt-6 mb-2">{children}</h2>;
}

export function LegalShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-slate-800 font-['Inter',sans-serif] relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(217,169,40,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(217,169,40,0.05) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-yellow-500/[0.08] blur-[160px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-5 py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-[12px] text-yellow-700 font-semibold hover:underline"
        >
          ← Voltar
        </Link>

        <div className="mt-4 bg-gradient-to-br from-white/95 to-slate-50/40 backdrop-blur-xl border border-yellow-200 rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_rgba(217,169,40,0.12)]">
          <div className="text-[10px] uppercase tracking-[0.3em] text-yellow-700 font-['Geist_Mono',monospace] font-bold">
            SpyRadar Brasil · Legal
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900">
            {title}
          </h1>
          <div className="mt-1 text-[11px] text-slate-500 font-['Geist_Mono',monospace]">
            {updated}
          </div>

          <div className="mt-5 space-y-3 text-[14px] leading-relaxed">
            {children}
          </div>

          <div className="mt-8 pt-5 border-t border-slate-200 text-[12px] text-slate-500 flex gap-4 justify-center">
            <Link to="/termos" className="hover:text-yellow-700">Termos de Uso</Link>
            <span>•</span>
            <Link to="/privacidade" className="hover:text-yellow-700">Política de Privacidade</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
