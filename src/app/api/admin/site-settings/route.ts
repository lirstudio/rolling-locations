import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/types";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const role = (user?.user_metadata?.role as UserRole) ?? "guest";
  if (!user || role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", ["hero_video_url"]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const heroVideoUrl =
    data?.find((r) => r.key === "hero_video_url")?.value?.trim() ?? null;
  return NextResponse.json({ heroVideoUrl });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const role = (user?.user_metadata?.role as UserRole) ?? "guest";
  if (!user || role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { heroVideoUrl?: string | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const value =
    body.heroVideoUrl === null || body.heroVideoUrl === undefined
      ? ""
      : String(body.heroVideoUrl).trim();

  const admin = createAdminClient();
  const { error } = await admin
    .from("site_settings")
    .upsert({ key: "hero_video_url", value }, { onConflict: "key" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ heroVideoUrl: value || null });
}
