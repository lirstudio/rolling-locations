import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  MapPin,
  CalendarDays,
  Inbox,
  BookOpen,
  FileText,
  Users,
  Tags,
  Settings,
  Calendar,
  CheckSquare,
  LayoutPanelLeft,
  Bell,
  Link2,
  Palette,
  User,
  Home,
  HelpCircle,
  FileQuestion,
  Handshake,
  Shield,
  AlertTriangle,
} from "lucide-react";
import type { UserRole } from "@/types";

export type DashboardNavItemDef = {
  id: string;
  path: string;
  icon: LucideIcon;
  /** Extra tokens matched by cmdk (e.g. English synonyms) */
  keywords?: string[];
  subItems?: { id: string; path: string }[];
};

export type DashboardNavGroupDef = {
  groupKey: string;
  items: DashboardNavItemDef[];
};

export const dashboardNavByRole: Record<
  Exclude<UserRole, "guest">,
  DashboardNavGroupDef[]
> = {
  admin: [
    {
      groupKey: "adminMain",
      items: [
        {
          id: "dashboard",
          path: "/dashboard",
          icon: LayoutDashboard,
          keywords: ["dashboard"],
        },
        {
          id: "adminUsers",
          path: "/admin/users",
          icon: Users,
          keywords: ["users"],
        },
        {
          id: "adminCategories",
          path: "/admin/categories",
          icon: Tags,
          keywords: ["categories"],
        },
        {
          id: "adminLocations",
          path: "/admin/locations",
          icon: MapPin,
          keywords: ["locations"],
        },
        {
          id: "adminBookings",
          path: "/admin/bookings",
          icon: BookOpen,
          keywords: ["bookings", "orders"],
        },
      ],
    },
    {
      groupKey: "adminSettingsGroup",
      items: [
        {
          id: "adminSettings",
          path: "/admin/settings",
          icon: Settings,
          keywords: ["settings", "admin"],
        },
      ],
    },
  ],
  host: [
    {
      groupKey: "hostMain",
      items: [
        {
          id: "hostOverview",
          path: "/host/overview",
          icon: LayoutDashboard,
          keywords: ["overview"],
        },
        {
          id: "hostLocations",
          path: "/host/locations",
          icon: MapPin,
          keywords: ["locations"],
        },
        {
          id: "hostAvailability",
          path: "/host/availability",
          icon: CalendarDays,
          keywords: ["availability", "calendar"],
        },
        {
          id: "hostRequests",
          path: "/host/requests",
          icon: Inbox,
          keywords: ["requests", "bookings"],
        },
      ],
    },
    {
      groupKey: "hostSettingsGroup",
      items: [
        {
          id: "hostSettings",
          path: "/host/settings",
          icon: Settings,
          keywords: ["settings"],
        },
      ],
    },
  ],
  creator: [
    {
      groupKey: "creatorMain",
      items: [
        {
          id: "creatorOverview",
          path: "/creator/overview",
          icon: LayoutDashboard,
          keywords: ["overview"],
        },
        {
          id: "creatorBookings",
          path: "/creator/bookings",
          icon: BookOpen,
          keywords: ["bookings"],
        },
        {
          id: "creatorInvoices",
          path: "/creator/invoices",
          icon: FileText,
          keywords: ["invoices"],
        },
      ],
    },
    {
      groupKey: "creatorSettingsGroup",
      items: [
        {
          id: "creatorSettings",
          path: "/creator/settings",
          icon: Settings,
          keywords: ["settings"],
        },
      ],
    },
  ],
};

export type CommandSearchExtraItem = {
  id: string;
  path: string;
  groupKey: string;
  icon: LucideIcon;
  roles: Array<Exclude<UserRole, "guest">>;
  /** Only listed when NODE_ENV === "development" */
  devOnly?: boolean;
  keywords?: string[];
};

