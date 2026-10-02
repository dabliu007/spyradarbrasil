import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";

const searchSchema = z.object({
  phone: z.coerce.string().optional().default(""),
  sex: z.enum(["M", "F"]).optional().default("M"),
});

export const Route = createFileRoute("/whatsapp-clonado")({
  head: () => ({
    meta: [
      { title: "WhatsApp Clonado — SpyRadar Brasil" },
      {
        name: "description",
        content:
          "Visualização do WhatsApp clonado do alvo investigado pelo SpyRadar Brasil.",
      },
      { property: "og:title", content: "WhatsApp Clonado — SpyRadar Brasil" },
      { property: "og:url", content: "https://clonawhats.com/whatsapp-clonado" },
      { name: "robots", content: "noindex,follow" },
    ],
    links: [{ rel: "canonical", href: "https://clonawhats.com/whatsapp-clonado" }],
  }),
  validateSearch: (s) => searchSchema.parse(s),
  component: WhatsAppClonadoPage
