"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  Users,
  Target,
  FilePlus2,
  Settings,
  Briefcase,
  Users2,
} from "lucide-react";
import type { UserRole } from "@/lib/auth";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuSkeleton } from "@/components/ui/sidebar";

const commonLinks = [
  { href: "/settings", label: "Settings", icon: Settings },
];

const navLinksByRole: Record<UserRole, { href: string; label: string; icon: React.ElementType }[]> = {
  sales: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/customers", label: "Customers", icon: Users },
    { href: "/opportunities", label: "Opportunities", icon: Target },
    { href: "/leads/capture", label: "Lead Capture", icon: FilePlus2 },
  ],
  admin: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/customers", label: "Customer Mgmt", icon: Users },
  ],
  proposal: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/proposal", label: "Assigned Leads", icon: Briefcase },
  ],
  hr: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/employees", label: "Employees", icon: Users2 },
  ],
};

export function SidebarNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  
  if (!user) {
     return (
        <SidebarMenu className="gap-2 px-2">
            {[...Array(4)].map((_, i) => <SidebarMenuSkeleton key={i} showIcon />)}
        </SidebarMenu>
    );
  }

  const links = navLinksByRole[user.role] || [];
  const allLinks = [...links, ...commonLinks];

  return (
    <SidebarMenu className="gap-2 px-2">
      {allLinks.map((link) => {
        const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href) && link.href !== '/');
        return (
          <SidebarMenuItem key={link.href}>
            <SidebarMenuButton
              asChild
              variant={isActive ? "secondary" : "ghost"}
              isActive={isActive}
              className="justify-start w-full"
              tooltip={{
                children: link.label,
                side: "right",
                align: "center",
              }}
            >
              <Link href={link.href}>
                <link.icon />
                <span>{link.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
