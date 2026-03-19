"use client";

import { useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, X, Grid2X2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { MediaItem } from "@/types";

interface LocationGalleryProps {
  gallery: MediaItem[];
  title: string;
}

function isSupabaseStorage(url: string) {
  return url.includes("supabase.co") && url.includes("/storage/");
}

function getTileSpan(index: number, total: number): { colSpan: number; rowSpan: number } {
  if (total <= 2) return { colSpan: 1, rowSpan: 1 };
  if (total <= 4) {
    return index === 0 ? { colSpan: 2, rowSpan: 2 } : { colSpan: 1, rowSpan: 1 };
  }

  const groupIndex = index % 10;
  if (groupIndex === 0 || groupIndex === 5) return { colSpan: 1, rowSpan: 2 };
  if (groupIndex === 2 || groupIndex === 7) return { colSpan: 1, rowSpan: 2 };
  return { colSpan: 1, rowSpan: 1 };
}

function getGridConfig(total: number) {
  if (total <= 2) return { cols: total, rowHeight: "minmax(280px, 400px)" };
  if (total <= 4) return { cols: 3, rowHeight: "minmax(180px, 220px)" };
  return { cols: 4, rowHeight: "minmax(160px, 200px)" };
}

export function LocationGallery({ gallery, title }: LocationGalleryProps) {
  const t = useTranslations("marketing.locationDetails");
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const openGallery = useCallback(() => setGalleryOpen(true), []);

  const openViewer = useCallback((index: number) => setViewerIndex(index), []);
  const closeViewer = useCallback(() => setViewerIndex(null), []);

  const goTo = useCallback(
    (dir: 1 | -1) =>
      setViewerIndex((i) =>
        i === null ? null : (i + dir + gallery.length) % gallery.length
      ),
    [gallery.length]
  );

  const gridConfig = useMemo(() => getGridConfig(gallery.length), [gallery.length]);

  if (gallery.length === 0) return null;

  const main = gallery[0];
  const side = gallery.slice(1, 3);
  const extraCount = gallery.length - 3;

  return (
    <>
      {/* ── Preview bento (on detail page) ── */}
      <section className="group relative">
        {gallery.length >= 3 ? (
          <div className="grid grid-cols-4 grid-rows-2 gap-2.5 h-[280px] sm:h-[360px] md:h-[440px]">
            <button
              type="button"
              className="relative col-span-2 row-span-2 overflow-hidden rounded-s-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={openGallery}
            >
              <Image
                src={main.url}
                alt={title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                sizes="(max-width: 768px) 50vw, 33vw"
                priority
                unoptimized={isSupabaseStorage(main.url)}
              />
            </button>
            {side.map((m, i) => (
              <button
                key={m.id}
                type="button"
                className={`relative col-span-2 overflow-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  i === 0 ? "rounded-se-xl" : "rounded-ee-xl"
                }`}
                onClick={openGallery}
              >
                <Image
                  src={m.url}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-[1.03]"
                  sizes="(max-width: 768px) 50vw, 33vw"
                  unoptimized={isSupabaseStorage(m.url)}
                />
                {i === 1 && extraCount > 0 && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white font-semibold text-lg backdrop-blur-[2px]">
                    +{extraCount} {t("photos")}
                  </span>
                )}
              </button>
            ))}
          </div>
        ) : gallery.length === 2 ? (
          <div className="grid grid-cols-2 gap-2 h-[280px] sm:h-[360px] md:h-[420px]">
            <button
              type="button"
              className="relative overflow-hidden rounded-s-xl focus-visible:ring-2 focus-visible:ring-ring"
              onClick={openGallery}
            >
              <Image
                src={main.url}
                alt={title}
                fill
                className="object-cover"
                sizes="50vw"
                priority
                unoptimized={isSupabaseStorage(main.url)}
              />
            </button>
            <button
              type="button"
              className="relative overflow-hidden rounded-e-xl focus-visible:ring-2 focus-visible:ring-ring"
              onClick={openGallery}
            >
              <Image
                src={gallery[1].url}
                alt=""
                fill
                className="object-cover"
                sizes="50vw"
                unoptimized={isSupabaseStorage(gallery[1].url)}
              />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="relative block h-[280px] sm:h-[360px] md:h-[420px] w-full overflow-hidden rounded-xl focus-visible:ring-2 focus-visible:ring-ring"
            onClick={openGallery}
          >
            <Image
              src={main.url}
              alt={title}
              fill
              className="object-cover"
              sizes="100vw"
              priority
              unoptimized={isSupabaseStorage(main.url)}
            />
          </button>
        )}

        {gallery.length > 1 && (
          <Button
            variant="outline"
            size="sm"
            className="absolute bottom-4 end-4 gap-1.5 rounded-full bg-background/85 backdrop-blur-md shadow-float opacity-0 group-hover:opacity-100 transition-opacity focus-visible:opacity-100"
            onClick={openGallery}
          >
            <Grid2X2 className="size-4" />
            {t("showAllPhotos")}
          </Button>
        )}
      </section>

      {/* ── Full gallery grid (Booking-style) ── */}
      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
        <DialogContent
          showCloseButton={false}
          className="max-w-none w-screen h-screen max-h-screen p-0 border-0 rounded-none bg-background gap-0 overflow-hidden"
        >
          <DialogTitle className="sr-only">{title}</DialogTitle>

          {/* sticky header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 backdrop-blur-sm px-4 sm:px-6 py-3">
            <h2 className="text-base font-semibold text-foreground truncate">
              {title}
            </h2>
            <button
              type="button"
              onClick={() => setGalleryOpen(false)}
              className="shrink-0 rounded-full p-2 hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-5" />
              <span className="sr-only">{t("closeLightbox")}</span>
            </button>
          </div>

          {/* scrollable masonry grid */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
            <div
              className="mx-auto max-w-6xl grid gap-2"
              style={{
                gridTemplateColumns: `repeat(${gridConfig.cols}, 1fr)`,
                gridAutoRows: gridConfig.rowHeight,
              }}
            >
              {gallery.map((m, i) => {
                const span = getTileSpan(i, gallery.length);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => openViewer(i)}
                    className="group/tile relative overflow-hidden rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    style={{
                      gridColumn: `span ${span.colSpan}`,
                      gridRow: `span ${span.rowSpan}`,
                    }}
                  >
                    <Image
                      src={m.url}
                      alt={`${title} — ${i + 1}`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover/tile:scale-[1.03]"
                      sizes={
                        span.colSpan === 2
                          ? "(max-width: 768px) 100vw, 50vw"
                          : "(max-width: 768px) 50vw, 25vw"
                      }
                      unoptimized={isSupabaseStorage(m.url)}
                    />
                    <span className="absolute inset-0 bg-black/0 group-hover/tile:bg-black/10 transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Single image viewer (dark overlay) ── */}
      <Dialog open={viewerIndex !== null} onOpenChange={(open) => !open && closeViewer()}>
        <DialogContent
          showCloseButton={false}
          className="max-w-[95vw] sm:max-w-5xl h-[90vh] p-0 border-0 bg-black/95 gap-0 overflow-hidden"
        >
          <DialogTitle className="sr-only">{title}</DialogTitle>

          <div className="flex items-center justify-between px-4 py-3 text-white/80">
            <span className="text-sm font-medium tabular-nums">
              {(viewerIndex ?? 0) + 1} / {gallery.length}
            </span>
            <button
              type="button"
              onClick={closeViewer}
              className="rounded-full p-1.5 hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-5" />
              <span className="sr-only">{t("closeLightbox")}</span>
            </button>
          </div>

          {viewerIndex !== null && (
            <div className="relative flex-1 min-h-0">
              <Image
                src={gallery[viewerIndex].url}
                alt={`${title} — ${viewerIndex + 1}`}
                fill
                className="object-contain"
                sizes="95vw"
                quality={90}
                unoptimized={isSupabaseStorage(gallery[viewerIndex].url)}
              />
            </div>
          )}

          {gallery.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => goTo(-1)}
                className="absolute start-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ChevronRight className="size-6 rtl:hidden" />
                <ChevronLeft className="size-6 hidden rtl:block" />
                <span className="sr-only">{t("previousPhoto")}</span>
              </button>
              <button
                type="button"
                onClick={() => goTo(1)}
                className="absolute end-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ChevronLeft className="size-6 rtl:hidden" />
                <ChevronRight className="size-6 hidden rtl:block" />
                <span className="sr-only">{t("nextPhoto")}</span>
              </button>
            </>
          )}

          {gallery.length > 1 && (
            <div className="flex gap-1.5 px-4 py-3 overflow-x-auto justify-center">
              {gallery.map((m, i) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setViewerIndex(i)}
                  className={`relative h-14 w-20 shrink-0 rounded-lg overflow-hidden transition-all focus-visible:ring-2 focus-visible:ring-ring ${
                    i === viewerIndex
                      ? "ring-2 ring-white opacity-100 scale-105"
                      : "opacity-50 hover:opacity-80"
                  }`}
                >
                  <Image
                    src={m.url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="80px"
                    unoptimized={isSupabaseStorage(m.url)}
                  />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
