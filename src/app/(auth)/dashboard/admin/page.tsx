import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Users, FileText, BarChart3, AlertTriangle, UserCog, Users2, Layers, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { RecentActivities } from "@/components/recent-activities";


export default function AdminDashboard() {
  return (
    <div className="space-y-6">
       <Card>
        <CardHeader>
          <CardTitle>Admin Overview</CardTitle>
          <CardDescription>System-wide statistics and management tools.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="opacity-0 animate-fade-up transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_hsl(var(--accent-glow))]" style={{ animationDelay: '100ms' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,257</div>
                <p className="text-xs text-muted-foreground">+20 since last month</p>
              </CardContent>
            </Card>
            <Card className="opacity-0 animate-fade-up transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_hsl(var(--accent-glow))]" style={{ animationDelay: '200ms' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4,832</div>
                <p className="text-xs text-muted-foreground">+120 this week</p>
              </CardContent>
            </Card>
            <Card className="opacity-0 animate-fade-up transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_hsl(var(--accent-glow))]" style={{ animationDelay: '300ms' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">Nominal</div>
                <p className="text-xs text-muted-foreground">All systems operational</p>
              </CardContent>
            </Card>
            <Card className="opacity-0 animate-fade-up transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_hsl(var(--accent-glow))]" style={{ animationDelay: '400ms' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">Requires immediate attention</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button asChild variant="outline">
                <Link href="/users">
                  <UserCog className="mr-2 h-4 w-4" />
                  Manage Users
                </Link>
            </Button>
              <Button asChild variant="outline">
                <Link href="/customers">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Customers
                </Link>
            </Button>
              <Button asChild variant="outline">
                <Link href="/employees">
                  <Users2 className="mr-2 h-4 w-4" />
                  Manage Employees
                </Link>
            </Button>
            <Button asChild variant="outline">
                <Link href="/opportunities">
                  <Target className="mr-2 h-4 w-4" />
                  Manage Opportunities
                </Link>
            </Button>
          </CardContent>
        </Card>
        <RecentActivities />
      </div>
    </div>
  );
}
