import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { BLOG_POSTS, formatDate } from "@/lib/blog-posts";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog ZapRadar · Relacionamentos, Traição e Investigação Digital" },
      {
        name: "description",
        content:
          "Artigos sobre sinais de traição, WhatsApp clonado, mensagens apagadas e como investigar a fidelidade do seu parceiro(a) com discrição.",
      },
      { property: "og:title", content: "Blog ZapRadar" },
      {
        property: "og:description",
        content:
          "Guias e artigos práticos sobre relacionamentos, traição e investigação digital.",
      },
      { property: "og:url", content: "https://zapradar.online/blog" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://zapradar.online/blog" }],
  }),
  component: BlogIndex,
});

const CATEGORY_STYLES: Record<string, string> = {
  Relacionamentos: "bg-rose-50 text-rose-700 border-rose-200",
  Investigação: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Tecnologia: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function categoryClass(cat: string) {
  return CATEGORY_STYLES[cat] ?? "bg-slate-50 text-slate-700 border-slate-200";
}

function BlogIndex() {
  useEffect(() => {
    const SRC = "https://app.trysoro.com/api/embed/4380ff6e-6a90-411d-908e-f2d96c3caa42";
    if (document.querySelector(`script[src="${SRC}"]`)) return;
    const s = document.createElement("script");
    s.src = SRC;
    s.defer = true;
    document.body.appendChild(s);
  }, []);

  const [featured, ...rest] = BLOG_POSTS;
  const categories = Array.from(new Set(BLOG_POSTS.map((p) => p.category)));

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 grid place-items-center text-white text-xs font-black">
              Z
            </div>
            <span className="font-extrabold text-slate-900 tracking-tight">
              ZapRadar<span className="text-emerald-600">.</span>Blog
            </span>
          </Link>
          <Link
            to="/verificar"
            className="hidden sm:inline-flex items-center gap-1 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2 text-[13px] transition"
          >
            Verificar número →
          </Link>
        </div>
      </div>

      {/* Hero header */}
      <header className="border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-5 pt-14 pb-10">
          <div className="text-[11px] uppercase tracking-[0.3em] text-emerald-700 font-['Geist_Mono',monospace] font-bold">
            Diário da investigação digital
          </div>
          <h1 className="mt-3 text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 leading-[1.05] tracking-tight max-w-3xl">
            A verdade sobre o que acontece{" "}
            <span className="italic font-serif text-emerald-700">na tela dele.</span>
          </h1>
          <p className="mt-5 text-[15px] sm:text-base text-slate-600 leading-relaxed max-w-2xl">
            Guias, análises e histórias reais sobre sinais de traição, WhatsApp
            clonado e como agir com discrição quando algo não parece certo.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            {categories.map((c) => (
              <span
                key={c}
                className={`text-[11px] uppercase tracking-wider font-['Geist_Mono',monospace] font-bold px-2.5 py-1 rounded-full border ${categoryClass(c)}`}
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-12 space-y-14">
        {/* Featured post */}
        {featured && (
          <section>
            <div className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-['Geist_Mono',monospace] font-bold mb-4">
              — Em destaque
            </div>
            <Link
              to="/blog/$slug"
              params={{ slug: featured.slug }}
              className="group grid md:grid-cols-2 gap-0 bg-slate-900 rounded-3xl overflow-hidden shadow-[0_30px_80px_-30px_rgba(15,23,42,0.35)]"
            >
              <div className="relative h-64 md:h-auto bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 overflow-hidden">
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.6) 1px, transparent 1px), radial-gradient(circle at 70% 60%, rgba(255,255,255,0.4) 1px, transparent 1px)",
                    backgroundSize: "24px 24px, 36px 36px",
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-[140px] md:text-[180px] group-hover:scale-110 transition-transform duration-500">
                  {featured.cover}
                </div>
                <div className="absolute top-4 left-4">
                  <span className="text-[10px] uppercase tracking-widest font-['Geist_Mono',monospace] font-bold bg-white/90 text-slate-900 px-3 py-1 rounded-full">
                    ★ Leitura essencial
                  </span>
                </div>
              </div>
              <div className="p-8 md:p-10 flex flex-col justify-center text-white">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-['Geist_Mono',monospace] font-bold text-emerald-300">
                  <span>{featured.category}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-300">{featured.readTime}</span>
                </div>
                <h2 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight group-hover:text-emerald-200 transition-colors">
                  {featured.title}
                </h2>
                <p className="mt-4 text-[15px] text-slate-300 leading-relaxed">
                  {featured.description}
                </p>
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-[12px] text-slate-400 font-['Geist_Mono',monospace]">
                    {formatDate(featured.date)} · {featured.author}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[13px] font-bold text-emerald-300 group-hover:gap-2 transition-all">
                    Ler artigo →
                  </span>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* Grid */}
        {rest.length > 0 && (
          <section>
            <div className="flex items-end justify-between mb-6">
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-['Geist_Mono',monospace] font-bold">
                  — Últimos artigos
                </div>
                <h3 className="mt-1 text-2xl font-black text-slate-900 tracking-tight">
                  Todas as investigações
                </h3>
              </div>
              <div className="text-[12px] text-slate-500 font-['Geist_Mono',monospace] hidden sm:block">
                {BLOG_POSTS.length} artigos
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {rest.map((post) => (
                <Link
                  key={post.slug}
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="group flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-emerald-400 hover:shadow-[0_20px_50px_-20px_rgba(16,185,129,0.35)] hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative h-40 bg-gradient-to-br from-slate-50 to-emerald-50 border-b border-slate-100 overflow-hidden">
                    <div
                      className="absolute inset-0 opacity-40"
                      style={{
                        backgroundImage:
                          "linear-gradient(to right, rgba(16,185,129,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(16,185,129,0.08) 1px, transparent 1px)",
                        backgroundSize: "20px 20px",
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-500">
                      {post.cover}
                    </div>
                    <div className="absolute top-3 left-3">
                      <span
                        className={`text-[10px] uppercase tracking-wider font-['Geist_Mono',monospace] font-bold px-2 py-0.5 rounded-full border ${categoryClass(post.category)}`}
                      >
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h4 className="text-[16px] font-extrabold text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
                      {post.title}
                    </h4>
                    <p className="mt-2 text-[13.5px] text-slate-600 leading-relaxed line-clamp-3">
                      {post.description}
                    </p>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-['Geist_Mono',monospace]">
                      <span>{formatDate(post.date)}</span>
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 p-8 sm:p-12 text-white">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at 80% 20%, rgba(16,185,129,0.4), transparent 50%)",
            }}
          />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
            <div className="flex-1">
              <div className="text-[11px] uppercase tracking-[0.3em] text-emerald-300 font-['Geist_Mono',monospace] font-bold">
                Chega de dúvida
              </div>
              <h3 className="mt-2 text-2xl sm:text-3xl font-black leading-tight tracking-tight">
                Descubra a verdade em menos de 2 minutos.
              </h3>
              <p className="mt-2 text-[14px] text-slate-300">
                Verifique um número e receba o relatório completo com discrição total.
              </p>
            </div>
            <Link
              to="/verificar"
              className="shrink-0 inline-flex items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black px-7 py-4 text-[14px] shadow-lg shadow-emerald-500/30 transition"
            >
              Verificar agora →
            </Link>
          </div>
        </section>

        <div id="soro-blog" />
      </main>
    </div>
  );
}
