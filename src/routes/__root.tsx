import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Analytics } from "@vercel/analytics/react";

// Vite 8 + TanStack Start dev não serve o CSS importado via `?url`
// (a requisição cai no handler SSR e é rejeitada), então importamos o CSS
// compilado como string com `?inline` e o injetamos num <style> no <head>.
import appCss from "../styles.css?inline";
import { reportLovableError } from "../lib/lovable-error-reporting";

import { capturePersistedUtms, fbqTrack, FB_PIXEL_IDS } from "../lib/tracking";

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;700&family=Inter:wght@400;600;700&display=swap";

// Injeta o CSS das fontes via JS após o parsing do HTML, para não bloquear
// a renderização inicial (First Contentful Paint).
const FONTS_LOADER = `
(function(){
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '${FONTS_HREF}';
  document.head.appendChild(link);
})();
`;

const FB_PIXEL_INIT = `
(function(){
  function loadPixel(){
    if (window.__fbqLoaded) return; window.__fbqLoaded = true;
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
${FB_PIXEL_IDS.map((id) => `    fbq('init', '${id}');`).join("\n")}
  }
  if (document.readyState === 'complete') { setTimeout(loadPixel, 0); }
  else { window.addEventListener('load', function(){ setTimeout(loadPixel, 0); }, { once: true }); }
})();
`;

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#080808" },
      { title: "Spy Radar Brasil: Descubra Traição em 5 Minutos" },
      {
        name: "description",
        content:
          "Spy Radar Brasil: descubra traição em 5 minutos. Clone o WhatsApp do seu parceiro(a) e veja conversas apagadas, fotos ocultas e áudios secretos sem que ele(a) desconfie.",
      },
      { name: "keywords", content: "spyradar brasil, spyradar, spyzap, zapspy, descobrir traição, espelhar whatsapp, clonar whatsapp, clonar celular, hackear whatsapp, hackear redes sociais, hackear instagram, hackear facebook, como clonar celular do marido, como clonar celular da esposa, ver conversas apagadas do whatsapp" },
      { name: "author", content: "SpyRadar Brasil" },
      { name: "robots", content: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" },
      { property: "og:site_name", content: "SpyRadar Brasil" },
      { property: "og:locale", content: "pt_BR" },
      { property: "og:title", content: "Spy Radar Brasil: Descubra Traição em 5 Minutos" },
      { property: "og:description", content: "Spy Radar Brasil: descubra traição em 5 minutos. Clone o WhatsApp e veja conversas apagadas, fotos ocultas e áudios secretos sem que ele(a) desconfie." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://zapradarbrasil.com.br/og-image.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "SpyRadar Brasil - Descubra a verdade pelo WhatsApp" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Spy Radar Brasil: Descubra Traição em 5 Minutos" },
      { name: "twitter:description", content: "Spy Radar Brasil: descubra traição em 5 minutos. Clone o WhatsApp e veja conversas apagadas, fotos e áudios secretos sem que ele(a) desconfie." },
      { name: "twitter:image", content: "https://zapradarbrasil.com.br/og-image.png" },

    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "preconnect", href: "https://connect.facebook.net" },
    ],
    scripts: [
      // Injeta o CSS das fontes de forma assíncrona (não bloqueia o FCP).
      { children: FONTS_LOADER, defer: true },
      // Defer FB Pixel init until after `load` — não bloqueia a renderização inicial.
      { children: FB_PIXEL_INIT, defer: true },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "SpyRadar Brasil",
          alternateName: ["SpyRadar Brasil", "SpyZap", "ZapSpy", "WhatsRadar"],
          url: "https://zapradarbrasil.com.br/",
          logo: "https://zapradarbrasil.com.br/og-image.png",
          description:
            "Plataforma de análise digital que ajuda pessoas a investigarem suspeitas de infidelidade a partir do número de WhatsApp do parceiro(a).",
          contactPoint: [
            {
              "@type": "ContactPoint",
              contactType: "customer support",
              email: "sac@zapradarbrasil.com.br",
              telephone: "+55-11-96507-2638",
              availableLanguage: ["Portuguese"],
            },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "SpyRadar Brasil",
          url: "https://zapradarbrasil.com.br/",
          inLanguage: "pt-BR",
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: "https://zapradarbrasil.com.br/verificar?phone={search_term_string}",
            },
            "query-input": "required name=search_term_string",
          },
        }),
      },
    ],

  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className="scroll-smooth bg-[#080808]">
      <head>
        <HeadContent />
        <style
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: appCss }}
        />
        {/* Fallback para navegadores sem JS — o caso comum carrega as fontes via FONTS_LOADER */}
        <noscript>
          <link rel="stylesheet" href={FONTS_HREF} />
        </noscript>
      </head>
      <body>
        <noscript>
          {FB_PIXEL_IDS.map((id) => (
            <img
              key={id}
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1`}
              alt=""
            />
          ))}
        </noscript>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  // Captura/persiste UTMs e dispara PageView a cada navegação.
  useEffect(() => {
    capturePersistedUtms();
    fbqTrack("PageView");
    const unsub = router.subscribe("onResolved", () => {
      capturePersistedUtms();
      fbqTrack("PageView");
    });
    return () => unsub();
  }, [router]);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <Analytics />
    </QueryClientProvider>
  );
}

