"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { MapPin, Inbox, CheckCircle, DollarSign } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useHostStore } from "@/stores/host-store";
import { mockUsers } from "@/mocks/users";

const HOST_ID = "user-host-1";

function formatCurrency(amount: number) {
  return `₪${amount.toLocaleString("he-IL")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("he-IL", {
    day: "numeric",
    month: "short",
  });
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  requested: "default",
  approved: "secondary",
  rejected: "destructive",
  cancelled: "outline",
};

export default function HostOverviewPage() {
  const t = useTranslations("host");
  const locations = useHostStore((s) => s.locations);
  const bookingRequests = useHostStore((s) => s.bookingRequests);
  const hostLocations = useMemo(
    () => locations.filter((l) => l.hostId === HOST_ID),
    [locations]
  );
  const hostRequests = useMemo(() => {
    const locationIds = hostLocations.map((l) => l.id);
    return bookingRequests.filter((r) => locationIds.includes(r.locationId));
  }, [bookingRequests, hostLocations]);

  const activeListings = hostLocations.filter(
    (l) => l.status === "published"
  ).length;
  const pendingRequests = hostRequests.filter(
    (r) => r.status === "requested"
  ).length;
  const approvedThisMonth = hostRequests.filter(
    (r) =>
      r.status === "approved" &&
      new Date(r.updatedAt).getMonth() === new Date().getMonth()
  ).length;
  const totalRevenue = hostRequests
    .filter((r) => r.status === "approved")
    .reduce((sum, r) => sum + r.priceEstimate, 0);

  const kpis = [
    {
      label: t("overview.activeListings"),
      value: activeListings,
      icon: MapPin,
    },
    {
      label: t("overview.pendingRequests"),
      value: pendingRequests,
      icon: Inbox,
    },
    {
      label: t("overview.approvedThisMonth"),
      value: approvedThisMonth,
      icon: CheckCircle,
    },
    {
      label: t("overview.totalRevenue"),
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
    },
  ];

  const recentRequests = hostRequests
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <h1 className="text-2xl font-bold tracking-tight">
        {t("overview.title")}
      </h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription className="text-sm font-medium">
                {kpi.label}
              </CardDescription>
              <kpi.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t("overview.recentRequests")}</CardTitle>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/host/requests">{t("overview.viewAll")}</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("overview.noRequests")}
            </p>
          ) : (
            <div className="space-y-3">
              {recentRequests.map((req) => {
                const location = locations.find(
                  (l) => l.id === req.locationId
                );
                const creator = mockUsers.find(
                  (u) => u.id === req.creatorId
                );
                return (
                  <Link
                    key={req.id}
                    href={`/host/requests/${req.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium">
                        {location?.title ?? "—"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {creator?.name} · {formatDate(req.start)}
                      </span>
                    </div>
                    <Badge variant={statusVariant[req.status] ?? "outline"}>
                      {t(`requests.${req.status}` as "requests.pending")}
                    </Badge>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
