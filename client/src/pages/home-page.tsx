import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import HeroSection from "@/components/home/hero-section";
import FeaturesSection from "@/components/home/features-section";
import PropertyShowcase from "@/components/home/property-showcase";
import TestimonialsSection from "@/components/home/testimonials-section";
import CTASection from "@/components/home/cta-section";
import FaqSection from "@/components/home/faq-section";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <FeaturesSection />
        <TestimonialsSection />
        <CTASection />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}
