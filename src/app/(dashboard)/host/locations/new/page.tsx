"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { LocationForm } from "@/components/locations/location-form";
import { useHostStore } from "@/stores/host-store";
import { generateSlug } from "@/utils/slug";
import type { LocationFormValues } from "@/schemas/location";
import type { MediaItem } from "@/types";

export default function NewLocationPage() {
  const t = useTranslations("host");
  const router = useRouter();
  const addLocation = useHostStore((s) => s.addLocation);

  async function handleSubmit(values: LocationFormValues) {
    const mediaGallery: MediaItem[] = (values.mediaUrls ?? []).map((url, index) => ({
      id: crypto.randomUUID(),
      url,
      type: "image" as const,
      isFeatured: index === 0,
    }));

    const id = crypto.randomUUID();
    await addLocation({
      id,
      slug: generateSlug(values.title),
      title: values.title,
      description: values.description,
      address: { ...values.address, country: values.address.country ?? "IL" },
      mediaGallery,
      hostId: "user-host-1",
      categoryIds: values.categoryIds,
      pricing: values.pricing,
      rules: values.rules,
      amenities: values.amenities,
      showcaseVideos: values.showcaseVideoUrls ?? [],
      status: values.status ?? "draft",
      createdAt: new Date().toISOString(),
    });
    router.push(`/host/locations/${id}/view`);
  }

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <h1 className="text-2xl font-bold tracking-tight">
        {t("locations.newLocation")}
      </h1>
      <div className="mx-auto w-full max-w-2xl">
        <LocationForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
