"use client";

import { AuthProvider } from "@/components/auth-provider";
import { Header } from "@/components/header";
import { SidebarNav } from "@/components/sidebar-nav";
import { Icons } from "@/components/icons";
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

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <Sidebar className="bg-sidebar text-sidebar-foreground border-r" collapsible="icon">
          <SidebarHeader className="p-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Icons.logo className="h-8 w-8 text-primary" />
              <span className="text-xl font-semibold font-headline group-data-[state=collapsed]:hidden">Apex Workflow</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarNav />
          </SidebarContent>
          <SidebarFooter className="p-2">
             <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild variant="ghost" className="w-full justify-start" tooltip={{
                  children: "Logout",
                  side: "right",
                  align: "center",
                }}>
                  <Link href="/">
                    <LogOut />
                    <span>Logout</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
            <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1 p-4 md:p-6 lg:p-8 bg-secondary/30">
                    {children}
                </main>
            </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthProvider>
  );
}
