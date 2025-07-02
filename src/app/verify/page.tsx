
'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getAuth, applyActionCode } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Icons } from '@/components/icons';

function VerifyComponent() {
  const params = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');
  const auth = getAuth();

  useEffect(() => {
    const oobCode = params.get('oobCode');

    if (!oobCode) {
      setStatus('error');
      setError('Missing verification code. Please check the link and try again.');
      return;
    }

    applyActionCode(auth, oobCode)
      .then(() => {
        setStatus('success');
      })
      .catch((err) => {
        console.error('Email verification failed:', err);
        switch (err.code) {
          case 'auth/expired-action-code':
            setError('The verification link has expired. Please try signing up again.');
            break;
          case 'auth/invalid-action-code':
            setError('The verification link is invalid. It may have already been used or is malformed.');
            break;
          case 'auth/user-disabled':
            setError('Your account has been disabled by an administrator.');
            break;
          default:
            setError('An unknown error occurred. Please try again.');
        }
        setStatus('error');
      });
  }, [params, auth]);

  return (
     <div className="flex min-h-screen items-center justify-center p-4 animated-background">
        <Card className="w-full max-w-md text-center">
            <CardHeader>
                 <div className="mb-4 flex justify-center">
                    <Icons.logo className="h-12 w-12 text-primary" />
                </div>
                <CardTitle>Email Verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
            {status === 'loading' && (
                <div className="flex flex-col items-center gap-4 p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Verifying your email...</p>
                </div>
            )}
            {status === 'success' && (
                <div className="flex flex-col items-center gap-4 p-8">
                    <CheckCircle className="h-12 w-12 text-green-500" />
                    <CardDescription>Your email has been successfully verified! You can now sign in to your account.</CardDescription>
                    <Button onClick={() => router.push('/signup')} className="w-full">
                        Proceed to Sign In
                    </Button>
                </div>
            )}
            {status === 'error' && (
                <div className="flex flex-col items-center gap-4 p-8">
                    <XCircle className="h-12 w-12 text-destructive" />
                    <CardDescription>{error}</CardDescription>
                     <Button onClick={() => router.push('/signup')} variant="outline" className="w-full">
                        Back to Sign In
                    </Button>
                </div>
            )}
            </CardContent>
        </Card>
    </div>
  );
}


export default function VerifyPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyComponent />
        </Suspense>
    )
}
