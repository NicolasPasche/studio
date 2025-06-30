export type UserRole = "sales" | "admin" | "proposal" | "hr" | "dev";

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
    email: "sales@example.com",
    role: "sales",
    avatar: "/avatars/01.png",
    initials: "AJ",
  },
  admin: {
    name: "Maria Garcia",
    email: "admin@example.com",
    role: "admin",
    avatar: "/avatars/02.png",
    initials: "MG",
  },
  proposal: {
    name: "David Chen",
    email: "proposal@example.com",
    role: "proposal",
    avatar: "/avatars/03.png",
    initials: "DC",
  },
  hr: {
    name: "Sarah Lee",
    email: "hr@example.com",
    role: "hr",
    avatar: "/avatars/04.png",
    initials: "SL",
  },
  dev: {
    name: "Dev User",
    email: "nicolas.pasche@proton.me",
    role: "dev",
    avatar: "/avatars/05.png",
    initials: "DV",
  }
};

export const roleDisplayNames: Record<UserRole, string> = {
  admin: "Admin",
  sales: "Sales",
  proposal: "Proposal Engineer",
  hr: "HR",
  dev: "Developer"
};
