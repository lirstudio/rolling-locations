"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowLeft, MapPin, Search, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockCategories } from "@/mocks/categories";
import { HeroVideoBackground } from "@/components/hero-video-background";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1800&q=80";

const EMPTY_CATEGORY = "__all__";

function getYouTubeVideoId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  return match?.[1] ?? null;
}

interface HeroSectionProps {
  /** From server so iframe gets src on first paint and autoplay works */
  initialHeroVideoUrl?: string | null;
}

export function HeroSection({ initialHeroVideoUrl = null }: HeroSectionProps) {
  const t = useTranslations("marketing.hero");
  const router = useRouter();
  const [heroVideoUrl, setHeroVideoUrl] = useState<string | null>(initialHeroVideoUrl);

  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [categorySlug, setCategorySlug] = useState(EMPTY_CATEGORY);

  const topLevelCategories = mockCategories.filter((c) => c.visible && !c.parentId);

  useEffect(() => {
    if (initialHeroVideoUrl) return;
    fetch("/api/site-settings/hero-video")
      .then((r) => r.json())
      .then((data: { url?: string | null }) => {
        const url = data?.url?.trim();
        if (url) setHeroVideoUrl(url);
      })
      .catch(() => {});
  }, [initialHeroVideoUrl]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (city.trim()) params.set("city", city.trim());
    if (categorySlug && categorySlug !== EMPTY_CATEGORY) params.set("category", categorySlug);
    const qs = params.toString();
    router.push(`/locations${qs ? `?${qs}` : ""}`);
  }

  const youtubeId = heroVideoUrl ? getYouTubeVideoId(heroVideoUrl) : null;
  const showVideo = youtubeId !== null;

  return (
    <section className="relative">
      {/* Full-width hero background: video (from admin) or image fallback */}
      <div className="relative min-h-[420px] sm:min-h-[500px] lg:min-h-[560px]">
        {showVideo ? (
          <>
            <HeroVideoBackground videoId={youtubeId!} />
            <div className="absolute inset-0 bg-black/40" aria-hidden style={{ zIndex: 1 }} />
          </>
        ) : (
          <>
            <Image
              src={HERO_IMAGE}
              alt=""
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-black/40" />
          </>
        )}

        {/* Centered text content */}
        <div className="relative flex h-full min-h-[420px] sm:min-h-[500px] lg:min-h-[560px] flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center pb-16" style={{ zIndex: 2 }}>
          <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl drop-shadow-md">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-white/85 sm:text-lg drop-shadow-sm">
            {t("subtitle")}
          </p>
        </div>
      </div>

      {/* Search bar — overlapping the hero bottom edge */}
      <div className="relative z-20 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-14">
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-border bg-card p-4 shadow-lg sm:p-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-4">
            {/* General search field */}
            <div className="flex-[2] min-w-0">
              <label className="mb-1.5 block text-xs font-semibold text-foreground">
                {t("searchQuery")}
              </label>
              <div className="relative">
                <Search className="absolute top-1/2 start-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("searchQueryPlaceholder")}
                  className="bg-background ps-10 pe-4"
                  aria-label={t("searchQuery")}
                />
              </div>
            </div>

            {/* City / region field */}
            <div className="flex-1 min-w-0">
              <label className="mb-1.5 block text-xs font-semibold text-foreground">
                {t("searchCity")}
              </label>
              <div className="relative">
                <MapPin className="absolute top-1/2 start-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={t("searchCity")}
                  className="bg-background ps-10 pe-4"
                  aria-label={t("searchCity")}
                />
              </div>
            </div>

            {/* Category select */}
            <div className="flex-1 min-w-0">
              <label className="mb-1.5 block text-xs font-semibold text-foreground">
                {t("searchCategory")}
              </label>
              <div className="relative">
                <Tag className="absolute top-1/2 start-3 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
                <Select value={categorySlug} onValueChange={setCategorySlug}>
                  <SelectTrigger className="bg-background ps-10" aria-label={t("searchCategory")}>
                    <SelectValue placeholder={t("allCategories")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EMPTY_CATEGORY}>{t("allCategories")}</SelectItem>
                    {topLevelCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.slug}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* CTA */}
            <Button type="submit" size="lg" className="shrink-0 w-full sm:w-auto">
              {t("cta")}
              <ArrowLeft className="ms-2 h-4 w-4 rtl:rotate-180" />
            </Button>
          </div>
        </form>
      </div>

      {/* Spacer so next section doesn't overlap */}
      <div className="h-8 sm:h-10" />
    </section>
  );
}
