"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { Plus, X, Star, Upload, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AmenityCatalogPicker } from "@/components/locations/amenity-catalog-picker";
import { queryKeys } from "@/lib/query-keys";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { locationSchema, type LocationFormValues } from "@/schemas/location";
import { mockCategories } from "@/mocks/categories";
import { uploadLocationImage } from "@/lib/upload-location-images";
import { AddressAutocomplete } from "@/components/locations/address-autocomplete";
import type { ParsedAddress } from "@/lib/nominatim";

// ── Types ────────────────────────────────────────────────────────────────────

type MediaEntry = {
  id: string;
  previewUrl: string;
  publicUrl?: string;
  uploading: boolean;
  error?: string;
  isFeatured?: boolean;
};

async function fetchAmenityCatalog(): Promise<string[]> {
  try {
    const r = await fetch("/api/site-settings/amenity-catalog");
    if (!r.ok) return [];
    const data = (await r.json()) as { options?: unknown };
    if (!Array.isArray(data.options)) return [];
    return data.options.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

// ── Component ────────────────────────────────────────────────────────────────

interface LocationFormProps {
  defaultValues?: Partial<LocationFormValues> & {
    mediaGallery?: Array<{ url: string; isFeatured?: boolean }>;
  };
  onSubmit: (values: LocationFormValues & { mediaGallery: Array<{ url: string; isFeatured: boolean }> }) => void;
  isEdit?: boolean;
}

export function LocationForm({
  defaultValues,
  onSubmit,
  isEdit = false,
}: LocationFormProps) {
  const t = useTranslations("host");

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      title: "",
      description: "",
      address: { street: "", neighborhood: "", city: "", country: "IL" },
      categoryIds: [],
      pricing: { dailyRate: 0 },
      rules: "",
      amenities: [],
      mediaUrls: [],
      showcaseVideoUrls: [],
      status: "draft",
      ...defaultValues,
    },
  });

  const { data: amenityCatalog = [], isFetching: amenityCatalogLoading } =
    useQuery({
      queryKey: queryKeys.site.amenityCatalog(),
      queryFn: fetchAmenityCatalog,
      staleTime: 60_000,
    });

  React.useEffect(() => {
    if (amenityCatalog.length === 0) return;
    const valid = new Set(amenityCatalog);
    const cur = form.getValues("amenities") ?? [];
    const filtered = cur.filter((a) => valid.has(a));
    if (filtered.length !== cur.length) {
      form.setValue("amenities", filtered, { shouldValidate: true });
    }
  }, [amenityCatalog, form]);

  // Compute URLs directly from mediaEntries at submit time to avoid
  // the useEffect race condition (effect runs after paint, button enabled
  // in the same render that marks uploading=false).
  const handleSubmit = form.handleSubmit((values) => {
    const validEntries = mediaEntries.filter((e) => e.publicUrl != null && !e.error);
    // Sort: featured image first, then others in their original order
    const sortedEntries = [...validEntries].sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return 0; // Keep original order for non-featured images
    });
    const mediaUrls = sortedEntries.map((e) => e.publicUrl!);
    const mediaGallery = sortedEntries.map((e) => ({
      url: e.publicUrl!,
      isFeatured: e.isFeatured ?? false,
    }));
    const valid = new Set(amenityCatalog);
    const amenities = (values.amenities ?? []).filter((a) => valid.has(a));
    onSubmit({ ...values, amenities, mediaUrls, mediaGallery });
  });

  // ── Category hierarchy ────────────────────────────────────────────────────

  const topLevelCats = mockCategories.filter((c) => c.visible && !c.parentId);
  const getChildren = (parentId: string) =>
    mockCategories.filter((c) => c.visible && c.parentId === parentId);

  // ── Media file upload ─────────────────────────────────────────────────────

  const [mediaEntries, setMediaEntries] = React.useState<MediaEntry[]>(() => {
    // If mediaGallery is provided (edit mode), use it with isFeatured
    if (defaultValues?.mediaGallery && defaultValues.mediaGallery.length > 0) {
      const entries = defaultValues.mediaGallery.map((item) => ({
        id: crypto.randomUUID(),
        previewUrl: item.url,
        publicUrl: item.url,
        uploading: false,
        isFeatured: item.isFeatured ?? false,
      }));
      // If no featured image exists, make the first one featured
      const hasFeatured = entries.some((e) => e.isFeatured);
      if (!hasFeatured && entries.length > 0) {
        entries[0].isFeatured = true;
      }
      // Sort: featured image first
      return entries.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return 0;
      });
    }
    // Otherwise, use mediaUrls (new mode or fallback)
    const urls = defaultValues?.mediaUrls ?? [];
    return urls.map((url, index) => ({
      id: crypto.randomUUID(),
      previewUrl: url,
      publicUrl: url,
      uploading: false,
      // Default: first image is featured if no featured image exists
      isFeatured: index === 0,
    }));
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const isUploading = mediaEntries.some((e) => e.uploading);

  // Revoke object URLs on unmount
  React.useEffect(() => {
    return () => {
      mediaEntries.forEach((e) => {
        if (e.previewUrl.startsWith("blob:")) URL.revokeObjectURL(e.previewUrl);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleFiles(fileList: FileList) {
    const files = Array.from(fileList);
    const newEntries: MediaEntry[] = files.map((file) => ({
      id: crypto.randomUUID(),
      previewUrl: URL.createObjectURL(file),
      uploading: true,
    }));

    setMediaEntries((prev) => [...prev, ...newEntries]);

    await Promise.all(
      files.map(async (file, i) => {
        const entryId = newEntries[i].id;
        try {
          const publicUrl = await uploadLocationImage(file);
          setMediaEntries((prev) =>
            prev.map((e) =>
              e.id === entryId ? { ...e, publicUrl, uploading: false } : e
            )
          );
        } catch (err) {
          setMediaEntries((prev) =>
            prev.map((e) =>
              e.id === entryId
                ? {
                    ...e,
                    uploading: false,
                    error: err instanceof Error ? err.message : "שגיאה",
                  }
                : e
            )
          );
        }
      })
    );
  }

  function removeEntry(id: string) {
    setMediaEntries((prev) => {
      const entry = prev.find((e) => e.id === id);
      const wasFeatured = entry?.isFeatured;
      if (entry?.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(entry.previewUrl);
      }
      const remaining = prev.filter((e) => e.id !== id);
      // If we removed the featured image, make the first remaining one featured
      if (wasFeatured && remaining.length > 0) {
        remaining[0].isFeatured = true;
      }
      return remaining;
    });
  }

  function setFeaturedImage(id: string) {
    setMediaEntries((prev) => {
      // Find the entry to make featured
      const featuredEntry = prev.find((e) => e.id === id);
      if (!featuredEntry) return prev;

      // Remove featured flag from all entries
      const updated = prev.map((e) => ({
        ...e,
        isFeatured: e.id === id,
      }));

      // Move featured image to the beginning
      const featuredIndex = updated.findIndex((e) => e.id === id);
      if (featuredIndex > 0) {
        const [featured] = updated.splice(featuredIndex, 1);
        return [featured, ...updated];
      }

      return updated;
    });
  }

  // ── Showcase video URL management ─────────────────────────────────────────

  const currentVideoUrls = form.watch("showcaseVideoUrls") ?? [];
  const [videoUrlInput, setVideoUrlInput] = React.useState("");

  function addVideoUrl() {
    const trimmed = videoUrlInput.trim();
    if (!trimmed || currentVideoUrls.includes(trimmed)) return;
    try {
      new URL(trimmed);
    } catch {
      return;
    }
    form.setValue("showcaseVideoUrls", [...currentVideoUrls, trimmed], {
      shouldValidate: true,
    });
    setVideoUrlInput("");
  }

  function removeVideoUrl(url: string) {
    form.setValue(
      "showcaseVideoUrls",
      currentVideoUrls.filter((u) => u !== url),
      { shouldValidate: true }
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── 1. Basic Info ─────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle>{t("locations.basicInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("locations.locationTitle")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("locations.description")}</FormLabel>
                  <FormControl>
                    <Textarea rows={5} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* ── 2. Categories ─────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle>{t("locations.categories")}</CardTitle>
            <CardDescription>{t("locations.categoriesDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="categoryIds"
              render={() => (
                <FormItem>
                  <div className="space-y-2">
                    {topLevelCats.map((cat) => {
                      const children = getChildren(cat.id);
                      return (
                        <div key={cat.id}>
                          <FormField
                            control={form.control}
                            name="categoryIds"
                            render={({ field }) => {
                              const isChecked = field.value?.includes(cat.id);
                              return (
                                <FormItem className="flex flex-row items-center gap-2 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={isChecked}
                                      onCheckedChange={(checked) => {
                                        const current = field.value ?? [];
                                        if (checked) {
                                          field.onChange([...current, cat.id]);
                                        } else {
                                          const childIds = getChildren(cat.id).map((c) => c.id);
                                          field.onChange(
                                            current.filter(
                                              (id) => id !== cat.id && !childIds.includes(id)
                                            )
                                          );
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="cursor-pointer font-normal">
                                    {cat.name}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />

                          {children.length > 0 && (
                            <FormField
                              control={form.control}
                              name="categoryIds"
                              render={({ field }) => {
                                const parentSelected = field.value?.includes(cat.id);
                                if (!parentSelected) return <></>;
                                return (
                                  <div className="mt-2 ms-6 space-y-2 border-s border-border ps-4">
                                    {children.map((child) => (
                                      <FormItem
                                        key={child.id}
                                        className="flex flex-row items-center gap-2 space-y-0"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(child.id)}
                                            onCheckedChange={(checked) => {
                                              const current = field.value ?? [];
                                              field.onChange(
                                                checked
                                                  ? [...current, child.id]
                                                  : current.filter((id) => id !== child.id)
                                              );
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="cursor-pointer font-normal text-sm">
                                          {child.name}
                                        </FormLabel>
                                      </FormItem>
                                    ))}
                                  </div>
                                );
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* ── 3. Address ────────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle>{t("locations.address")}</CardTitle>
            <CardDescription>{t("locations.addressDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <FormLabel>{t("locations.addressSearch")}</FormLabel>
              <AddressAutocomplete
                value={form.getValues("address.street") ? `${form.getValues("address.street")}, ${form.getValues("address.city")}` : ""}
                onSelect={(addr: ParsedAddress) => {
                  form.setValue("address.street", addr.street, { shouldValidate: true });
                  form.setValue("address.city", addr.city, { shouldValidate: true });
                  form.setValue("address.neighborhood", addr.neighborhood || "", { shouldValidate: true });
                  form.setValue("address.country", addr.country || "IL", { shouldValidate: true });
                  form.setValue("address.lat", addr.lat, { shouldValidate: true });
                  form.setValue("address.lng", addr.lng, { shouldValidate: true });
                }}
                className="mt-1.5"
              />
            </div>

            <FormField
              control={form.control}
              name="address.street"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>{t("locations.street")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address.neighborhood"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("locations.neighborhood")}{" "}
                    <span className="text-muted-foreground font-normal text-xs">(אופציונלי)</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("locations.city")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* ── 4. Pricing ────────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle>{t("locations.pricing")}</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="pricing.dailyRate"
              render={({ field }) => (
                <FormItem className="max-w-xs">
                  <FormLabel>{t("locations.dailyRate")}</FormLabel>
                  <FormDescription>{t("locations.dailyRateDesc")}</FormDescription>
                  <FormControl>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-muted-foreground text-sm">
                        ₪
                      </span>
                      <Input
                        type="number"
                        min={0}
                        className="ps-7"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* ── 5. Amenities ──────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle>{t("locations.amenities")}</CardTitle>
            <CardDescription>{t("locations.amenitiesDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="amenities"
              render={({ field }) => (
                <FormItem>
                  <AmenityCatalogPicker
                    options={amenityCatalog}
                    value={field.value ?? []}
                    onChange={field.onChange}
                    loading={amenityCatalogLoading}
                    triggerPlaceholder={t(
                      "locations.amenitiesSelectPlaceholder"
                    )}
                    loadingLabel={t("locations.amenitiesCatalogLoading")}
                    emptyCatalogMessage={t(
                      "locations.amenitiesCatalogEmpty"
                    )}
                    popoverLabel={t("locations.amenitiesPopoverTitle")}
                    removeTagAriaLabel={t("locations.amenitiesRemoveTag")}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* ── 6. Media (file upload) ─────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle>{t("locations.media")}</CardTitle>
            <CardDescription>{t("locations.mediaDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Thumbnail grid */}
            {mediaEntries.length > 0 && (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {mediaEntries.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={entry.previewUrl}
                      alt=""
                      className="size-full object-cover"
                    />

                    {/* Uploading overlay */}
                    {entry.uploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
                        <Loader2 className="size-6 animate-spin text-primary" />
                      </div>
                    )}

                    {/* Error overlay */}
                    {entry.error && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-destructive/20 p-2">
                        <AlertCircle className="size-5 text-destructive" />
                        <span className="text-center text-[10px] text-destructive leading-tight">
                          {t("locations.mediaUploadError")}
                        </span>
                      </div>
                    )}

                    {/* Featured badge */}
                    {entry.isFeatured && !entry.uploading && !entry.error && (
                      <span className="absolute bottom-1.5 start-1.5 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground shadow">
                        <Star className="size-2.5 fill-current" />
                        {t("locations.mediaFeatured")}
                      </span>
                    )}

                    {/* Set as featured button */}
                    {!entry.uploading && !entry.error && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={`absolute bottom-1.5 end-1.5 size-7 rounded-full bg-white/90 backdrop-blur-sm transition-all ${
                          entry.isFeatured
                            ? "opacity-100 text-primary"
                            : "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setFeaturedImage(entry.id);
                        }}
                        aria-label={
                          entry.isFeatured
                            ? t("locations.removeFromFeatured")
                            : t("locations.setAsFeatured")
                        }
                      >
                        <Star
                          className={`size-4 ${
                            entry.isFeatured ? "fill-primary text-primary" : ""
                          }`}
                        />
                      </Button>
                    )}

                    {/* Remove button */}
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1.5 end-1.5 size-6 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => removeEntry(entry.id)}
                    >
                      <X className="size-3" />
                      <span className="sr-only">{t("locations.mediaRemove")}</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                if (e.target.files?.length) {
                  handleFiles(e.target.files);
                  e.target.value = "";
                }
              }}
            />

            {/* Upload trigger */}
            <Button
              type="button"
              variant="outline"
              className="w-full border-dashed"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="me-2 size-4 animate-spin" />
                  {t("locations.mediaUploading")}
                </>
              ) : (
                <>
                  <Upload className="me-2 size-4" />
                  {t("locations.mediaSelectFiles")}
                </>
              )}
            </Button>

          </CardContent>
        </Card>

        {/* ── 7. Showcase Videos ────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle>{t("locations.showcaseVideos")}</CardTitle>
            <CardDescription>{t("locations.showcaseVideosDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentVideoUrls.length > 0 && (
              <ul className="space-y-2">
                {currentVideoUrls.map((url) => (
                  <li
                    key={url}
                    className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2"
                  >
                    <span className="flex-1 truncate text-sm text-foreground" title={url}>
                      {url}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 size-7 text-muted-foreground hover:text-destructive"
                      onClick={() => removeVideoUrl(url)}
                    >
                      <X className="size-3.5" />
                      <span className="sr-only">{t("locations.removeVideo")}</span>
                    </Button>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex gap-2">
              <Input
                value={videoUrlInput}
                onChange={(e) => setVideoUrlInput(e.target.value)}
                placeholder={t("locations.showcaseVideoUrlPlaceholder")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addVideoUrl();
                  }
                }}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addVideoUrl}
                disabled={!videoUrlInput.trim()}
              >
                <Plus className="size-4 me-1" />
                {t("locations.addVideoUrl")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── 8. Rules ──────────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle>{t("locations.rules")}</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="rules"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder={t("locations.rulesPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* ── 9. Actions ────────────────────────────────────────────────── */}
        <div className="flex justify-end gap-3 pb-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.setValue("status", "draft");
              handleSubmit();
            }}
            disabled={isUploading}
          >
            {t("locations.saveAsDraft")}
          </Button>
          <Button
            type="submit"
            onClick={() => form.setValue("status", "published")}
            disabled={isUploading}
          >
            {isEdit
              ? t("locations.updateLocation")
              : t("locations.publishLocation")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
