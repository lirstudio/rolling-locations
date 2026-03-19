import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  LOCATION_AMENITY_CATALOG_KEY,
  parseAmenityCatalog,
} from "@/lib/amenity-catalog";

/**
 * Public catalog for host location form. Uses service role so hosts always
 * receive the same list the admin saved (RLS on `site_settings` may hide rows
 * to the anon/authenticated client).
 */
export async function GET() {
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json({ options: [] as string[] });
  }

  const { data, error } = await admin
    .from("site_settings")
    .select("value")
    .eq("key", LOCATION_AMENITY_CATALOG_KEY)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  const options = parseAmenityCatalog(data?.value);
  return NextResponse.json({ options });
}
