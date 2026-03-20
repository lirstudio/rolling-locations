"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Heart, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LocationCard } from "@/components/locations/location-card";
import { useFavorites } from "@/hooks/use-favorites";

export default function CreatorFavoritesPage() {
  const t = useTranslations("creator.favorites");
  const { locations, isLoading } = useFavorites();

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <Button variant="outline" asChild>
          <Link href="/locations">
            <MapPin className="me-2 h-4 w-4" />
            {t("browseLocations")}
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="rounded-2xl border-border/60 shadow-card">
              <CardContent className="p-0">
                <div className="aspect-[16/10] bg-muted animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                  <div className="h-5 bg-muted rounded w-1/2 animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : locations.length === 0 ? (
        <Card className="rounded-2xl border-border/60 shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Heart className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="mb-2">{t("emptyTitle")}</CardTitle>
            <CardDescription className="text-center max-w-md mb-6">
              {t("emptyDesc")}
            </CardDescription>
            <Button asChild>
              <Link href="/locations">{t("browseLocations")}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((location) => (
            <LocationCard
              key={location.id}
              location={location}
              showFavoriteButton={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
