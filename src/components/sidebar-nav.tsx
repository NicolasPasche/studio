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
  Code,
  UserCog,
  Layers,
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
    { href: "/users", label: "User Management", icon: UserCog },
    { href: "/customers", label: "Customer Mgmt", icon: Users },
    { href: "/employees", label: "Employee Mgmt", icon: Users2 },
    { href: "/scaffolding-leads", label: "Scaffolding Leads", icon: Layers },
    { href: "/opportunities", label: "Formwork Pipeline", icon: Target },
  ],
  proposal: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/opportunities", label: "Opportunities", icon: Target },
  ],
  hr: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/employees", label: "Employees", icon: Users2 },
  ],
  dev: [
     { href: "/dashboard/dev", label: "Dev Controls", icon: Code },
  ]
};

export function SidebarNav() {
  const pathname = usePathname();
  const { user, realUser } = useAuth();
  
  if (!user) {
     return (
        <SidebarMenu className="gap-2 px-2">
            {[...Array(4)].map((_, i) => <SidebarMenuSkeleton key={i} showIcon />)}
        </SidebarMenu>
    );
  }

  const roleToDisplay = realUser?.role === 'dev' ? user.role : realUser?.role;
  const links = navLinksByRole[roleToDisplay || 'sales'] || [];
  
  // Combine role-specific links with common links, ensuring no duplicates
  const allLinks = [...links];
  commonLinks.forEach(commonLink => {
    if (!links.find(link => link.href === commonLink.href)) {
      allLinks.push(commonLink);
    }
  });


  return (
    <SidebarMenu className="gap-2 px-2">
      {allLinks.map((link) => {
        const isDashboardLink = link.href === "/dashboard";
        const isActive = isDashboardLink 
            ? pathname.startsWith('/dashboard') && !pathname.includes('/dashboard/dev')
            : pathname.startsWith(link.href);

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
