import LandingNav from "../components/hero/LandingNav";
import HeroSection from "../components/hero/HeroSection";
import FloatingCards from "../components/hero/FloatingCards";
import HowItWorks from "../components/hero/HowItWorks";
import StatStrip from "../components/hero/StatStrip";
import ForPatients from "../components/hero/ForPatients";
import ForDoctors from "../components/hero/ForDoctors";
import { LogoMark } from "../components/hero/LandingNav";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <LandingNav />
      <main id="main">
        <HeroSection />
        <StatStrip />
        <HowItWorks />

        <section aria-labelledby="in-action" className="pb-28 lg:pb-36">
          <div className="max-w-6xl mx-auto px-6 mb-14">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-doctor-accent mb-4">
              One case, three views
            </p>
            <h2
              id="in-action"
              className="text-4xl font-semibold tracking-tight text-text-primary leading-[1.1] max-w-[18ch]"
            >
              The same X-ray, from every side
            </h2>
          </div>
          <FloatingCards />
        </section>

        <ForPatients />
        <ForDoctors />
      </main>

      <footer className="border-t border-border bg-surface">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          <div className="flex items-center gap-2.5 text-text-primary">
            <span className="text-doctor-accent">
              <LogoMark className="w-6 h-6" />
            </span>
            <span className="font-medium tracking-tight">BreatheWish</span>
          </div>
          <p className="text-text-muted text-sm max-w-[60ch] leading-relaxed">
            BreatheWish is a screening aid and does not replace a clinical diagnosis. If you have
            severe breathlessness, chest pain or a very high fever, contact emergency services or
            go to a hospital now.
          </p>
          <div className="text-sm text-text-muted md:text-right space-y-2">
            <p className="flex gap-5 md:justify-end">
              <Link href="/privacy" className="link-quiet">Privacy</Link>
              <Link href="/terms" className="link-quiet">Terms</Link>
            </p>
            <p className="tabular">© 2026 BreatheWish</p>
          </div>
        </div>
      </footer>
    </>
  );
}
