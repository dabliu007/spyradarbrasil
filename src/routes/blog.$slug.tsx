import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { BLOG_POSTS, formatDate, getPostBySlug, renderMarkdown } from "@/lib/blog-posts";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getPostBySlug(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Artigo não encontrado · Blog SpyRadar Brasil" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { post } = loaderData;
    const url = `https://whatsradar.top/blog/${post.slug}`;
    const image = post.heroImage?.startsWith("http") ? post.heroImage : undefined;
    return {
      meta: [
        { title: `${post.title} · Blog SpyRadar Brasil` },
        { name: "description", content: post.description },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.description },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { property: "article:published_time", content: post.date },
        { property: "article:section", content: post.category },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: post.title },
        { name: "twitter:description", content: post.description },
        ...(image
          ? [
              { property: "og:image", content: image },
              { name: "twitter:image", content: image },
            ]
          : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.description,
            datePublished: post.date,
            dateModified: post.date,
            inLanguage: "pt-BR",
            articleSection: post.category,
            ...(image ? { image: [image] } : {}),
            author: { "@type": "Organization", name: post.author },
            publisher: {
              "@type": "Organization",
              name: "SpyRadar Brasil",
              url: "https://whatsradar.top/",
            },
            mainEntityOfPage: { "@type": "WebPage", "@id": url },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Início", item: "https://whatsradar.top/" },
              { "@type": "ListItem", position: 2, name: "Blog", item: "https://whatsradar.top/blog" },
              { "@type": "ListItem", position: 3, name: post.title, item: url },
            ],
          }),
        },
      ],
    };

  },
  notFoundComponent: PostNotFound,
  component: BlogPostPage,
});

const CATEGORY_STYLES: Record<string, string> = {
  Relacionamentos: "bg-rose-50 text-rose-700 border-rose-200",
  Investigação: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Tecnologia: "bg-yellow-50 text-yellow-700 border-yellow-200",
};

function categoryClass(cat: string) {
  return CATEGORY_STYLES[cat] ?? "bg-slate-50 text-slate-700 border-slate-200";
}

function PostNotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-5">
      <div className="max-w-md text-center">
        <div className="text-5xl mb-3">🔍</div>
        <h1 className="text-2xl font-extrabold text-slate-900">Artigo não encontrado</h1>
        <p className="mt-2 text-sm text-slate-600">
          O post que você procura não existe ou foi movido.
        </p>
        <Link
          to="/blog"
          className="mt-5 inline-flex items-center justify-center rounded-full bg-yellow-600 hover:bg-yellow-700 text-[#080808] font-bold px-5 py-2.5 text-sm"
        >
          Ver todos os artigos
        </Link>
      </div>
    </div>
  );
}

