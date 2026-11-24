import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import logoAsset from "@/assets/logo.png.asset.json";
import FooterCredibilidade from "./FooterCredibilidade";

type Step = 1 | 2 | 3;

const ITEMS = [
  { id: "msgs", label: "Conversas do WhatsApp (incluindo mensagens apagadas)" },
  { id: "midia", label: "Fotos e Vídeos (galeria oculta)" },
  { id: "gps", label: "Localização em tempo real (GPS)" },
  { id: "audios", label: "Áudios, chamadas e contatos recentes" },
] as const;

export function PresellPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [checked, setChecked] = useState<Record<string, boolean>>(
    Object.fromEntries(ITEMS.map((i) => [i.id, true])),
  );
  const [sex, setSex] = useState<"M" | "F">("M");

  const toggle = (id: string) =>
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  const goVerificar = (chosenSex: "M" | "F") => {
    try {
      sessionStorage.setItem("zr.presell.sex", chosenSex);
    } catch {}
    navigate({ to: "/verificar" });
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-['Inter',sans-serif] relative overflow-hidden">
      {/* grid + green glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(16,185,129,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(16,185,129,0.06) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-emerald-500/[0.12] blur-[160px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-md mx-auto px-4 py-8">
        <div className="bg-gradient-to-br from-white/95 to-slate-50/40 backdrop-blur-xl border border-emerald-300 rounded-3xl p-6 space-y-5 shadow-[0_25px_70px_rgba(16,185,129,0.18)]">
          {/* logo */}
          <div className="flex flex-col items-center gap-3">
            <img src={logoAsset.url} alt="SpyRadar Brasil" className="h-10 w-auto" />
            <StepDots step={step} />
          </div>

          {step === 1 && <StepThree onNext={() => setStep(2)} />}
          {step === 2 && (
            <StepTwo
              onPick={(s) => {
                setSex(s);
                setStep(3);
              }}
            />
          )}
          {step === 3 && (
            <StepOne
              checked={checked}
              toggle={toggle}
              onNext={() => goVerificar(sex)}
            />
          )}

          <div className="flex justify-center">
            <span className="text-[10px] tracking-[0.3em] font-['Geist_Mono',monospace] text-slate-500 border border-slate-200 rounded-full px-3 py-1 uppercase">
              Etapa {step} de 3
            </span>
          </div>
        </div>

      </div>

      <FooterCredibilidade />
    </div>
  );
}

function StepDots({ step }: { step: Step }) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className={
            n === step
              ? "h-1.5 w-8 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
              : "h-1.5 w-1.5 rounded-full bg-slate-300"
          }
        />
      ))}
    </div>
  );
}

function StepOne({
  checked,
  toggle,
  onNext,
}: {
  checked: Record<string, boolean>;
  toggle: (id: string) => void;
  onNext: () => void;
}) {
  return (
    <>
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-extrabold">O que você quer analisar?</h1>
        <p className="text-[13px] text-slate-500 leading-relaxed">
          Selecione as informações que deseja incluir na{" "}
          <span className="text-emerald-600 font-semibold">análise social</span>.
        </p>
      </div>

      <div className="space-y-2.5">
        {ITEMS.map((it) => {
          const on = checked[it.id];
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => toggle(it.id)}
              className={`w-full flex items-center gap-3 text-left rounded-2xl border px-3 py-3 transition-all ${
                on
                  ? "border-emerald-300 bg-emerald-50/50"
                  : "border-slate-200 bg-white"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-md flex items-center justify-center text-white text-sm font-bold shrink-0 transition-all ${
                  on
                    ? "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_4px_12px_rgba(16,185,129,0.4)]"
                    : "bg-slate-200"
                }`}
              >
                {on ? "✓" : ""}
              </span>
              <span className="text-[13px] font-semibold text-slate-800 leading-tight">
                {it.label}
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onNext}
        className="w-full h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-extrabold rounded-2xl transition-all active:scale-[0.98] uppercase tracking-wider text-[14px] shadow-[0_10px_30px_-8px_rgba(16,185,129,0.6)]"
      >
        → Confirmar e avançar
      </button>
    </>
  );
}

function StepTwo({ onPick }: { onPick: (s: "M" | "F") => void }) {
  return (
    <>
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-extrabold">Quem você quer analisar?</h1>
        <p className="text-[13px] text-slate-500 leading-relaxed">
          Selecione o perfil da pessoa para direcionar a busca por
          informações <strong>públicas</strong> disponíveis na internet, em
          conformidade com a{" "}
          <span className="text-emerald-600 font-semibold">LGPD</span>.
        </p>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => onPick("M")}
          className="w-full h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-extrabold rounded-2xl transition-all active:scale-[0.98] tracking-wider text-[15px] shadow-[0_10px_30px_-8px_rgba(16,185,129,0.6)] flex items-center justify-center gap-2"
        >
          <span>👤</span> Homem
        </button>
        <button
          type="button"
          onClick={() => onPick("F")}
          className="w-full h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-extrabold rounded-2xl transition-all active:scale-[0.98] tracking-wider text-[15px] shadow-[0_10px_30px_-8px_rgba(16,185,129,0.6)] flex items-center justify-center gap-2"
        >
          <span>👥</span> Mulher
        </button>
      </div>
    </>
  );
}

function StepThree({ onFinish, onNext }: { onFinish?: () => void; onNext?: () => void }) {
  const handle = onFinish ?? onNext ?? (() => {});
  return (
    <>
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-extrabold">Receber o relatório com discrição?</h1>
      </div>

      <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4">
        <div className="text-[11px] uppercase tracking-[0.2em] text-emerald-700 font-['Geist_Mono',monospace] font-bold mb-1">
          ⓘ Como funciona
        </div>
        <p className="text-[13px] text-slate-700 leading-relaxed">
          Seu relatório de análise social é enviado de forma{" "}
          <span className="font-bold">confidencial</span> apenas para você,
          com base em informações{" "}
          <span className="text-emerald-600 font-bold">públicas</span>{" "}
          disponíveis na internet. Nenhuma notificação é enviada à pessoa
          analisada.
        </p>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={handle}
          className="w-full h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-extrabold rounded-2xl transition-all active:scale-[0.98] tracking-wider text-[15px] shadow-[0_10px_30px_-8px_rgba(16,185,129,0.6)] flex items-center justify-center gap-2"
        >
          🛡️ Sim, com total discrição
        </button>
        <button
          type="button"
          onClick={handle}
          className="w-full h-14 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-extrabold rounded-2xl transition-all active:scale-[0.98] tracking-wider text-[15px] flex items-center justify-center gap-2"
        >
          🚫 Não é necessário
        </button>
      </div>
    </>
  );
}
