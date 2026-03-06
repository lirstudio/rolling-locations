"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, roleRedirectPath } from "@/stores/auth-store";
import { HeroSection } from "./components/hero-section";
import { CategoryHighlights } from "./components/category-highlights";
import { HowItWorks } from "./components/how-it-works";
import { FeaturedLocations } from "./components/featured-locations";
import { TestimonialsSection } from "./components/testimonials-section";
import { CTABanner } from "./components/cta-banner";

export default function MarketingHomePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(roleRedirectPath(user.role));
    }
  }, [isAuthenticated, user, router]);

  if (isAuthenticated && user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <HeroSection />
      <CategoryHighlights />
      <HowItWorks />
      <FeaturedLocations />
      <TestimonialsSection />
      <CTABanner />
    </>
  );
}
