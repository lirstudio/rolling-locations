"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, CheckCircle, XCircle, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { useHostStore } from "@/stores/host-store";
import { mockUsers } from "@/mocks/users";
import type { BookingStatus } from "@/types";

const statusVariant: Record<BookingStatus, "default" | "secondary" | "destructive" | "outline"> = {
  requested: "default",
  approved: "secondary",
  rejected: "destructive",
  cancelled: "outline",
};

const statusIcon: Record<BookingStatus, React.ElementType> = {
  requested: Clock,
  approved: CheckCircle,
  rejected: XCircle,
  cancelled: XCircle,
};

function formatFull(iso: string) {
  return new Date(iso).toLocaleDateString("he-IL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
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
  const bookingRequests = useHostStore((s) => s.bookingRequests);
  const locations = useHostStore((s) => s.locations);
  const updateRequestStatus = useHostStore((s) => s.updateRequestStatus);

  const [hostNote, setHostNote] = React.useState("");

  const request = bookingRequests.find((r) => r.id === params.id);

  if (!request) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Request not found</p>
      </div>
    );
  }

  const location = locations.find((l) => l.id === request.locationId);
  const creator = mockUsers.find((u) => u.id === request.creatorId);
  const StatusIcon = statusIcon[request.status];
  const isPending = request.status === "requested";
  const requestId = request.id;

  function handleApprove() {
    updateRequestStatus(requestId, "approved", hostNote || undefined);
    router.push("/host/requests");
  }

  function handleReject() {
    updateRequestStatus(requestId, "rejected", hostNote || undefined);
    router.push("/host/requests");
  }

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/host/requests"
          className="hover:text-foreground"
        >
          {t("requests.title")}
        </Link>
        <ArrowRight className="size-3 rtl:rotate-180" />
        <span>{t("requests.requestDetails")}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">
            {t("requests.requestDetails")}
          </h1>
          <Badge variant={statusVariant[request.status]} className="gap-1">
            <StatusIcon className="size-3" />
            {t(`requests.${request.status}` as "requests.pending")}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("requests.location")}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <div className="size-16 overflow-hidden rounded-lg bg-muted">
                {location?.mediaGallery[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={location.mediaGallery[0].url}
                    alt={location.title}
                    className="size-full object-cover"
                  />
                )}
              </div>
              <div>
                <p className="font-medium">{location?.title ?? "—"}</p>
                <p className="text-sm text-muted-foreground">
                  {location?.address.city}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("requests.creator")}
                </p>
                <p className="font-medium">{creator?.name ?? "—"}</p>
                <p className="text-sm text-muted-foreground">
                  {creator?.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("requests.date")}
                </p>
                <p className="font-medium">{formatFull(request.start)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("requests.time")}
                </p>
                <p className="font-medium">
                  {formatTime(request.start)} – {formatTime(request.end)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("requests.duration")}
                </p>
                <p className="font-medium">
                  {request.durationHours} {t("requests.hours")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("requests.priceEstimate")}
                </p>
                <p className="text-lg font-bold">
                  ₪{request.priceEstimate.toLocaleString("he-IL")}
                </p>
              </div>
              {request.notes && (
                <div className="sm:col-span-2">
                  <p className="text-sm text-muted-foreground">
                    {t("requests.notes")}
                  </p>
                  <p className="text-sm">{request.notes}</p>
                </div>
              )}
              {request.hostNote && (
                <div className="sm:col-span-2">
                  <p className="text-sm text-muted-foreground">
                    {t("requests.hostNote")}
                  </p>
                  <p className="text-sm">{request.hostNote}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {isPending && (
            <Card>
              <CardContent className="space-y-4 p-6">
                <div>
                  <Label>{t("requests.hostNote")}</Label>
                  <Textarea
                    rows={3}
                    placeholder={t("requests.hostNotePlaceholder")}
                    value={hostNote}
                    onChange={(e) => setHostNote(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button>
                        <CheckCircle className="me-2 size-4" />
                        {t("requests.approve")}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {t("requests.approveConfirm")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {location?.title} · {creator?.name}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleApprove}>
                          {t("requests.approve")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline">
                        <XCircle className="me-2 size-4" />
                        {t("requests.reject")}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {t("requests.rejectConfirm")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {location?.title} · {creator?.name}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleReject}>
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

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>{t("requests.timeline")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 size-2 rounded-full bg-primary" />
                <div>
                  <p className="text-sm font-medium">
                    {t("requests.requested")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTimestamp(request.createdAt)}
                  </p>
                </div>
              </div>
              {request.status !== "requested" && (
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-1 size-2 rounded-full ${
                      request.status === "approved"
                        ? "bg-green-500"
                        : request.status === "rejected"
                          ? "bg-destructive"
                          : "bg-muted-foreground"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium">
                      {t(`requests.${request.status}` as "requests.pending")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimestamp(request.updatedAt)}
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
