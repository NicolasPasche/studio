
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword, sendEmailVerification, signOut, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { UserRole } from '@/lib/auth';

interface SignUpFormProps {
    title: string;
    description: string;
    showLoginLink?: boolean;
    roleToAssign?: UserRole;
}

export function SignUpForm({ title, description, showLoginLink = true, roleToAssign = 'sales' }: SignUpFormProps) {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<React.ReactNode>('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSignUp = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        if (roleToAssign === 'dev' && !name.endsWith('__dev')) {
            setError("To sign up as a developer, your first name must end with '__dev'.");
            setLoading(false);
            return;
        }

        try {
            // 1. Create the user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Set their display name with a role suffix for later processing.
            let displayNameWithRole: string;
            if (roleToAssign === 'dev') {
                // For dev sign-up, the user is expected to enter the suffix manually.
                displayNameWithRole = name;
            } else {
                // For other roles, we append the suffix automatically.
                displayNameWithRole = `${name}__${roleToAssign}`;
            }
            await updateProfile(user, { displayName: displayNameWithRole });
            
            // 3. Send the verification email.
            await sendEmailVerification(user);

            // 4. Sign the user out so they must verify their email before logging in.
            await signOut(auth);

            // 5. Show the success message
            setSuccess(true);

        } catch (err: any) {
            console.error("Firebase Auth Error:", err);
            let message: React.ReactNode;
             // Check for the specific permission error first
            if (err.message?.includes('Missing or insufficient permissions')) {
                message = "An unexpected error occurred: Missing or insufficient permissions.";
            } else {
                switch (err.code) {
                    case 'auth/email-already-in-use':
                        message = (
                            <>
                                This email address is already in use.{" "}
                                <Link href="/signup" className="font-bold underline hover:text-destructive-foreground">
                                    Please sign in instead.
                                </Link>
                            </>
                        );
                        break;
                    case 'auth/invalid-email':
                        message = "The email address you entered is not valid.";
                        break;
                    case 'auth/operation-not-allowed':
                        message = "Account creation is not enabled. Please contact an administrator.";
                        break;
                    case 'auth/weak-password':
                        message = "The password is too weak. Please use at least 6 characters.";
                        break;
                    default:
                        message = `An unexpected error occurred: ${err.message}`;
                }
            }
            setError(message);
        } finally {
            setLoading(false);
        }
    };
    
    const successMessage = "Your account has been created. We've sent a verification link to your email. Please check your inbox (and spam folder!) and click the link to activate your account before you can sign in.";
    const successTitle = "Verification Email Sent";

    return (
        <Card className="w-full max-w-sm shadow-2xl animate-fade-in">
            <CardHeader className="text-center">
                <div className="mb-4 flex justify-center">
                    <Icons.logo className="h-12 w-12 text-primary" />
                </div>
                <CardTitle className="text-2xl font-headline">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            {success ? (
                <CardContent className="space-y-4">
                    <Alert variant="default" className="border-green-500/50 bg-green-500/10">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <AlertTitle className="text-green-600">{successTitle}</AlertTitle>
                        <AlertDescription>
                           {successMessage}
                        </AlertDescription>
                    </Alert>
                     <Button 
                        onClick={() => router.push('/signup')} 
                        className="w-full"
                    >
                        Proceed to Sign In
                    </Button>
                </CardContent>
            ) : (
                <form onSubmit={handleSignUp}>
                    <CardContent className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Sign Up Failed</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="name">First Name</Label>
                            <Input id="name" placeholder="John" required value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="your@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </Button>
                        {showLoginLink && (
                             <div className="text-center text-sm text-muted-foreground">
                                Already have an account?{" "}
                                <Link href="/signup" className="text-primary hover:underline">
                                Sign in
                                </Link>
                            </div>
                        )}
                    </CardFooter>
                </form>
            )}
        </Card>
    );
}
