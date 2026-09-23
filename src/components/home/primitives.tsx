import { Link } from "@tanstack/react-router";
import { ArrowRight, Radar } from "lucide-react";

export const GOLD_GRADIENT =
  "linear-gradient(100deg, #79530D 0%, #D9A928 34%, #FFE078 60%, #B17B13 100%)";

export function Container({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={"mx-auto w-full max-w-[1280px] px-5 sm:px-8 " + className}>
      {children}
    </div>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={"flex items-center gap-3 " + className}>
      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#292929] bg-[#151515]">
        <Radar className="h-5 w-5 text-[#D9A928]" />
      </span>
      <span className="leading-none">
        <span className="block text-[15px] font-bold tracking-tight text-[#F5F5F2]">
          SPY <span className="text-[#D9A928]">RADAR</span>
        </span>
        <span className="mt-1 block text-[9px] tracking-[0.42em] text-[#A7A7A7]">
          BRASIL
        </span>
      </span>
    </span>
  );
}

const baseBtn =
  "group inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full px-7 text-[13px] font-bold uppercase tracking-[0.08em] transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9A928] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808]";

type BtnProps = {
  children: React.ReactNode;
  to?: string;
  href?: string;
  className?: string;
  withArrow?: boolean;
};

export function GoldButton({ children, to, href, className = "", withArrow = true }: BtnProps) {
  const cls = baseBtn + " text-[#080808] shadow-[0_10px_30px_-12px_rgba(217,169,40,0.7)] " + className;
  const inner = (
    <>
      {children}
      {withArrow && (
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      )}
    </>
  );
  if (to) {
    return (
      <Link to={to} className={cls} style={{ backgroundImage: GOLD_GRADIENT }}>
        {inner}
      </Link>
    );
  }
  return (
    <a href={href} className={cls} style={{ backgroundImage: GOLD_GRADIENT }}>
      {inner}
    </a>
  );
}

export function OutlineButton({ children, to, href, className = "", withArrow = false }: BtnProps) {
  const cls =
    baseBtn +
    " border border-[#292929] bg-[#151515]/60 text-[#F5F5F2] hover:border-[#D9A928]/50 hover:bg-[#1C1C1C] " +
    className;
  const inner = (
    <>
      {children}
      {withArrow && (
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      )}
    </>
  );
  if (to) {
    return (
      <Link to={to} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <a href={href} className={cls}>
      {inner}
    </a>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.28em] text-[#D9A928]">
      <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#8C6515]" />
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className = "",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={
        (align === "center" ? "mx-auto max-w-2xl text-center items-center " : "items-start ") +
        "flex flex-col gap-4 " +
        className
      }
    >
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="text-balance font-display text-3xl font-extrabold uppercase leading-[1.05] tracking-tight text-[#F5F5F2] sm:text-4xl lg:text-[2.75rem]">
        {title}
      </h2>
      {subtitle && (
        <p className="max-w-xl text-pretty text-[15px] leading-relaxed text-[#A7A7A7]">
          {subtitle}
        </p>
      )}
    </div>
  );
}
