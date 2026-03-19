"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Command as CommandPrimitive } from "cmdk";
import { Search, MapPin, BookOpen, Users, type LucideIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import {
  commandSearchExtraItems,
  dashboardNavByRole,
  type DashboardNavItemDef,
} from "@/config/dashboard-navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { queryKeys } from "@/lib/query-keys";
import { useAuthStore } from "@/stores/auth-store";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { UserRole } from "@/types";

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-xl bg-white text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50",
      className
    )}
    {...props}
  />
));
Command.displayName = CommandPrimitive.displayName;

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Input
    ref={ref}
    className={cn(
      "mb-4 flex h-12 w-full border-b border-zinc-200 bg-transparent px-4 py-3 text-[17px] outline-none placeholder:text-zinc-500 dark:border-zinc-800 dark:placeholder:text-zinc-400",
      className
    )}
    {...props}
  />
));
CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn(
      "max-h-[400px] overflow-y-auto overflow-x-hidden pb-2",
      className
    )}
    {...props}
  />
));
CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="flex h-12 items-center justify-center text-sm text-zinc-500 dark:text-zinc-400"
    {...props}
  />
));
CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "overflow-hidden px-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-zinc-500 dark:[&_[cmdk-group-heading]]:text-zinc-400 [&:not(:first-child)]:mt-2",
      className
    )}
    {...props}
  />
));
CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex h-12 cursor-pointer select-none items-center gap-2 rounded-lg px-4 text-sm text-zinc-700 outline-none transition-colors data-[disabled=true]:pointer-events-none data-[selected=true]:bg-zinc-100 data-[selected=true]:text-zinc-900 data-[disabled=true]:opacity-50 dark:text-zinc-300 dark:data-[selected=true]:bg-zinc-800 dark:data-[selected=true]:text-zinc-100 [&+[cmdk-item]]:mt-1",
      className
    )}
    {...props}
  />
));
CommandItem.displayName = CommandPrimitive.Item.displayName;

type SearchApiResponse = {
  locations: Array<{
    id: string;
    title: string;
    url: string;
    subtitle?: string;
  }>;
  bookings: Array<{
    id: string;
    title: string;
    url: string;
    subtitle?: string;
  }>;
  users: Array<{
    id: string;
    title: string;
    url: string;
    subtitle?: string;
  }>;
};

type StaticRow = {
  key: string;
  path: string;
  title: string;
  searchValue: string;
  icon?: LucideIcon;
};

const STATIC_GROUP_ORDER = [
  "dynamicLocations",
  "dynamicBookings",
  "dynamicUsers",
  "adminMain",
  "adminSettingsGroup",
  "hostMain",
  "hostSettingsGroup",
  "creatorMain",
  "creatorSettingsGroup",
  "tools",
  "account",
  "publicSite",
  "development",
] as const;

function itemToStaticRow(
  item: DashboardNavItemDef,
  t: (key: string) => string
): StaticRow[] {
  const title = t(`items.${item.id}`);
  const baseValue = [title, ...(item.keywords ?? [])].join(" ");
  if (item.subItems?.length) {
    return item.subItems.map((sub) => ({
      key: `${item.id}-${sub.id}`,
      path: sub.path,
      title: t(`items.${sub.id}`),
      searchValue: [t(`items.${sub.id}`), baseValue].join(" "),
      icon: item.icon,
    }));
  }
  return [
    {
      key: item.id,
      path: item.path,
      title,
      searchValue: baseValue,
      icon: item.icon,
    },
  ];
}

function buildStaticBuckets(
  role: Exclude<UserRole, "guest">,
  t: (key: string) => string,
  includeDev: boolean
): Record<string, StaticRow[]> {
  const buckets: Record<string, StaticRow[]> = {};

  for (const group of dashboardNavByRole[role]) {
    buckets[group.groupKey] = [];
    for (const item of group.items) {
      buckets[group.groupKey].push(...itemToStaticRow(item, t));
    }
  }

  for (const extra of commandSearchExtraItems) {
    if (!extra.roles.includes(role)) continue;
    if (extra.devOnly && !includeDev) continue;
    if (!buckets[extra.groupKey]) {
      buckets[extra.groupKey] = [];
    }
    const title = t(`items.${extra.id}`);
    buckets[extra.groupKey].push({
      key: `extra-${extra.id}`,
      path: extra.path,
      title,
      searchValue: [title, ...(extra.keywords ?? [])].join(" "),
      icon: extra.icon,
    });
  }

  return buckets;
}

