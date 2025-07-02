"use client"
import { SignUpForm } from '@/components/signup-form';

export default function ProposalSignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 animated-background">
      <SignUpForm
        title="Proposal Engineer Sign Up"
        description="Create a new proposal engineer account"
        showLoginLink={false}
        roleToAssign="proposal"
      />
    </div>
  );
}
