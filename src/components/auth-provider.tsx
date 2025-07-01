
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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setLoading(true);
      setImpersonatedRole(null); // Reset impersonation on auth state change

      if (firebaseUser && firebaseUser.email) {
        // 1. Check if the user document already exists in the 'users' collection.
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        let userRole: UserRole | null = null;
        let userDataFromDb: User | null = null;

        if (userDocSnap.exists()) {
          // User document exists, get role from there. This is the primary source of truth.
          const dbData = userDocSnap.data();
          userRole = dbData.role;
          userDataFromDb = {
            name: dbData.name || firebaseUser.displayName || firebaseUser.email,
            email: firebaseUser.email,
            role: userRole!,
            avatar: mockUsers[userRole!]?.avatar || "",
            initials: (dbData.name || firebaseUser.displayName || firebaseUser.email).substring(0, 2).toUpperCase(),
          };
        } else {
          // 2. If user doc doesn't exist, this might be a first login for an invited user.
          // Check the 'user_roles' collection.
          const roleDocRef = doc(db, "user_roles", firebaseUser.email);
          const roleDocSnap = await getDoc(roleDocRef);
          if (roleDocSnap.exists()) {
              userRole = roleDocSnap.data().role as UserRole;
              
              // Now create the user document in 'users' collection
              const newUserDocData = { 
                role: userRole, 
                email: firebaseUser.email, 
                name: firebaseUser.displayName || firebaseUser.email,
                createdAt: serverTimestamp()
              };
              await setDoc(userDocRef, newUserDocData);

              userDataFromDb = {
                name: newUserDocData.name,
                email: firebaseUser.email,
                role: userRole,
                avatar: mockUsers[userRole]?.avatar || "",
                initials: (newUserDocData.name).substring(0, 2).toUpperCase(),
              };
          }
        }
        
        if (userDataFromDb) {
            setRealUser(userDataFromDb);
        } else {
          // 3. User is not in 'users' or 'user_roles'. Deny access.
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