async function fetchSearchEntities(q: string): Promise<SearchApiResponse> {
  const res = await fetch(
    `/api/search?q=${encodeURIComponent(q)}`,
    { credentials: "include" }
  );
  if (!res.ok) {
    return { locations: [], bookings: [], users: [] };
  }
  return res.json() as Promise<SearchApiResponse>;
}

interface CommandSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandSearch({ open, onOpenChange }: CommandSearchProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("commandSearch");
  const commandRef = React.useRef<HTMLDivElement>(null);
  const [input, setInput] = React.useState("");
  const debouncedInput = useDebouncedValue(input, 300);
  const user = useAuthStore((s) => s.user);
  const dashboardRole: Exclude<UserRole, "guest"> =
    user?.role === "admin" ||
    user?.role === "host" ||
    user?.role === "creator"
      ? user.role
      : "admin";

  const includeDev = process.env.NODE_ENV === "development";
  const staticBuckets = React.useMemo(
    () =>
      buildStaticBuckets(
        dashboardRole,
        (key) => t(key as never),
        includeDev
      ),
    [dashboardRole, t, includeDev]
  );

  const { data: entityData, isFetching } = useQuery({
    queryKey: queryKeys.search.command(debouncedInput),
    queryFn: () => fetchSearchEntities(debouncedInput),
    enabled: open && debouncedInput.trim().length >= 2,
    staleTime: 30_000,
  });

  React.useEffect(() => {
    if (!open) {
      setInput("");
    }
  }, [open]);

  const handleSelect = (url: string) => {
    router.push(url);
    onOpenChange(false);
    if (commandRef.current) {
      commandRef.current.style.transform = "scale(0.96)";
      window.setTimeout(() => {
        if (commandRef.current) {
          commandRef.current.style.transform = "";
        }
      }, 100);
    }
  };

  const dir = locale === "he" ? "rtl" : "ltr";
  const entities = entityData ?? {
    locations: [],
    bookings: [],
    users: [],
  };

  const orderedGroupKeys = STATIC_GROUP_ORDER.filter((k) => {
    if (k === "dynamicLocations") return entities.locations.length > 0;
    if (k === "dynamicBookings") return entities.bookings.length > 0;
    if (k === "dynamicUsers") return entities.users.length > 0;
    return Boolean(staticBuckets[k]?.length);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[640px] overflow-hidden border border-zinc-200 p-0 shadow-2xl dark:border-zinc-800"
        dir={dir}
      >
        <DialogTitle className="sr-only">{t("title")}</DialogTitle>
        <Command
          ref={commandRef}
          shouldFilter
          className="transition-transform duration-100 ease-out"
        >
          <CommandInput
            placeholder={t("placeholder")}
            value={input}
            onValueChange={setInput}
            autoFocus
          />
          <CommandList>
            <CommandEmpty>
              {isFetching && debouncedInput.trim().length >= 2
                ? t("loading")
                : t("noResults")}
            </CommandEmpty>

            {orderedGroupKeys.map((groupKey) => {
              if (groupKey === "dynamicLocations") {
                if (entities.locations.length === 0) return null;
                return (
                  <CommandGroup
                    key={groupKey}
                    heading={t(`groups.${groupKey}`)}
                  >
                    {entities.locations.map((loc) => {
                      const typeLabel = t("entityTypes.location");
                      const sv = `${typeLabel} ${loc.title} ${loc.subtitle ?? ""}`;
                      return (
                        <CommandItem
                          key={`loc-${loc.id}`}
                          value={sv}
                          onSelect={() => handleSelect(loc.url)}
                        >
                          <MapPin className="size-4 shrink-0 text-muted-foreground" />
                          <span className="min-w-0 flex-1 truncate text-start">
                            {loc.title}
                            {loc.subtitle ? (
                              <span className="ms-1 text-xs text-muted-foreground">
                                · {loc.subtitle}
                              </span>
                            ) : null}
                          </span>
                          <span className="shrink-0 text-[10px] uppercase text-muted-foreground">
                            {typeLabel}
                          </span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                );
              }

              if (groupKey === "dynamicBookings") {
                if (entities.bookings.length === 0) return null;
                return (
                  <CommandGroup
                    key={groupKey}
                    heading={t(`groups.${groupKey}`)}
                  >
                    {entities.bookings.map((b) => {
                      const typeLabel = t("entityTypes.booking");
                      const sv = `${typeLabel} ${b.title} ${b.subtitle ?? ""}`;
                      return (
                        <CommandItem
                          key={`book-${b.id}`}
                          value={sv}
                          onSelect={() => handleSelect(b.url)}
                        >
                          <BookOpen className="size-4 shrink-0 text-muted-foreground" />
                          <span className="min-w-0 flex-1 truncate text-start">
                            {b.title}
                            {b.subtitle ? (
                              <span className="ms-1 text-xs text-muted-foreground">
                                · {b.subtitle}
                              </span>
                            ) : null}
                          </span>
                          <span className="shrink-0 text-[10px] uppercase text-muted-foreground">
                            {typeLabel}
                          </span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                );
              }

              if (groupKey === "dynamicUsers") {
                if (entities.users.length === 0) return null;
                return (
                  <CommandGroup
                    key={groupKey}
                    heading={t(`groups.${groupKey}`)}
                  >
                    {entities.users.map((u) => {
                      const typeLabel = t("entityTypes.user");
                      const sv = `${typeLabel} ${u.title} ${u.subtitle ?? ""}`;
                      return (
                        <CommandItem
                          key={`user-${u.id}`}
                          value={sv}
                          onSelect={() => handleSelect(u.url)}
                        >
                          <Users className="size-4 shrink-0 text-muted-foreground" />
                          <span className="min-w-0 flex-1 truncate text-start">
                            {u.title}
                            {u.subtitle ? (
                              <span className="ms-1 text-xs text-muted-foreground">
                                · {u.subtitle}
                              </span>
                            ) : null}
                          </span>
                          <span className="shrink-0 text-[10px] uppercase text-muted-foreground">
                            {typeLabel}
                          </span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                );
              }

              const rows = staticBuckets[groupKey];
              if (!rows?.length) return null;
              return (
                <CommandGroup key={groupKey} heading={t(`groups.${groupKey}`)}>
                  {rows.map((row) => {
                    const Icon = row.icon;
                    return (
                      <CommandItem
                        key={row.key}
                        value={row.searchValue}
                        onSelect={() => handleSelect(row.path)}
                      >
                        {Icon ? (
                          <Icon className="size-4 shrink-0 text-muted-foreground" />
                        ) : null}
                        <span className="min-w-0 flex-1 truncate text-start">
                          {row.title}
                        </span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              );
            })}

          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

export function SearchTrigger({ onClick }: { onClick: () => void }) {
  const t = useTranslations("commandSearch");
  return (
    <button
      type="button"
      onClick={onClick}
      className="border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring relative inline-flex h-8 w-full max-w-sm items-center justify-start gap-2 whitespace-nowrap rounded-md border px-3 py-1 text-sm font-medium shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 sm:pe-12 md:w-36 lg:w-56"
    >
      <Search className="me-2 size-3.5 shrink-0" />
      <span className="hidden lg:inline-flex">{t("triggerLabel")}</span>
      <span className="inline-flex lg:hidden">{t("triggerLabel")}</span>
      <kbd className="bg-muted pointer-events-none absolute end-1.5 top-1.5 hidden h-4 select-none items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </button>
  );
}
