"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Play } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface ShowcaseVideoItem {
  id: string;
  url: string;
  thumbnailUrl?: string;
  caption?: string;
}

function getVideoKind(url: string): "youtube" | "vimeo" | "direct" {
  try {
    const u = new URL(url);
    if (
      u.hostname === "www.youtube.com" ||
      u.hostname === "youtube.com" ||
      u.hostname === "youtu.be"
    )
      return "youtube";
    if (
      u.hostname === "player.vimeo.com" ||
      u.hostname === "vimeo.com"
    )
      return "vimeo";
  } catch {
    // ignore
  }
  return "direct";
}

function getEmbedUrl(url: string): string {
  const kind = getVideoKind(url);
  if (kind === "direct") return url;
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") {
      const id = u.pathname.slice(1).split("?")[0];
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }
    if (u.pathname.includes("/embed/")) return url;
    const match = u.pathname.match(/\/(?:embed\/|v\/|video\/)([a-zA-Z0-9_-]+)/);
    const id = match?.[1] ?? u.searchParams.get("v");
    if (id)
      return kind === "vimeo"
        ? `https://player.vimeo.com/video/${id}`
        : `https://www.youtube.com/embed/${id}`;
  } catch {
    // ignore
  }
  return url;
}

interface LocationShowcaseVideosProps {
  videos: ShowcaseVideoItem[];
  className?: string;
}

export function LocationShowcaseVideos({ videos, className }: LocationShowcaseVideosProps) {
  const t = useTranslations("marketing.locationDetails");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<ShowcaseVideoItem | null>(null);

  const openVideo = useCallback((video: ShowcaseVideoItem) => {
    setActive(video);
    setOpen(true);
  }, []);

  const closeVideo = useCallback(() => {
    setOpen(false);
    setActive(null);
  }, []);

  if (!videos.length) return null;

  return (
    <>
      <section className={cn("space-y-3", className)}>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {t("videosFromLocation")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("videosFromLocationSubline")}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => {
            const youtubeId =
              getVideoKind(video.url) === "youtube"
                ? (() => {
                    try {
                      const u = new URL(video.url);
                      if (u.hostname === "youtu.be")
                        return u.pathname.slice(1).split("?")[0] ?? "";
                      const m = u.pathname.match(/\/embed\/([a-zA-Z0-9_-]+)/);
                      if (m?.[1]) return m[1];
                      return u.searchParams.get("v") ?? "";
                    } catch {
                      return "";
                    }
                  })()
                : "";
            const thumb =
              video.thumbnailUrl ??
              (youtubeId
                ? `https://img.youtube.com/vi/${youtubeId}/sddefault.jpg`
                : undefined);
            return (
              <button
                key={video.id}
                type="button"
                onClick={() => openVideo(video)}
                className="group relative block w-full overflow-hidden rounded-xl border border-border aspect-[3/4] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label={t("playVideo")}
              >
                {thumb ? (
                  <span className="absolute inset-0">
                    <img
                      src={thumb}
                      alt=""
                      className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </span>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
                    <Play className="h-12 w-12" aria-hidden />
                  </div>
                )}

                {/* Gradient overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                {/* Center play button */}
                <span className="absolute inset-0 flex items-center justify-center transition-opacity group-hover:opacity-100">
                  <span className="rounded-full bg-primary p-3 text-primary-foreground shadow-lg">
                    <Play className="h-6 w-6 fill-current" aria-hidden />
                  </span>
                </span>

                {/* Bottom glass overlay – content inside video like location card */}
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <div className="rounded-xl bg-white/20 backdrop-blur-md border border-white/30 p-3.5 shadow-lg">
                    <div className="flex items-center justify-between gap-2">
                      {video.caption ? (
                        <p className="min-w-0 flex-1 truncate text-sm font-medium text-white">
                          {video.caption}
                        </p>
                      ) : (
                        <span className="flex-1" />
                      )}
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/30 backdrop-blur-sm text-white transition-colors group-hover:bg-white group-hover:text-foreground">
                        <Play className="h-4 w-4 fill-current" />
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <Dialog open={open} onOpenChange={(o) => !o && closeVideo()}>
        <DialogContent className="max-w-4xl border-border p-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>{t("playVideo")}</DialogTitle>
          </DialogHeader>
          {active && (
            <div className="aspect-video w-full bg-black">
              {getVideoKind(active.url) !== "direct" ? (
                <iframe
                  src={open ? getEmbedUrl(active.url) : undefined}
                  title={active.caption ?? t("playVideo")}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={open ? active.url : undefined}
                  controls
                  className="h-full w-full"
                  preload="metadata"
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
