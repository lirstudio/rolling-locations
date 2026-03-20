import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { User, UserRole } from "@/types";
import type { User as SupabaseUser } from "@supabase/supabase-js";

function getTwoStepEnabled(sb: SupabaseUser): boolean {
  const factors = (sb as { factors?: { status?: string }[] }).factors;
  if (!Array.isArray(factors)) return false;
  return factors.some((f) => f.status === "verified");
}

function toAppUser(sb: SupabaseUser): User {
  const meta = sb.user_metadata ?? {};
  const role = (meta.role as UserRole) ?? "guest";
  const name =
    meta.name ?? meta.full_name ?? sb.email?.split("@")[0] ?? "User";
  const avatarUrl =
    typeof meta.avatar_url === "string" && meta.avatar_url
      ? meta.avatar_url
      : undefined;
  return {
    id: sb.id,
    name: typeof name === "string" ? name : "User",
    email: sb.email ?? "",
    phone: typeof meta.phone === "string" ? meta.phone : undefined,
    avatarUrl,
    role: ["guest", "creator", "host", "admin"].includes(role) ? role : "guest",
    createdAt: sb.created_at ?? new Date().toISOString(),
    lastLoginAt: sb.last_sign_in_at ?? null,
    twoStepEnabled: getTwoStepEnabled(sb),
  };
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const role = (user?.user_metadata?.role as UserRole) ?? "guest";
  if (!user || role !== "admin") {
    return null;
  }
  return user;
}

const createUserBodySchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(200),
  phone: z.string().max(40).optional().or(z.literal("")),
  role: z.enum(["guest", "creator", "host", "admin"]),
});

function generateTempPassword(): string {
  const base = randomBytes(18).toString("base64url");
  return `${base}Aa1!`;
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

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createUserBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { email, name, phone, role } = parsed.data;
  const admin = createAdminClient();
  const origin = new URL(req.url).origin;
  const redirectTo = `${origin}/auth/callback`;

  const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(
    email.trim().toLowerCase(),
    {
      data: {
        name,
        ...(phone ? { phone } : {}),
        role,
      },
      redirectTo,
    }
  );

  if (!inviteError) {
    return NextResponse.json({ ok: true, method: "invite" as const });
  }

  const password = generateTempPassword();
  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: {
        name,
        ...(phone ? { phone } : {}),
        role,
      },
    });

  if (createError) {
    return NextResponse.json(
      { error: createError.message },
      { status: 400 }
    );
  }

  return NextResponse.json({
    ok: true,
    method: "create" as const,
    userId: created.user?.id,
    messageKey: "passwordResetHint",
  });
}
