import { createClient } from "@/lib/supabase/server";
import { HeroSection } from "./components/hero-section";
import { FeaturedLocations } from "./components/featured-locations";
import { HowItWorks } from "./components/how-it-works";
import { CTABanner } from "./components/cta-banner";

export default async function MarketingHomePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "hero_video_url")
    .maybeSingle();
  const initialHeroVideoUrl = data?.value?.trim() ?? null;

  return (
    <>
      <HeroSection initialHeroVideoUrl={initialHeroVideoUrl} />
      <FeaturedLocations />
      <HowItWorks />
      <CTABanner />
    </>
  );
}
