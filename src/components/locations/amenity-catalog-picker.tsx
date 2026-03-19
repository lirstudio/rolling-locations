"use client";

import * as React from "react";
import { ChevronDown, X } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface AmenityCatalogPickerProps {
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  loading?: boolean;
  triggerPlaceholder: string;
  loadingLabel: string;
  emptyCatalogMessage: string;
  popoverLabel: string;
  removeTagAriaLabel: string;
  id?: string;
  className?: string;
}

export function AmenityCatalogPicker({
  options,
  value,
  onChange,
  disabled = false,
  loading = false,
  triggerPlaceholder,
  loadingLabel,
  emptyCatalogMessage,
  popoverLabel,
  removeTagAriaLabel,
  id,
  className,
}: AmenityCatalogPickerProps) {
  const [open, setOpen] = React.useState(false);
  const noOptions = options.length === 0;
  const blocked = disabled;

  function toggleOption(label: string, checked: boolean) {
    if (checked) {
      if (value.includes(label)) return;
      onChange([...value, label]);
    } else {
      onChange(value.filter((v) => v !== label));
    }
  }

  function removeTag(label: string) {
    onChange(value.filter((v) => v !== label));
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        {/* Use PopoverTrigger directly — no asChild, no forwardRef chains */}
        <PopoverTrigger
          id={id}
          type="button"
          disabled={blocked}
          className={cn(
            "flex h-auto min-h-10 w-full items-start justify-between gap-2 rounded-xl border border-border bg-background px-3 py-2 text-start text-sm shadow-sm transition-colors",
            "hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2",
            "disabled:pointer-events-none disabled:opacity-60"
          )}
        >
          <span className="flex min-w-0 flex-1 flex-wrap items-center gap-2 py-0.5">
            {value.length === 0 ? (
              <span className="text-muted-foreground">
                {loading ? loadingLabel : triggerPlaceholder}
              </span>
            ) : (
              value.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex max-w-full items-center gap-1 rounded-lg border border-border bg-muted/40 px-2 py-0.5 text-sm text-foreground"
                >
                  <span className="min-w-0 truncate">{tag}</span>
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label={removeTagAriaLabel}
                    className="shrink-0 rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeTag(tag);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        removeTag(tag);
                      }
                    }}
                  >
                    <X className="size-3" />
                  </span>
                </span>
              ))
            )}
          </span>
          <ChevronDown
            className={cn(
              "mt-1.5 size-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180"
            )}
          />
        </PopoverTrigger>

        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
        >
          <div className="border-b border-border px-3 py-2">
            <p className="text-sm font-medium text-foreground">{popoverLabel}</p>
          </div>
          <ScrollArea className="h-[min(18rem,calc(100vh-12rem))]">
            {loading ? (
              <p className="p-4 text-sm text-muted-foreground">{loadingLabel}</p>
            ) : noOptions ? (
              <p className="p-4 text-sm text-muted-foreground">
                {emptyCatalogMessage}
              </p>
            ) : (
              <div className="p-2">
                {options.map((opt, index) => {
                  const checked = value.includes(opt);
                  const itemId = `${id ?? "amenity"}-${index}`;
                  return (
                    <div
                      key={opt}
                      className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-muted/50"
                    >
                      <Checkbox
                        id={itemId}
                        checked={checked}
                        onCheckedChange={(c) => toggleOption(opt, c === true)}
                      />
                      <Label
                        htmlFor={itemId}
                        className="flex-1 cursor-pointer text-sm font-normal leading-snug"
                      >
                        {opt}
                      </Label>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>

      {noOptions && !loading ? (
        <p className="text-xs text-muted-foreground">{emptyCatalogMessage}</p>
      ) : null}
    </div>
  );
}
