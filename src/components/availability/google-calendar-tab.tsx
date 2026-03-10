"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  CalendarSync,
  Check,
  ExternalLink,
  Loader2,
  RefreshCw,
  Unlink,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { GoogleCalendarConnection } from "@/types";
import {
  fetchGoogleConnection,
  disconnectGoogleCalendar,
  syncGoogleCalendar,
} from "@/app/actions/google-calendar";

interface GoogleCalendarTabProps {
  locationId: string;
}

export function GoogleCalendarTab({ locationId }: GoogleCalendarTabProps) {
  const t = useTranslations("host.availability");
  const [connection, setConnection] =
    React.useState<GoogleCalendarConnection | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [isDisconnecting, setIsDisconnecting] = React.useState(false);

  const loadConnection = React.useCallback(async () => {
    setIsLoading(true);
    const conn = await fetchGoogleConnection(locationId);
    setConnection(conn);
    setIsLoading(false);
  }, [locationId]);

  React.useEffect(() => {
    loadConnection();
  }, [loadConnection]);

  function handleConnect() {
    window.location.href = `/api/google-calendar/auth?locationId=${locationId}`;
  }

  async function handleSync() {
    setIsSyncing(true);
    const { error, synced } = await syncGoogleCalendar(locationId);
    setIsSyncing(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success(t("syncSuccess", { count: synced ?? 0 }));
      await loadConnection();
    }
  }

  async function handleDisconnect() {
    setIsDisconnecting(true);
    const { error } = await disconnectGoogleCalendar(locationId);
    setIsDisconnecting(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success(t("disconnectSuccess"));
      setConnection(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!connection) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardHeader className="text-center">
          <CalendarSync className="mx-auto mb-2 size-12 text-muted-foreground" />
          <CardTitle>{t("googleConnect")}</CardTitle>
          <CardDescription>{t("googleConnectDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3">
          <Button onClick={handleConnect}>
            <ExternalLink className="me-2 size-4" />
            {t("googleConnect")}
          </Button>
          <p className="text-xs text-muted-foreground max-w-sm text-center">
            {t("googlePermissionNote")}
          </p>
        </CardContent>
      </Card>
    );
  }

  const lastSyncText = connection.lastSyncAt
    ? formatDistanceToNow(new Date(connection.lastSyncAt), {
        addSuffix: true,
        locale: he,
      })
    : null;

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarSync className="size-5 text-muted-foreground" />
            <CardTitle className="text-lg">{t("googleConnect")}</CardTitle>
          </div>
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-700"
          >
            <Check className="me-1 size-3" />
            {t("googleConnected")}
          </Badge>
        </div>
        <CardDescription>
          {connection.googleAccountEmail}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {lastSyncText && (
          <div className="text-sm text-muted-foreground">
            {t("googleLastSync")}: {lastSyncText}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={handleSync}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <Loader2 className="me-2 size-4 animate-spin" />
            ) : (
              <RefreshCw className="me-2 size-4" />
            )}
            {t("googleSyncNow")}
          </Button>

          <Button
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={handleDisconnect}
            disabled={isDisconnecting}
          >
            {isDisconnecting ? (
              <Loader2 className="me-2 size-4 animate-spin" />
            ) : (
              <Unlink className="me-2 size-4" />
            )}
            {t("googleDisconnect")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
