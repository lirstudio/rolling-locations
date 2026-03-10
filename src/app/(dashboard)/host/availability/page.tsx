"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { CalendarDays, MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHostStore } from "@/stores/host-store";
import { useStoreHydrated } from "@/hooks/use-store-hydrated";
import { AvailabilityCalendar } from "@/components/availability/availability-calendar";
import { OperatingHoursEditor } from "@/components/availability/operating-hours-editor";
import { GoogleCalendarTab } from "@/components/availability/google-calendar-tab";

const HOST_ID = "user-host-1";

export default function HostAvailabilityPage() {
  const t = useTranslations("host");
  const hydrated = useStoreHydrated();
  const locations = useHostStore((s) => s.locations);
  const hostLocations = React.useMemo(
    () => locations.filter((l) => l.hostId === HOST_ID),
    [locations]
  );

  const [selectedLocationId, setSelectedLocationId] = React.useState<
    string | undefined
  >();

  React.useEffect(() => {
    if (hostLocations.length > 0 && !selectedLocationId) {
      setSelectedLocationId(hostLocations[0].id);
    }
  }, [hostLocations, selectedLocationId]);

  if (!hydrated) {
    return (
      <div className="flex flex-col gap-6 px-4 lg:px-6">
        <h1 className="text-2xl font-bold tracking-tight">
          {t("availability.title")}
        </h1>
        <div className="flex items-center justify-center py-12">
          <div className="size-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        </div>
      </div>
    );
  }

  if (hostLocations.length === 0) {
    return (
      <div className="flex flex-col gap-6 px-4 lg:px-6">
        <h1 className="text-2xl font-bold tracking-tight">
          {t("availability.title")}
        </h1>
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-12 text-center">
          <MapPin className="size-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold">{t("availability.noLocation")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("availability.noLocationDesc")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          {t("availability.title")}
        </h1>

        <Select
          value={selectedLocationId}
          onValueChange={setSelectedLocationId}
        >
          <SelectTrigger className="w-full sm:w-72">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-muted-foreground" />
              <SelectValue placeholder={t("availability.selectLocation")} />
            </div>
          </SelectTrigger>
          <SelectContent>
            {hostLocations.map((loc) => (
              <SelectItem key={loc.id} value={loc.id}>
                {loc.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedLocationId && (
        <Tabs defaultValue="calendar" className="w-full">
          <TabsList>
            <TabsTrigger value="calendar">
              {t("availability.tabCalendar")}
            </TabsTrigger>
            <TabsTrigger value="hours">
              {t("availability.tabHours")}
            </TabsTrigger>
            <TabsTrigger value="google">
              {t("availability.tabGoogle")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="mt-4">
            <AvailabilityCalendar locationId={selectedLocationId} />
          </TabsContent>

          <TabsContent value="hours" className="mt-4">
            <OperatingHoursEditor locationId={selectedLocationId} />
          </TabsContent>

          <TabsContent value="google" className="mt-4">
            <GoogleCalendarTab locationId={selectedLocationId} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
