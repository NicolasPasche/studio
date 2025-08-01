
'use client';
import React, {useState, useEffect} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {signInWithEmailAndPassword} from 'firebase/auth';
import {auth} from '@/lib/firebase';
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
import { useAuth } from '@/hooks/use-auth';
import { developerEmails } from '@/lib/dev-accounts';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace('/dashboard');
    }
  }, [user, router]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get the latest user data
      await user.reload();

      if (!user.emailVerified) {
        setError("Please verify your email address before logging in. We've sent a link to your inbox.");
        await auth.signOut();
        setLoading(false);
        return;
      }
      
      // Let the AuthProvider handle the redirect
      // The useEffect hook will catch the user state change and redirect.

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
    } finally {
        if (!auth.currentUser || !auth.currentUser.emailVerified) {
             setLoading(false);
        }
    }
  };
  
  // Disable form if auth is still loading to prevent race conditions
  const isFormDisabled = loading || authLoading;

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
                disabled={isFormDisabled}
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
                disabled={isFormDisabled}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isFormDisabled}
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
