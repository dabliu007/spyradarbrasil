import type { ReactNode } from "react";

export const CHECKOUT_PRICE = 137.0;
export const CHECKOUT_ANCHOR_PRICE = 397;

export const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const BENEFITS = [
  "Mensagens, fotos e áudios — inclusive os apagados",
  "Localização em tempo real e apps monitorados",
  "Acesso por 365 dias, sem mensalidade",
  "O alvo nunca é notificado",
];

const STEPS = [
  "Abra o app do seu banco e escolha Pix",
  "Escaneie o QR Code ou cole o código copiado",
  "Confirme — o acesso é liberado nesta tela",
];

export function CheckoutShell({
  title,
  amount,
  timer,
  children,
}: {
  title: string;
  amount: number;
  timer?: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 font-['Inter',sans-serif]">
      <header className="bg-[#075E54] text-white">
        <div className="max-w-md mx-auto px-4 h-12 flex items-center justify-between text-[13px] font-semibold">
          <span className="flex items-center gap-2">
            <LockIcon className="w-4 h-4" />
            Pagamento seguro
          </span>
          {timer ? (
            <span className="flex items-center gap-2" aria-live="off">
              <span className="text-white/70 font-normal">Pix expira em</span>
              <span className="font-['Geist_Mono',monospace] tabular-nums bg-white/15 rounded-md px-2 py-0.5">
                {timer}
              </span>
            </span>
          ) : (
            <span className="text-white/70 font-normal">Via Pix</span>
          )}
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-5 flex flex-col gap-4">
        <OrderSummary title={title} amount={amount} />
        {children}
        <HowToPay />
        <Guarantee />
        <p className="text-[11px] text-slate-500 leading-relaxed text-center text-pretty">
          O SpyRadar Brasil não se responsabiliza pelo mau uso das informações obtidas. O uso é de
          inteira responsabilidade do contratante.
        </p>
      </div>
    </main>
  );
}

function OrderSummary({ title, amount }: { title: string; amount: number }) {
  return (
    <section
      aria-label="Resumo do pedido"
      className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#128C7E]">
            Seu pedido
          </span>
          <h1 className="text-[16px] font-bold leading-snug text-balance">{title}</h1>
          <span className="text-[12px] text-slate-500">Plano anual · pagamento único</span>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span className="text-[12px] text-slate-400 line-through">
            {formatBRL(CHECKOUT_ANCHOR_PRICE)}
          </span>
          <span className="text-[22px] font-extrabold text-[#128C7E] leading-tight tabular-nums">
            {formatBRL(amount)}
          </span>
        </div>
      </div>
      <ul className="grid grid-cols-1 gap-1.5 border-t border-slate-100 pt-3">
        {BENEFITS.map((item) => (
          <li key={item} className="flex items-start gap-2 text-[13px] text-slate-600 leading-snug">
            <CheckIcon className="w-4 h-4 text-[#25D366] mt-0.5 shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function HowToPay() {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col gap-3">
      <h2 className="text-[14px] font-bold">Como pagar</h2>
      <ol className="flex flex-col gap-2.5">
        {STEPS.map((step, i) => (
          <li key={step} className="flex items-center gap-3 text-[13px] text-slate-600 leading-snug">
            <span className="w-6 h-6 shrink-0 rounded-full bg-[#E7F6EF] text-[#128C7E] text-[12px] font-bold grid place-items-center">
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
    </section>
  );
}

function Guarantee() {
  return (
    <section className="flex items-start gap-3 rounded-2xl bg-[#E7F6EF] p-4">
      <ShieldIcon className="w-6 h-6 text-[#128C7E] shrink-0" />
      <div className="flex flex-col gap-1">
        <h2 className="text-[13px] font-bold text-[#075E54]">Garantia incondicional de 7 dias</h2>
        <p className="text-[12px] text-slate-600 leading-relaxed">
          Liberação automática, sem enviar comprovante. Seu dinheiro fica protegido e só é repassado
          à Spy Monitoramento LTDA após 7 dias de uso.
        </p>
      </div>
    </section>
  );
}

export function LockIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className={className} aria-hidden="true">
      <rect x="4" y="10" width="16" height="10" rx="2.5" strokeLinejoin="round" />
      <path d="M8 10V7a4 4 0 018 0v3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} className={className} aria-hidden="true">
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CopyIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <rect x="9" y="9" width="11" height="11" rx="2" strokeLinejoin="round" />
      <path d="M15 9V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7a2 2 0 002 2h3" strokeLinejoin="round" />
    </svg>
  );
}

function ShieldIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PixPanelSkeleton({ label }: { label: string }) {
  return (
    <section
      aria-busy="true"
      className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col items-center gap-4"
    >
      <div className="w-52 h-52 rounded-xl bg-slate-100 animate-pulse" />
      <div className="w-full h-12 rounded-xl bg-slate-100 animate-pulse" />
      <p role="status" className="text-[13px] text-slate-500 flex items-center gap-2">
        <span className="w-4 h-4 rounded-full border-2 border-[#25D366] border-t-transparent animate-spin" />
        {label}
      </p>
    </section>
  );
}
