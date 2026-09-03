import { createFileRoute } from "@tanstack/react-router";
import { PresellPage } from "@/components/PresellPage";

export const Route = createFileRoute("/investigar")({
  head: () => ({
    meta: [
      { title: "Análise Social · SpyRadar Brasil" },
      { name: "description", content: "Configure sua análise social com dados públicos disponíveis na internet, em conformidade com a LGPD." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: PresellPage,
});
