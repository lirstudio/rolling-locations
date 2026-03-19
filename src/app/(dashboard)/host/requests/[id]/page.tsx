"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  User,
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  StickyNote,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  fetchBookingRequestById,
  updateBookingStatusInDb,
  type DbBookingRequest,
} from "@/app/actions/bookings";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  requested: "default",
  approved: "secondary",
  rejected: "destructive",
  cancelled: "outline",
};

const statusIcon: Record<string, React.ElementType> = {
  requested: Clock,
  approved: CheckCircle,
  rejected: XCircle,
  cancelled: XCircle,
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("he-IL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleDateString("he-IL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function RequestDetailPage() {
  const t = useTranslations("host");
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [request, setRequest] = React.useState<DbBookingRequest | null | undefined>(undefined);
  const [hostNote, setHostNote] = React.useState("");
  const [updating, setUpdating] = React.useState(false);

  React.useEffect(() => {
    setRequest(undefined);
    fetchBookingRequestById(params.id).then(setRequest);
  }, [params.id]);

  async function handleStatusChange(status: string) {
    if (!request) return;
    setUpdating(true);
    await updateBookingStatusInDb(request.id, status);
    setRequest((prev) => prev ? { ...prev, status, updated_at: new Date().toISOString() } : prev);
    setUpdating(false);
    router.push("/host/requests");
  }

  if (request === undefined) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-muted-foreground">הבקשה לא נמצאה</p>
        <Button asChild variant="outline">
          <Link href="/host/requests">{t("requests.backToList")}</Link>
        </Button>
      </div>
    );
  }

  const StatusIcon = statusIcon[request.status] ?? Clock;
  const isPending = request.status === "requested";

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/host/requests" className="hover:text-foreground">
          {t("requests.title")}
        </Link>
        <ArrowRight className="size-3 rtl:rotate-180" />
        <span>{t("requests.requestDetails")}</span>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">
          {t("requests.requestDetails")}
        </h1>
        <Badge variant={statusVariant[request.status] ?? "outline"} className="gap-1">
          <StatusIcon className="size-3" />
          {t(`requests.${request.status}` as "requests.requested")}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card className="rounded-2xl border-border/60 shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4 text-primary" />
                {t("requests.location")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold text-lg">{request.location_title}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{request.location_address}</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/60 shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4 text-primary" />
                {t("requests.creator")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-semibold text-base">{request.creator_name}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                <a href={`mailto:${request.creator_email}`} className="hover:text-foreground hover:underline">
                  {request.creator_email}
                </a>
              </div>
              {request.creator_phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" />
                  <a href={`tel:${request.creator_phone}`} className="hover:text-foreground hover:underline" dir="ltr">
                    {request.creator_phone}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/60 shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarDays className="h-4 w-4 text-primary" />
                פרטי הזמנה
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t("requests.startDate")}</p>
                <p className="font-medium text-sm">{formatDate(request.start_date)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t("requests.endDate")}</p>
                <p className="font-medium text-sm">{formatDate(request.end_date)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t("requests.duration")}</p>
                <p className="font-medium text-sm">{request.duration_days} {t("requests.days")}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t("requests.priceEstimate")}</p>
                <div className="space-y-0.5">
                  <p className="text-sm text-muted-foreground">
                    ₪{request.daily_rate} × {request.duration_days} ימים = ₪{request.subtotal.toLocaleString("he-IL")}
                  </p>
                  <p className="text-xl font-bold text-primary">
                    ₪{request.total.toLocaleString("he-IL")}
                  </p>
                </div>
              </div>

              {request.notes && (
                <div className="sm:col-span-2">
                  <Separator className="mb-3" />
                  <div className="flex items-start gap-2">
                    <StickyNote className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{t("requests.notes")}</p>
                      <p className="text-sm">{request.notes}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {isPending && (
            <Card className="rounded-2xl border-border/60 shadow-card">
              <CardContent className="space-y-4 p-6">
                <div>
                  <Label className="mb-2 block">{t("requests.hostNote")}</Label>
                  <Textarea
                    rows={3}
                    placeholder={t("requests.hostNotePlaceholder")}
                    value={hostNote}
                    onChange={(e) => setHostNote(e.target.value)}
                    disabled={updating}
                  />
                </div>
                <div className="flex gap-3">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button disabled={updating}>
                        {updating ? (
                          <Loader2 className="me-2 size-4 animate-spin" />
                        ) : (
                          <CheckCircle className="me-2 size-4" />
                        )}
                        {t("requests.approve")}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t("requests.approveConfirm")}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {request.location_title} · {request.creator_name}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>ביטול</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleStatusChange("approved")}>
                          {t("requests.approve")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" disabled={updating}>
                        <XCircle className="me-2 size-4" />
                        {t("requests.reject")}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t("requests.rejectConfirm")}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {request.location_title} · {request.creator_name}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>ביטול</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleStatusChange("rejected")}>
                          {t("requests.reject")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="h-fit rounded-2xl border-border/60 shadow-card">
          <CardHeader>
            <CardTitle className="text-base">{t("requests.timeline")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 size-2.5 shrink-0 rounded-full bg-primary" />
                <div>
                  <p className="text-sm font-medium">{t("requests.requested")}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatTimestamp(request.created_at)}
                  </p>
                </div>
              </div>
              {request.status !== "requested" && (
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-1 size-2 shrink-0 rounded-full ${
                      request.status === "approved"
                        ? "bg-green-500"
                        : request.status === "rejected"
                          ? "bg-destructive"
                          : "bg-muted-foreground"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium">
                      {t(`requests.${request.status}` as "requests.requested")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimestamp(request.updated_at)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
