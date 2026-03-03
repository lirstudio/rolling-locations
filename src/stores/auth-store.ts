import { create } from "zustand";
import type { User, UserRole } from "@/types";
import { createClient } from "@/lib/supabase/client";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";

const PENDING_SIGNUP_ROLE_KEY = "rollin-pending-signup-role";

function supabaseUserToAppUser(sb: SupabaseUser): User {
  const meta = sb.user_metadata ?? {};
  const role = (meta.role as UserRole) ?? "creator";
  const name = meta.name ?? meta.full_name ?? sb.email?.split("@")[0] ?? "User";
  return {
    id: sb.id,
    name: typeof name === "string" ? name : "User",
    email: sb.email ?? "",
    phone: meta.phone,
    role: ["guest", "creator", "host", "admin"].includes(role) ? role : "creator",
    createdAt: sb.created_at ?? new Date().toISOString(),
  };
}

export function roleRedirectPath(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/dashboard";
    case "host":
      return "/host/overview";
    case "creator":
      return "/creator/overview";
    default:
      return "/sign-in";
  }
}

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;

  setSession: (session: Session | null) => void;
  sendMagicLink: (email: string, redirectTo?: string) => Promise<void>;
  sendOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, token: string) => Promise<void>;
  signInWithGoogle: (redirectTo?: string, pendingRole?: "creator" | "host") => Promise<void>;
  signOut: () => Promise<void>;
  updateUserMetadata: (data: { role?: string; name?: string; phone?: string }) => Promise<void>;
  updateUser: (patch: Partial<User>) => void;
  clearError: () => void;
  setPendingSignUpRole: (role: "creator" | "host") => void;
  consumePendingSignUpRole: () => "creator" | "host" | null;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isInitialized: false,

  setSession: (session: Session | null) => {
    if (!session) {
      set({ user: null, session: null, isAuthenticated: false });
      return;
    }
    set({
      session,
      user: supabaseUserToAppUser(session.user),
      isAuthenticated: true,
      isInitialized: true,
    });
  },

  sendMagicLink: async (email: string, redirectTo?: string) => {
    set({ isLoading: true, error: null });
    const supabase = createClient();
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const redirect = redirectTo ?? `${origin}/auth/callback`;

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: redirect,
        shouldCreateUser: true,
      },
    });

    set({ isLoading: false });
    if (error) set({ error: error.message });
  },

  sendOtp: async (email: string) => {
    set({ isLoading: true, error: null });
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: true,
      },
    });

    set({ isLoading: false });
    if (error) set({ error: error.message });
  },

  verifyOtp: async (email: string, token: string) => {
    set({ isLoading: true, error: null });
    const supabase = createClient();

    const { error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: token.trim(),
      type: "email",
    });

    set({ isLoading: false });
    if (error) set({ error: error.message });
  },

  signInWithGoogle: async (redirectTo?: string, pendingRole?: "creator" | "host") => {
    set({ isLoading: true, error: null });
    if (pendingRole && typeof window !== "undefined") {
      sessionStorage.setItem(PENDING_SIGNUP_ROLE_KEY, pendingRole);
    }
    const supabase = createClient();
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const redirect = redirectTo ?? `${origin}/auth/callback`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirect },
    });

    set({ isLoading: false });
    if (error) set({ error: error.message });
  },

  signOut: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: null, session: null, isAuthenticated: false, error: null });
  },

  updateUserMetadata: async (data: { role?: string; name?: string; phone?: string }) => {
    const supabase = createClient();
    const { data: updated, error } = await supabase.auth.updateUser({
      data: { ...data },
    });
    if (!error && updated.user) {
      set({ user: supabaseUserToAppUser(updated.user) });
    }
  },

  clearError: () => set({ error: null }),

  updateUser: (patch) => {
    const { user } = get();
    if (!user) return;
    set({ user: { ...user, ...patch } });
  },

  setPendingSignUpRole: (role: "creator" | "host") => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(PENDING_SIGNUP_ROLE_KEY, role);
    }
  },

  consumePendingSignUpRole: (): "creator" | "host" | null => {
    if (typeof window === "undefined") return null;
    const role = sessionStorage.getItem(PENDING_SIGNUP_ROLE_KEY);
    sessionStorage.removeItem(PENDING_SIGNUP_ROLE_KEY);
    if (role === "creator" || role === "host") return role;
    return null;
  },
}));

// Sync auth state from Supabase (run in client)
export function subscribeAuth() {
  const supabase = createClient();
  const { setSession, consumePendingSignUpRole, updateUserMetadata } = useAuthStore.getState();

  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
    useAuthStore.setState({ isInitialized: true });
  });

  supabase.auth.onAuthStateChange(async (event, session) => {
    setSession(session ?? null);

    if (event === "SIGNED_IN" && session?.user) {
      const pendingRole = consumePendingSignUpRole();
      if (pendingRole) {
        const meta = session.user.user_metadata ?? {};
        if (!meta.role) {
          await updateUserMetadata({ role: pendingRole });
        }
      }
    }
  });
}
