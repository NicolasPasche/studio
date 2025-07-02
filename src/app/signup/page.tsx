
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
import { developerEmails } from '@/lib/dev-accounts';

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
      // 1. Sign in the user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. IMPORTANT: Reload user data to get the latest emailVerified state
      await user.reload();

      // 3. Check if user is a developer (for bypass)
      const isDevUser = developerEmails.includes(user.email || '');
      
      // 4. Check for verification. Allow access if verified OR if they are a dev user.
      if (user.emailVerified || isDevUser) {
        // Login successful, proceed to dashboard
        router.push('/dashboard');
      } else {
        // Not verified and not a dev, so sign them out and show an error.
        await signOut(auth); 
        setError("Please verify your email address before logging in. Check your inbox (and spam folder!) for a verification link.");
        setLoading(false);
      }

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
          message = 'Network error. Please check your internet connection.';
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
