import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchPublishedLocations } from "@/app/actions/locations";
import { HeroSection } from "./components/hero-section";
import { FeaturedLocations } from "./components/featured-locations";
import { HowItWorks } from "./components/how-it-works";
import { CTABanner } from "./components/cta-banner";

const getHeroVideoUrl = unstable_cache(
  async () => {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "hero_video_url")
      .maybeSingle();
    return data?.value?.trim() ?? null;
  },
  ["hero-video-url"],
  { tags: ["admin-settings"], revalidate: 300 }
);

export default async function MarketingHomePage() {
  const [initialHeroVideoUrl, initialLocations] = await Promise.all([
    getHeroVideoUrl(),
    fetchPublishedLocations(),
  ]);

  return (
    <>
      <HeroSection initialHeroVideoUrl={initialHeroVideoUrl} />
      <FeaturedLocations initialData={initialLocations} />
      <HowItWorks />
      <CTABanner />
    </>
  );
}
