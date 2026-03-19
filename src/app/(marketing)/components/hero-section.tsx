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
      {/* Full-width hero background: video (from admin) or image fallback — 90vh */}
      <div className="relative min-h-[90vh]">
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

        {/* Centered content: title, subtitle, then search bar */}
        <div
          className="relative flex min-h-[90vh] flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8"
          style={{ zIndex: 2 }}
        >
          <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-white drop-shadow-md sm:text-4xl lg:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-white/85 drop-shadow-sm sm:text-lg">
            {t("subtitle")}
          </p>

          {/* Search bar — pill, solid white, reference layout */}
          <div className="mx-auto mt-8 w-full max-w-5xl min-w-0 sm:mt-10">
            <form
              onSubmit={handleSubmit}
              className="flex min-w-0 flex-col items-stretch rounded-3xl bg-white px-5 py-4 text-start shadow-float lg:flex-row lg:items-center lg:gap-0 lg:rounded-full lg:py-4"
            >
              {/* Section 1: Location search */}
              <div className="flex w-full min-w-0 shrink-0 items-center gap-3 py-2 lg:min-w-[140px] lg:flex-[2] lg:ps-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Search className="h-4 w-4 text-muted-foreground" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <label className="block text-start text-xs font-semibold leading-snug text-foreground">
                    {t("searchQuery")}
                  </label>
                  <Input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t("searchQueryPlaceholder")}
                    className="mt-0.5 border-0 bg-transparent px-0 py-1 text-start text-sm text-foreground placeholder:text-muted-foreground shadow-none focus-visible:ring-0"
                    aria-label={t("searchQuery")}
                  />
                </div>
              </div>

              <div className="h-px w-full shrink-0 bg-border lg:h-8 lg:w-px lg:flex-none" aria-hidden />

              {/* Section 2: City / region */}
              <div className="flex w-full min-w-0 shrink-0 items-center gap-3 py-2 lg:min-w-[120px] lg:flex-1 lg:px-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                  <MapPin className="h-4 w-4 text-muted-foreground" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <label className="block text-start text-xs font-semibold leading-snug text-foreground">
                    {t("searchCity")}
                  </label>
                  <Input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder={t("searchCity")}
                    className="mt-0.5 border-0 bg-transparent px-0 py-1 text-start text-sm text-foreground placeholder:text-muted-foreground shadow-none focus-visible:ring-0"
                    aria-label={t("searchCity")}
                  />
                </div>
              </div>

              <div className="h-px w-full shrink-0 bg-border lg:h-8 lg:w-px lg:flex-none" aria-hidden />

              {/* Section 3: Category */}
              <div className="flex w-full min-w-0 shrink-0 items-center gap-3 py-2 lg:min-w-[120px] lg:flex-1 lg:px-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Tag className="h-4 w-4 text-muted-foreground" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <label className="block text-start text-xs font-semibold leading-snug text-foreground">
                    {t("searchCategory")}
                  </label>
                  <Select value={categorySlug} onValueChange={setCategorySlug}>
                    <SelectTrigger
                      className="mt-0.5 h-auto w-full min-w-0 justify-between border-0 bg-transparent py-1 ps-0 pe-6 text-start text-sm text-foreground whitespace-normal shadow-none focus:ring-0 focus-visible:ring-0 *:data-[slot=select-value]:line-clamp-2 *:data-[slot=select-value]:whitespace-normal data-[placeholder]:text-muted-foreground"
                      aria-label={t("searchCategory")}
                    >
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

              <div className="h-px w-full shrink-0 bg-border lg:h-8 lg:w-px lg:flex-none" aria-hidden />

              {/* CTA */}
              <div className="w-full shrink-0 pt-2 lg:w-auto lg:ps-2 lg:pt-0">
                <Button type="submit" size="lg" className="w-full rounded-2xl lg:w-auto lg:rounded-full">
                  {t("cta")}
                  <ArrowLeft className="ms-2 h-4 w-4 rtl:rotate-180 shrink-0" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
