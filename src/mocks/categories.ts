import type { Category } from "@/types";

export const mockCategories: Category[] = [
  { id: "cat-1", name: "סטודיו", slug: "studio", order: 1, visible: true },
  { id: "cat-2", name: "פודקאסט", slug: "podcast", order: 2, visible: true },
  { id: "cat-3", name: "צילומי חוץ", slug: "outdoor-photography", order: 3, visible: true },
  { id: "cat-4", name: "אולם להשכרה", slug: "event-hall", order: 4, visible: true },
  { id: "cat-5", name: "משרדים להשכרה", slug: "offices", order: 5, visible: true },
  { id: "cat-5-1", name: "קומה להשכרה", slug: "office-floor", order: 1, visible: true, parentId: "cat-5" },
  { id: "cat-5-2", name: "משרד", slug: "office", order: 2, visible: true, parentId: "cat-5" },
  { id: "cat-5-3", name: "חדר ישיבות", slug: "meeting-room", order: 3, visible: true, parentId: "cat-5" },
  { id: "cat-6", name: "פרסומת", slug: "commercial", order: 6, visible: true },
  { id: "cat-7", name: "כנס", slug: "conference", order: 7, visible: true },
];
