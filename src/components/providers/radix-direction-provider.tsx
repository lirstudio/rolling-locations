"use client";

import * as React from "react";
import { DirectionProvider } from "@radix-ui/react-direction";
import { useLocale } from "next-intl";

export function RadixDirectionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = useLocale();
  const dir = locale === "he" ? "rtl" : "ltr";

  return <DirectionProvider dir={dir}>{children}</DirectionProvider>;
}
