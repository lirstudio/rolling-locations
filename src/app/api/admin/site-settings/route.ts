import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  LOCATION_AMENITY_CATALOG_KEY,
  parseAmenityCatalog,
  serializeAmenityCatalog,
} from "@/lib/amenity-catalog";
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
    .in("key", ["hero_video_url", LOCATION_AMENITY_CATALOG_KEY]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const heroVideoUrl =
    data?.find((r) => r.key === "hero_video_url")?.value?.trim() ?? null;
  const rawCatalog =
    data?.find((r) => r.key === LOCATION_AMENITY_CATALOG_KEY)?.value ?? null;
  const amenityCatalog = parseAmenityCatalog(rawCatalog ?? undefined);
  return NextResponse.json({ heroVideoUrl, amenityCatalog });
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

  let body: { heroVideoUrl?: string | null; amenityCatalog?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.heroVideoUrl === undefined && body.amenityCatalog === undefined) {
    return NextResponse.json(
      { error: "No fields to update" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  if (body.heroVideoUrl !== undefined) {
    const value =
      body.heroVideoUrl === null || body.heroVideoUrl === undefined
        ? ""
        : String(body.heroVideoUrl).trim();
    const { error } = await admin
      .from("site_settings")
      .upsert({ key: "hero_video_url", value }, { onConflict: "key" });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  if (body.amenityCatalog !== undefined) {
    const list = Array.isArray(body.amenityCatalog) ? body.amenityCatalog : [];
    const { error } = await admin.from("site_settings").upsert(
      {
        key: LOCATION_AMENITY_CATALOG_KEY,
        value: serializeAmenityCatalog(list),
      },
      { onConflict: "key" }
    );
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  revalidateTag("admin-settings", "max");
  revalidateTag("site-amenity-catalog", "max");

  return NextResponse.json({ ok: true as const });
}
