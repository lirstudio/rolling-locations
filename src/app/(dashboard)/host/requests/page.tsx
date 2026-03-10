"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Inbox, Loader2, CalendarDays, User, MapPin, Archive } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHostBookingRequests } from "@/hooks/use-host-booking-requests";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  requested: "default",
  approved: "secondary",
  rejected: "destructive",
  cancelled: "outline",
};

const ACTIVE_STATUSES = ["requested", "approved"];
const ARCHIVED_STATUSES = ["rejected", "cancelled"];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("he-IL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function RequestCard({
  req,
  t,
}: {
  req: { id: string; location_title: string; creator_name: string; creator_email: string | null; start_date: string; end_date: string; duration_days: number; daily_rate: number; total: number; status: string; notes: string | null };
  t: (key: string) => string;
}) {
  return (
    <Link href={`/host/requests/${req.id}`}>
      <Card className="transition-colors hover:bg-muted/50 hover:shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="font-semibold text-foreground text-sm sm:text-base truncate">
                  {req.location_title}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {req.creator_name}
                  {req.creator_email && (
                    <span className="text-xs opacity-70"> · {req.creator_email}</span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {formatDate(req.start_date)} — {formatDate(req.end_date)}
                  <span className="opacity-70"> · {req.duration_days} ימים</span>
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
              <div className="text-end">
                <p className="text-base font-bold text-primary">
                  ₪{req.total.toLocaleString("he-IL")}
                </p>
                <p className="text-xs text-muted-foreground">
                  ₪{req.daily_rate} × {req.duration_days} ימים
                </p>
              </div>
              <Badge variant={statusVariant[req.status] ?? "outline"}>
                {t(`requests.${req.status}` as "requests.requested")}
              </Badge>
            </div>
          </div>
          {req.notes && (
            <p className="mt-2 text-xs text-muted-foreground line-clamp-1 border-t border-border pt-2">
              💬 {req.notes}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export default function HostRequestsPage() {
  const t = useTranslations("host");
  const { requests, loading } = useHostBookingRequests();

  const activeRequests = requests.filter((r) => ACTIVE_STATUSES.includes(r.status));
  const archivedRequests = requests.filter((r) => ARCHIVED_STATUSES.includes(r.status));

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("requests.title")}</h1>
        {!loading && requests.length > 0 && (
          <p className="mt-1 text-sm text-muted-foreground">
            {activeRequests.length} פעיל · {archivedRequests.length} בארכיון
          </p>
        )}
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full max-w-[280px] grid-cols-2">
          <TabsTrigger value="active">{t("requests.tabActive")}</TabsTrigger>
          <TabsTrigger value="archive" className="gap-1.5">
            <Archive className="size-3.5" />
            {t("requests.tabArchive")}
            {archivedRequests.length > 0 && (
              <span className="ms-1 rounded-full bg-muted-foreground/20 px-1.5 text-[10px] font-medium">
                {archivedRequests.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : activeRequests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Inbox className="mb-4 size-12 text-muted-foreground" />
                <CardTitle className="mb-2">{t("requests.noRequests")}</CardTitle>
                <CardDescription>{t("requests.noRequestsDesc")}</CardDescription>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {activeRequests.map((req) => (
                <RequestCard key={req.id} req={req} t={t} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="archive" className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : archivedRequests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Archive className="mb-4 size-12 text-muted-foreground" />
                <CardTitle className="mb-2">{t("requests.noArchived")}</CardTitle>
                <CardDescription>{t("requests.noArchivedDesc")}</CardDescription>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {archivedRequests.map((req) => (
                <RequestCard key={req.id} req={req} t={t} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
