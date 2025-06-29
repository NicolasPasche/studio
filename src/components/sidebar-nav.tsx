"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
    { href: "/opportunities", label: "Assigned Leads", icon: Briefcase },
  ],
  hr: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/employees", label: "Employees", icon: Users2 },
  ],
};

export function SidebarNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  
  const links = navLinksByRole[user.role] || [];
  const allLinks = [...links, ...commonLinks];

  return (
    <nav className="flex flex-col gap-2 px-4">
      {allLinks.map((link) => {
        const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
        return (
          <Button
            key={link.href}
            asChild
            variant={isActive ? "secondary" : "ghost"}
            className="justify-start"
          >
            <Link href={link.href}>
              <link.icon className="mr-2 h-4 w-4" />
              {link.label}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}
