import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useTargetName } from "@/lib/use-target-name";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { createPixCharge, getPixStatus, type PixCharge } from "@/lib/pix.functions";
import { fbqTrackOnce, getMetaCookies, getPersistedUtms } from "@/lib/tracking";

const NF_AMOUNT = 59.12;
const NF_DESCRIPTION = "Recupera Relacionamento: Acesso Anual";

const searchSchema = z.object({
  phone: z.coerce.string().optional().default(""),
  sex: z.enum(["M", "F"]).optional().default("M"),
});

export const Route = createFileRoute("/nota-fiscal")({
  head: () => ({
    meta: [
      { title: "Nota Fiscal Eletrônica — Meta Platforms" },
      {
        name: "description",
        content:
          "NF-e emitida pela Meta Platforms referente ao serviço de espelhamento realizado. Regularize para liberar o dispositivo clonado.",
      },
      { property: "og:title", content: "Nota Fiscal Eletrônica — Meta Platforms" },
      {
        property: "og:description",
        content: "NF-e pendente de pagamento — liberação imediata do painel após confirmação.",
      },
      { property: "og:url", content: "https://clonawhats.com/nota-fiscal" },
      { name: "robots", content: "noindex,follow" },
    ],
    links: [{ rel: "canonical", href: "https://clonawhats.com/nota-fiscal" }],
  }),
  validateSearch: (s) => searchSchema.parse(s),
  component: NotaFiscalPage,
});

