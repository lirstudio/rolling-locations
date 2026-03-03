import type { User } from "@/types";

export const mockUsers: User[] = [
  {
    id: "user-admin-1",
    name: "רון לוי",
    email: "ron@rollinlocations.com",
    phone: "050-1234567",
    role: "admin",
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "user-host-1",
    name: "מיכל כהן",
    email: "michal@example.com",
    phone: "052-9876543",
    role: "host",
    createdAt: "2025-02-01T00:00:00Z",
  },
  {
    id: "user-host-2",
    name: "דוד אברהם",
    email: "david@example.com",
    phone: "054-1112222",
    role: "host",
    createdAt: "2025-02-15T00:00:00Z",
  },
  {
    id: "user-creator-1",
    name: "נועה שפירא",
    email: "noa@example.com",
    phone: "053-3334444",
    role: "creator",
    createdAt: "2025-03-01T00:00:00Z",
  },
  {
    id: "user-creator-2",
    name: "יונתן בן-דוד",
    email: "yonatan@example.com",
    role: "creator",
    createdAt: "2025-03-10T00:00:00Z",
  },
];

export const mockCurrentUser = mockUsers[0];
