"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Plus, Search, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LocationCard } from "@/components/locations/location-card";
import { useAuthStore } from "@/stores/auth-store";
import { useHostLocations } from "@/hooks/use-host-locations";

export default function HostLocationsPage() {
  const t = useTranslations("host");
  const user = useAuthStore((s) => s.user);
  const {
    locations: hostLocations,
    isLoading,
    setLocationStatus,
    deleteLocation,
  } = useHostLocations(user?.id);

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  const filtered = hostLocations.filter((loc) => {
    const matchesSearch =
      search === "" ||
      loc.title.toLowerCase().includes(search.toLowerCase()) ||
      loc.address.city.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || loc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 px-4 lg:px-6">
        <h1 className="text-2xl font-bold tracking-tight">{t("locations.title")}</h1>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          {t("locations.title")}
        </h1>
        <Button asChild>
          <Link href="/host/locations/new">
            <Plus className="me-2 size-4" />
            {t("locations.addNew")}
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("locations.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("locations.allStatuses")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("locations.allStatuses")}</SelectItem>
            <SelectItem value="published">{t("locations.published")}</SelectItem>
            <SelectItem value="draft">{t("locations.draft")}</SelectItem>
            <SelectItem value="paused">{t("locations.paused")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="mb-4 size-12 text-muted-foreground" />
            <CardTitle className="mb-2">{t("locations.noLocations")}</CardTitle>
            <CardDescription>{t("locations.noLocationsDesc")}</CardDescription>
            <Button asChild className="mt-4">
              <Link href="/host/locations/new">
                <Plus className="me-2 size-4" />
                {t("locations.addNew")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((loc) => (
            <LocationCard
              key={loc.id}
              location={loc}
              href={`/host/locations/${loc.id}/view`}
              showStatus
              menuContent={
                <>
                  <DropdownMenuItem asChild>
                    <Link href={`/host/locations/${loc.id}/view`}>
                      {t("locations.view")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/host/locations/${loc.id}/edit`}>
                      {t("locations.edit")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/host/locations/${loc.id}/availability`}>
                      {t("locations.manageAvailability")}
                    </Link>
                  </DropdownMenuItem>
                  {loc.status === "draft" && (
                    <DropdownMenuItem
                      onClick={() => setLocationStatus(loc.id, "published")}
                    >
                      {t("locations.publish")}
                    </DropdownMenuItem>
                  )}
                  {loc.status === "published" && (
                    <DropdownMenuItem
                      onClick={() => setLocationStatus(loc.id, "paused")}
                    >
                      {t("locations.pause")}
                    </DropdownMenuItem>
                  )}
                  {loc.status === "paused" && (
                    <DropdownMenuItem
                      onClick={() => setLocationStatus(loc.id, "draft")}
                    >
                      {t("locations.toDraft")}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => deleteLocation(loc.id)}
                  >
                    {t("locations.delete")}
                  </DropdownMenuItem>
                </>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
