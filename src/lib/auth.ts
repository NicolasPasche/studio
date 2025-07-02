
export type UserRole = "sales" | "admin" | "proposal" | "hr" | "dev";

export interface User {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  initials: string;
  emailVerified: boolean;
  disabled?: boolean;
}

export const users: Record<UserRole, User> = {
  sales: {
    uid: "mock-sales-uid",
    name: "Alex Johnson",
    email: "sales@example.com",
    role: "sales",
    avatar: "/avatars/01.png",
    initials: "AJ",
    emailVerified: true,
    disabled: false,
  },
  admin: {
    uid: "mock-admin-uid",
    name: "Maria Garcia",
    email: "admin@example.com",
    role: "admin",
    avatar: "/avatars/02.png",
    initials: "MG",
    emailVerified: true,
    disabled: false,
  },
  proposal: {
    uid: "mock-proposal-uid",
    name: "David Chen",
    email: "proposal@example.com",
    role: "proposal",
    avatar: "/avatars/03.png",
    initials: "DC",
    emailVerified: true,
    disabled: false,
  },
  hr: {
    uid: "mock-hr-uid",
    name: "Sarah Lee",
    email: "hr@example.com",
    role: "hr",
    avatar: "/avatars/04.png",
    initials: "SL",
    emailVerified: true,
    disabled: false,
  },
  dev: {
    uid: "mock-dev-uid",
    name: "Dev User",
    email: "nicolas.pasche@proton.me",
    role: "dev",
    avatar: "/avatars/05.png",
    initials: "DV",
    emailVerified: true,
    disabled: false,
  }
};

export const roleDisplayNames: Record<UserRole, string> = {
  admin: "Admin",
  sales: "Sales",
  proposal: "Proposal Engineer",
  hr: "HR",
  dev: "Developer"
};
