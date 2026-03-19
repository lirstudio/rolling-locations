import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/types";

export const dynamic = "force-dynamic";

const LIMIT = 8;
const FETCH_CAP = 500;

type EntityHit = {
  id: string;
  title: string;
  url: string;
  subtitle?: string;
};

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

function matchesQuery(haystack: string, q: string): boolean {
  if (!q) return false;
  return normalize(haystack).includes(normalize(q));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (q.length < 2) {
    return NextResponse.json({
      locations: [] as EntityHit[],
      bookings: [] as EntityHit[],
      users: [] as EntityHit[],
    });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (user.user_metadata?.role as UserRole) ?? "guest";
  if (role === "guest") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const locations: EntityHit[] = [];
  const bookings: EntityHit[] = [];
  const users: EntityHit[] = [];

  try {
    const admin = createAdminClient();

    if (role === "admin") {
      const { data: locRows, error: locErr } = await admin
        .from("locations")
        .select("id, slug, title, address_city")
        .order("created_at", { ascending: false })
        .limit(FETCH_CAP);

      if (locErr) {
        console.error("[api/search] locations", locErr.message);
      } else {
        for (const row of locRows ?? []) {
          const title = String(row.title ?? "");
          const city = String(row.address_city ?? "");
          if (!matchesQuery(title, q) && !matchesQuery(city, q)) continue;
          const slug = String(row.slug ?? "");
          locations.push({
            id: String(row.id),
            title,
            subtitle: city || undefined,
            url: slug ? `/locations/${slug}` : `/admin/locations`,
          });
          if (locations.length >= LIMIT) break;
        }
      }

      const { data: bookRows, error: bookErr } = await admin
        .from("booking_requests")
        .select(
          "id, location_title, creator_name, creator_email, status, host_id"
        )
        .order("created_at", { ascending: false })
        .limit(FETCH_CAP);

      if (bookErr) {
        console.error("[api/search] bookings", bookErr.message);
      } else {
        for (const row of bookRows ?? []) {
          const lt = String(row.location_title ?? "");
          const cn = String(row.creator_name ?? "");
          const ce = String(row.creator_email ?? "");
          if (
            !matchesQuery(lt, q) &&
            !matchesQuery(cn, q) &&
            !matchesQuery(ce, q)
          ) {
            continue;
          }
          bookings.push({
            id: String(row.id),
            title: lt,
            subtitle: `${cn} · ${String(row.status ?? "")}`,
            url: "/admin/bookings",
          });
          if (bookings.length >= LIMIT) break;
        }
      }

      const { data: authData, error: authErr } =
        await admin.auth.admin.listUsers({ perPage: 1000 });
      if (authErr) {
        console.error("[api/search] users", authErr.message);
      } else {
        for (const u of authData?.users ?? []) {
          const name =
            typeof u.user_metadata?.name === "string"
              ? u.user_metadata.name
              : (u.email ?? "");
          const email = u.email ?? "";
          if (
            !matchesQuery(name, q) &&
            !matchesQuery(email, q)
          ) {
            continue;
          }
          users.push({
            id: u.id,
            title: name || email,
            subtitle: email || undefined,
            url: "/admin/users",
          });
          if (users.length >= LIMIT) break;
        }
      }
    }

    if (role === "host") {
      const { data: locRows, error: locErr } = await admin
        .from("locations")
        .select("id, slug, title, address_city")
        .eq("host_id", user.id)
        .order("created_at", { ascending: false })
        .limit(FETCH_CAP);

      if (locErr) {
        console.error("[api/search] host locations", locErr.message);
      } else {
        for (const row of locRows ?? []) {
          const title = String(row.title ?? "");
          const city = String(row.address_city ?? "");
          if (!matchesQuery(title, q) && !matchesQuery(city, q)) continue;
          locations.push({
            id: String(row.id),
            title,
            subtitle: city || undefined,
            url: `/host/locations/${row.id}/edit`,
          });
          if (locations.length >= LIMIT) break;
        }
      }

      const { data: bookRows, error: bookErr } = await admin
        .from("booking_requests")
        .select("id, location_title, creator_name, status")
        .eq("host_id", user.id)
        .order("created_at", { ascending: false })
        .limit(FETCH_CAP);

      if (bookErr) {
        console.error("[api/search] host bookings", bookErr.message);
      } else {
        for (const row of bookRows ?? []) {
          const lt = String(row.location_title ?? "");
          const cn = String(row.creator_name ?? "");
          if (!matchesQuery(lt, q) && !matchesQuery(cn, q)) continue;
          bookings.push({
            id: String(row.id),
            title: lt,
            subtitle: cn,
            url: `/host/requests/${row.id}`,
          });
          if (bookings.length >= LIMIT) break;
        }
      }
    }

    if (role === "creator") {
      const email = user.email;
      if (!email) {
        return NextResponse.json({ locations, bookings, users });
      }

      const { data: bookRows, error: bookErr } = await admin
        .from("booking_requests")
        .select("id, location_title, creator_name, status")
        .eq("creator_email", email)
        .order("created_at", { ascending: false })
        .limit(FETCH_CAP);

      if (bookErr) {
        console.error("[api/search] creator bookings", bookErr.message);
      } else {
        for (const row of bookRows ?? []) {
          const lt = String(row.location_title ?? "");
          const cn = String(row.creator_name ?? "");
          if (!matchesQuery(lt, q) && !matchesQuery(cn, q)) continue;
          bookings.push({
            id: String(row.id),
            title: lt,
            subtitle: String(row.status ?? ""),
            url: `/creator/bookings/${row.id}`,
          });
          if (bookings.length >= LIMIT) break;
        }
      }
    }
  } catch (e) {
    console.error("[api/search]", e);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }

  return NextResponse.json({ locations, bookings, users });
}
