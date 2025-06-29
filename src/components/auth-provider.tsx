"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User as FirebaseUser, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { User, UserRole, users as mockUsers } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export interface AuthContextType {
  user: User | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setLoading(true);
      if (firebaseUser && firebaseUser.email) {
        // 1. Check user_roles collection
        const roleDocRef = doc(db, "user_roles", firebaseUser.email);
        const roleDocSnap = await getDoc(roleDocRef);

        if (roleDocSnap.exists()) {
          const userRole = roleDocSnap.data().role as UserRole;
          
          // 2. Create/update user in users collection
          const userDocRef = doc(db, "users", firebaseUser.uid);
          
          const userData: User = {
            name: firebaseUser.displayName || firebaseUser.email,
            email: firebaseUser.email,
            role: userRole,
            avatar: mockUsers[userRole]?.avatar || "",
            initials: (firebaseUser.displayName || firebaseUser.email).substring(0, 2).toUpperCase(),
          };

          // Set user document in Firestore if it doesn't exist
          const userDocSnap = await getDoc(userDocRef);
          if (!userDocSnap.exists()) {
              await setDoc(userDocRef, { role: userRole, email: firebaseUser.email });
          }
          
          setUser(userData);
        } else {
          // 3. Email not in user_roles, sign out and show error
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: "You do not have permission to access this application.",
          });
          await signOut(auth);
          setUser(null);
          router.replace("/");
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, toast]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
