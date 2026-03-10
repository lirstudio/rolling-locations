"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, MoreHorizontal, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useHostStore } from "@/stores/host-store";
import { useStoreHydrated } from "@/hooks/use-store-hydrated";
import type { LocationStatus } from "@/types";

function isSupabaseStorageUrl(url: string): boolean {
  return url.includes("supabase.co") && url.includes("/storage/");
}

const HOST_ID = "user-host-1";

const statusVariant: Record<LocationStatus, "default" | "secondary" | "outline"> = {
  published: "default",
  draft: "secondary",
  paused: "outline",
};

export default function HostLocationsPage() {
  const t = useTranslations("host");
  const hydrated = useStoreHydrated();
  const syncFromDb = useHostStore((s) => s.syncFromDb);
  const locations = useHostStore((s) => s.locations);
  const hostLocations = React.useMemo(
    () => locations.filter((l) => l.hostId === HOST_ID),
    [locations]
  );
  const setLocationStatus = useHostStore((s) => s.setLocationStatus);
  const deleteLocation = useHostStore((s) => s.deleteLocation);

  // On first mount after hydration: sync from DB (and migrate legacy localStorage data)
  React.useEffect(() => {
    if (hydrated) syncFromDb();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((loc) => {
            const coverUrl =
              loc.mediaGallery.find((m) => m.isFeatured)?.url ??
              loc.mediaGallery[0]?.url;

            return (
              <Link
                key={loc.id}
                href={`/host/locations/${loc.id}/view`}
                className="group relative block aspect-[3/4] overflow-hidden rounded-xl"
              >
                {coverUrl ? (
                  <Image
                    src={coverUrl}
                    alt={loc.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    unoptimized={isSupabaseStorageUrl(coverUrl)}
                  />
                ) : (
                  <div className="size-full bg-muted" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                <Badge
                  variant={statusVariant[loc.status]}
                  className="absolute top-3 start-3"
                >
                  {t(`locations.${loc.status}` as "locations.draft")}
                </Badge>

                {/* Dropdown – stop propagation so the Link doesn't navigate */}
                <div
                  className="absolute top-3 end-3"
                  onClick={(e) => e.preventDefault()}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="size-8 rounded-full bg-white/80 backdrop-blur-sm text-foreground hover:bg-white"
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
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
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-4">
                  <div className="rounded-xl bg-white/20 backdrop-blur-md border border-white/30 p-3.5 shadow-lg">
                    <div className="flex items-end justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-white truncate leading-snug">
                          {loc.title}
                        </h3>
                        <p className="flex items-center gap-1 text-[12px] text-white/80 mt-0.5">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {loc.address.city}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-white">
                        ₪{loc.pricing.dailyRate}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
