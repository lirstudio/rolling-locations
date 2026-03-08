"use client";

import { useEffect, useRef } from "react";
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
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const didRedirect = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !user || didRedirect.current) return;
    didRedirect.current = true;
    router.replace(roleRedirectPath(user.role));
  }, [isAuthenticated, user?.id, user?.role, router]);

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
