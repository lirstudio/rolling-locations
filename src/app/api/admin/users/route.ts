import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { User, UserRole } from "@/types";
import type { User as SupabaseUser } from "@supabase/supabase-js";

function toAppUser(sb: SupabaseUser): User {
  const meta = sb.user_metadata ?? {};
  const role = (meta.role as UserRole) ?? "guest";
  const name =
    meta.name ?? meta.full_name ?? sb.email?.split("@")[0] ?? "User";
  return {
    id: sb.id,
    name: typeof name === "string" ? name : "User",
    email: sb.email ?? "",
    phone: meta.phone,
    role: ["guest", "creator", "host", "admin"].includes(role) ? role : "guest",
    createdAt: sb.created_at ?? new Date().toISOString(),
  };
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const role = (user?.user_metadata?.role as UserRole) ?? "guest";
  if (!user || role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const users: User[] = (data.users ?? []).map(toAppUser);
  return NextResponse.json(users);
}