function BlogPostPage() {
  const { post } = Route.useLoaderData();
  const blocks = renderMarkdown(post.content);
  const related = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link to="/blog" className="flex items-center gap-2 text-slate-900">
            <div className="w-7 h-7 rounded-lg bg-yellow-600 grid place-items-center text-[#080808] text-xs font-black">
              Z
            </div>
            <span className="font-extrabold tracking-tight">
              SpyRadar Brasil<span className="text-yellow-600">.</span>Blog
            </span>
          </Link>
          <Link
            to="/blog"
            className="text-[12px] text-slate-600 hover:text-yellow-700 font-semibold"
          >
            ← Todos os artigos
          </Link>
        </div>
      </div>

      {/* Hero */}
      <header className="relative border-b border-slate-200 bg-gradient-to-br from-slate-50 via-white to-yellow-50/50">
        <div className="max-w-3xl mx-auto px-5 pt-14 pb-12">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-[10px] uppercase tracking-wider font-['Geist_Mono',monospace] font-bold px-2.5 py-1 rounded-full border ${categoryClass(post.category)}`}
            >
              {post.category}
            </span>
            <span className="text-[11px] text-slate-500 font-['Geist_Mono',monospace]">
              {post.readTime} de leitura
            </span>
          </div>

          <h1 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight">
            {post.title}
          </h1>
          <p className="mt-4 text-[16px] sm:text-lg text-slate-600 leading-relaxed">
            {post.description}
          </p>

          <div className="mt-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-600 grid place-items-center text-[#080808] font-black text-sm">
              {post.author.charAt(0)}
            </div>
            <div>
              <div className="text-[13px] font-bold text-slate-900">{post.author}</div>
              <div className="text-[11px] text-slate-500 font-['Geist_Mono',monospace]">
                {formatDate(post.date)}
              </div>
            </div>
          </div>
        </div>

        {/* Cover strip */}
        <div className="max-w-3xl mx-auto px-5 pb-8">
          <div className="relative h-56 sm:h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-yellow-500 via-yellow-600 to-amber-700">
            {post.heroImage ? (
              <>
                <img
                  src={post.heroImage}
                  alt={post.title}
                  width={1280}
                  height={720}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 right-4 text-3xl sm:text-4xl drop-shadow-lg">
                  {post.cover}
                </div>
              </>
            ) : (
              <>
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.6) 1px, transparent 1px)",
                    backgroundSize: "28px 28px",
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-[100px] sm:text-[140px]">
                  {post.cover}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-12">
        {/* Article body */}
        <article className="prose-custom">
          <div className="space-y-5 text-[16.5px] leading-[1.75] text-slate-700 font-['Geist',system-ui,sans-serif]">
            {blocks.map((b, i) => {
              if (b.type === "h2") {
                return (
                  <h2
                    key={i}
                    className="text-2xl sm:text-[28px] font-black text-slate-900 mt-10 mb-2 tracking-tight leading-tight"
                  >
                    {b.text}
                  </h2>
                );
              }
              if (b.type === "h3") {
                return (
                  <h3
                    key={i}
                    className="text-xl sm:text-[22px] font-extrabold text-slate-900 mt-8 mb-1 tracking-tight leading-tight"
                  >
                    {b.text}
                  </h3>
                );
              }
              if (b.type === "quote") {
                return (
                  <blockquote
                    key={i}
                    className="my-6 border-l-4 border-yellow-500 bg-yellow-50/60 pl-5 pr-4 py-4 rounded-r-xl italic text-slate-800 text-[17px] leading-relaxed whitespace-pre-wrap"
                  >
                    {b.text}
                  </blockquote>
                );
              }
              if (b.type === "image") {
                return (
                  <figure key={i} className="my-8 -mx-2 sm:mx-0">
                    <img
                      src={b.url}
                      alt={b.alt}
                      loading="lazy"
                      width={1024}
                      height={1024}
                      className="w-full h-auto rounded-2xl border border-slate-200 shadow-sm object-cover max-h-[520px]"
                    />
                    {b.alt && (
                      <figcaption className="mt-2 text-center text-[12px] text-slate-500 font-['Geist_Mono',monospace]">
                        {b.alt}
                      </figcaption>
                    )}
                  </figure>
                );
              }
              return (
                <p key={i} className="whitespace-pre-wrap">
                  {b.text}
                </p>
              );
            })}
          </div>
        </article>

        {/* Inline CTA */}
        <div className="mt-12 relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-yellow-950 p-8 text-white">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at 80% 20%, rgba(217,169,40,0.4), transparent 50%)",
            }}
          />
          <div className="relative z-10 text-center">
            <div className="text-[11px] uppercase tracking-[0.3em] text-yellow-300 font-['Geist_Mono',monospace] font-bold">
              Chega de dúvida
            </div>
            <h3 className="mt-2 text-xl sm:text-2xl font-black leading-tight">
              Desconfia? Verifique agora em menos de 2 minutos.
            </h3>
            <Link
              to="/verificar"
              className="mt-5 inline-flex items-center justify-center rounded-full bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-black px-7 py-3.5 text-[14px] shadow-lg shadow-yellow-500/30 transition"
            >
              Verificar um número →
            </Link>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-16 pt-10 border-t border-slate-200">
            <div className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-['Geist_Mono',monospace] font-bold mb-6">
              — Continue lendo
            </div>
            <div className="grid sm:grid-cols-3 gap-5">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to="/blog/$slug"
                  params={{ slug: r.slug }}
                  className="group flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-yellow-400 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative h-28 bg-gradient-to-br from-slate-50 to-yellow-50 border-b border-slate-100 flex items-center justify-center text-4xl">
                    {r.cover}
                  </div>
                  <div className="p-4 flex-1">
                    <div
                      className={`inline-block text-[10px] uppercase tracking-wider font-['Geist_Mono',monospace] font-bold px-2 py-0.5 rounded-full border ${categoryClass(r.category)}`}
                    >
                      {r.category}
                    </div>
                    <div className="mt-2 text-[14px] font-extrabold text-slate-900 leading-snug group-hover:text-yellow-700 transition-colors">
                      {r.title}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
