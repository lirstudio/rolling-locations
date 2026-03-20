"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, Loader2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { searchAddress, type ParsedAddress } from "@/lib/nominatim";

interface AddressAutocompleteProps {
  value: string;
  onSelect: (address: ParsedAddress) => void;
  onChange?: (text: string) => void;
  placeholder?: string;
  className?: string;
}

const DEBOUNCE_MS = 600;

export function AddressAutocomplete({
  value,
  onSelect,
  onChange,
  placeholder,
  className,
}: AddressAutocompleteProps) {
  const t = useTranslations("host.locations");
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<ParsedAddress[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 3) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await searchAddress(q, { limit: 5 });
      setResults(res);
      setIsOpen(res.length > 0);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (text: string) => {
    setQuery(text);
    onChange?.(text);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSearch(text), DEBOUNCE_MS);
  };

  const handleSelect = (address: ParsedAddress) => {
    setQuery(address.street ? `${address.street}, ${address.city}` : address.displayName);
    setResults([]);
    setIsOpen(false);
    onSelect(address);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    onChange?.("");
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <MapPin className="absolute top-1/2 start-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder={placeholder ?? t("addressSearchPlaceholder")}
          className="ps-9 pe-9"
        />
        {loading && (
          <Loader2 className="absolute top-1/2 end-3 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
        {!loading && query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-1/2 end-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full rounded-xl border border-border bg-popover p-1 shadow-lg">
          {results.map((r) => (
            <li key={`${r.lat}-${r.lng}`}>
              <button
                type="button"
                className="flex w-full items-start gap-2.5 rounded-lg px-3 py-2.5 text-start text-sm hover:bg-accent transition-colors"
                onClick={() => handleSelect(r)}
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {r.street ? `${r.street}, ${r.city}` : r.city || r.displayName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {r.displayName}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
