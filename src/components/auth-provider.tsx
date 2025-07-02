"use client";

import React, { createContext, useState, useEffect, ReactNode, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User as FirebaseUser, signOut, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { User, UserRole, users as mockUsers } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export interface AuthContextType {
  user: User | null;
  realUser: User | null;
  loading: boolean;
  setImpersonatedRole: (role: UserRole | null) => void;
  updateUser: (newUserData: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [realUser, setRealUser] = useState<User | null>(null);
  const [impersonatedRole, setImpersonatedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const updateUser = useCallback((newUserData: Partial<User>) => {
    setRealUser(prevUser => {
        if (!prevUser) return null;
        return { ...prevUser, ...newUserData };
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setLoading(true);
      setImpersonatedRole(null); // Reset impersonation on auth state change

      if (firebaseUser) {
        await firebaseUser.reload(); // Get the latest user data

        const userDocRef = doc(db, 'users', firebaseUser.uid);
        let userDocSnap = await getDoc(userDocRef);

        // If user document doesn't exist, create it. This is their first login.
        if (!userDocSnap.exists()) {
            try {
                const userEmail = firebaseUser.email!;
                
                // For regular users, an admin must have pre-registered their role.
                const roleDocRef = doc(db, 'user_roles', userEmail);
                const roleDocSnap = await getDoc(roleDocRef);

                if (!roleDocSnap.exists()) {
                  // If the role doesn't exist, this is an unauthorized sign-up.
                  toast({
                    variant: "destructive",
                    title: "Access Denied",
                    description: "Your email has not been invited. Please contact an administrator.",
                  });
                  await firebaseUser.delete(); // Delete the unauthorized auth user.
                  await signOut(auth);
                  setRealUser(null);
                  setLoading(false);
                  return;
                }
                
                const finalRole = roleDocSnap.data().role as UserRole;
                const displayName = firebaseUser.displayName || userEmail.split('@')[0];

                const newUserRecord = {
                    name: displayName,
                    email: userEmail,
                    role: finalRole,
                    createdAt: serverTimestamp(),
                    emailVerified: true, // They must be verified to get here
                    disabled: false,
                };
                
                await setDoc(userDocRef, newUserRecord);
                
                // If the user's display name had a role suffix, clean it up.
                if (firebaseUser.displayName?.includes('__')) {
                   await updateProfile(firebaseUser, { displayName });
                }

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

          if (dbData.disabled) {
            toast({
                variant: "destructive",
                title: "Account Restricted",
                description: "This account has been restricted by an administrator.",
            });
            await signOut(auth);
            setRealUser(null);
            setLoading(false);
            router.replace("/signup");
            return;
          }
          
          const userRole = dbData.role as UserRole;
          const userDataFromDb: User = {
            uid: firebaseUser.uid,
            name: dbData.name,
            email: dbData.email,
            role: userRole,
            avatar: dbData.avatar || firebaseUser.photoURL || mockUsers[userRole]?.avatar || "",
            initials: (dbData.name || "").substring(0, 2).toUpperCase(),
            emailVerified: dbData.emailVerified,
            disabled: dbData.disabled || false,
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
            ...realUser,
            role: impersonatedRole,
        };
    }
    return realUser;
  }, [realUser, impersonatedRole]);


  return (
    <AuthContext.Provider value={{ user, realUser, loading, setImpersonatedRole, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
