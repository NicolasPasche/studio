
"use client";

import React, { createContext, useState, useEffect, ReactNode, useMemo } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User as FirebaseUser, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { User, UserRole, users as mockUsers } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export interface AuthContextType {
  user: User | null;
  realUser: User | null;
  loading: boolean;
  setImpersonatedRole: (role: UserRole | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [realUser, setRealUser] = useState<User | null>(null);
  const [impersonatedRole, setImpersonatedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // DEV BACKDOOR: Allow role simulation via query parameter
    const searchParams = new URLSearchParams(window.location.search);
    const devRole = searchParams.get("dev_role") as UserRole | null;

    if (process.env.NODE_ENV === "development" && devRole && mockUsers[devRole]) {
      console.log(`DEV MODE: Simulating login for role: ${devRole}`);
      const simulatedUser = mockUsers[devRole];
      setRealUser(simulatedUser);
      // For the backdoor, user and realUser are the same
      setLoading(false);
      return; // Skip Firebase auth listener setup
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setLoading(true);
      setImpersonatedRole(null); // Reset impersonation on auth state change

      if (firebaseUser && firebaseUser.email) {
        let userRole: UserRole | null = null;
        
        // Special case for dev users
        const devEmails = ['nicolas.pasche@proton.me', 'nicolas.pasche@ksh.edu'];
        if (devEmails.includes(firebaseUser.email)) {
            userRole = 'dev';
        } else {
            // 1. Check user_roles collection for other users
            const roleDocRef = doc(db, "user_roles", firebaseUser.email);
            const roleDocSnap = await getDoc(roleDocRef);
            if (roleDocSnap.exists()) {
                userRole = roleDocSnap.data().role as UserRole;
            }
        }

        if (userRole) {
          // 2. Create/update user in users collection
          const userDocRef = doc(db, "users", firebaseUser.uid);
          
          const userData: User = {
            name: firebaseUser.displayName || firebaseUser.email,
            email: firebaseUser.email,
            role: userRole,
            avatar: mockUsers[userRole]?.avatar || "",
            initials: (firebaseUser.displayName || firebaseUser.email).substring(0, 2).toUpperCase(),
          };

          const userDocSnap = await getDoc(userDocRef);
          if (!userDocSnap.exists()) {
              await setDoc(userDocRef, { 
                role: userRole, 
                email: firebaseUser.email, 
                name: userData.name,
                createdAt: serverTimestamp()
              });
          }
          
          setRealUser(userData);
        } else {
          // 3. Email not in user_roles, sign out and show error
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: "You do not have permission to access this application.",
          });
          await signOut(auth);
          setRealUser(null);
          router.replace("/");
        }
      } else {
        setRealUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, toast]);
  
  const user = useMemo(() => {
    if (impersonatedRole && realUser?.role === 'dev') {
        return {
            ...mockUsers[impersonatedRole],
             // keep original dev user's email for display if needed
            email: realUser.email,
            name: realUser.name,
        };
    }
    return realUser;
  }, [realUser, impersonatedRole]);


  return (
    <AuthContext.Provider value={{ user, realUser, loading, setImpersonatedRole }}>
      {children}
    </AuthContext.Provider>
  );
}
