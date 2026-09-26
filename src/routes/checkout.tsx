import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useTargetName } from "@/lib/use-target-name";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import {
  BadgeCheck,
  Check,
  ChevronDown,
  Clock,
  EyeOff,
  Gift,
  Image as ImageIcon,
  Loader2,
  Lock,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Star,
  Zap,
} from "lucide-react";
import { createPixCharge } from "@/lib/pix.functions";
import { fbqTrackOnce, getMetaCookies, getPersistedUtms } from "@/lib/tracking";
import provaWhatsapp from "@/assets/prova-whatsapp.png";
import provaGaleria from "@/assets/prova-galeria.png";
import provaRastreador from "@/assets/prova-rastreador.png";

const searchSchema = z.object({
  phone: z.coerce.string().optional().default(""),
  sex: z.enum(["M", "F"]).optional().default("M"),
  amount: z.coerce.number().positive().optional(),
});

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Pagamento PIX — SpyRadar Brasil" },
      {
        name: "description",
        content:
          "Etapa de pagamento PIX do SpyRadar Brasil. Liberação automática do acesso após a confirmação, com sigilo total e sem envio de comprovante.",
      },
      { property: "og:title", content: "Pagamento PIX — SpyRadar Brasil" },
      {
        property: "og:description",
        content: "Gere seu PIX e libere automaticamente o acesso ao celular clonado.",
      },
      { property: "og:url", content: "https://clonawhats.com/checkout" },
      { name: "robots", content: "noindex,follow" },
    ],
    links: [{ rel: "canonical", href: "https://clonawhats.com/checkout" }],
  }),
  validateSearch: (s) => searchSchema.parse(s),
  component: CheckoutPage,
});

const DEFAULT_AMOUNT = 97.0;
const ANCHOR_PRICE = 297.0;
const DOWNSELL_CHAIN = [57, 47, 37, 27];
const RESERVE_SECONDS = 10 * 60;

const formatBRL = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

const BENEFITS = [
  { icon: MessageCircle, text: "Todas as conversas do WhatsApp, inclusive as apagadas" },
  { icon: ImageIcon, text: "Fotos, vídeos e áudios recebidos e enviados" },
  { icon: MapPin, text: "Localização em tempo real do aparelho" },
  { icon: EyeOff, text: "100% invisível — o alvo nunca é notificado" },
];

const PROOFS = [
  { src: provaWhatsapp, label: "Conversas" },
  { src: provaGaleria, label: "Galeria" },
  { src: provaRastreador, label: "Localização" },
];

const TESTIMONIALS = [
  {
    name: "Juliana M.",
    city: "Campinas, SP",
    time: "há 2 horas",
    text: "Paguei o PIX e em menos de 1 minuto já estava vendo as conversas. Descobri tudo o que eu precisava saber.",
  },
  {
    name: "Ricardo A.",
    city: "Belo Horizonte, MG",
    time: "há 5 horas",
    text: "Achei que era golpe, mas liberou na hora. Vi até as mensagens que ela tinha apagado. Valeu cada centavo.",
  },
  {
    name: "Fernanda S.",
    city: "Recife, PE",
    time: "ontem",
    text: "O nome e CPF no PIX vieram aleatórios, ninguém ficou sabendo. A localização em tempo real me abriu os olhos.",
  },
];

const STEPS = [
  { title: "Gere o PIX", text: "Toque no botão e o código PIX é criado na hora." },
  { title: "Pague no seu banco", text: "Use o Copia e Cola ou o QR Code em qualquer banco." },
  { title: "Acesso liberado", text: "A confirmação é automática, sem enviar comprovante." },
];

const FAQ = [
  {
    q: "A pessoa vai saber que estou vendo o celular dela?",
    a: "Não. O espelhamento é 100% invisível: nenhuma notificação, ícone ou aviso aparece no aparelho do alvo.",
  },
  {
    q: "Meu nome aparece no pagamento?",
    a: "Não. A cobrança PIX é gerada com nome e CPF aleatórios,
