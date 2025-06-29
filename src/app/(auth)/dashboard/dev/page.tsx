"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { UserRole, users } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Briefcase, UserCog, Shield, Code } from "lucide-react";
import React from "react";

const roleIcons: Record<UserRole, React.ElementType> = {
    admin: Shield,
    sales: Briefcase,
    proposal: UserCog,
    hr: Users,
    dev: Code,
}

export default function DevDashboard() {
  const { setImpersonatedRole } = useAuth();
  const router = useRouter();

  const handleRoleSelect = (role: UserRole) => {
    setImpersonatedRole(role);
    router.push("/dashboard");
  };

  const availableRoles = (Object.keys(users) as UserRole[]).filter(r => r !== 'dev');

  return (
    <div className="flex justify-center items-center h-full">
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Developer Controls</CardTitle>
                <CardDescription>Select a role to impersonate and view the application from their perspective.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
                {availableRoles.map(role => {
                    const Icon = roleIcons[role];
                    return (
                        <Button key={role} variant="outline" className="h-20 flex-col gap-2" onClick={() => handleRoleSelect(role)}>
                           <Icon className="h-6 w-6" />
                           <span className="capitalize">{role}</span>
                        </Button>
                    )
                })}
            </CardContent>
        </Card>
    </div>
  );
}
