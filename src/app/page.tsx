import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import ServicesSection from "@/components/sections/ServicesSection";
import PricingSection from "@/components/sections/PricingSection";
import ContactSection from "@/components/sections/ContactSection";

export default function Home() {
  return (
    <main className="bg-slate-950 text-slate-100 font-sans">
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <PricingSection />
      <ContactSection />
    </main>
  );
}
