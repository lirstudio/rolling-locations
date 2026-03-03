import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, UserRole } from "@/types";
import { mockUsers } from "@/mocks";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: {
    name: string;
    email: string;
    phone?: string;
    role: "creator" | "host";
  }) => Promise<void>;
  signOut: () => void;
  updateUser: (patch: Partial<User>) => void;
  clearError: () => void;
}

function roleRedirectPath(role: UserRole): string {
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

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      signIn: async (email: string, _password: string) => {
        set({ isLoading: true, error: null });

        // Simulate network delay
        await new Promise((r) => setTimeout(r, 400));

        const found = mockUsers.find(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        );

        if (!found) {
          set({ isLoading: false, error: "invalidCredentials" });
          return;
        }

        set({ user: found, isAuthenticated: true, isLoading: false });
      },

      signUp: async (data) => {
        set({ isLoading: true, error: null });

        await new Promise((r) => setTimeout(r, 400));

        const exists = mockUsers.find(
          (u) => u.email.toLowerCase() === data.email.toLowerCase()
        );
        if (exists) {
          set({ isLoading: false, error: "emailAlreadyExists" });
          return;
        }

        const newUser: User = {
          id: `user-${Date.now()}`,
          name: data.name,
          email: data.email,
          phone: data.phone,
          role: data.role,
          createdAt: new Date().toISOString(),
        };

        mockUsers.push(newUser);
        set({ user: newUser, isAuthenticated: true, isLoading: false });
      },

      signOut: () => {
        set({ user: null, isAuthenticated: false, error: null });
      },

      updateUser: (patch) => {
        const { user } = get();
        if (!user) return;
        set({ user: { ...user, ...patch } });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "rollin-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export { roleRedirectPath };
