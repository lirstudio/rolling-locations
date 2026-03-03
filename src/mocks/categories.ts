import type { Category } from "@/types";

export const mockCategories: Category[] = [
  {
    id: "cat-1",
    name: "סטודיו לצילום",
    slug: "photography-studio",
    order: 1,
    visible: true,
  },
  {
    id: "cat-2",
    name: "גג / חוץ",
    slug: "rooftop-outdoor",
    order: 2,
    visible: true,
  },
  {
    id: "cat-3",
    name: "דירת לוקיישן",
    slug: "apartment",
    order: 3,
    visible: true,
  },
  {
    id: "cat-4",
    name: "סביבה תעשייתית",
    slug: "industrial",
    order: 4,
    visible: true,
  },
  {
    id: "cat-5",
    name: "טבע / חקלאות",
    slug: "nature",
    order: 5,
    visible: false,
  },
];
