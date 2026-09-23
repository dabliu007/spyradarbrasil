import { createFileRoute } from "@tanstack/react-router";
import { LegalShell } from "./termos";

export const Route = createFileRoute("/disclaimer")({
  head: () => ({
    meta: [
      { title: "Disclaimer · SpyRadar Brasil" },
      {
        name: "description",
        content:
          "Aviso legal do SpyRadar Brasil sobre a natureza informativa e de entretenimento do conteúdo, isenção de responsabilidade e ausência de vínculo com terceiros.",
      },
      { property: "og:title", content: "Disclaimer · SpyRadar Brasil" },
      { property: "og:url", content: "https://clonawhats.com/disclaimer" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://clonawhats.com/disclaimer" }],
  }),
  component: DisclaimerPage,
});

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-extrabold text-slate-900 mt-6 mb-2">{children}</h2>
  );
}

function DisclaimerPage() {
  return (
    <LegalShell title="Disclaimer / Aviso Legal" updated="Atualizado em 06 de julho de 2026">
      <H2>Natureza do conteúdo</H2>
      <p>
        Todo o conteúdo publicado no <strong>SpyRadar Brasil</strong> tem caráter
        exclusivamente <strong>informativo, ilustrativo e de entretenimento</strong>,
        destinado a pessoas maiores de 18 anos. Prints, imagens, áudios,
        vídeos, relatórios e demonstrações apresentados na plataforma são de
        natureza <strong>ficcional</strong>, produzidos para fins de
        apresentação e reflexão sobre comportamento em relacionamentos.
      </p>

      <H2>Isenção de responsabilidade</H2>
      <p>
        As informações aqui disponibilizadas não substituem aconselhamento
        jurídico, psicológico, médico ou profissional de qualquer natureza. O
        SpyRadar Brasil não se responsabiliza por decisões pessoais, familiares ou
        profissionais tomadas com base no conteúdo do site.
      </p>

      <H2>Sem promessa de resultado</H2>
      <p>
        Os resultados eventualmente exibidos, incluindo depoimentos, podem
        variar de pessoa para pessoa e não constituem promessa ou garantia de
        qualquer tipo de resultado.
      </p>

      <H2>Sem vínculo com plataformas de terceiros</H2>
      <p>
        O SpyRadar Brasil é uma plataforma independente e <strong>não possui vínculo,
        parceria ou autorização</strong> do WhatsApp, Meta Platforms, Inc.,
        Instagram, Facebook, Google LLC, YouTube, TikTok, ByteDance Ltd. ou de
        qualquer uma de suas subsidiárias ou afiliadas. Todas as marcas
        mencionadas pertencem aos seus respectivos titulares.
      </p>

      <H2>Uso adequado</H2>
      <p>
        O uso da plataforma deve respeitar integralmente a legislação
        brasileira, incluindo a Lei nº 12.737/2012 (Lei Carolina Dieckmann), o
        Marco Civil da Internet (Lei nº 12.965/2014) e a LGPD (Lei nº
        13.709/2018). Qualquer tentativa de utilizar a plataforma para acessar
        dados de terceiros sem autorização é de responsabilidade exclusiva do
        usuário.
      </p>

      <H2>Publicidade</H2>
      <p>
        Este site pode veicular anúncios de parceiros ou promover conteúdos
        próprios. Anúncios são exibidos de forma identificável e não
        representam endosso a produtos, serviços ou opiniões de terceiros.
      </p>

      <H2>Contato</H2>
      <p>
        Dúvidas sobre este aviso podem ser enviadas para{" "}
        <strong>sac@spyradarbrasil.com</strong>.
      </p>
    </LegalShell>
  );
}
