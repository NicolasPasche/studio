'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { CheckCircle2, Cloud, Database, Server } from "lucide-react";

export default function SystemHealthPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>System Health Status</CardTitle>
          <CardDescription>Real-time status of all system components.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <Server className="h-8 w-8 text-primary" />
              <div>
                <h3 className="text-lg font-medium">Application Servers</h3>
                <p className="text-sm text-muted-foreground">Main web and API servers.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-accent font-semibold">
              <CheckCircle2 className="h-5 w-5" />
              <span>Operational</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <Database className="h-8 w-8 text-primary" />
              <div>
                <h3 className="text-lg font-medium">Firestore Database</h3>
                <p className="text-sm text-muted-foreground">Primary data storage.</p>
              </div>
            </div>
             <div className="flex items-center gap-2 text-accent font-semibold">
              <CheckCircle2 className="h-5 w-5" />
              <span>Operational</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <Cloud className="h-8 w-8 text-primary" />
              <div>
                <h3 className="text-lg font-medium">Third-Party Services</h3>
                <p className="text-sm text-muted-foreground">External API integrations.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-accent font-semibold">
              <CheckCircle2 className="h-5 w-5" />
              <span>Operational</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
