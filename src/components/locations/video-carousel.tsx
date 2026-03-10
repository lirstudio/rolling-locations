"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Video URL helpers ──────────────────────────────────────────────────────────

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

  function prev() {
    setActiveIndex((i) => (i === 0 ? videos.length - 1 : i - 1));
  }

  function next() {
    setActiveIndex((i) => (i === videos.length - 1 ? 0 : i + 1));
  }

  return (
    <div className="space-y-3">
      {/* Main video frame */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-black aspect-video">
        {active.kind === "youtube" || active.kind === "vimeo" ? (
          <iframe
            key={activeIndex}
            src={active.embedUrl}
            title={playLabel}
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

      {/* Navigation: thumbnails row + prev/next */}
      {videos.length > 1 && (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0 size-8"
            onClick={prev}
            aria-label={prevLabel}
          >
            <ChevronRight className="size-4" />
          </Button>

          <div className="flex flex-1 gap-2 overflow-x-auto py-0.5">
            {videos.map((v, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={`relative shrink-0 h-14 w-22 rounded-lg overflow-hidden border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  i === activeIndex
                    ? "border-primary"
                    : "border-border opacity-60 hover:opacity-90"
                }`}
                aria-label={`${playLabel} ${i + 1}`}
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

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0 size-8"
            onClick={next}
            aria-label={nextLabel}
          >
            <ChevronLeft className="size-4" />
          </Button>
        </div>
      )}

      {/* Dot indicators */}
      {videos.length > 1 && (
        <div className="flex justify-center gap-1.5">
          {videos.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`size-2 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                i === activeIndex ? "bg-primary" : "bg-muted-foreground/30"
              }`}
              aria-label={`${playLabel} ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
