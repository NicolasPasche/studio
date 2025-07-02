"use client"
import Link from 'next/link';
import { SignUpForm } from '@/components/signup-form';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Code, Shield, Briefcase, UserCog, Users } from 'lucide-react';


export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 animated-background">
      <SignUpForm
        title="Create a Sales Account"
        description="Enter your details to sign up for a sales role"
        roleToAssign="sales"
      />
      <div className="fixed bottom-4 right-4 flex gap-2">
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button asChild variant="outline" size="icon" className="rounded-full">
                        <Link href="/signup/proposal">
                            <UserCog />
                            <span className="sr-only">Proposal Engineer Sign Up</span>
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Proposal Engineer Sign Up</p>
                </TooltipContent>
            </Tooltip>
             <Tooltip>
                <TooltipTrigger asChild>
                    <Button asChild variant="outline" size="icon" className="rounded-full">
                        <Link href="/signup/hr">
                            <Users />
                            <span className="sr-only">HR Sign Up</span>
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>HR Sign Up</p>
                </TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button asChild variant="outline" size="icon" className="rounded-full">
                        <Link href="/signup/admin">
                            <Shield />
                            <span className="sr-only">Admin Sign Up</span>
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Admin Sign Up</p>
                </TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                     <Button asChild variant="outline" size="icon" className="rounded-full">
                        <Link href="/signup/dev">
                            <Code />
                            <span className="sr-only">Developer Sign Up</span>
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Developer Sign Up</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
