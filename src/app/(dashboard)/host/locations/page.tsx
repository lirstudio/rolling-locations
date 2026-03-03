"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Plus, Search, MoreHorizontal, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
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
import type { LocationStatus } from "@/types";

const statusVariant: Record<LocationStatus, "default" | "secondary" | "outline"> = {
  published: "default",
  draft: "secondary",
  paused: "outline",
};

export default function HostLocationsPage() {
  const t = useTranslations("host");
  const hostLocations = useHostStore((s) => s.getHostLocations());
  const setLocationStatus = useHostStore((s) => s.setLocationStatus);
  const deleteLocation = useHostStore((s) => s.deleteLocation);

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
          {filtered.map((loc) => (
            <Card key={loc.id} className="overflow-hidden">
              <div className="relative aspect-video bg-muted">
                {loc.mediaGallery[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={loc.mediaGallery[0].url}
                    alt={loc.title}
                    className="size-full object-cover"
                  />
                )}
                <Badge
                  variant={statusVariant[loc.status]}
                  className="absolute end-2 top-2"
                >
                  {t(`locations.${loc.status}` as "locations.draft")}
                </Badge>
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="line-clamp-1 text-base">
                      {loc.title}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {loc.address.city} · {t(`locations.types.${loc.type}` as "locations.types.studio")}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
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
                          onClick={() =>
                            setLocationStatus(loc.id, "published")
                          }
                        >
                          {t("locations.publish")}
                        </DropdownMenuItem>
                      )}
                      {loc.status === "published" && (
                        <DropdownMenuItem
                          onClick={() =>
                            setLocationStatus(loc.id, "paused")
                          }
                        >
                          {t("locations.pause")}
                        </DropdownMenuItem>
                      )}
                      {loc.status === "paused" && (
                        <DropdownMenuItem
                          onClick={() =>
                            setLocationStatus(loc.id, "draft")
                          }
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
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    ₪{loc.pricing.hourlyRate}
                  </span>
                  {t("locations.hourly")}
                  {loc.pricing.dailyRate && (
                    <>
                      <span className="mx-1">·</span>
                      <span className="font-semibold text-foreground">
                        ₪{loc.pricing.dailyRate}
                      </span>
                      {t("locations.daily")}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
