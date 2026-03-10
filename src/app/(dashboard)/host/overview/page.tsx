"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { MapPin, Inbox, CheckCircle, DollarSign, Loader2, CalendarDays, User } from "lucide-react";
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
import { useHostBookingRequests } from "@/hooks/use-host-booking-requests";

function formatCurrency(amount: number) {
  return `₪${amount.toLocaleString("he-IL")}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("he-IL", {
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
  const { requests, loading } = useHostBookingRequests();

  const activeListings = useMemo(
    () => locations.filter((l) => l.status === "published").length,
    [locations]
  );

  const pendingRequests = useMemo(
    () => requests.filter((r) => r.status === "requested").length,
    [requests]
  );

  const approvedThisMonth = useMemo(() => {
    const now = new Date();
    return requests.filter(
      (r) =>
        r.status === "approved" &&
        new Date(r.updated_at).getMonth() === now.getMonth() &&
        new Date(r.updated_at).getFullYear() === now.getFullYear()
    ).length;
  }, [requests]);

  const totalRevenue = useMemo(
    () =>
      requests
        .filter((r) => r.status === "approved")
        .reduce((sum, r) => sum + r.total, 0),
    [requests]
  );

  const recentRequests = useMemo(
    () =>
      requests
        .filter((r) => r.status === "requested" || r.status === "approved")
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 5),
    [requests]
  );

  const kpis = [
    { label: t("overview.activeListings"), value: activeListings, icon: MapPin },
    { label: t("overview.pendingRequests"), value: pendingRequests, icon: Inbox },
    { label: t("overview.approvedThisMonth"), value: approvedThisMonth, icon: CheckCircle },
    { label: t("overview.totalRevenue"), value: formatCurrency(totalRevenue), icon: DollarSign },
  ];

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("overview.title")}</h1>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription className="text-sm font-medium">{kpi.label}</CardDescription>
              <kpi.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              ) : (
                <div className="text-2xl font-bold">{kpi.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("overview.recentRequests")}</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/host/requests">{t("overview.viewAll")}</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : recentRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("overview.noRequests")}</p>
          ) : (
            <div className="space-y-2">
              {recentRequests.map((req) => (
                <Link
                  key={req.id}
                  href={`/host/requests/${req.id}`}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted"
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-sm font-medium truncate">{req.location_title}</span>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="size-3" />
                        {req.creator_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarDays className="size-3" />
                        {formatDate(req.start_date)} — {formatDate(req.end_date)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ms-3">
                    <span className="text-sm font-semibold text-primary">
                      ₪{req.total.toLocaleString("he-IL")}
                    </span>
                    <Badge variant={statusVariant[req.status] ?? "outline"}>
                      {t(`requests.${req.status}` as "requests.requested")}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
