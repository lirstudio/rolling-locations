import * as React from "react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface LoadingStateProps {
  message?: string
  className?: string
}

export function LoadingState({ message, className }: LoadingStateProps) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-3 py-16", className)}
      role="status"
      aria-label={message ?? "טוען..."}
    >
      <div className="size-8 animate-spin rounded-full border-2 border-border border-t-primary" />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <Skeleton className="h-40 w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-1/4" />
    </div>
  )
}

export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
  )
}
