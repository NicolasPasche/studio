"use client";

import React, { createContext, useState, ReactNode } from "react";
import { User, UserRole, users } from "@/lib/auth";

export interface AuthContextType {
  user: User;
  setUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(users.sales);

  const switchRole = (role: UserRole) => {
    const newUser = users[role];
    if (newUser) {
      setUser(newUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}
