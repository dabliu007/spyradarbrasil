import { Link } from "@tanstack/react-router";

export default function FooterLegal() {
  const anoAtual = new Date().getFullYear();

  return (
    <footer className="w-full max-w-lg mx-auto mt-6 px-2">
      <div className="bg-zinc-950/60 backdrop-blur border border-zinc-800 rounded-xl px-4 py-4 text-[11px] leading-relaxed text-zinc-500 space-y-3">
        <p className="text-zinc-400">
          &copy;{anoAtual} Spy Radar Brasil &mdash; Todos os direitos reservados.
        </p>

        <p>
          Esta plataforma tem finalidade exclusivamente informativa e destina-se a
          auxiliar usuários a consultar e compreender informações que a própria
          conta de WhatsApp já exibe publicamente, sempre dentro dos limites da
          legislação vigente.
        </p>

        <p>
          O Spy Radar Brasil destina-se apenas ao uso legal. O serviço lê somente
          informações que a própria conta escolheu tornar públicas no WhatsApp:
          não solicita senha, não instala nada no aparelho e não contorna
          configurações de privacidade nem concede acesso a contas de terceiros.
          O usuário é responsável por utilizar o serviço em conformidade com a
          legislação aplicável, inclusive a Lei Geral de Proteção de Dados (Lei
          n&ordm; 13.709/2018). Em caso de dúvida sobre a legalidade de uso em sua
          jurisdição, consulte seu assessor jurídico.
        </p>

        <p>
          Este site não é afiliado, associado, autorizado, endossado por, ou de
          qualquer forma oficialmente conectado ao WhatsApp, à Meta Platforms,
          Inc. ou ao Google LLC. WhatsApp e Meta são marcas registradas de seus
          respectivos proprietários. O conteúdo e as informações presentes neste
          site são de responsabilidade exclusiva do proprietário do domínio. Os
          resultados podem variar de pessoa para pessoa. Este site segue as
          diretrizes e políticas de publicidade do Google Ads. O uso deste site
          implica na aceitação dos nossos{" "}
          <Link to="/termos" className="underline text-zinc-400 hover:text-zinc-200 transition-colors">
            Termos de Uso
          </Link>{" "}
          e{" "}
          <Link to="/privacidade" className="underline text-zinc-400 hover:text-zinc-200 transition-colors">
            Política de Privacidade
          </Link>
          .
        </p>
      </div>
    </footer>
  );
}
