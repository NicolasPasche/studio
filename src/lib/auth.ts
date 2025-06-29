export type UserRole = "sales" | "admin" | "proposal" | "hr";

export interface User {
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  initials: string;
}

export const users: Record<UserRole, User> = {
  sales: {
    name: "Alex Johnson",
    email: "alex.j@apex.com",
    role: "sales",
    avatar: "/avatars/01.png",
    initials: "AJ",
  },
  admin: {
    name: "Maria Garcia",
    email: "maria.g@apex.com",
    role: "admin",
    avatar: "/avatars/02.png",
    initials: "MG",
  },
  proposal: {
    name: "David Chen",
    email: "david.c@apex.com",
    role: "proposal",
    avatar: "/avatars/03.png",
    initials: "DC",
  },
  hr: {
    name: "Sarah Lee",
    email: "sarah.l@apex.com",
    role: "hr",
    avatar: "/avatars/04.png",
    initials: "SL",
  },
};
