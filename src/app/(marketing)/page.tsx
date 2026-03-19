import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchPublishedLocations } from "@/app/actions/locations";
import { HeroSection } from "./components/hero-section";
import { FeaturedLocations } from "./components/featured-locations";
import { HowItWorks } from "./components/how-it-works";
import { CTABanner } from "./components/cta-banner";

const getHeroVideoUrl = unstable_cache(
  async (): Promise<string | null> => {
    try {
      const supabase = createAdminClient();
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "hero_video_url")
        .maybeSingle();
      return data?.value?.trim() ?? null;
    } catch {
      // env vars missing or table not yet seeded — render page without video
      return null;
    }
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
