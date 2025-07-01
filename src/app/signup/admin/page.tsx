"use client"
import { SignUpForm } from '@/components/signup-form';

export default function AdminSignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 animated-background">
      <SignUpForm
        title="Admin Sign Up"
        description="Create a new administrator account with full permissions"
        roleToAssign="admin"
        showLoginLink={false}
      />
    </div>
  );
}
