import { APP_VERSION } from "@/generated/version";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/30 px-4 py-4">
      <p className="text-xs text-muted-foreground text-center">
        גרסה {APP_VERSION}
      </p>
    </footer>
  )
}
