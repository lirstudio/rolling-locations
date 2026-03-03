"use client";

import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { LocationForm } from "@/components/locations/location-form";
import { useHostStore } from "@/stores/host-store";
import type { LocationFormValues } from "@/schemas/location";

export default function EditLocationPage() {
  const t = useTranslations("host");
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const location = useHostStore((s) => s.getLocationById(params.id));
  const updateLocation = useHostStore((s) => s.updateLocation);

  if (!location) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Location not found</p>
      </div>
    );
  }

  function handleSubmit(values: LocationFormValues) {
    updateLocation(params.id, {
      title: values.title,
      description: values.description,
      type: values.type,
      address: { ...values.address, country: values.address.country ?? "IL" },
      categoryIds: values.categoryIds,
      pricing: values.pricing,
      rules: values.rules,
      amenities: values.amenities,
      status: values.status ?? "draft",
    });
    router.push("/host/locations");
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
            type: location.type,
            address: location.address,
            categoryIds: location.categoryIds,
            pricing: location.pricing,
            rules: location.rules ?? "",
            amenities: location.amenities ?? [],
            status: location.status,
          }}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
