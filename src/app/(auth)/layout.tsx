
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider } from "@/components/auth-provider";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/header";
import { SidebarNav } from "@/components/sidebar-nav";
import { Icons } from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const handleLogout = async () => {
  await signOut(auth);
};

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, realUser, loading, setImpersonatedRole } = useAuth();
  const router = useRouter();

  const isImpersonating = realUser?.role === 'dev' && user?.role !== realUser?.role;

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="w-full max-w-4xl space-y-4 p-4">
          <div className="grid grid-cols-4 gap-4">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }
  
  const handleReturnToDevView = () => {
    setImpersonatedRole(null);
    router.push('/dashboard/dev');
  }

  return (
    <SidebarProvider>
      <Sidebar
        className="bg-sidebar text-sidebar-foreground border-r"
        collapsible="icon"
      >
        <SidebarHeader className="p-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Icons.logo className="h-8 w-8 text-primary" />
            <span className="text-xl font-semibold font-headline group-data-[state=collapsed]:hidden">
              Tobler Workflow
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter className="p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleLogout}
                variant="ghost"
                className="w-full justify-start"
                tooltip={{
                  children: "Logout",
                  side: "right",
                  align: "center",
                }}
              >
                <LogOut />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col min-h-screen">
           {isImpersonating && (
              <div className="bg-yellow-400 text-black p-2 text-center text-sm flex justify-center items-center gap-4 z-50">
                <span>You are viewing the app as a <strong className="capitalize">{user?.role}</strong>.</span>
                <Button variant="link" className="text-black h-auto p-0 underline" onClick={handleReturnToDevView}>Return to Dev View</Button>
              </div>
            )}
          <Header />
          <main className="flex-1 p-4 md:p-6 lg:p-8 bg-secondary/30">
            <div className="opacity-0 animate-fade-in">
              {children}
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ProtectedLayout>{children}</ProtectedLayout>
    </AuthProvider>
  );
}
