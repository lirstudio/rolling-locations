"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { DayPicker } from "react-day-picker";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AvailabilityBlock } from "@/types";
import { fetchAvailabilityBlocks } from "@/app/actions/availability";
import { format } from "date-fns";
import { he } from "date-fns/locale";

interface AvailabilityCalendarProps {
  locationId: string;
}

export function AvailabilityCalendar({
  locationId,
}: AvailabilityCalendarProps) {
  const t = useTranslations("host.availability");
  const [blocks, setBlocks] = React.useState<AvailabilityBlock[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [month, setMonth] = React.useState(new Date());

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    const blocksData = await fetchAvailabilityBlocks(locationId);
    setBlocks(blocksData);
    setIsLoading(false);
  }, [locationId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const googleDates = React.useMemo(
    () =>
      blocks
        .filter((b) => b.isBlocked && b.source === "google_calendar")
        .flatMap((b) => {
          const dates: Date[] = [];
          const start = new Date(b.start);
          const end = new Date(b.end);
          for (
            let d = new Date(start);
            d <= end;
            d.setDate(d.getDate() + 1)
          ) {
            dates.push(new Date(d));
          }
          return dates;
        }),
    [blocks]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardContent className="p-4">
          <DayPicker
            mode="single"
            month={month}
            onMonthChange={setMonth}
            locale={he}
            dir="rtl"
            showOutsideDays={false}
            modifiers={{
              google: googleDates,
            }}
            modifiersClassNames={{
              google: "!bg-blue-100 !text-blue-700 dark:!bg-blue-900/30",
            }}
            classNames={{
              months: "flex flex-col",
              month: "flex flex-col gap-4",
              month_caption:
                "flex items-center justify-center h-10 relative",
              caption_label: "text-base font-semibold",
              nav: "flex items-center gap-1 absolute inset-x-0 top-0 justify-between",
              button_previous: cn(
                buttonVariants({ variant: "ghost" }),
                "size-8 p-0"
              ),
              button_next: cn(
                buttonVariants({ variant: "ghost" }),
                "size-8 p-0"
              ),
              weekdays: "flex",
              weekday:
                "text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] text-center py-2",
              week: "flex w-full mt-1",
              day: "relative flex-1 text-center p-0 aspect-square",
              day_button:
                "w-full h-full inline-flex items-center justify-center rounded-md text-sm font-normal transition-colors",
              today:
                "bg-accent text-accent-foreground rounded-md font-semibold",
              outside: "text-muted-foreground opacity-50",
              disabled: "text-muted-foreground opacity-50",
            }}
            components={{
              Chevron: ({ orientation }) =>
                orientation === "left" ? (
                  <ChevronLeftIcon className="size-4" />
                ) : (
                  <ChevronRightIcon className="size-4" />
                ),
            }}
          />
          <div className="mt-4 flex flex-wrap gap-3 border-t pt-4">
            <LegendDot color="bg-green-500" label={t("legendAvailable")} />
            <LegendDot color="bg-blue-500" label={t("legendGoogle")} />
            <LegendDot color="bg-orange-500" label={t("legendBooked")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("blockedDates")}</CardTitle>
          <CardDescription>{t("googleCalendarSource")}</CardDescription>
        </CardHeader>
        <CardContent>
          {blocks.filter((b) => b.isBlocked).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("noBlocks")}
            </p>
          ) : (
            <div className="space-y-2">
              {blocks
                .filter((b) => b.isBlocked)
                .map((block) => (
                  <div
                    key={block.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-blue-500" />
                        <span className="text-sm font-medium">
                          {format(new Date(block.start), "dd/MM/yyyy", {
                            locale: he,
                          })}
                          {block.start.slice(0, 10) !==
                            block.end.slice(0, 10) && (
                            <>
                              {" – "}
                              {format(new Date(block.end), "dd/MM/yyyy", {
                                locale: he,
                              })}
                            </>
                          )}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {t("sourceGoogle")}
                        </Badge>
                      </div>
                      {block.note && (
                        <p className="text-xs text-muted-foreground">
                          {block.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn("size-3 rounded-full", color)} />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
