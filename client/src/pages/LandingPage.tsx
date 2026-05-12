import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { HeroSection } from '../components/landing/HeroSection';
import { StatsBar } from '../components/landing/StatsBar';
import { NoticeSection } from '../components/landing/NoticeSection';
import { EventsSection } from '../components/landing/EventsSection';
import { LibrarySection } from '../components/landing/LibrarySection';
import { ModulesSection } from '../components/landing/ModulesSection';
import { CTASection } from '../components/landing/CTASection';

export function LandingPage() {
  return (
    <>
      <Header />
      <main id="main-content">
        <HeroSection />
        <StatsBar />
        <NoticeSection />
        <EventsSection />
        <LibrarySection />
        <ModulesSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
