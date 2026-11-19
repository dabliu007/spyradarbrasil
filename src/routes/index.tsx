import { createFileRoute } from "@tanstack/react-router";
import { VerificarPage } from "@/routes/verificar";

const SITE_URL = "https://zapradarbrasil.com.br";

const TITLE = "Spy Radar Brasil: Descubra Traição em 5 Minutos (SpyZap)";

const DESCRIPTION =
  "Spy Radar Brasil: descubra traição em 5 minutos informando apenas o número do WhatsApp. Veja conversas apagadas, fotos ocultas, áudios e localização em tempo real, 100% sigiloso.";

const KEYWORDS = [
  "SpyRadar Brasil",
  "SpyZap",
  "ZapSpy",
  "WhatsRadar",
  "descobrir traição",
  "como descobrir traição",
  "descobrir traição pelo whatsapp",
  "descobrir traição do marido",
  "descobrir traição da esposa",
  "espelhar whatsapp",
  "como espelhar whatsapp",
  "espelhar whatsapp do parceiro",
  "espelhar celular",
  "clonar whatsapp",
  "como clonar whatsapp",
  "app para clonar whatsapp",
  "clonar o whatsapp do marido",
  "clonar o whatsapp da esposa",
  "clonar celular",
  "como clonar celular do marido",
  "como clonar celular da esposa",
  "clonar celular do namorado",
  "clonar celular da namorada",
  "hackear whatsapp",
  "como hackear whatsapp",
  "hackear whatsapp do namorado",
  "hackear whatsapp da namorada",
  "hackear redes sociais",
  "hackear instagram",
  "hackear facebook",
  "ver conversas apagadas do whatsapp",
].join(", ");

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "keywords", content: KEYWORDS },
      { name: "robots", content: "index,follow,max-image-preview:large,max-snippet:-1" },
      { name: "language", content: "pt-BR" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: `${SITE_URL}/` },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { property: "og:site_name", content: "SpyRadar Brasil · SpyZap" },
      { property: "og:image", content: `${SITE_URL}/og-image.png` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "SpyRadar Brasil - Descubra a verdade pelo WhatsApp" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: `${SITE_URL}/og-image.png` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "SpyRadar Brasil",
          alternateName: ["SpyRadar Brasil", "SpyZap", "ZapSpy", "WhatsRadar"],
          url: `${SITE_URL}/`,
          inLanguage: "pt-BR",
          description: DESCRIPTION,
          potentialAction: {
            "@type": "SearchAction",
            target: `${SITE_URL}/verificar?phone={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "SpyRadar Brasil",
          alternateName: ["SpyRadar Brasil", "SpyZap"],
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Android, iOS, Web",
          url: `${SITE_URL}/`,
          description: DESCRIPTION,
          offers: {
            "@type": "Offer",
            price: "137.00",
            priceCurrency: "BRL",
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/checkout`,
          },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.8",
            reviewCount: "2431",
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "Como clonar o celular do marido?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "No SpyRadar Brasil (também conhecido como SpyZap) você informa o número do WhatsApp do seu marido e recebe o espelhamento com conversas apagadas, fotos ocultas, áudios e localização em tempo real em poucos minutos, sem que ele receba qualquer notificação.",
              },
            },
            {
              "@type": "Question",
              name: "Como clonar o celular da esposa?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Basta digitar o número do WhatsApp da sua esposa no SpyRadar Brasil. O sistema faz a verificação e libera o painel com mensagens apagadas, mídias escondidas e histórico de localização, com sigilo total.",
              },
            },
            {
              "@type": "Question",
              name: "O que é o SpyZap / SpyRadar Brasil?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "SpyZap, ZapSpy, WhatsRadar e SpyRadar Brasil são nomes populares usados para o SpyRadar Brasil, a plataforma que espelha o WhatsApp do parceiro(a) e mostra conversas, fotos, áudios e localização em um painel único.",
              },
            },
            {
              "@type": "Question",
              name: "A pessoa descobre que o celular foi clonado?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Não. O processo do SpyRadar Brasil é 100% sigiloso: nenhuma notificação, mensagem ou aviso aparece no aparelho do alvo durante ou depois da verificação.",
              },
            },
            {
              "@type": "Question",
              name: "Quanto tempo leva para clonar o WhatsApp?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Em média 5 minutos. Após a verificação do número, o painel é liberado com o histórico recuperado de conversas, fotos, áudios e localização.",
              },
            },
            {
              "@type": "Question",
              name: "Dá para ver conversas já apagadas?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Sim. O SpyRadar Brasil recupera mensagens apagadas, fotos e vídeos que somem uma única vez e áudios enviados nas últimas semanas.",
              },
            },
            {
              "@type": "Question",
              name: "Como espelhar o WhatsApp de outra pessoa?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Com o SpyRadar Brasil você espelha o WhatsApp a partir do número do parceiro(a): o sistema sincroniza as conversas, fotos, áudios e status em um painel espelhado que você acompanha em tempo real, sem instalar nada no celular do alvo.",
              },
            },
            {
              "@type": "Question",
              name: "Como clonar o WhatsApp sem pegar o celular?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Não é preciso pegar o aparelho. Basta informar o número do WhatsApp no SpyRadar Brasil (SpyZap) e o painel é liberado com o histórico de mensagens, mídias e localização, de forma remota e 100% sigilosa.",
              },
            },
            {
              "@type": "Question",
              name: "Como hackear o WhatsApp do namorado ou da namorada?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "O termo popular 'hackear WhatsApp' se refere ao espelhamento feito pelo SpyRadar Brasil: você acessa as conversas do namorado(a) informando apenas o número, sem invasão e sem que a pessoa receba qualquer aviso no aparelho.",
              },
            },
            {
              "@type": "Question",
              name: "Dá para hackear ou monitorar redes sociais como Instagram e Facebook?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Sim. Além do WhatsApp, o SpyRadar Brasil reúne informações públicas e atividade de redes sociais como Instagram e Facebook Messenger ligadas ao número investigado, em um único relatório.",
              },
            },
            {
              "@type": "Question",
              name: "Como clonar o celular do marido ou da esposa?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Clonar o celular no SpyRadar Brasil significa espelhar o conteúdo do WhatsApp e das redes sociais a partir do número. Em poucos minutos você recebe conversas apagadas, fotos ocultas, áudios e localização, sem que o marido ou a esposa desconfie.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: VerificarPage,
});
