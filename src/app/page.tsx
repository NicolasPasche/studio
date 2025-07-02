
"use client"
import Link from 'next/link';
import { SignUpForm } from '@/components/signup-form';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Code, Shield, UserCog, Users, ChevronLeft } from 'lucide-react';


export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 animated-background">
      <SignUpForm
        title="Create a Sales Account"
        description="Enter your details to sign up for a sales role"
        roleToAssign="sales"
      />
      <TooltipProvider>
        {/* Standard Roles */}
        <div className="fixed bottom-4 right-4 flex items-center gap-2">
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
        </div>
        
        {/* Advanced Roles */}
        <div className="fixed top-1/2 right-4 -translate-y-1/2">
            <DropdownMenu>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="rounded-full">
                                <ChevronLeft className="h-4 w-4" />
                                <span className="sr-only">Advanced sign-up options</span>
                            </Button>
                        </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                        <p>Advanced Sign Up</p>
                    </TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end" side="left">
                    <DropdownMenuLabel>Advanced Roles</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href="/signup/admin">
                            <Shield />
                            <span>Admin</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                         <Link href="/signup/dev">
                            <Code />
                            <span>Developer</span>
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </TooltipProvider>
    </div>
  );
}
