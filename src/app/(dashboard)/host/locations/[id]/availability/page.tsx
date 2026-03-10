"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { CalendarDays, Plus, Trash2, AlertTriangle } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useHostStore } from "@/stores/host-store";

function formatDateRange(start: string, end: string) {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("he-IL", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  return `${fmt(start)} – ${fmt(end)}`;
}

function generateCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];

  const startPad = firstDay.getDay();
  for (let i = startPad - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i));
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  const remaining = 7 - (days.length % 7);
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      days.push(new Date(year, month + 1, i));
    }
  }
  return days;
}

const DAY_NAMES_HE = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];
const MONTH_NAMES_HE = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

export default function AvailabilityPage() {
  const t = useTranslations("host");
  const params = useParams<{ id: string }>();
  const locationId = params?.id ?? "";
  const locations = useHostStore((s) => s.locations);
  const availabilityBlocks = useHostStore((s) => s.availabilityBlocks);
  const location = React.useMemo(
    () => locations.find((l) => l.id === locationId),
    [locations, locationId]
  );
  const blocks = React.useMemo(
    () => availabilityBlocks.filter((b) => b.locationId === locationId),
    [availabilityBlocks, locationId]
  );
  const addBlock = useHostStore((s) => s.addBlock);
  const removeBlock = useHostStore((s) => s.removeBlock);
  const bookingRequests = useHostStore((s) => s.bookingRequests);

  const [currentMonth, setCurrentMonth] = React.useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const [newStart, setNewStart] = React.useState("");
  const [newEnd, setNewEnd] = React.useState("");
  const [newNote, setNewNote] = React.useState("");

  if (!location) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Location not found</p>
      </div>
    );
  }

  const days = generateCalendarDays(currentMonth.year, currentMonth.month);

  const approvedBookings = bookingRequests.filter(
    (r) => r.locationId === params.id && r.status === "approved"
  );

  function isBlocked(date: Date) {
    return blocks.some((b) => {
      const s = new Date(b.start);
      const e = new Date(b.end);
      return date >= s && date <= e && b.isBlocked;
    });
  }

  function hasBooking(date: Date) {
    return approvedBookings.some((r) => {
      const s = new Date(r.start);
      const e = new Date(r.end);
      return date >= new Date(s.toDateString()) && date <= new Date(e.toDateString());
    });
  }

  function handleAddBlock() {
    if (!newStart || !newEnd) return;
    addBlock({
      id: `avail-${Date.now()}`,
      locationId: params.id,
      start: new Date(newStart).toISOString(),
      end: new Date(newEnd).toISOString(),
      isBlocked: true,
      note: newNote || undefined,
      source: "manual",
    });
    setNewStart("");
    setNewEnd("");
    setNewNote("");
  }

  function prevMonth() {
    setCurrentMonth((prev) => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { ...prev, month: prev.month - 1 };
    });
  }

  function nextMonth() {
    setCurrentMonth((prev) => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { ...prev, month: prev.month + 1 };
    });
  }

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("availability.title")}
          </h1>
          <p className="text-sm text-muted-foreground">{location.title}</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="me-2 size-4" />
              {t("availability.addBlock")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("availability.blockDates")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{t("availability.startDate")}</Label>
                <Input
                  type="date"
                  value={newStart}
                  onChange={(e) => setNewStart(e.target.value)}
                />
              </div>
              <div>
                <Label>{t("availability.endDate")}</Label>
                <Input
                  type="date"
                  value={newEnd}
                  onChange={(e) => setNewEnd(e.target.value)}
                />
              </div>
              <div>
                <Label>{t("availability.note")}</Label>
                <Input
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button onClick={handleAddBlock}>
                  {t("availability.addBlock")}
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {MONTH_NAMES_HE[currentMonth.month]} {currentMonth.year}
            </CardTitle>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                ←
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                →
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-px">
              {DAY_NAMES_HE.map((d) => (
                <div
                  key={d}
                  className="py-2 text-center text-xs font-medium text-muted-foreground"
                >
                  {d}
                </div>
              ))}
              {days.map((day, idx) => {
                const isCurrentMonth =
                  day.getMonth() === currentMonth.month;
                const blocked = isBlocked(day);
                const booked = hasBooking(day);
                const today = new Date();
                const isToday =
                  day.toDateString() === today.toDateString();

                return (
                  <div
                    key={idx}
                    className={`relative flex min-h-[48px] items-center justify-center rounded-md border text-sm transition-colors ${
                      !isCurrentMonth
                        ? "text-muted-foreground/40"
                        : blocked
                          ? "bg-destructive/10 text-destructive"
                          : booked
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted"
                    } ${isToday ? "ring-2 ring-primary" : ""}`}
                  >
                    {day.getDate()}
                    {blocked && (
                      <span className="absolute bottom-0.5 start-1/2 -translate-x-1/2 text-[8px]">
                        ●
                      </span>
                    )}
                    {booked && !blocked && (
                      <span className="absolute bottom-0.5 start-1/2 -translate-x-1/2 text-[8px] text-primary">
                        ■
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="inline-block size-3 rounded bg-destructive/10" />{" "}
                {t("availability.blocked")}
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block size-3 rounded bg-primary/10" />{" "}
                {t("requests.approved")}
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block size-3 rounded border" />{" "}
                {t("availability.available")}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("availability.blockedDates")}</CardTitle>
            <CardDescription>
              {blocks.length === 0
                ? t("availability.noBlocks")
                : `${blocks.length} ${t("availability.blocked")}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {blocks.map((block) => {
                const hasConflict = approvedBookings.some((r) => {
                  const bStart = new Date(block.start);
                  const bEnd = new Date(block.end);
                  const rStart = new Date(r.start);
                  const rEnd = new Date(r.end);
                  return rStart <= bEnd && rEnd >= bStart;
                });

                return (
                  <div
                    key={block.id}
                    className="flex items-start justify-between rounded-lg border p-3"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium">
                        {formatDateRange(block.start, block.end)}
                      </span>
                      {block.note && (
                        <span className="text-xs text-muted-foreground">
                          {block.note}
                        </span>
                      )}
                      {hasConflict && (
                        <span className="flex items-center gap-1 text-xs text-destructive">
                          <AlertTriangle className="size-3" />
                          {t("availability.conflictWarning")}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive"
                      onClick={() => removeBlock(block.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
