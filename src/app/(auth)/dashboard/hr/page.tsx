import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Users2, Briefcase, UserPlus, FileCheck } from "lucide-react";
import { RecentActivities } from "@/components/recent-activities";

export default function HRDashboard() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Human Resources Overview</CardTitle>
          <CardDescription>Key metrics for personnel management.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="opacity-0 animate-fade-up transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_hsl(var(--accent-glow))]" style={{ animationDelay: '100ms' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                <Users2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">215</div>
                <p className="text-xs text-muted-foreground">+5 this quarter</p>
              </CardContent>
            </Card>
            <Card className="opacity-0 animate-fade-up transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_hsl(var(--accent-glow))]" style={{ animationDelay: '200ms' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">3 new this week</p>
              </CardContent>
            </Card>
            <Card className="opacity-0 animate-fade-up transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_hsl(var(--accent-glow))]" style={{ animationDelay: '300ms' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Hires</CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">This quarter</p>
              </CardContent>
            </Card>
            <Card className="opacity-0 animate-fade-up transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_hsl(var(--accent-glow))]" style={{ animationDelay: '400ms' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                <FileCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4</div>
                <p className="text-xs text-muted-foreground">Time-off requests</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
       <RecentActivities />
    </div>
  );
}
