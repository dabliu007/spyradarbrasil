import { Link } from "@tanstack/react-router";
import { Shield, Lock, Mail, Phone } from "lucide-react";

export default function FooterCredibilidade() {
  const anoAtual = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 font-['Inter',sans-serif]">
      {/* Faixa de selos de confiança */}
      <div className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-wrap items-center justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-yellow-400" />
            <span>Site protegido por criptografia SSL</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-yellow-400" />
            <span>Pagamento 100% seguro</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-yellow-400" />
            <span>Dados protegidos conforme a LGPD</span>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Coluna 1 — Empresa */}
        <div>
          <h3 className="text-white font-semibold mb-3">SpyRadar Brasil</h3>
          <p className="text-sm leading-relaxed">
            Spy Monitoramento LTDA
            <br />
            CNPJ: 17.722.425/0001-07
            <br />
            Rodovia Curitiba–Paranaguá, BR-277, 793 — Cajuru
            <br />
            Curitiba – PR, CEP 82900-335
          </p>
          <p className="text-sm mt-3 text-slate-400">
            Ferramenta independente de análise e conteúdo digital, com foco em
            relacionamentos e comportamento.
          </p>
        </div>

        {/* Coluna 2 — Links legais */}
        <div>
          <h3 className="text-white font-semibold mb-3">Informações Legais</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/sobre" className="hover:text-white transition-colors">
                Sobre nós
              </Link>
            </li>
            <li>
              <Link to="/contato" className="hover:text-white transition-colors">
                Contato
              </Link>
            </li>
            <li>
              <Link to="/blog" className="hover:text-white transition-colors">
                Blog
              </Link>
            </li>
            <li>
              <Link to="/termos" className="hover:text-white transition-colors">
                Termos de Uso
              </Link>
            </li>
            <li>
              <Link to="/privacidade" className="hover:text-white transition-colors">
                Política de Privacidade
              </Link>
            </li>
            <li>
              <Link to="/cookies" className="hover:text-white transition-colors">
                Política de Cookies
              </Link>
            </li>
            <li>
              <Link to="/disclaimer" className="hover:text-white transition-colors">
                Disclaimer
              </Link>
            </li>
          </ul>
        </div>

        {/* Coluna 3 — Atendimento */}
        <div>
          <h3 className="text-white font-semibold mb-3">Atendimento</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <a href="mailto:sac@spyradarbrasil.com" className="hover:text-white transition-colors">
                sac@spyradarbrasil.com
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <a href="tel:+5511965072638" className="hover:text-white transition-colors">
                (11) 96507-2638
              </a>
            </li>
            <li className="text-slate-400">
              Horário de atendimento: segunda a sexta, das 9h às 18h
            </li>
            <li className="text-slate-400">Prazo de resposta: até 24h úteis</li>
          </ul>
        </div>
      </div>

      {/* Disclaimers — parte mais importante pra aprovação */}
      <div className="border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-6 space-y-3 text-xs text-slate-400 leading-relaxed">
          <p>
            Este site não é afiliado, associado, autorizado, endossado por, ou de qualquer
            forma oficialmente conectado ao Google LLC, YouTube ou qualquer uma de suas
            subsidiárias ou afiliadas. Os nomes Google e YouTube, bem como logotipos e marcas
            relacionadas, são marcas registradas de seus respectivos proprietários.
          </p>
          <p>
            Este site não é afiliado, associado, autorizado ou endossado pela TikTok, pela
            ByteDance Ltd. ou por qualquer uma de suas subsidiárias ou afiliadas. TikTok é uma
            marca registrada de seus respectivos proprietários.
          </p>
          <p>
            Este site também não faz parte do Facebook, Instagram ou Meta Platforms, Inc., e
            não é endossado pela Meta de nenhuma forma.
          </p>
          <p>
            O SpyRadar Brasil é uma ferramenta independente e não possui qualquer vínculo, parceria ou
            autorização do WhatsApp ou da Meta Platforms, Inc. WhatsApp é uma marca registrada
            da Meta Platforms, Inc.
          </p>
          <p>
            Os resultados apresentados neste site podem variar de pessoa para pessoa. Nenhuma
            informação contida nesta página deve ser interpretada como promessa ou garantia de
            resultados. Todo o conteúdo tem caráter exclusivamente informativo e de
            entretenimento.
          </p>
          <p>
            Ao fornecer seus dados neste site, você concorda com nossa Política de Privacidade,
            em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
          </p>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-4 text-center text-xs text-slate-500">
          © {anoAtual} SpyRadar Brasil — Spy Monitoramento LTDA — CNPJ 17.722.425/0001-07.
          Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
