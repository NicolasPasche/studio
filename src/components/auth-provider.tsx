
"use client";

import React, { createContext, useState, useEffect, ReactNode, useMemo } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User as FirebaseUser, signOut } from "firebase/auth";
import { collection, query, where, getDocs, limit, doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { User, UserRole, users as mockUsers } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { developerEmails } from "@/lib/dev-accounts";

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
        await firebaseUser.reload(); // Get the latest user data
        const isDev = developerEmails.includes(firebaseUser.email);

        // This check is now the single source of truth for allowing access.
        if (!isDev && !firebaseUser.emailVerified) {
            toast({
                variant: "destructive",
                title: "Email Verification Required",
                description: "Please check your inbox and verify your email address before logging in.",
                duration: 5000,
            });
            await signOut(auth);
            setRealUser(null);
            setLoading(false);
            router.replace("/signup"); // Redirect to login page
            return; 
        }

        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", firebaseUser.email), limit(1));
        const querySnapshot = await getDocs(q);
        const userDocSnap = querySnapshot.docs.length > 0 ? querySnapshot.docs[0] : null;

        if (isDev) {
            const name = userDocSnap ? userDocSnap.data().name : "Developer";
            setRealUser({
                name: name,
                email: firebaseUser.email,
                role: 'dev',
                avatar: mockUsers.dev.avatar,
                initials: name.substring(0, 2).toUpperCase(),
                emailVerified: true,
            });
        } else if (userDocSnap) {
          const dbData = userDocSnap.data();

          // Sync email verification status from Auth to Firestore
          if (firebaseUser.emailVerified && !dbData.emailVerified) {
            const userDocRef = doc(db, 'users', userDocSnap.id);
            await updateDoc(userDocRef, { emailVerified: true });
            dbData.emailVerified = true; // Update local data to avoid stale state
          }
          
          const userRole = dbData.role as UserRole;
          const userDataFromDb: User = {
            name: dbData.name || firebaseUser.displayName || firebaseUser.email,
            email: firebaseUser.email,
            role: userRole,
            avatar: mockUsers[userRole]?.avatar || "",
            initials: (dbData.name || firebaseUser.displayName || firebaseUser.email).substring(0, 2).toUpperCase(),
            emailVerified: dbData.emailVerified || false,
          };
          setRealUser(userDataFromDb);
        } else {
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: "Your user account is not fully configured. Please contact an administrator.",
          });
          await signOut(auth);
          setRealUser(null);
          router.replace("/signup");
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
