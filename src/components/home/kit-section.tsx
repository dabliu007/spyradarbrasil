import {
  Video,
  Mic,
  Minimize2,
  Wifi,
  RadioTower,
  MapPin,
  Smartphone,
  PackageOpen,
  ShieldHalf,
  MonitorSmartphone,
  Info,
} from "lucide-react";
import { Container, SectionHeading, GoldButton } from "./primitives";

type Product = {
  name: string;
  image: string;
  features: { icon: React.ComponentType<{ className?: string }>; label: string }[];
};

const products: Product[] = [
  {
    name: "Caneta com Câmera",
    image: "/kit/caneta.png",
    features: [
      { icon: Video, label: "Gravação de vídeo" },
      { icon: Mic, label: "Gravação de áudio" },
      { icon: Minimize2, label: "Formato compacto" },
    ],
  },
  {
    name: "Mini Câmera Wi-Fi",
    image: "/kit/camera.png",
    features: [
      { icon: Wifi, label: "Conectividade Wi-Fi" },
      { icon: RadioTower, label: "Recursos remotos" },
      { icon: Minimize2, label: "Formato compacto" },
    ],
  },
  {
    name: "Localizador",
    image: "/kit/rastreador.png",
    features: [
      { icon: MapPin, label: "Recursos de localização" },
      { icon: Smartphone, label: "Acompanhamento pelo celular" },
      { icon: PackageOpen, label: "Portátil" },
    ],
  },
  {
    name: "App Clonador",
    image: "/kit/app.png",
    features: [
      { icon: ShieldHalf, label: "Espelha o WhatsApp" },
      { icon: MonitorSmartphone, label: "Monitoramento invisível" },
      { icon: Smartphone, label: "Funciona em qualquer celular" },
    ],
  },
];

export function KitSection() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading
            eyebrow="Kit Detetive"
            title={
              <>
                Ferramentas para
                <br className="hidden sm:block" /> flagrar e espionar
              </>
            }
            subtitle="Além do app clonador, o Kit Detetive traz câmeras escondidas e rastreadores para você pegar a pessoa em flagrante."
          />
          <div className="shrink-0">
            <GoldButton to="/verificar">Clonar agora</GoldButton>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <article
              key={product.name}
              className="group flex flex-col overflow-hidden rounded-2xl border border-[#292929] bg-[#151515] transition-colors hover:border-[#D9A928]/40"
            >
              <div className="relative aspect-square overflow-hidden bg-[#0d0d0d]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,169,40,0.12),transparent_65%)]" />
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={`${product.name} — Kit Detetive Spy Radar Brasil`}
                  className="relative h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-display text-lg font-bold text-[#F5F5F2]">
                  {product.name}
                </h3>
                <ul className="mt-4 flex flex-1 flex-col gap-3">
                  {product.features.map((feature) => (
                    <li key={feature.label} className="flex items-center gap-3">
                      <feature.icon className="h-4 w-4 shrink-0 text-[#D9A928]" />
                      <span className="text-[13px] text-[#A7A7A7]">{feature.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-8 flex items-start gap-2 text-[12px] leading-relaxed text-[#A7A7A7]/80">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#8C6515]" />
          Utilize os recursos de forma responsável e de acordo com a legislação
          aplicável.
        </p>
      </Container>
    </section>
  );
}
