
"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LogOut, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { UserProfileDialog } from "./user-profile-dialog";

const handleLogout = async () => {
  await signOut(auth);
};

export function Header() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const getPageTitle = () => {
    const segments = pathname.split("/").filter(Boolean);
    const first = segments[0];
    
    if (first === "dashboard") return "Dashboard";

    const last = segments[segments.length - 1];
    if (last === "capture") return "Lead Capture";
    if (last) return last.charAt(0).toUpperCase() + last.slice(1);
    
    return "Dashboard";
  };
  
  if (!user) {
    return (
       <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold md:text-2xl font-headline">{getPageTitle()}</h1>
       </header>
    );
  }
  
  return (
    <>
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold md:text-2xl font-headline">{getPageTitle()}</h1>
        <div className="ml-auto flex items-center gap-4">
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.initials}</AvatarFallback>
                </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                    </p>
                </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                 <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
                    <User className="mr-2 h-4 w-4" />
                    <span>View Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
        </header>
         <UserProfileDialog
            user={user}
            isOpen={isProfileOpen}
            onOpenChange={setIsProfileOpen}
        />
    </>
  );
}
