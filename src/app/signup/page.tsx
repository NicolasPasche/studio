
'use client';
import React, {useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {signInWithEmailAndPassword, signOut} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import {auth, db} from '@/lib/firebase';
import {Button} from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Icons} from '@/components/icons';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {AlertTriangle, Loader2} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // IMPORTANT: Reload the user object to get the latest emailVerified state from Firebase.
      const user = userCredential.user;
      await user.reload();

      // Now, get the user's role from Firestore to check for the developer exception.
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      const isDevUser = userDocSnap.exists() && userDocSnap.data().role === 'dev';
      
      // Check for verification. Dev users are exempt.
      if (!user.emailVerified && !isDevUser) {
        await signOut(auth); // Sign out the unverified user.
        setError("Please verify your email address before logging in. Check your inbox (and spam folder!) for a verification link.");
        setLoading(false);
        return; // Stop the login process.
      }
      
      // If verified (or a dev user), proceed to the dashboard.
      router.push('/dashboard');

    } catch (err: any) {
      console.error('Firebase Auth Error:', err);
      let message;

      switch (err.code) {
        case 'auth/invalid-email':
          message =
            'The email address is not valid. Please check and try again.';
          break;
        case 'auth/invalid-credential':
          message = 'Invalid credentials. Please check your email and password.';
          break;
        case 'auth/user-disabled':
          message = 'This user account has been disabled.';
          break;
        case 'auth/network-request-failed':
        case 'auth/invalid-api-key':
        case 'auth/api-key-not-valid':
        case 'auth/app-deleted':
        case 'auth/invalid-app-credential':
          message =
            'Network error or invalid configuration. Please check your internet connection and Firebase project setup in `src/lib/firebase.ts`.';
          break;
        default:
          message = `An unexpected error occurred: ${err.message}`;
      }
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 animated-background">
      <Card className="w-full max-w-sm shadow-2xl animate-fade-in">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Icons.logo className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-headline">Tobler Workflow</CardTitle>
          <CardDescription>Sign in to access your dashboard</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Login Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-sm text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
              ) : (
                'Sign In'
              )}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