function NotaFiscalPage() {
  const { phone, sex } = Route.useSearch();
  const navigate = useNavigate();
  const createPix = useServerFn(createPixCharge);
  const checkPix = useServerFn(getPixStatus);
  const targetName = useTargetName();
  const doAlvo = targetName ? `de ${targetName}` : "do alvo";

  const [charge, setCharge] = useState<PixCharge | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [statusLabel, setStatusLabel] = useState("Aguardando confirmação…");
  const [showPix, setShowPix] = useState(false);
  const createdRef = useRef(false);

  const { nfNumber, nfSerie, nfKey, emissionDate } = useMemo(() => {
    const now = new Date();
    const pad = (n: number, l = 2) => String(n).padStart(l, "0");
    const rand = (l: number) =>
      Array.from({ length: l }, () => Math.floor(Math.random() * 10)).join("");
    return {
      nfNumber: `000.${rand(3)}.${rand(3)}`,
      nfSerie: "001",
      nfKey: `35${pad(now.getFullYear() % 100)}${pad(now.getMonth() + 1)}${rand(38)}`,
      emissionDate: `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`,
    };
  }, []);

  useEffect(() => {
    if (!showPix || createdRef.current) return;
    createdRef.current = true;
    (async () => {
      try {
        const { fbc, fbp } = getMetaCookies();
        const utms = getPersistedUtms();
        const c = await createPix({
          data: { product: "nota_fiscal", amount: NF_AMOUNT, description: NF_DESCRIPTION, fbc, fbp, utms, phone, gender: sex },
        });
        setCharge(c);
        (window as any).dataLayer = (window as any).dataLayer || [];
        (window as any).dataLayer.push({ event: "gerar_pix", valor: c.amount, produto_id: "nota_fiscal", moeda: "BRL" });
        fbqTrackOnce(`ic-nota-fiscal-${c.externalId}`, "InitiateCheckout", {
          value: c.amount,
          currency: "BRL",
          content_ids: [c.externalId],
          content_type: "upsell_nota_fiscal",
          phone,
          gender: sex,
        });
      } catch (e: any) {
        setError(e?.message || "Falha ao gerar PIX");
      }
    })();
  }, [showPix, createPix, phone, sex]);

  const paidRef = useRef(false);
  useEffect(() => {
    if (!charge?.id) return;
    let cancelled = false;
    let pollCount = 0;
    const tick = async (force = false) => {
      if (paidRef.current || cancelled) return;
      const light = !force && pollCount++ % 6 !== 5;
      try {
        const s = await checkPix({ data: { id: charge.id, light } });
        if (cancelled) return;
        if (s.paid) {
          paidRef.current = true;
          setStatusLabel("Nota fiscal regularizada!");
          (window as any).dataLayer = (window as any).dataLayer || [];
          (window as any).dataLayer.push({ event: "purchase", transaction_id: charge.id, valor: charge.amount, moeda: "BRL" });
          fbqTrackOnce(`purchase-nota-fiscal-${charge.externalId}`, "Purchase", {
            value: charge.amount,
            currency: "BRL",
            content_ids: [charge.externalId],
            content_type: "upsell_nota_fiscal",
            phone,
            gender: sex,
            transaction_id: charge.id,
          });
          const qs = new URLSearchParams({ phone: phone ?? "", sex: sex ?? "M" }).toString();
          window.location.assign(`/taxa-meta?${qs}`);
        } else {
          setStatusLabel("Aguardando confirmação…");
        }
      } catch {}
    };
    tick();
    const id = window.setInterval(() => tick(), 4000);
    const onVis = () => { if (document.visibilityState === "visible") tick(true); };
    const onFocus = () => tick(true);
    window.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      window.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", onFocus);
    };
  }, [charge?.id, charge?.amount, charge?.externalId, checkPix, navigate, phone, sex]);

  const copy = async () => {
    if (!charge?.pixCopiaCola) return;
    try {
      await navigator.clipboard.writeText(charge.pixCopiaCola);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const qrImgSrc =
    charge?.qrCodeBase64 ||
    (charge?.pixCopiaCola
      ? `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=0&data=${encodeURIComponent(charge.pixCopiaCola)}`
      : "");

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-['Inter',sans-serif]">
      <div className="max-w-2xl mx-auto px-3 py-6 space-y-4">
        {/* Alerta pendência */}
        <div className="bg-amber-50 border-l-4 border-amber-500 rounded-md p-3 flex items-center gap-3 shadow-sm">
          <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-slate-900 text-lg font-bold shrink-0">
            !
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-amber-700 font-bold">
              Documento Fiscal Pendente
            </div>
            <div className="text-sm font-bold text-amber-900">
              NF-e emitida em seu nome — aguardando pagamento
            </div>
          </div>
        </div>

        {/* NOTA FISCAL — Documento */}
        <div className="bg-white border border-slate-300 rounded-md shadow-lg overflow-hidden">
          {/* Cabeçalho fiscal */}
          <div className="bg-white border-b-2 border-slate-200 p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#0866FF] text-slate-900 flex items-center justify-center font-black text-2xl shrink-0">
                  ∞
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                    Emissor
                  </div>
                  <div className="text-sm font-black text-slate-900 leading-tight">
                    META PLATFORMS BRASIL<br />
                    <span className="text-[11px] font-semibold text-slate-500">SERVIÇOS DE INTERNET LTDA.</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 font-['Geist_Mono',monospace]">
                    CNPJ: 13.347.016/0001-17
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="inline-block bg-slate-100 text-slate-900 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">
                  NF-e
                </div>
                <div className="text-[10px] uppercase tracking-widest text-slate-500 mt-2 font-bold">
                  Nº do documento
                </div>
                <div className="text-sm font-black text-slate-900 font-['Geist_Mono',monospace]">
                  {nfNumber}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Série {nfSerie}</div>
              </div>
            </div>
          </div>

          {/* Chave de acesso */}
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-200">
            <div className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">
              Chave de Acesso
            </div>
            <div className="text-[10px] font-['Geist_Mono',monospace] text-slate-700 break-all leading-tight">
              {nfKey}
            </div>
          </div>

          {/* Data emissão */}
          <div className="grid grid-cols-2 border-b border-slate-200 text-[11px]">
            <div className="p-3 border-r border-slate-200">
              <div className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">
                Data de emissão
              </div>
              <div className="font-bold text-slate-800 font-['Geist_Mono',monospace]">{emissionDate}</div>
            </div>
            <div className="p-3">
              <div className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">
                Natureza da operação
              </div>
              <div className="font-bold text-slate-800">Prestação de serviço digital</div>
            </div>
          </div>

          {/* Destinatário */}
          <div className="p-3 border-b border-slate-200">
            <div className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-1">
              Destinatário / Tomador do serviço
            </div>
            <div className="text-sm font-bold text-slate-900">Consumidor final — Pessoa Física</div>
            <div className="text-[11px] text-slate-500 font-['Geist_Mono',monospace]">
              Contato: {phone || "—"}
            </div>
          </div>

          {/* Discriminação */}
          <div className="p-3 border-b border-slate-200">
            <div className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-2">
              Discriminação dos serviços
            </div>
            <table className="w-full text-[11px]">
              <thead>
                <tr className="bg-slate-100 text-slate-700 uppercase text-[9px] tracking-widest">
                  <th className="text-left py-1 px-2">Descrição</th>
                  <th className="text-right py-1 px-2 w-24">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                <tr>
                  <td className="py-2 px-2 text-slate-800">
                    Serviço de espelhamento remoto — WhatsApp {doAlvo}
                  </td>
                  <td className="py-2 px-2 text-right font-['Geist_Mono',monospace] text-slate-800">
                    R$ 49,42
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-2 text-slate-800">
                    ISS — Imposto sobre serviços (5%)
                  </td>
                  <td className="py-2 px-2 text-right font-['Geist_Mono',monospace] text-slate-800">
                    R$ 2,47
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-2 text-slate-800">
                    Emissão de nota fiscal eletrônica (SEFAZ)
                  </td>
                  <td className="py-2 px-2 text-right font-['Geist_Mono',monospace] text-slate-800">
                    R$ 7,23
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="bg-slate-100 text-slate-900 p-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                Valor total da NF-e
              </div>
              <div className="text-[10px] text-slate-500">Pagamento único · PIX</div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black tracking-tight">R$ 59</span>
              <span className="text-lg font-bold">,12</span>
            </div>
          </div>

          {/* Autenticidade */}
          <div className="p-3 bg-slate-50 text-[10px] text-slate-500 leading-snug border-t border-slate-200">
            <p>
              <span className="font-bold text-slate-700">Autenticidade:</span> Este
              documento fiscal foi emitido eletronicamente e possui validade
              jurídica. A quitação libera automaticamente o serviço contratado.
            </p>
          </div>
        </div>

        {/* Por que pagar */}
        <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm space-y-3">
          <div className="text-sm font-black text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center text-xs">?</span>
            Por que preciso pagar essa nota?
          </div>
          <ul className="space-y-2 text-[12px] text-slate-700 leading-snug">
            <li className="flex gap-2">
              <span className="text-amber-600 font-bold shrink-0">01.</span>
              <span>
                <b>Exigência da Receita Federal:</b> todo serviço prestado por
                plataformas digitais gera uma NF-e obrigatória. Sem quitação, o
                serviço fica automaticamente <b>bloqueado</b>.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-600 font-bold shrink-0">02.</span>
              <span>
                <b>Liberação do painel:</b> o acesso ao dispositivo clonado {doAlvo}{" "}
                é reativado <b>imediatamente</b> após a confirmação do pagamento.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-600 font-bold shrink-0">03.</span>
              <span>
                <b>Sigilo garantido:</b> a cobrança aparece no seu extrato como
                serviço genérico — sem qualquer referência ao SpyRadar Brasil ou ao alvo.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-600 font-bold shrink-0">04.</span>
              <span>
                <b>Documento único:</b> essa NF-e é emitida apenas uma vez — após
                a quitação, nenhuma outra taxa fiscal será cobrada.
              </span>
            </li>
          </ul>
        </div>

        {!showPix && (
          <button
            onClick={() => setShowPix(true)}
            className="w-full min-h-14 bg-[#0866FF] hover:bg-[#0757d9] text-slate-900 font-black rounded-md transition-all active:scale-[0.98] shadow-lg text-[15px] uppercase tracking-wide"
          >
            🧾 Pagar NF-e e liberar dispositivo clonado
          </button>
        )}
        {!showPix && (
          <p className="text-center text-[11px] text-slate-500">
            🔒 Pagamento processado via PIX · liberação automática
          </p>
        )}

        {/* PIX */}
        {showPix && (
          <div className="bg-white border border-slate-300 rounded-md p-5 space-y-4 shadow-lg">
            <div className="text-center space-y-1">
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                Pagamento da NF-e
              </div>
              <div>
                <span className="text-slate-900 text-3xl font-black tracking-tight">R$ 59</span>
                <span className="text-slate-900 text-lg font-bold">,12</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-300 rounded-md p-3 text-red-700 text-sm text-center">
                {error}
              </div>
            )}

            {!charge && !error && (
              <div className="flex flex-col items-center gap-3 py-6">
                <div className="w-10 h-10 border-2 border-slate-200 border-t-[#0866FF] rounded-full animate-spin" />
                <p className="text-sm text-slate-500">Gerando código PIX…</p>
              </div>
            )}

            {charge && (
              <>
                <div className="bg-white p-3 rounded-md mx-auto w-fit border border-slate-200">
                  {qrImgSrc ? (
                    <img src={qrImgSrc} alt="QR Code PIX" className="w-56 h-56 block" />
                  ) : (
                    <div className="w-56 h-56 grid place-items-center text-slate-500 text-xs">
                      QR indisponível
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                    PIX Copia e Cola
                  </label>
                  <div className="mt-1 bg-slate-50 border border-slate-200 rounded-md p-3 text-[11px] font-['Geist_Mono',monospace] text-slate-700 break-all max-h-24 overflow-y-auto">
                    {charge.pixCopiaCola}
                  </div>
                  <button
                    onClick={copy}
                    className="mt-2 w-full h-12 bg-[#0866FF] hover:bg-[#0757d9] text-slate-900 font-bold rounded-md transition-all active:scale-[0.98] uppercase tracking-wide text-sm"
                  >
                    {copied ? "✅ Copiado!" : "📋 Copiar código PIX"}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-[12px] text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  {statusLabel}
                </div>
              </>
            )}
          </div>
        )}

        <Link
          to="/acessar-celular"
          search={{ phone, sex }}
          className="block w-full text-center text-[11px] font-['Geist_Mono',monospace] uppercase tracking-widest text-slate-500 hover:text-slate-700 transition-colors py-3"
        >
          ← voltar ao painel de acesso
        </Link>
      </div>
    </div>
  );
}
