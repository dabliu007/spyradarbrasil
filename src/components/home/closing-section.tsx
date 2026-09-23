import { Link } from "@tanstack/react-router";
import { Container, GoldButton, OutlineButton, Logo } from "./primitives";

type FooterLink = { label: string; to?: string; href?: string };

const footerColumns: { title: string; links: FooterLink[] }[] = [
  {
    title: "Empresa",
    links: [
      { label: "Sobre", to: "/sobre" },
      { label: "Contato", to: "/contato" },
      { label: "Suporte", to: "/contato" },
    ],
  },
  {
    title: "Recursos",
    links: [
      { label: "WhatsApp Clonado", href: "#solucoes" },
      { label: "Localização em Tempo Real", href: "#solucoes" },
      { label: "Como Funciona", href: "#como-funciona" },
    ],
  },
  {
    title: "Institucional",
    links: [
      { label: "Privacidade", to: "/privacidade" },
      { label: "Termos de Uso", to: "/termos" },
      { label: "Garantia", to: "/garantia" },
      { label: "Política de Trocas", to: "/troca" },
      { label: "Rastreamento", to: "/rastreamento" },
    ],
  },
];

export function ClosingSection() {
  return (
    <>
      {/* Final CTA */}
      <section className="py-20 sm:py-28">
        <Container>
          <div className="relative overflow-hidden rounded-3xl border border-[#292929] px-6 py-16 text-center sm:px-12 sm:py-20">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(120% 120% at 50% 0%, rgba(217,169,40,0.16) 0%, rgba(217,169,40,0.04) 30%, transparent 60%), #0d0d0d",
              }}
              aria-hidden="true"
            />
            <div className="relative flex flex-col items-center">
              <h2 className="text-balance font-display text-3xl font-extrabold uppercase leading-[1.05] tracking-tight text-[#F5F5F2] sm:text-4xl lg:text-5xl">
                Pare de sofrer na dúvida.
                <br className="hidden sm:block" />{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(100deg, #B17B13 0%, #D9A928 40%, #FFE078 100%)",
                  }}
                >
                  Descubra a verdade hoje
                </span>
              </h2>
              <p className="mt-5 max-w-md text-pretty text-[15px] leading-relaxed text-[#A7A7A7]">
                Clone o celular em minutos e veja com seus próprios olhos o que está
                acontecendo. Rápido, sigiloso e sem deixar rastros.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <GoldButton to="/verificar">Começar teste grátis</GoldButton>
                <OutlineButton href="#como-funciona">Como funciona</OutlineButton>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#292929] bg-[#0d0d0d]">
        <Container className="py-16">
          <div className="grid grid-cols-2 gap-12 lg:grid-cols-5">
            <div className="col-span-2 flex flex-col gap-5 lg:col-span-2">
              <Logo />
              <p className="max-w-xs text-[13px] leading-relaxed text-[#A7A7A7]">
                O aplicativo clonador de celular que revela conversas, fotos e localização
                para você acabar de vez com a dúvida da traição.
              </p>
            </div>

            {footerColumns.map((col) => (
              <div key={col.title}>
                <h3 className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#F5F5F2]">
                  {col.title}
                </h3>
                <ul className="mt-5 flex flex-col gap-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.to ? (
                        <Link
                          to={link.to}
                          className="text-[13px] text-[#A7A7A7] transition-colors hover:text-[#D9A928]"
                        >
                          {link.label}
                        </Link>
                      ) : (
                        <a
                          href={link.href}
                          className="text-[13px] text-[#A7A7A7] transition-colors hover:text-[#D9A928]"
                        >
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-14 flex flex-col gap-6 border-t border-[#292929] pt-8 text-[12px] text-[#A7A7A7] sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[#F5F5F2]">Spy Monitoramento LTDA</span>
              <span className="text-[#A7A7A7]/70">CNPJ: 17.722.425/0001-07</span>
              <span className="text-[#A7A7A7]/70">
                Rodovia Curitiba–Paranaguá, BR-277, 793
              </span>
              <span className="text-[#A7A7A7]/70">Cajuru, Curitiba – PR, 82900-335</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#A7A7A7]/70 sm:max-w-md sm:text-right">
              Utilize os dispositivos de acordo com a legislação aplicável e mediante
              autorização quando necessária.
            </p>
          </div>

          <p className="mt-8 text-[11px] text-[#A7A7A7]/60">
            © {new Date().getFullYear()} Spy Monitoramento LTDA. Todos os direitos
            reservados.
          </p>
        </Container>
      </footer>
    </>
  );
}