/** Items for the command palette only (not duplicated in sidebar). */
export const commandSearchExtraItems: CommandSearchExtraItem[] = [
  {
    id: "calendar",
    path: "/calendar",
    groupKey: "tools",
    icon: Calendar,
    roles: ["admin"],
    keywords: ["calendar", "יומן"],
  },
  {
    id: "tasks",
    path: "/tasks",
    groupKey: "tools",
    icon: CheckSquare,
    roles: ["admin"],
    keywords: ["tasks", "משימות"],
  },
  {
    id: "demoUsers",
    path: "/users",
    groupKey: "tools",
    icon: Users,
    roles: ["admin"],
    keywords: ["users", "demo"],
  },
  {
    id: "landing",
    path: "/landing",
    groupKey: "tools",
    icon: LayoutPanelLeft,
    roles: ["admin"],
    keywords: ["landing"],
  },
  {
    id: "settingsUser",
    path: "/settings/user",
    groupKey: "account",
    icon: User,
    roles: ["admin", "host", "creator"],
    keywords: ["profile", "user"],
  },
  {
    id: "settingsAccount",
    path: "/settings/account",
    groupKey: "account",
    icon: Settings,
    roles: ["admin", "host", "creator"],
    keywords: ["account", "password"],
  },
  {
    id: "settingsAppearance",
    path: "/settings/appearance",
    groupKey: "account",
    icon: Palette,
    roles: ["admin", "host", "creator"],
    keywords: ["theme", "appearance"],
  },
  {
    id: "settingsNotifications",
    path: "/settings/notifications",
    groupKey: "account",
    icon: Bell,
    roles: ["admin", "host", "creator"],
    keywords: ["notifications"],
  },
  {
    id: "settingsConnections",
    path: "/settings/connections",
    groupKey: "account",
    icon: Link2,
    roles: ["admin", "host", "creator"],
    keywords: ["connections", "integrations"],
  },
  {
    id: "home",
    path: "/",
    groupKey: "publicSite",
    icon: Home,
    roles: ["admin", "host", "creator"],
    keywords: ["home", "main"],
  },
  {
    id: "discoverLocations",
    path: "/locations",
    groupKey: "publicSite",
    icon: MapPin,
    roles: ["admin", "host", "creator"],
    keywords: ["locations", "discover", "גלו"],
  },
  {
    id: "about",
    path: "/about",
    groupKey: "publicSite",
    icon: FileQuestion,
    roles: ["admin", "host", "creator"],
    keywords: ["about"],
  },
  {
    id: "contact",
    path: "/contact",
    groupKey: "publicSite",
    icon: Handshake,
    roles: ["admin", "host", "creator"],
    keywords: ["contact"],
  },
  {
    id: "faq",
    path: "/faq",
    groupKey: "publicSite",
    icon: HelpCircle,
    roles: ["admin", "host", "creator"],
    keywords: ["faq", "help"],
  },
  {
    id: "forHosts",
    path: "/for-hosts",
    groupKey: "publicSite",
    icon: Handshake,
    roles: ["admin", "host", "creator"],
    keywords: ["hosts"],
  },
  {
    id: "terms",
    path: "/terms",
    groupKey: "publicSite",
    icon: FileQuestion,
    roles: ["admin", "host", "creator"],
    keywords: ["terms"],
  },
  {
    id: "privacy",
    path: "/privacy",
    groupKey: "publicSite",
    icon: Shield,
    roles: ["admin", "host", "creator"],
    keywords: ["privacy"],
  },
  {
    id: "signIn",
    path: "/sign-in",
    groupKey: "development",
    icon: Shield,
    roles: ["admin", "host", "creator"],
    devOnly: true,
    keywords: ["login"],
  },
  {
    id: "signUp",
    path: "/sign-up",
    groupKey: "development",
    icon: Shield,
    roles: ["admin", "host", "creator"],
    devOnly: true,
  },
  {
    id: "forgotPassword",
    path: "/forgot-password",
    groupKey: "development",
    icon: Shield,
    roles: ["admin", "host", "creator"],
    devOnly: true,
    keywords: ["password"],
  },
  {
    id: "errUnauthorized",
    path: "/errors/unauthorized",
    groupKey: "development",
    icon: AlertTriangle,
    roles: ["admin", "host", "creator"],
    devOnly: true,
  },
  {
    id: "errForbidden",
    path: "/errors/forbidden",
    groupKey: "development",
    icon: AlertTriangle,
    roles: ["admin", "host", "creator"],
    devOnly: true,
  },
  {
    id: "errNotFound",
    path: "/errors/not-found",
    groupKey: "development",
    icon: AlertTriangle,
    roles: ["admin", "host", "creator"],
    devOnly: true,
  },
  {
    id: "errInternal",
    path: "/errors/internal-server-error",
    groupKey: "development",
    icon: AlertTriangle,
    roles: ["admin", "host", "creator"],
    devOnly: true,
  },
  {
    id: "errMaintenance",
    path: "/errors/under-maintenance",
    groupKey: "development",
    icon: AlertTriangle,
    roles: ["admin", "host", "creator"],
    devOnly: true,
  },
];
