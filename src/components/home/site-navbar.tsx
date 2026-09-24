import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Container, GoldButton, Logo } from "./primitives";

const navLinks = [
  { label: "Recursos", href: "#solucoes" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Sigilo", href: "#seguranca" },
  { label: "Depoimentos", href: "#sobre" },
  { label: "Dúvidas", href: "#faq" },
];

export function SiteNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={
        "absolute inset-x-0 top-0 z-50 transition-colors duration-300 lg:fixed " +
        (scrolled
          ? "border-b border-[#292929] bg-[#080808]/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent")
      }
    >
      <Container className="flex h-[72px] items-center justify-between">
        <a href="#topo" aria-label="Spy Radar Brasil — início">
          <Logo />
        </a>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Navegação principal">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[13px] font-medium text-[#A7A7A7] transition-colors hover:text-[#F5F5F2]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:block">
          <GoldButton to="/verificar" withArrow={false} className="px-6">
            Teste grátis
          </GoldButton>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#292929] bg-[#151515] text-[#F5F5F2] lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </Container>

      {open && (
        <div className="border-t border-[#292929] bg-[#080808]/95 backdrop-blur-md lg:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium text-[#A7A7A7] transition-colors hover:bg-[#151515] hover:text-[#F5F5F2]"
              >
                {link.label}
              </a>
            ))}
          <GoldButton to="/verificar" withArrow={false} className="mt-3">
            Teste grátis
            </GoldButton>
          </Container>
        </div>
      )}
    </header>
  );
}
