"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  MapPin,
  Inbox,
  CheckCircle,
  DollarSign,
  Loader2,
  CalendarDays,
  User,
  Plus,
  ArrowLeft,
} from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/auth-store";
import { useHostLocations } from "@/hooks/use-host-locations";
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

const statusVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  requested: "default",
  approved: "secondary",
  rejected: "destructive",
  cancelled: "outline",
};

const kpiConfig = [
  {
    key: "pendingRequests" as const,
    icon: Inbox,
    colorBg: "bg-orange-50",
    colorIcon: "text-orange-500",
  },
  {
    key: "activeListings" as const,
    icon: MapPin,
    colorBg: "bg-blue-50",
    colorIcon: "text-blue-500",
  },
  {
    key: "approvedThisMonth" as const,
    icon: CheckCircle,
    colorBg: "bg-green-50",
    colorIcon: "text-green-500",
  },
  {
    key: "totalRevenue" as const,
    icon: DollarSign,
    colorBg: "bg-primary/10",
    colorIcon: "text-primary",
  },
];

export default function HostOverviewPage() {
  const t = useTranslations("host");
  const user = useAuthStore((s) => s.user);
  const { locations, isLoading: locationsLoading } = useHostLocations(user?.id);
  const { requests, loading: requestsLoading } = useHostBookingRequests();

  const loading = locationsLoading || requestsLoading;

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

  const kpiValues: Record<string, string | number> = {
    pendingRequests,
    activeListings,
    approvedThisMonth,
    totalRevenue: formatCurrency(totalRevenue),
  };

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "U";

  const firstName = user?.name?.split(" ")[0] ?? "";
  const showEmptyLocationsBanner =
    !loading && !!user?.id && locations.length === 0;

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      {/* Greeting header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 rounded-xl border border-border">
            <AvatarImage src={user?.avatarUrl ?? undefined} />
            <AvatarFallback className="rounded-xl text-base font-semibold bg-muted">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t("overview.greeting")}, {firstName} 👋
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("overview.subtitle")}
            </p>
          </div>
        </div>
        <Button asChild className="hidden sm:flex cursor-pointer">
          <Link href="/host/locations/new">
            <Plus className="me-2 h-4 w-4" />
            {t("overview.addLocation")}
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiConfig.map(({ key, icon: Icon, colorBg, colorIcon }) => (
          <Card key={key} className="card-hover rounded-2xl border-border/60 shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription className="text-sm font-medium">
                {t(`overview.${key}`)}
              </CardDescription>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${colorBg}`}
              >
                <Icon className={`size-4.5 ${colorIcon}`} />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              ) : (
                <div className="text-2xl font-bold">{kpiValues[key]}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {showEmptyLocationsBanner && (
        <Card className="rounded-2xl border-dashed border-2 bg-muted/30">
          <CardContent className="flex items-center justify-between gap-4 py-5 px-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {t("overview.emptyStateTitle")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("overview.emptyStateDesc")}
                </p>
              </div>
            </div>
            <Button asChild size="sm" className="shrink-0 cursor-pointer">
              <Link href="/host/locations/new">
                <Plus className="me-2 h-4 w-4" />
                {t("overview.emptyStateCta")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-2xl border-border/60 shadow-card lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              {t("overview.recentRequests")}
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/host/requests">
                {t("overview.viewAll")}
                <ArrowLeft className="ms-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : recentRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                <Inbox className="size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  {t("overview.noRequests")}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentRequests.map((req) => (
                  <Link
                    key={req.id}
                    href={`/host/requests/${req.id}`}
                    className="flex items-center justify-between rounded-xl border border-border/60 p-3.5 transition-all hover:bg-muted/50 hover:shadow-sm"
                  >
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="text-sm font-medium truncate">
                        {req.location_title}
                      </span>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="size-3" />
                          {req.creator_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarDays className="size-3" />
                          {formatDate(req.start_date)} —{" "}
                          {formatDate(req.end_date)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ms-3">
                      <span className="text-sm font-semibold text-primary">
                        ₪{req.total.toLocaleString("he-IL")}
                      </span>
                      <Badge
                        variant={statusVariant[req.status] ?? "outline"}
                      >
                        {t(
                          `requests.${req.status}` as "requests.requested"
                        )}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60 shadow-card">
          <CardHeader>
            <CardTitle className="text-base">
              {t("overview.quickActions")}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            <Button
              asChild
              variant="outline"
              className="w-full justify-start rounded-xl cursor-pointer"
            >
              <Link href="/host/locations/new">
                <Plus className="me-2 h-4 w-4 text-primary" />
                {t("overview.addLocation")}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start rounded-xl cursor-pointer"
            >
              <Link href="/host/availability">
                <CalendarDays className="me-2 h-4 w-4 text-blue-500" />
                {t("overview.manageAvailability")}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start rounded-xl cursor-pointer"
            >
              <Link href="/host/requests">
                <Inbox className="me-2 h-4 w-4 text-orange-500" />
                {t("overview.viewRequests")}
                {pendingRequests > 0 && (
                  <Badge className="ms-auto" variant="default">
                    {pendingRequests}
                  </Badge>
                )}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
