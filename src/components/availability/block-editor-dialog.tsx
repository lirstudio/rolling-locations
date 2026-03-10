"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AvailabilityBlock } from "@/types";
import { addAvailabilityBlock } from "@/app/actions/availability";

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? "00" : "30";
  return `${String(h).padStart(2, "0")}:${m}`;
});

interface BlockEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locationId: string;
  selectedDate?: Date;
  existingBlocks: AvailabilityBlock[];
  onBlockAdded: () => void;
}

export function BlockEditorDialog({
  open,
  onOpenChange,
  locationId,
  selectedDate,
  existingBlocks,
  onBlockAdded,
}: BlockEditorDialogProps) {
  const t = useTranslations("host.availability");
  const [isFullDay, setIsFullDay] = React.useState(true);
  const [startTime, setStartTime] = React.useState("09:00");
  const [endTime, setEndTime] = React.useState("20:00");
  const [note, setNote] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setIsFullDay(true);
      setStartTime("09:00");
      setEndTime("20:00");
      setNote("");
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDate) return;

    setIsSaving(true);
    const dateStr = format(selectedDate, "yyyy-MM-dd");

    const start = isFullDay
      ? `${dateStr}T00:00:00Z`
      : `${dateStr}T${startTime}:00Z`;
    const end = isFullDay
      ? `${dateStr}T23:59:59Z`
      : `${dateStr}T${endTime}:00Z`;

    const { error } = await addAvailabilityBlock({
      locationId,
      start,
      end,
      isBlocked: true,
      note: note || undefined,
      source: "manual",
    });

    setIsSaving(false);

    if (error) {
      toast.error(error);
    } else {
      toast.success(t("blockSuccess"));
      onBlockAdded();
    }
  }

  const formattedDate = selectedDate
    ? format(selectedDate, "EEEE, d MMMM yyyy", { locale: he })
    : "";

  const hasExistingManualBlock = existingBlocks.some(
    (b) => b.source === "manual"
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("blockDialogTitle")}</DialogTitle>
          <DialogDescription>
            {formattedDate}
          </DialogDescription>
        </DialogHeader>

        {hasExistingManualBlock ? (
          <div className="py-4 text-sm text-muted-foreground">
            {t("conflictWarning")}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch
              id="full-day"
              checked={isFullDay}
              onCheckedChange={setIsFullDay}
            />
            <Label htmlFor="full-day">{t("fullDay")}</Label>
          </div>

          {!isFullDay && (
            <div className="flex items-center gap-3">
              <div className="flex-1 space-y-1">
                <Label>{t("startDate")}</Label>
                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-1">
                <Label>{t("endDate")}</Label>
                <Select value={endTime} onValueChange={setEndTime}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <Label>{t("note")}</Label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("note")}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="me-2 size-4 animate-spin" />}
              {t("addBlock")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
