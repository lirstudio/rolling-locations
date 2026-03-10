"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Plus, X, Star, Upload, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { Separator } from "@/components/ui/separator";
import { locationSchema, type LocationFormValues } from "@/schemas/location";
import { mockCategories } from "@/mocks/categories";
import { uploadLocationImage } from "@/lib/upload-location-images";

// ── Types ────────────────────────────────────────────────────────────────────

type MediaEntry = {
  id: string;
  previewUrl: string;
  publicUrl?: string;
  uploading: boolean;
  error?: string;
};

const PREDEFINED_AMENITY_KEYS = [
  "wifi",
  "ac",
  "parking",
  "bathrooms",
  "kitchen",
  "backdrops",
  "professionalLighting",
  "generator",
  "monolights",
  "dressingRoom",
  "garden",
  "accessibility",
] as const;

// ── Component ────────────────────────────────────────────────────────────────

interface LocationFormProps {
  defaultValues?: Partial<LocationFormValues>;
  onSubmit: (values: LocationFormValues) => void;
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

  // Compute URLs directly from mediaEntries at submit time to avoid
  // the useEffect race condition (effect runs after paint, button enabled
  // in the same render that marks uploading=false).
  const handleSubmit = form.handleSubmit((values) => {
    const mediaUrls = mediaEntries
      .filter((e) => e.publicUrl != null && !e.error)
      .map((e) => e.publicUrl!);
    onSubmit({ ...values, mediaUrls });
  });

  // ── Category hierarchy ────────────────────────────────────────────────────

  const topLevelCats = mockCategories.filter((c) => c.visible && !c.parentId);
  const getChildren = (parentId: string) =>
    mockCategories.filter((c) => c.visible && c.parentId === parentId);

  // ── Media file upload ─────────────────────────────────────────────────────

  const [mediaEntries, setMediaEntries] = React.useState<MediaEntry[]>(() =>
    (defaultValues?.mediaUrls ?? []).map((url) => ({
      id: crypto.randomUUID(),
      previewUrl: url,
      publicUrl: url,
      uploading: false,
    }))
  );

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
      if (entry?.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(entry.previewUrl);
      }
      return prev.filter((e) => e.id !== id);
    });
  }

  // ── Custom amenity management ─────────────────────────────────────────────

  const predefinedKeys = PREDEFINED_AMENITY_KEYS.map(
    (k) => t(`locations.amenitiesList.${k}` as "locations.amenitiesList.wifi")
  );
  const currentAmenities = form.watch("amenities") ?? [];
  const customAmenities = currentAmenities.filter((a) => !predefinedKeys.includes(a));
  const [customInput, setCustomInput] = React.useState("");

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

  function addCustomAmenity() {
    const trimmed = customInput.trim();
    if (!trimmed || currentAmenities.includes(trimmed)) return;
    form.setValue("amenities", [...currentAmenities, trimmed], { shouldValidate: true });
    setCustomInput("");
  }

  function removeCustomAmenity(value: string) {
    form.setValue(
      "amenities",
      currentAmenities.filter((a) => a !== value),
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
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
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
          <CardContent className="space-y-5">
            <FormField
              control={form.control}
              name="amenities"
              render={() => (
                <FormItem>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {PREDEFINED_AMENITY_KEYS.map((key) => {
                      const label = t(
                        `locations.amenitiesList.${key}` as "locations.amenitiesList.wifi"
                      );
                      return (
                        <FormField
                          key={key}
                          control={form.control}
                          name="amenities"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center gap-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(label)}
                                  onCheckedChange={(checked) => {
                                    const current = field.value ?? [];
                                    field.onChange(
                                      checked
                                        ? [...current, label]
                                        : current.filter((v) => v !== label)
                                    );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="cursor-pointer font-normal text-sm">
                                {label}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {customAmenities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {customAmenities.map((a) => (
                  <Badge key={a} variant="secondary" className="gap-1 pe-1">
                    {a}
                    <button
                      type="button"
                      onClick={() => removeCustomAmenity(a)}
                      className="ms-1 rounded-sm opacity-70 hover:opacity-100"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            <Separator />

            <div className="flex gap-2">
              <Input
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder={t("locations.customAmenityPlaceholder")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomAmenity();
                  }
                }}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCustomAmenity}
                disabled={!customInput.trim()}
              >
                <Plus className="size-4 me-1" />
                {t("locations.addAmenity")}
              </Button>
            </div>
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
                    {index === 0 && !entry.uploading && !entry.error && (
                      <span className="absolute bottom-1.5 start-1.5 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground shadow">
                        <Star className="size-2.5 fill-current" />
                        {t("locations.mediaFeatured")}
                      </span>
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
