import LandingNav from "../components/hero/LandingNav";
import HeroSection from "../components/hero/HeroSection";
import FloatingCards from "../components/hero/FloatingCards";
import HowItWorks from "../components/hero/HowItWorks";
import StatStrip from "../components/hero/StatStrip";
import ForPatients from "../components/hero/ForPatients";
import ForDoctors from "../components/hero/ForDoctors";

export default function HomePage() {
  return (
    <main>
      <LandingNav />
      <HeroSection />
      
      {/* Floating Cards */}
      <section className="py-24 bg-background">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-text-primary">See it in action</h2>
          <p className="text-text-muted mt-3">Three perspectives. One seamless workflow.</p>
        </div>
        <FloatingCards />
      </section>

      <div id="how-it-works">
        <HowItWorks />
      </div>
      
      <StatStrip />
      <ForPatients />
      <ForDoctors />
      
      {/* Footer */}
      <footer className="py-8 bg-surface border-t border-border text-center">
        <p className="text-text-muted text-sm">
          © 2026 BreatheWish. AI-assisted pneumonia detection. Always doctor-verified.
        </p>
      </footer>
    </main>
  );
}
