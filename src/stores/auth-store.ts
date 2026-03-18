import { create } from "zustand";
import type { User, UserRole } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { roleRedirectPath } from "@/lib/auth";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";

function supabaseUserToAppUser(sb: SupabaseUser): User {
  const meta = sb.user_metadata ?? {};
  const role = (meta.role as UserRole) ?? "guest";
  const name = meta.name ?? meta.full_name ?? sb.email?.split("@")[0] ?? "User";
  return {
    id: sb.id,
    name: typeof name === "string" ? name : "User",
    email: sb.email ?? "",
    phone: meta.phone,
    avatarUrl:
    typeof meta.avatar_url === "string" && meta.avatar_url
      ? meta.avatar_url
      : undefined,
    role: ["guest", "creator", "host", "admin"].includes(role) ? role : "guest",
    createdAt: sb.created_at ?? new Date().toISOString(),
  };
}

export { roleRedirectPath };

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
  signInWithGoogle: (redirectTo?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserMetadata: (data: { role?: string; name?: string; phone?: string; avatar_url?: string }) => Promise<void>;
  updateUser: (patch: Partial<User>) => void;
  clearError: () => void;
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
        shouldCreateUser: false,
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

    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: token.trim(),
      type: "email",
    });

    set({ isLoading: false });
    if (error) {
      set({ error: error.message });
      return;
    }
    if (data.session) {
      get().setSession(data.session);
    }
  },

  signInWithGoogle: async (redirectTo?: string) => {
    set({ isLoading: true, error: null });
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

  updateUserMetadata: async (data: { role?: string; name?: string; phone?: string; avatar_url?: string }) => {
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
}));

export function subscribeAuth() {
  let supabase: ReturnType<typeof createClient>;
  try {
    supabase = createClient();
  } catch {
    useAuthStore.setState({ isInitialized: true });
    return;
  }

  const { setSession } = useAuthStore.getState();

  supabase.auth
    .getSession()
    .then(({ data: { session } }) => {
      setSession(session);
    })
    .catch(() => {})
    .finally(() => {
      useAuthStore.setState({ isInitialized: true });
    });

  supabase.auth.onAuthStateChange((_event, session) => {
    setSession(session ?? null);
  });
}
