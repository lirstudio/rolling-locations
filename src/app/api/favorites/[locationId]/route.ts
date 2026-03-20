import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isFavorite } from "@/app/actions/favorites";

/**
 * GET /api/favorites/[locationId]
 * Check if a location is favorited by the authenticated user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locationId: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ isFavorite: false });
  }

  try {
    const { locationId } = await params;
    const favorited = await isFavorite(locationId);
    return NextResponse.json({ isFavorite: favorited });
  } catch (error) {
    console.error("[GET /api/favorites/[locationId]] error:", error);
    return NextResponse.json({ isFavorite: false });
  }
}
