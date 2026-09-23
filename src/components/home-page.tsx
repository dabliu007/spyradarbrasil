import { SiteNavbar } from "./home/site-navbar";
import { HeroSection } from "./home/hero-section";
import { SolutionsSection } from "./home/solutions-section";
import { KitSection } from "./home/kit-section";
import { ExperienceSection } from "./home/experience-section";
import { ProcessSection } from "./home/process-section";
import { SupportFaqSection } from "./home/support-faq-section";
import { ClosingSection } from "./home/closing-section";

export function HomePage() {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#080808] font-sans text-[#F5F5F2] selection:bg-[#D9A928]/30">
      {/* very subtle tech grid */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10">
        <SiteNavbar />
        <main>
          <HeroSection />
          <SolutionsSection />
          <KitSection />
          <ExperienceSection />
          <ProcessSection />
          <SupportFaqSection />
          <ClosingSection />
        </main>
      </div>
    </div>
  );
}
