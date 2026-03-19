"use client";

import * as React from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

export interface CleanTagInputProps {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  /** Accessible name for each tag remove control (i18n from parent). */
  removeTagAriaLabel: string;
  hint?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
}

export function CleanTagInput({
  value,
  onChange,
  placeholder,
  removeTagAriaLabel,
  hint,
  id,
  className,
  disabled = false,
}: CleanTagInputProps) {
  const [inputValue, setInputValue] = React.useState("");

  function addTag(raw: string) {
    const text = raw.trim();
    if (!text || disabled) return;
    if (value.includes(text)) {
      setInputValue("");
      return;
    }
    onChange([...value, text]);
    setInputValue("");
  }

  function removeTag(index: number) {
    if (disabled) return;
    onChange(value.filter((_, i) => i !== index));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(inputValue);
    } else if (
      e.key === "Backspace" &&
      inputValue === "" &&
      value.length > 0
    ) {
      e.preventDefault();
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className={cn("w-full space-y-2", className)}>
      <div
        className={cn(
          "flex min-h-10 flex-wrap items-center gap-2 rounded-xl border border-border bg-background px-2 py-2 transition-shadow",
          disabled && "pointer-events-none opacity-60"
        )}
      >
        {value.map((tag, index) => (
          <div
            key={`${tag}-${index}`}
            className="flex max-w-full items-center gap-1 rounded-xl border border-border bg-muted/40 px-2.5 py-1 text-sm text-foreground"
          >
            <span className="min-w-0 truncate">{tag}</span>
            <button
              type="button"
              disabled={disabled}
              onClick={() => removeTag(index)}
              className="shrink-0 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={removeTagAriaLabel}
            >
              <X className="size-3" />
            </button>
          </div>
        ))}

        <input
          id={id}
          value={inputValue}
          disabled={disabled}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="min-w-[120px] flex-1 bg-transparent py-1 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>
      {hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
