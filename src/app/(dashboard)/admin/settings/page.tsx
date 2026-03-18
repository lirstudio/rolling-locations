"use client"

import { useState, useEffect } from "react"
import { Lock } from "lucide-react"
import { useTranslations } from "next-intl"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { queryKeys } from "@/lib/query-keys"

async function fetchSiteSettings(): Promise<{ heroVideoUrl: string | null }> {
  const r = await fetch("/api/admin/site-settings")
  return r.ok ? r.json() : { heroVideoUrl: null }
}

export default function AdminSettingsPage() {
  const t = useTranslations("admin.settings")
  const queryClient = useQueryClient()
  const [platformName, setPlatformName] = useState("Rollin Locations")
  const [defaultLang, setDefaultLang] = useState("he")
  const [heroVideoUrl, setHeroVideoUrl] = useState("")

  const { data: settingsData, isLoading: loading } = useQuery({
    queryKey: queryKeys.admin.settings(),
    queryFn: fetchSiteSettings,
  })

  useEffect(() => {
    if (settingsData) {
      setHeroVideoUrl(settingsData.heroVideoUrl ?? "")
    }
  }, [settingsData])

  const saveMutation = useMutation({
    mutationFn: async (url: string | null) => {
      const res = await fetch("/api/admin/site-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ heroVideoUrl: url }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { error?: string })?.error ?? "Failed to save")
      }
    },
    onSuccess: () => {
      toast.success("ההגדרות נשמרו")
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.settings() })
    },
    onError: (e: Error) => {
      toast.error(e.message ?? "שגיאה בשמירה")
    },
  })

  const saving = saveMutation.isPending

  function handleSave() {
    saveMutation.mutate(heroVideoUrl.trim() || null)
  }

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">הגדרות ניהול</h1>
        <p className="text-muted-foreground">
          הגדרות כלליות של הפלטפורמה
        </p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        {/* General Settings */}
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="text-base">כללי</CardTitle>
            <CardDescription>הגדרות בסיסיות של הפלטפורמה</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platform-name">שם הפלטפורמה</Label>
              <Input
                id="platform-name"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                שם התצוגה של השוק
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="default-lang">שפת ברירת מחדל</Label>
              <Select value={defaultLang} onValueChange={setDefaultLang}>
                <SelectTrigger id="default-lang" className="cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="he">עברית</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                השפה הראשית של הפלטפורמה
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hero-video-url">{t("heroVideoUrl")}</Label>
              <Input
                id="hero-video-url"
                type="url"
                value={heroVideoUrl}
                onChange={(e) => setHeroVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                {t("heroVideoUrlDesc")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Commission Settings (v2 placeholder) */}
        <Card className="rounded-xl opacity-60">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">עמלות</CardTitle>
              <Badge variant="outline" className="gap-1">
                <Lock className="size-3" />
                בקרוב בגרסה 2
              </Badge>
            </div>
            <CardDescription>
              הגדרות עמלות יהיו זמינות בגרסה 2 עם הפעלת עיבוד תשלומים.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>סוג עמלה</Label>
              <Select disabled value="percentage">
                <SelectTrigger className="cursor-not-allowed">
                  <SelectValue placeholder="סוג עמלה" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">אחוז (%)</SelectItem>
                  <SelectItem value="fixed">סכום קבוע (₪)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>ערך עמלה</Label>
              <Input disabled placeholder="10" type="number" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving || loading}
            className="cursor-pointer"
          >
            {saving ? "..." : t("saveSettings")}
          </Button>
        </div>
      </div>
    </div>
  )
}
