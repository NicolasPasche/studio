
"use client";

import React, { createContext, useState, useEffect, ReactNode, useMemo } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User as FirebaseUser, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";
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

      if (firebaseUser) {
        await firebaseUser.reload(); // Get the latest user data

        if (!firebaseUser.emailVerified) {
            toast({
                variant: "destructive",
                title: "Email Verification Required",
                description: "Please check your inbox and verify your email address before logging in.",
                duration: 5000,
            });
            await signOut(auth);
            setRealUser(null);
            setLoading(false);
            router.replace("/signup");
            return; 
        }

        const userDocRef = doc(db, 'users', firebaseUser.uid);
        let userDocSnap = await getDoc(userDocRef);

        // If user document doesn't exist, create it. This is their first login.
        if (!userDocSnap.exists()) {
            try {
                const userEmail = firebaseUser.email!;
                const userName = firebaseUser.displayName || userEmail.split('@')[0];
                
                let determinedRole: UserRole = 'sales'; // Default role
                
                // Correctly determine the role, prioritizing dev accounts
                if (developerEmails.includes(userEmail)) {
                    determinedRole = 'dev';
                } else {
                    const roleDocRef = doc(db, "user_roles", userEmail);
                    const roleDocSnap = await getDoc(roleDocRef);
                    if (roleDocSnap.exists()) {
                        determinedRole = roleDocSnap.data().role as UserRole;
                    }
                }
                
                const newUserRecord = {
                    name: userName,
                    email: userEmail,
                    role: determinedRole,
                    createdAt: serverTimestamp(),
                    emailVerified: true,
                };
                
                await setDoc(userDocRef, newUserRecord);
                userDocSnap = await getDoc(userDocRef); // Re-fetch the snapshot
            } catch (error) {
                console.error("Failed to create user document in Firestore:", error);
                toast({
                    variant: "destructive",
                    title: "Account Setup Failed",
                    description: "Could not create your user profile. Please contact an administrator.",
                });
                await signOut(auth);
                setRealUser(null);
                setLoading(false);
                return;
            }
        }
        
        // By now, the document should exist.
        if (userDocSnap.exists()) {
          const dbData = userDocSnap.data();

          // Sync email verification status from Auth to Firestore
          if (firebaseUser.emailVerified && !dbData.emailVerified) {
            await updateDoc(userDocRef, { emailVerified: true });
            dbData.emailVerified = true;
          }
          
          const userRole = dbData.role as UserRole;
          const userDataFromDb: User = {
            name: dbData.name,
            email: dbData.email,
            role: userRole,
            avatar: mockUsers[userRole]?.avatar || "",
            initials: (dbData.name || "").substring(0, 2).toUpperCase(),
            emailVerified: dbData.emailVerified,
          };
          setRealUser(userDataFromDb);
        } else {
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: "Could not find your user profile. Please contact an administrator.",
          });
          await signOut(auth);
          setRealUser(null);
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
