"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Inbox } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
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
import { mockUsers } from "@/mocks/users";
import type { BookingStatus } from "@/types";

const statusVariant: Record<BookingStatus, "default" | "secondary" | "destructive" | "outline"> = {
  requested: "default",
  approved: "secondary",
  rejected: "destructive",
  cancelled: "outline",
};

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("he-IL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HostRequestsPage() {
  const t = useTranslations("host");
  const hostRequests = useHostStore((s) => s.getRequestsForHost());
  const locations = useHostStore((s) => s.locations);

  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  const filtered = hostRequests.filter(
    (r) => statusFilter === "all" || r.status === statusFilter
  );

  const sorted = [...filtered].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          {t("requests.title")}
        </h1>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("requests.allStatuses")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("requests.allStatuses")}</SelectItem>
            <SelectItem value="requested">{t("requests.requested")}</SelectItem>
            <SelectItem value="approved">{t("requests.approved")}</SelectItem>
            <SelectItem value="rejected">{t("requests.rejected")}</SelectItem>
            <SelectItem value="cancelled">{t("requests.cancelled")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {sorted.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Inbox className="mb-4 size-12 text-muted-foreground" />
            <CardTitle className="mb-2">{t("requests.noRequests")}</CardTitle>
            <CardDescription>{t("requests.noRequestsDesc")}</CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sorted.map((req) => {
            const location = locations.find((l) => l.id === req.locationId);
            const creator = mockUsers.find((u) => u.id === req.creatorId);

            return (
              <Link key={req.id} href={`/host/requests/${req.id}`}>
                <Card className="transition-colors hover:bg-muted/50">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="size-12 overflow-hidden rounded-lg bg-muted">
                        {location?.mediaGallery[0] && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={location.mediaGallery[0].url}
                            alt={location.title}
                            className="size-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">
                          {location?.title ?? "—"}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {creator?.name} · {formatDateTime(req.start)} ·{" "}
                          {formatTime(req.start)}–{formatTime(req.end)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">
                        ₪{req.priceEstimate.toLocaleString("he-IL")}
                      </span>
                      <Badge variant={statusVariant[req.status]}>
                        {t(`requests.${req.status}` as "requests.pending")}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
