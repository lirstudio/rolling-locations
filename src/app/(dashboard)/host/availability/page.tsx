"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { CalendarDays } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useHostStore } from "@/stores/host-store";

const HOST_ID = "user-host-1";

export default function HostAvailabilityPage() {
  const t = useTranslations("host");
  const router = useRouter();
  const locations = useHostStore((s) => s.locations);
  const hostLocations = React.useMemo(
    () => locations.filter((l) => l.hostId === HOST_ID),
    [locations]
  );

  function handleSelect(locationId: string) {
    router.push(`/host/locations/${locationId}/availability`);
  }

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <h1 className="text-2xl font-bold tracking-tight">
        {t("availability.title")}
      </h1>

      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="text-center">
          <CalendarDays className="mx-auto mb-2 size-10 text-muted-foreground" />
          <CardTitle>{t("availability.selectLocation")}</CardTitle>
          <CardDescription>
            {t("availability.title")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select onValueChange={handleSelect}>
            <SelectTrigger>
              <SelectValue placeholder={t("availability.selectLocation")} />
            </SelectTrigger>
            <SelectContent>
              {hostLocations.map((loc) => (
                <SelectItem key={loc.id} value={loc.id}>
                  {loc.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  );
}
