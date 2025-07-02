"use client"
import { SignUpForm } from '@/components/signup-form';

export default function HrSignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 animated-background">
      <SignUpForm
        title="HR Sign Up"
        description="Create a new human resources account"
        showLoginLink={false}
        roleToAssign="hr"
      />
    </div>
  );
}
