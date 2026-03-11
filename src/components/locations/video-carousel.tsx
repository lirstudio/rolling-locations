"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

// ── URL helpers ────────────────────────────────────────────────────────────────

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  return match?.[1] ?? null;
}

function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match?.[1] ?? null;
}

type VideoMeta =
  | { kind: "youtube"; id: string; embedUrl: string; thumbnailUrl: string }
  | { kind: "vimeo"; id: string; embedUrl: string }
  | { kind: "direct"; url: string };

function parseVideo(url: string): VideoMeta {
  const ytId = getYouTubeId(url);
  if (ytId) {
    return {
      kind: "youtube",
      id: ytId,
      embedUrl: `https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`,
      thumbnailUrl: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
    };
  }
  const vimeoId = getVimeoId(url);
  if (vimeoId) {
    return {
      kind: "vimeo",
      id: vimeoId,
      embedUrl: `https://player.vimeo.com/video/${vimeoId}?title=0&byline=0&portrait=0`,
    };
  }
  return { kind: "direct", url };
}

// ── Component ─────────────────────────────────────────────────────────────────

interface VideoCarouselProps {
  urls: string[];
  prevLabel: string;
  nextLabel: string;
  playLabel: string;
}

export function VideoCarousel({ urls, prevLabel, nextLabel, playLabel }: VideoCarouselProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const videos = React.useMemo(() => urls.map(parseVideo), [urls]);

  if (videos.length === 0) return null;

  const active = videos[activeIndex];
  const isMulti = videos.length > 1;

  function prev() {
    setActiveIndex((i) => (i === 0 ? videos.length - 1 : i - 1));
  }

  function next() {
    setActiveIndex((i) => (i === videos.length - 1 ? 0 : i + 1));
  }

  return (
    <div className="space-y-4 text-center">
      {/* counter when multiple */}
      {isMulti && (
        <p className="text-sm text-muted-foreground tabular-nums">
          {activeIndex + 1} / {videos.length}
        </p>
      )}

      {/* player + arrows */}
      <div className="relative flex items-center justify-center gap-3">
        {/* prev arrow */}
        {isMulti && (
          <button
            type="button"
            onClick={prev}
            aria-label={prevLabel}
            className="hidden sm:flex shrink-0 h-10 w-10 items-center justify-center rounded-full border border-border bg-background shadow-sm hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronRight className="size-5 rtl:hidden" />
            <ChevronLeft className="size-5 hidden rtl:block" />
          </button>
        )}

        {/* video embed */}
        <div className="relative flex-1 overflow-hidden rounded-xl border border-border bg-black aspect-video shadow-sm">
          {active.kind === "youtube" || active.kind === "vimeo" ? (
            <iframe
              key={activeIndex}
              src={active.embedUrl}
              title={`${playLabel} ${activeIndex + 1}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 size-full"
            />
          ) : (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video
              key={activeIndex}
              src={active.url}
              controls
              className="absolute inset-0 size-full object-contain"
            />
          )}
        </div>

        {/* next arrow */}
        {isMulti && (
          <button
            type="button"
            onClick={next}
            aria-label={nextLabel}
            className="hidden sm:flex shrink-0 h-10 w-10 items-center justify-center rounded-full border border-border bg-background shadow-sm hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronLeft className="size-5 rtl:hidden" />
            <ChevronRight className="size-5 hidden rtl:block" />
          </button>
        )}
      </div>

      {/* mobile arrows */}
      {isMulti && (
        <div className="flex justify-center gap-3 sm:hidden">
          <button
            type="button"
            onClick={prev}
            aria-label={prevLabel}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background shadow-sm hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronRight className="size-5 rtl:hidden" />
            <ChevronLeft className="size-5 hidden rtl:block" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label={nextLabel}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background shadow-sm hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronLeft className="size-5 rtl:hidden" />
            <ChevronRight className="size-5 hidden rtl:block" />
          </button>
        </div>
      )}

      {/* dots */}
      {isMulti && (
        <div className="flex justify-center gap-2">
          {videos.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={`${playLabel} ${i + 1}`}
              className={`rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                i === activeIndex
                  ? "w-5 h-2 bg-primary"
                  : "w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
              }`}
            />
          ))}
        </div>
      )}

      {/* thumbnail strip — only when 3+ videos */}
      {videos.length >= 3 && (
        <div className="flex gap-2 overflow-x-auto pb-1 justify-center">
          {videos.map((v, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={`${playLabel} ${i + 1}`}
              className={`relative shrink-0 h-16 w-28 rounded-lg overflow-hidden border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                i === activeIndex
                  ? "border-primary opacity-100 shadow-sm"
                  : "border-transparent opacity-50 hover:opacity-80"
              }`}
            >
              {v.kind === "youtube" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={v.thumbnailUrl}
                  alt=""
                  className="size-full object-cover bg-black"
                />
              ) : (
                <div className="size-full bg-muted flex items-center justify-center">
                  <Play className="size-4 text-muted-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
