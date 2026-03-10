"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
import { Label } from "@/components/ui/label";
import type { OperatingHoursEntry } from "@/types";
import {
  fetchOperatingHours,
  saveOperatingHours,
} from "@/app/actions/availability";

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? "00" : "30";
  return `${String(h).padStart(2, "0")}:${m}`;
});

const DEFAULT_HOURS: OperatingHoursEntry[] = Array.from(
  { length: 7 },
  (_, i) => ({
    locationId: "",
    dayOfWeek: i,
    isOpen: i >= 0 && i <= 4, // Sun-Thu open by default
    openTime: "09:00",
    closeTime: "20:00",
  })
);

interface OperatingHoursEditorProps {
  locationId: string;
}

export function OperatingHoursEditor({
  locationId,
}: OperatingHoursEditorProps) {
  const t = useTranslations("host.availability");
  const [hours, setHours] = React.useState<OperatingHoursEntry[]>(
    DEFAULT_HOURS.map((h) => ({ ...h, locationId }))
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      const data = await fetchOperatingHours(locationId);
      if (cancelled) return;

      if (data.length > 0) {
        const merged = DEFAULT_HOURS.map((def) => {
          const found = data.find((d) => d.dayOfWeek === def.dayOfWeek);
          return found ?? { ...def, locationId };
        });
        setHours(merged);
      } else {
        setHours(DEFAULT_HOURS.map((h) => ({ ...h, locationId })));
      }
      setIsLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [locationId]);

  function updateDay(dayOfWeek: number, updates: Partial<OperatingHoursEntry>) {
    setHours((prev) =>
      prev.map((h) =>
        h.dayOfWeek === dayOfWeek ? { ...h, ...updates } : h
      )
    );
  }

  async function handleSave() {
    setIsSaving(true);
    const { error } = await saveOperatingHours(locationId, hours);
    setIsSaving(false);
    if (error) {
      toast.error(t("hoursSaveError"));
    } else {
      toast.success(t("hoursSaved"));
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock className="size-5 text-muted-foreground" />
          <CardTitle className="text-lg">{t("operatingHours")}</CardTitle>
        </div>
        <CardDescription>{t("operatingHoursDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hours.map((entry) => {
          const dayKey = DAY_KEYS[entry.dayOfWeek];
          return (
            <div
              key={entry.dayOfWeek}
              className="flex items-center gap-4 rounded-lg border p-3"
            >
              <div className="w-28 shrink-0">
                <Label className="text-sm font-medium">
                  {t(`days.${dayKey}`)}
                </Label>
              </div>
              <Switch
                checked={entry.isOpen}
                onCheckedChange={(checked) =>
                  updateDay(entry.dayOfWeek, { isOpen: checked })
                }
              />
              <span className="w-12 text-sm text-muted-foreground">
                {entry.isOpen ? t("open") : t("closed")}
              </span>
              {entry.isOpen && (
                <div className="flex items-center gap-2">
                  <Select
                    value={entry.openTime ?? "09:00"}
                    onValueChange={(v) =>
                      updateDay(entry.dayOfWeek, { openTime: v })
                    }
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-muted-foreground">–</span>
                  <Select
                    value={entry.closeTime ?? "20:00"}
                    onValueChange={(v) =>
                      updateDay(entry.dayOfWeek, { closeTime: v })
                    }
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          );
        })}
        <Button onClick={handleSave} disabled={isSaving} className="mt-2">
          {isSaving && <Loader2 className="me-2 size-4 animate-spin" />}
          {t("saveHours")}
        </Button>
      </CardContent>
    </Card>
  );
}
