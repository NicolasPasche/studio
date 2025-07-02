"use client"
import { SignUpForm } from '@/components/signup-form';

export default function DevSignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 animated-background">
      <SignUpForm
        title="Developer Sign Up"
        description="Create a new developer account with impersonation abilities"
        showLoginLink={false}
      />
    </div>
  );
}
