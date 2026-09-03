import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useTargetName } from "@/lib/use-target-name";

const searchSchema = z.object({
  phone: z.coerce.string().optional().default(""),
  sex: z.enum(["M", "F"]).optional().default("M"),
});

export const Route = createFileRoute("/cadastro-dispositivo")({
  head: () => ({
    meta: [
      { title: "Cadastro de Dispositivo · Espelhamento" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  validateSearch: (s) => searchSchema.parse(s),
  component: CadastroDispositivoPage,
});

type Step = {
  label: string;
  detail: string;
};

const STEPS: Step[] = [
  { label: "Identificando dispositivo atual", detail: "Lendo fingerprint do navegador, GPU, fuso e modelo do aparelho…" },
  { label: "Estabelecendo túnel criptografado", detail: "Handshake TLS 1.3 + AES-256 com o nó de espelhamento…" },
  { label: "Injetando payload no WhatsApp do alvo", detail: "Explorando sessão multi-device via socket WSS…" },
  { label: "Sincronizando banco SQLite do alvo", detail: "Baixando msgstore.db, wa.db, mídia e thumbnails…" },
  { label: "Pareando chaves Signal Protocol", detail: "Curve25519 / X3DH — recriando identidade do dispositivo…" },
  { label: "Liberando painel de espelhamento", detail: "Vinculando seu navegador à sessão clonada do alvo…" },
];

const FAKE_LOGS: string[] = [
  "[boot] zr-mirror-agent v4.7.2 iniciando…",
  "[net] conectado em mirror-br-03.spyradar.internal :8443",
  "[tls] handshake OK · cipher=TLS_AES_256_GCM_SHA384",
  "[fp] device=Chrome/124 · os=Android 14 · gpu=Adreno 730",
  "[probe] alvo localizado · last_seen=online · device_count=2",
  "[wa] sessão multi-device detectada · slot=4/5 livre",
  "[inject] payload 0x4a2f1c → entregue · ack=true",
  "[sync] msgstore.db 184 MB · 12.847 mensagens",
  "[sync] media/ 412 arquivos · 1.2 GB",
  "[sync] contatos.vcf 218 entradas",
  "[crypto] X3DH ok · prekey_bundle=valid",
  "[crypto] sender_key rotacionada · epoch=88412",
  "[geo] última localização 22.9068°S 43.1729°W · precisão 8m",
  "[bank] sessões bancárias detectadas: 3",
  "[social] instagram=on · tiktok=on · tinder=on",
  "[mirror] espelhamento ativo · latência 42ms",
  "[ok] painel liberado para o operador.",
];

function Telemetry({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="bg-white/70 border border-emerald-100 rounded-xl px-3 py-2">
      <div className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-['Geist_Mono',monospace]">{label}</div>
      <div className="text-[#25D366] font-bold font-['Geist_Mono',monospace] text-sm leading-tight">{value}</div>
      <div className="text-[9px] text-slate-500 font-['Geist_Mono',monospace]">{unit}</div>
    </div>
  );
}


function CadastroDispositivoPage() {
  const { phone, sex } = Route.useSearch();
  const navigate = useNavigate();
  const targetName = useTargetName();
  const doAlvo = targetName ? `de ${targetName}` : "do alvo";
  const oAlvo = targetName ?? "o alvo";

  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState<"installing" | "password" | "instructions" | "checking-lgpd">("installing");
  const [pin, setPin] = useState(["", "", "", ""]);
  const [pinError, setPinError] = useState<string | null>(null);
  const [showLgpd, setShowLgpd] = useState(false);

  // 30s installation
  useEffect(() => {
    if (phase !== "installing") return;
    const totalMs = 30000;
    const tickMs = 200;
    const inc = (tickMs / totalMs) * 100;
    const iv = window.setInterval(() => {
      setProgress((p) => {
        const next = Math.min(100, p + inc);
        const idx = Math.min(STEPS.length - 1, Math.floor((next / 100) * STEPS.length));
        setStepIndex(idx);
        if (next >= 100) {
          window.clearInterval(iv);
          setTimeout(() => setPhase("password"), 400);
        }
        return next;
      });
    }, tickMs);
    return () => window.clearInterval(iv);
  }, [phase]);

  const setDigit = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1);
    setPin((prev) => {
      const next = [...prev];
      next[i] = d;
      return next;
    });
    if (d && i < 3) {
      const nextEl = document.getElementById(`pin-${i + 1}`) as HTMLInputElement | null;
      nextEl?.focus();
    }
  };

  const submitPin = () => {
    const code = pin.join("");
    if (code.length < 4) {
      setPinError("Digite os 4 dígitos da senha.");
      return;
    }
    setPinError(null);
    try {
      sessionStorage.setItem("zr.access.pin", code);
      sessionStorage.setItem("zr.access.phone", phone || "");
    } catch {}
    setPhase("instructions");
  };

  // After showing instructions, wait ~10s then check LGPD
  useEffect(() => {
    if (phase !== "instructions") return;
    const t = window.setTimeout(() => {
      setPhase("checking-lgpd");
      setTimeout(() => setShowLgpd(true), 400);
    }, 2000);
    return () => window.clearTimeout(t);
  }, [phase]);

  const acceptLgpd = () => {
    try { sessionStorage.setItem("zr.lgpd.accepted", "1"); } catch {}
    navigate({ to: "/sigilo", search: { phone, sex } });
  };

  const maskedPhone = useMemo(() => {
    if (!phone) return "+55 (••) •••••-••••";
    return phone;
  }, [phone]);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-['Inter',sans-serif] relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(16,185,129,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(16,185,129,0.06) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-emerald-500/[0.10] blur-[160px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-6 space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-slate-100 border border-emerald-300 rounded-xl flex items-center justify-center">
            <span className="text-[#128C7E] text-lg">📡</span>
          </div>
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#128C7E]/80 font-['Geist_Mono',monospace]">
              Etapa 2 de 3
            </div>
            <div className="text-sm font-bold">Cadastro de Dispositivo · Espelhamento</div>
          </div>
          {phase === "installing" && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-['Geist_Mono',monospace] text-[#25D366]">CLONAGEM EM ANDAMENTO</span>
            </div>
          )}
        </div>

        {/* INSTALLING */}
        {phase === "installing" && (
          <div className="grid lg:grid-cols-5 gap-4">
            <div className="lg:col-span-3 bg-gradient-to-br from-white/95 to-slate-50/40 backdrop-blur-xl border border-emerald-300 rounded-3xl p-5 space-y-4 shadow-[0_25px_70px_rgba(16,185,129,0.18)]">
              <div className="text-center space-y-1">
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#128C7E]/80 font-['Geist_Mono',monospace]">
                  Clonando dispositivo {doAlvo}
                </div>
                <div className="text-4xl font-extrabold tracking-tight">{Math.floor(progress)}%</div>
                <div className="text-[12px] text-slate-500">Não feche essa página. O canal seguro com {oAlvo} cai se você sair agora.</div>
              </div>

              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <ul className="space-y-2 pt-1">
                {STEPS.map((s, i) => {
                  const done = i < stepIndex;
                  const active = i === stepIndex;
                  return (
                    <li key={i} className="flex items-start gap-3">
                      <span
                        className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold border ${
                          done
                            ? "bg-emerald-100 border-emerald-500/60 text-[#25D366]"
                            : active
                              ? "bg-emerald-50 border-emerald-300 text-[#25D366] animate-pulse"
                              : "bg-slate-100 border-slate-300 text-slate-500"
                        }`}
                      >
                        {done ? "✓" : i + 1}
                      </span>
                      <div>
                        <div className={`text-[13px] font-semibold ${active || done ? "text-slate-900" : "text-slate-500"}`}>{s.label}</div>
                        {(active || done) && <div className="text-[11px] text-slate-500 font-['Geist_Mono',monospace]">{s.detail}</div>}
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* TELEMETRIA */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                <Telemetry label="Mensagens" value={Math.floor(progress * 128.47).toLocaleString("pt-BR")} unit="msgs" />
                <Telemetry label="Mídias" value={Math.floor(progress * 4.12).toLocaleString("pt-BR")} unit="arquivos" />
                <Telemetry label="Contatos" value={Math.floor(progress * 2.18).toLocaleString("pt-BR")} unit="entradas" />
                <Telemetry label="Latência" value={`${42 + Math.floor(Math.sin(progress / 5) * 6)}`} unit="ms" />
              </div>
            </div>

            {/* LOG PANEL */}
            <div className="lg:col-span-2 bg-white border border-emerald-200 rounded-3xl overflow-hidden shadow-[0_25px_70px_rgba(16,185,129,0.12)] flex flex-col min-h-[420px]">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-emerald-100 bg-white">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-[10px] uppercase tracking-[0.2em] text-[#128C7E]/80 font-['Geist_Mono',monospace]">
                  zr-mirror-agent · live
                </span>
              </div>
              <div className="flex-1 p-3 overflow-hidden font-['Geist_Mono',monospace] text-[11px] leading-relaxed text-[#25D366]/90 space-y-0.5">
                {FAKE_LOGS.slice(0, Math.max(1, Math.floor((progress / 100) * FAKE_LOGS.length) + 1)).map((line, idx, arr) => (
                  <div
                    key={idx}
                    className={idx === arr.length - 1 ? "text-[#25D366]" : "text-[#128C7E]/60"}
                  >
                    <span className="text-slate-500">$ </span>
                    {line}
                    {idx === arr.length - 1 && <span className="inline-block w-2 h-3 bg-emerald-400 ml-1 animate-pulse align-middle" />}
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-emerald-100 bg-white flex items-center justify-between text-[10px] font-['Geist_Mono',monospace]">
                <span className="text-slate-500">node: <span className="text-[#25D366]">mirror-br-03</span></span>
                <span className="text-slate-500">pid: <span className="text-[#25D366]">{4727 + Math.floor(progress * 13)}</span></span>
              </div>
            </div>
          </div>
        )}



        {/* PASSWORD */}
        {phase === "password" && (
          <div className="bg-gradient-to-br from-white/95 to-slate-50/40 backdrop-blur-xl border border-emerald-300 rounded-3xl p-5 space-y-4 shadow-[0_25px_70px_rgba(16,185,129,0.18)]">
            <div className="text-center space-y-1">
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#25D366] font-['Geist_Mono',monospace]">
                ✅ Dispositivo cadastrado
              </div>
              <h2 className="text-xl font-extrabold">Crie sua senha de acesso</h2>
              <p className="text-[13px] text-slate-500">
                Defina uma senha de <span className="text-[#25D366] font-semibold">4 dígitos</span> para acessar o celular clonado quando quiser.
              </p>
            </div>

            <div className="flex justify-center gap-3 py-2">
              {pin.map((d, i) => (
                <input
                  key={i}
                  id={`pin-${i}`}
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={1}
                  value={d}
                  onChange={(e) => setDigit(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !pin[i] && i > 0) {
                      const prev = document.getElementById(`pin-${i - 1}`) as HTMLInputElement | null;
                      prev?.focus();
                    }
                  }}
                  className="w-14 h-16 text-center text-2xl font-extrabold bg-white border-2 border-emerald-300 rounded-2xl focus:outline-none focus:border-emerald-400 text-[#25D366]"
                />
              ))}
            </div>

            {pinError && <div className="text-center text-[12px] text-red-600">{pinError}</div>}

            <button
              onClick={submitPin}
              className="w-full h-14 bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#1eb959] hover:to-[#0f7266] text-white font-extrabold rounded-2xl transition-all active:scale-[0.98] uppercase tracking-wider text-[15px] shadow-[0_10px_30px_-8px_rgba(16,185,129,0.6)]"
            >
              Cadastrar senha e continuar
            </button>

            <p className="text-[11px] text-slate-500 text-center">
              Anote sua senha. Ela será exigida sempre que você acessar o celular clonado.
            </p>
          </div>
        )}

        {/* INSTRUCTIONS */}
        {(phase === "instructions" || phase === "checking-lgpd") && (
          <>
            <div className="bg-gradient-to-br from-white/95 to-slate-50/40 backdrop-blur-xl border border-emerald-300 rounded-3xl p-5 space-y-4 shadow-[0_25px_70px_rgba(16,185,129,0.18)]">
              <div className="text-center space-y-1">
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#25D366] font-['Geist_Mono',monospace]">
                  🎉 Espelhamento ativado
                </div>
                <h2 className="text-xl font-extrabold">Como acessar o celular clonado</h2>
                <p className="text-[13px] text-slate-500">
                  Salve esse passo a passo. Funciona em qualquer navegador, a qualquer hora.
                </p>
              </div>

              <div className="bg-white border-2 border-emerald-500/50 rounded-2xl p-4 text-center">
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#128C7E]/80 font-['Geist_Mono',monospace] mb-1">
                  Acesse esse link no navegador
                </div>
                <div className="text-[#25D366] font-bold text-lg font-['Geist_Mono',monospace] break-all select-all">
                  https://clonawhats.com/acessar-celular
                </div>
                <div className="text-[11px] text-slate-500 mt-2">
                  Digite a URL manualmente no seu navegador. Por segurança, o link não é clicável aqui.
                </div>
              </div>

              <ol className="space-y-3 pt-1">
                <li className="flex gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-emerald-100 border border-emerald-300 text-[#25D366] font-bold flex items-center justify-center text-[12px]">1</span>
                  <div>
                    <div className="font-semibold text-slate-900 text-[14px]">Abra o navegador do seu celular ou computador</div>
                    <div className="text-[12px] text-slate-500">Pode ser Chrome, Safari, Edge ou qualquer outro. Use uma aba anônima se quiser sigilo máximo — o SpyRadar Brasil não deixa rastros no histórico.</div>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-emerald-100 border border-emerald-300 text-[#25D366] font-bold flex items-center justify-center text-[12px]">2</span>
                  <div>
                    <div className="font-semibold text-slate-900 text-[14px]">Digite o endereço <span className="text-[#25D366] font-['Geist_Mono',monospace]">whatsradar.com/acessar-celular</span></div>
                    <div className="text-[12px] text-slate-500">Digite manualmente na barra de endereço (não clique em links suspeitos). Salve nos favoritos para acessar rapidamente quando quiser.</div>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-emerald-100 border border-emerald-300 text-[#25D366] font-bold flex items-center justify-center text-[12px]">3</span>
                  <div>
                    <div className="font-semibold text-slate-900 text-[14px]">Informe o número clonado com DDD</div>
                    <div className="text-[12px] text-slate-500 font-['Geist_Mono',monospace]">{maskedPhone}</div>
                    <div className="text-[12px] text-slate-500 mt-0.5">Esse é exatamente o número {doAlvo} que você cadastrou no início. Confirme antes de prosseguir.</div>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-emerald-100 border border-emerald-300 text-[#25D366] font-bold flex items-center justify-center text-[12px]">4</span>
                  <div>
                    <div className="font-semibold text-slate-900 text-[14px]">Digite sua senha de 4 dígitos</div>
                    <div className="text-[12px] text-slate-500">A mesma senha que você acabou de cadastrar nesta tela. Guarde com cuidado — ela é o único caminho para o painel clonado e não é recuperável sem reativação da licença.</div>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-emerald-100 border border-emerald-300 text-[#25D366] font-bold flex items-center justify-center text-[12px]">5</span>
                  <div>
                    <div className="font-semibold text-slate-900 text-[14px]">Pronto — acesso total liberado em tempo real</div>
                    <div className="text-[12px] text-slate-500">WhatsApp (incluindo mensagens apagadas), áudios, fotos, vídeos, contatos, localização ao vivo, redes sociais e histórico de chamadas. Tudo espelhado de forma 100% indetectável {targetName ? `por ${targetName}` : "pelo alvo"}.</div>
                  </div>
                </li>
              </ol>

              <div className="bg-amber-50 border border-amber-500/40 rounded-2xl p-3 text-[12px] text-amber-700 leading-relaxed">
                ⚠️ <strong>Importante:</strong> o espelhamento permanece ativo 24h por dia enquanto a licença estiver vigente. Acesse de qualquer dispositivo, quantas vezes quiser, sem {oAlvo} nunca perceber.
              </div>
            </div>

            {phase === "checking-lgpd" && !showLgpd && (
              <div className="flex items-center justify-center gap-2 text-[12px] text-slate-700 bg-emerald-50 border border-emerald-200 rounded-xl py-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold font-['Geist_Mono',monospace]">Validando conformidade LGPD…</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* LGPD MODAL */}
      {showLgpd && (
        <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-gradient-to-br from-slate-50 to-white border-2 border-amber-500/60 rounded-3xl p-5 space-y-4 shadow-[0_25px_70px_rgba(245,158,11,0.25)]">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 bg-amber-500/15 border border-amber-500/40 rounded-2xl flex items-center justify-center text-2xl shrink-0">
                ⚠️
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-amber-700 font-['Geist_Mono',monospace]">
                  Conformidade obrigatória
                </div>
                <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                  Opa! Vimos que você ainda não aceitou o Termo de Sigilo da LGPD
                </h3>
              </div>
            </div>

            <p className="text-[13px] text-slate-700 leading-relaxed">
              Para liberar o espelhamento e proteger sua identidade, é <span className="text-amber-700 font-semibold">obrigatório aceitar o termo de sigilo</span> conforme a Lei Geral de Proteção de Dados (LGPD).
            </p>

            <div className="bg-white/80 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-500 leading-relaxed max-h-24 overflow-y-auto">
              Declaro que utilizarei as informações obtidas exclusivamente para fins pessoais, em conformidade com a LGPD (Lei nº 13.709/2018), assumindo total responsabilidade pelo uso e me comprometendo a manter sigilo absoluto sobre os dados acessados.
            </div>

            <button
              onClick={acceptLgpd}
              className="w-full h-14 bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#1eb959] hover:to-[#0f7266] text-white font-extrabold rounded-2xl transition-all active:scale-[0.98] uppercase tracking-wider text-[14px] shadow-[0_10px_30px_-8px_rgba(16,185,129,0.6)]"
            >
              ✅ Sim, aceitar e continuar
            </button>

            <p className="text-[10px] text-slate-500 text-center">
              Sem o aceite, o espelhamento não pode ser ativado.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
