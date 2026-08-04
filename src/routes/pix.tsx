import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useTargetName } from "@/lib/use-target-name";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { getPixStatus, type PixCharge } from "@/lib/pix.functions";
import { fbqTrackOnce } from "@/lib/tracking";

const searchSchema = z.object({
  id: z.coerce.string().min(1),
  phone: z.coerce.string().optional().default(""),
  sex: z.enum(["M", "F"]).optional().default("M"),
});

export const Route = createFileRoute("/pix")({
  head: () => ({
    meta: [
      { title: "PIX gerado — pague agora e desbloqueie o acesso" },
      {
        name: "description",
        content:
          "Seu PIX foi gerado. Pague em segundos e libere o acesso completo imediatamente — sigilo total, sem comprovante.",
      },
      { name: "robots", content: "noindex,follow" },
    ],
  }),
  validateSearch: (s) => searchSchema.parse(s),
  component: PixPage,
});

const STORAGE_PREFIX = "zr.pix.";

function PixPage() {
  const { id, phone, sex } = Route.useSearch();
  const navigate = useNavigate();
  const checkPix = useServerFn(getPixStatus);
  const targetName = useTargetName();
  const doAlvo = targetName ? `de ${targetName}` : "do alvo";
  const paraAlvo = targetName ? `para ${targetName}` : "para o alvo";

  const [charge, setCharge] = useState<PixCharge | null>(null);
  const [copied, setCopied] = useState(false);
  const [statusLabel, setStatusLabel] = useState("Aguardando pagamento…");
  const [seconds, setSeconds] = useState(15 * 60); // 15 min de urgência
  const [viewers] = useState(() => 27 + Math.floor(Math.random() * 41));
  const paidRef = useRef(false);

  // Recupera o charge salvo no sessionStorage pelo checkout
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_PREFIX + id);
      if (raw) setCharge(JSON.parse(raw));
    } catch {}
  }, [id]);

  // Sem charge no storage (refresh perdeu o QR) → volta ao checkout,
  // MAS só depois de checar se o pagamento já foi confirmado — assim
  // um usuário que reabre a aba do PIX ainda é redirecionado.
  useEffect(() => {
    if (charge || !id) return;
    let cancelled = false;
    (async () => {
      try {
        const s = await checkPix({ data: { id } });
        if (cancelled) return;
        if (s.paid) {
          paidRef.current = true;
          navigate({ to: "/cadastro-dispositivo", search: { phone, sex } });
          return;
        }
      } catch {}
      if (!cancelled) navigate({ to: "/checkout", search: { phone, sex } });
    })();
    return () => {
      cancelled = true;
    };
  }, [charge, id, checkPix, navigate, phone, sex]);

  // Cronômetro de urgência
  useEffect(() => {
    const t = window.setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(t);
  }, []);

  const [checking, setChecking] = useState(false);
  const [checkMsg, setCheckMsg] = useState<string | null>(null);
  const tickRef = useRef<((force?: boolean) => Promise<boolean>) | null>(null);

  // Polling de status
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    let pollCount = 0;
    // `force` = consulta completa à Codefy (fallback). Ticks normais usam o
    // modo leve (só Supabase/webhook) para não saturar o rate limit da Codefy.
    const tick = async (force = false): Promise<boolean> => {
      if (paidRef.current) return true;
      if (cancelled) return false;
      // A cada 6 ticks (~24s) faz uma consulta completa à Codefy como fallback,
      // caso o webhook não tenha chegado; os demais ticks são leves.
      const light = !force && pollCount++ % 6 !== 5;
      try {
        const s = await checkPix({ data: { id, light } });
        if (cancelled) return false;
        if (s.paid) {
          paidRef.current = true;
          setStatusLabel("Pagamento confirmado! Redirecionando…");
          (window as any).dataLayer = (window as any).dataLayer || [];
          (window as any).dataLayer.push({
            event: "purchase",
            transaction_id: id,
            valor: charge?.amount,
            moeda: "BRL",
          });
          fbqTrackOnce(
            `purchase-${id}`,
            "Purchase",
            {
              value: charge?.amount,
              currency: "BRL",
              content_ids: [id],
              content_type: "product",
              transaction_id: id,
            },
            { eventId: `purchase-${id}` }
          );
          try { sessionStorage.removeItem(STORAGE_PREFIX + id); } catch {}
          navigate({ to: "/cadastro-dispositivo", search: { phone, sex } });
          return true;
        }
        setStatusLabel("Aguardando pagamento…");
        return false;
      } catch {
        return false;
      }
    };
    tickRef.current = tick;
    tick();
    const iv = window.setInterval(() => tick(), 4000);
    // Retomar a aba/foco força uma consulta completa à Codefy (fallback rápido).
    const onVis = () => { if (document.visibilityState === "visible") tick(true); };
    const onFocus = () => tick(true);
    window.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      window.clearInterval(iv);
      window.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", onFocus);
    };
  }, [id, charge?.amount, checkPix, navigate, phone, sex]);

  const copy = async () => {
    if (!charge?.pixCopiaCola) return;
    try {
      await navigator.clipboard.writeText(charge.pixCopiaCola);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleAlreadyPaid = async () => {
    if (checking || paidRef.current) return;
    setChecking(true);
    setCheckMsg("Verificando pagamento no banco…");
    try {
      const paid = await tickRef.current?.(true);
      if (!paid) {
        setCheckMsg("Ainda não identificamos seu pagamento. Aguarde alguns segundos e tente novamente.");
      }
    } catch {
      setCheckMsg("Não foi possível verificar agora. Tente novamente em instantes.");
    } finally {
      setChecking(false);
      setTimeout(() => setCheckMsg(null), 6000);
    }
  };

  const qrImgSrc = useMemo(() => {
    if (!charge) return "";
    return (
      charge.qrCodeBase64 ||
      (charge.pixCopiaCola
        ? `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=0&data=${encodeURIComponent(charge.pixCopiaCola)}`
        : "")
    );
  }, [charge]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const amount = charge?.amount ?? 0;
  const formatBRL = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

  return (
    <div className="min-h-screen bg-white text-slate-900 font-['Inter',sans-serif] relative overflow-hidden">
      {/* fundo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(16,185,129,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(16,185,129,0.06) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-emerald-500/[0.10] blur-[160px] rounded-full pointer-events-none" />

      {/* faixa de urgência */}
      <div className="relative z-10 bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-slate-900 text-center text-[12px] font-bold py-2 px-3 uppercase tracking-wider">
        ⏳ PIX expira em <span className="font-mono text-base mx-1">{mm}:{ss}</span> — não feche essa página
      </div>

      <div className="relative z-10 max-w-md mx-auto px-4 py-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-slate-100 border border-emerald-300 rounded-xl flex items-center justify-center">
              <span className="text-[#128C7E] text-lg">🔒</span>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#128C7E]/80 font-['Geist_Mono',monospace]">
                PIX gerado
              </div>
              <div className="text-sm font-bold">Conexão segura · Banco Central</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-[#25D366] font-bold uppercase tracking-wider">{viewers} pessoas pagando agora</span>
          </div>
        </div>

        {/* gatilho emocional */}
        <div className="bg-gradient-to-br from-red-600/20 via-red-900/10 to-slate-50/40 border border-red-200 rounded-2xl p-4">
          <div className="flex items-start gap-2">
            <span className="text-red-600 text-xl leading-none">⚠️</span>
            <div className="space-y-1">
              <div className="text-[11px] uppercase tracking-[0.2em] text-red-700 font-bold font-['Geist_Mono',monospace]">
                A verdade está a 1 PIX de distância
              </div>
              <p className="text-[13px] text-slate-800 leading-snug">
                Mensagens apagadas, áudios secretos, fotos escondidas, conversas com terceiros… <span className="text-red-700 font-semibold">tudo isso será desbloqueado agora.</span>
              </p>
            </div>
          </div>
        </div>

        {/* Card principal */}
        <div className="bg-gradient-to-br from-white/95 to-slate-50/40 backdrop-blur-xl border border-emerald-300 rounded-3xl p-5 space-y-4 shadow-[0_25px_70px_rgba(16,185,129,0.18)]">
          <div className="text-center space-y-1">
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#128C7E]/80 font-['Geist_Mono',monospace]">
              Pague para desbloquear
            </div>
            <div>
              <span className="text-[#128C7E] text-5xl font-extrabold tracking-tight">R${Math.floor(amount)}</span>
              <span className="text-[#128C7E] text-xl font-bold">
                ,{String(Math.round((amount - Math.floor(amount)) * 100)).padStart(2, "0")}
              </span>
            </div>
            <div className="text-[12px] text-slate-500">
              Liberação <span className="text-[#25D366] font-semibold">imediata</span> após a confirmação
            </div>
          </div>

          {!charge ? (
            <div className="py-10 text-center text-slate-500 text-sm">Carregando PIX…</div>
          ) : (
            <>
              {/* QR */}
              <div className="bg-white p-3 rounded-2xl mx-auto w-fit shadow-[0_0_40px_rgba(16,185,129,0.25)]">
                {qrImgSrc ? (
                  <img src={qrImgSrc} alt="QR Code PIX" className="w-56 h-56 block" />
                ) : (
                  <div className="w-56 h-56 grid place-items-center text-slate-500 text-xs">QR indisponível</div>
                )}
              </div>

              <button
                onClick={copy}
                className="w-full h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-900 font-extrabold rounded-2xl transition-all active:scale-[0.98] uppercase tracking-wider text-[15px] shadow-[0_10px_30px_-8px_rgba(16,185,129,0.6)]"
              >
                {copied ? "✅ Código copiado!" : "📋 Copiar código PIX"}
              </button>

              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-['Geist_Mono',monospace]">
                  PIX Copia e Cola
                </label>
                <div className="mt-1 bg-white border border-slate-200 rounded-xl p-3 text-[11px] font-['Geist_Mono',monospace] text-slate-700 break-all max-h-24 overflow-y-auto">
                  {charge.pixCopiaCola}
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-[12px] text-slate-700 bg-emerald-50 border border-emerald-200 rounded-xl py-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold">{statusLabel}</span>
              </div>

              <button
                onClick={handleAlreadyPaid}
                disabled={checking}
                className="w-full h-12 bg-slate-100 border-2 border-emerald-500/60 hover:border-emerald-400 hover:bg-emerald-50 text-[#25D366] font-bold rounded-2xl transition-all active:scale-[0.98] uppercase tracking-wider text-[13px] disabled:opacity-60 disabled:cursor-wait"
              >
                {checking ? "🔎 Verificando…" : "✅ Já efetuei o pagamento"}
              </button>
              {checkMsg && (
                <div className="text-center text-[11px] text-slate-500 -mt-2">{checkMsg}</div>
              )}
            </>
          )}
        </div>

        {/* Passo a passo */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
          <div className="text-[11px] uppercase tracking-[0.2em] text-[#25D366] font-bold font-['Geist_Mono',monospace] mb-1">
            Passo a passo · Como pagar o PIX
          </div>
          <p className="text-[12px] text-slate-500 leading-snug mb-2">
            Siga os 4 passos abaixo. O processo leva menos de 1 minuto e a liberação do acesso é automática.
          </p>
          <ol className="text-[13px] text-slate-700 space-y-3">
            <li className="flex gap-3">
              <span className="shrink-0 w-7 h-7 rounded-full bg-emerald-100 border border-emerald-300 text-[#25D366] font-bold flex items-center justify-center text-[12px]">1</span>
              <div>
                <div className="font-semibold text-slate-900">Abra o aplicativo do seu banco</div>
                <div className="text-[12px] text-slate-500">Use qualquer banco ou carteira digital (Nubank, Itaú, Bradesco, Caixa, Inter, PicPay, Mercado Pago, etc.) e entre no menu <span className="text-[#25D366]">Área PIX</span>.</div>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-7 h-7 rounded-full bg-emerald-100 border border-emerald-300 text-[#25D366] font-bold flex items-center justify-center text-[12px]">2</span>
              <div>
                <div className="font-semibold text-slate-900">Escolha "PIX Copia e Cola" ou "Ler QR Code"</div>
                <div className="text-[12px] text-slate-500">
                  <span className="text-[#25D366] font-semibold">No celular:</span> toque em <span className="text-[#25D366]">Copiar código PIX</span> acima e cole no campo do banco.<br />
                  <span className="text-[#25D366] font-semibold">No computador:</span> abra a câmera do banco no celular e aponte para o QR Code da tela.
                </div>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-7 h-7 rounded-full bg-emerald-100 border border-emerald-300 text-[#25D366] font-bold flex items-center justify-center text-[12px]">3</span>
              <div>
                <div className="font-semibold text-slate-900">Confira os dados e confirme o pagamento de <span className="text-[#25D366]">{formatBRL(amount)}</span></div>
                <div className="text-[12px] text-slate-500">O nome do recebedor aparece de forma neutra para preservar o seu sigilo. Confirme com a sua senha do banco normalmente.</div>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-7 h-7 rounded-full bg-emerald-100 border border-emerald-300 text-[#25D366] font-bold flex items-center justify-center text-[12px]">4</span>
              <div>
                <div className="font-semibold text-slate-900">Pronto! Aguarde nessa tela</div>
                <div className="text-[12px] text-slate-500">Em poucos segundos o pagamento é identificado automaticamente e o <span className="text-[#25D366] font-semibold">acesso ao celular clonado é liberado</span> sem você precisar fazer mais nada. Não feche essa página.</div>
              </div>
            </li>
          </ol>
        </div>

        {/* Aviso de sigilo */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[#128C7E] text-lg">🛡️</span>
            <h3 className="text-sm font-bold text-[#25D366]">100% sigiloso</h3>
          </div>
          <p className="text-[12px] text-slate-700 leading-relaxed">
            O nome no extrato bancário aparece de forma <span className="text-[#25D366] font-semibold">neutra</span>. Ninguém vai saber para onde foi o pagamento.
          </p>
          <p className="text-[11px] text-slate-500 leading-relaxed border-t border-emerald-100 pt-2">
            Após o pagamento você terá <span className="text-slate-700 font-semibold">acesso total ao celular clonado</span> {doAlvo}. O ZapRadar não se responsabiliza pelo mau uso das informações.
          </p>
        </div>

        {/* Aviso de quebra de sigilo */}
        <div className="bg-gradient-to-br from-red-600/20 via-red-900/10 to-slate-50/40 border border-red-300 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-red-600 text-lg">🚨</span>
            <h3 className="text-sm font-bold text-red-700 uppercase tracking-wider font-['Geist_Mono',monospace]">
              Atenção · Risco de exposição
            </h3>
          </div>
          <p className="text-[12px] text-slate-800 leading-relaxed">
            O <span className="text-red-700 font-semibold">não pagamento para ativação da licença</span> pode acarretar na <span className="text-red-700 font-semibold">quebra de sigilo</span> e vazamento de informações {paraAlvo}.
          </p>
        </div>

        {/* Garantia 7 dias */}
        <div className="bg-gradient-to-br from-emerald-500/15 to-slate-50/40 border border-emerald-300 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[#128C7E] text-lg">🛡️</span>
            <h3 className="text-sm font-bold text-[#25D366] uppercase tracking-wider font-['Geist_Mono',monospace]">
              Garantia incondicional de 7 dias
            </h3>
          </div>
          <p className="text-[12px] text-slate-800 leading-relaxed">
            Seu dinheiro fica <span className="text-[#25D366] font-semibold">protegido</span> e só é liberado para a empresa <span className="text-[#25D366] font-semibold">ZapRadar LTDA</span> após os 7 dias de uso da plataforma.
          </p>
        </div>

        {/* Garantias */}
        <div className="grid grid-cols-3 gap-2">
          <Badge>🔒 Anônimo</Badge>
          <Badge>⚡ Liberação na hora</Badge>
          <Badge>🕵️ Sigilo total</Badge>
        </div>

        {/* Microdepoimento de fechamento */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="text-amber-600 text-sm">★★★★★</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-['Geist_Mono',monospace]">Cliente verificado · há 6 min</div>
          </div>
          <p className="text-[12px] text-slate-700 italic leading-snug">
            "Paguei o PIX e em segundos vi tudo. Confirmou tudo que eu já suspeitava. Valeu cada centavo."
          </p>
          <div className="text-[11px] text-slate-500 mt-1">— Camila R., São Paulo</div>
        </div>

        <Link
          to="/checkout"
          search={{ phone, sex }}
          className="block w-full text-center text-[11px] font-['Geist_Mono',monospace] uppercase tracking-[0.2em] text-slate-500 hover:text-slate-500 transition-colors py-3"
        >
          ← gerar novo PIX
        </Link>
      </div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl py-2 text-center text-[10px] text-slate-700 font-semibold">
      {children}
    </div>
  );
}
