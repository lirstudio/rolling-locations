import { HeroSection } from "./components/hero-section";
import { FeaturedLocations } from "./components/featured-locations";
import { HowItWorks } from "./components/how-it-works";
import { CTABanner } from "./components/cta-banner";

export default function MarketingHomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedLocations />
      <HowItWorks />
      <CTABanner />
    </>
  );
}
