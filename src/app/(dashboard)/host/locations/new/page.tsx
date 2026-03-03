"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { LocationForm } from "@/components/locations/location-form";
import { useHostStore } from "@/stores/host-store";
import type { LocationFormValues } from "@/schemas/location";

export default function NewLocationPage() {
  const t = useTranslations("host");
  const router = useRouter();
  const addLocation = useHostStore((s) => s.addLocation);

  function handleSubmit(values: LocationFormValues) {
    addLocation({
      id: `loc-${Date.now()}`,
      title: values.title,
      description: values.description,
      type: values.type,
      address: { ...values.address, country: values.address.country ?? "IL" },
      mediaGallery: [],
      hostId: "user-host-1",
      categoryIds: values.categoryIds,
      pricing: values.pricing,
      rules: values.rules,
      amenities: values.amenities,
      status: values.status ?? "draft",
      createdAt: new Date().toISOString(),
    });
    router.push("/host/locations");
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
