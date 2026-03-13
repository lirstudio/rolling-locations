"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useHostStore } from "@/stores/host-store";
import { useStoreHydrated } from "@/hooks/use-store-hydrated";
import { useAuthStore } from "@/stores/auth-store";
import { AvailabilityCalendar } from "@/components/availability/availability-calendar";
import { GoogleCalendarTab } from "@/components/availability/google-calendar-tab";

export default function HostAvailabilityPage() {
  const t = useTranslations("host");
  const searchParams = useSearchParams();
  const hydrated = useStoreHydrated();
  const user = useAuthStore((s) => s.user);
  const locations = useHostStore((s) => s.locations);

  React.useEffect(() => {
    const error = searchParams.get("error");
    const google = searchParams.get("google");
    if (error === "config") {
      toast.error(t("availability.googleErrorConfig"));
    } else if (error === "oauth_failed" || error === "oauth_start_failed" || error === "missing_params") {
      toast.error(t("availability.googleErrorOAuthFailed"));
    } else if (google === "connected") {
      toast.success(t("availability.googleConnectedSuccess"));
    }
    if (error || google) {
      const url = new URL(window.location.href);
      url.searchParams.delete("error");
      url.searchParams.delete("google");
      window.history.replaceState({}, "", url.pathname + url.search || url.pathname);
    }
  }, [searchParams, t]);

  const hostLocations = React.useMemo(
    () =>
      user ? locations.filter((l) => l.hostId === user.id) : locations,
    [locations, user]
  );

  const [selectedLocationId, setSelectedLocationId] = React.useState<
    string | undefined
  >();

  React.useEffect(() => {
    if (hostLocations.length > 0 && !selectedLocationId) {
      setSelectedLocationId(hostLocations[0].id);
    }
  }, [hostLocations, selectedLocationId]);

  if (!hydrated || !user) {
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

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <h1 className="text-2xl font-bold tracking-tight">
        {t("availability.title")}
      </h1>

      {/* Google Calendar connection — always visible */}
      <GoogleCalendarTab hostId={user.id} />

      {/* Per-location calendar view when host has locations */}
      {hostLocations.length > 0 && (
        <>
          <div className="flex items-center justify-end">
            <Select
              value={selectedLocationId}
              onValueChange={setSelectedLocationId}
            >
              <SelectTrigger className="w-full sm:w-72">
                <div className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-muted-foreground" />
                  <SelectValue
                    placeholder={t("availability.selectLocation")}
                  />
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
            <AvailabilityCalendar locationId={selectedLocationId} />
          )}
        </>
      )}
    </div>
  );
}
