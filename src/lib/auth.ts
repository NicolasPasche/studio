
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
  readme?: string;
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
    readme: "Sales professional focused on driving growth and building strong customer relationships.",
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
    readme: "Administrator overseeing system operations and user management.",
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
    readme: "Proposal engineer specializing in formwork solutions.",
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
    readme: "Human resources manager dedicated to fostering a positive work environment.",
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
    readme: "Developer building and maintaining the Tobler Workflow application.",
  }
};

export const roleDisplayNames: Record<UserRole, string> = {
  admin: "Admin",
  sales: "Sales",
  proposal: "Proposal Engineer",
  hr: "HR",
  dev: "Developer"
};
