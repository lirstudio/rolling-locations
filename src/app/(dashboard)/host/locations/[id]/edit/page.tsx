"use client";

import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { LocationForm } from "@/components/locations/location-form";
import { useAuthStore } from "@/stores/auth-store";
import { useHostLocations } from "@/hooks/use-host-locations";
import type { LocationFormValues } from "@/schemas/location";
import type { MediaItem } from "@/types";

export default function EditLocationPage() {
  const t = useTranslations("host");
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const { locations, updateLocation } = useHostLocations(user?.id);
  const location = locations.find((l) => l.id === params.id);

  if (!location) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Location not found</p>
      </div>
    );
  }

  async function handleSubmit(values: LocationFormValues) {
    const mediaGallery: MediaItem[] = (values.mediaUrls ?? []).map((url, index) => ({
      id: crypto.randomUUID(),
      url,
      type: "image" as const,
      isFeatured: index === 0,
    }));

    await updateLocation(params.id, {
      title: values.title,
      description: values.description,
      address: { ...values.address, country: values.address.country ?? "IL" },
      mediaGallery,
      categoryIds: values.categoryIds,
      pricing: values.pricing,
      rules: values.rules,
      amenities: values.amenities,
      showcaseVideos: values.showcaseVideoUrls ?? [],
      status: values.status ?? "draft",
    });
    router.push(`/host/locations/${params.id}/view`);
  }

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <h1 className="text-2xl font-bold tracking-tight">
        {t("locations.editLocation")}
      </h1>
      <div className="mx-auto w-full max-w-2xl">
        <LocationForm
          isEdit
          defaultValues={{
            title: location.title,
            description: location.description,
            address: location.address,
            categoryIds: location.categoryIds,
            pricing: location.pricing,
            rules: location.rules ?? "",
            amenities: location.amenities ?? [],
            mediaUrls: location.mediaGallery.map((m) => m.url),
            showcaseVideoUrls: location.showcaseVideos ?? [],
            status: location.status,
          }}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
