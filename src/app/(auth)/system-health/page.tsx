
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, Cpu, Database, Server } from 'lucide-react';

const StatusIndicator = ({ status }: { status: 'operational' | 'degraded' | 'outage' }) => {
    const statusConfig = {
        operational: {
            Icon: CheckCircle,
            text: 'Operational',
            color: 'text-green-500',
        },
        degraded: {
            Icon: AlertTriangle,
            text: 'Degraded Performance',
            color: 'text-yellow-500',
        },
        outage: {
            Icon: AlertTriangle,
            text: 'Service Outage',
            color: 'text-destructive',
        }
    };
    const { Icon, text, color } = statusConfig[status];
    return (
        <div className={`flex items-center gap-2 font-medium ${color}`}>
            <Icon className="h-5 w-5" />
            <span>{text}</span>
        </div>
    );
};

export default function SystemHealthPage() {
  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>System Health Status</CardTitle>
                <CardDescription>Real-time status of all system components.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <div className="flex items-center gap-3">
                            <Server className="h-6 w-6 text-muted-foreground" />
                            <h3 className="text-lg font-semibold">Application Servers</h3>
                        </div>
                        <StatusIndicator status="operational" />
                    </CardHeader>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                         <div className="flex items-center gap-3">
                            <Database className="h-6 w-6 text-muted-foreground" />
                            <h3 className="text-lg font-semibold">Firestore Database</h3>
                        </div>
                        <StatusIndicator status="operational" />
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                         <div className="flex items-center gap-3">
                            <Cpu className="h-6 w-6 text-muted-foreground" />
                            <h3 className="text-lg font-semibold">AI Services (Genkit)</h3>
                        </div>
                         <StatusIndicator status="degraded" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">We are currently experiencing higher than normal latency with our AI proposal generation service. The team is investigating the issue.</p>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
    </div>
  )
}
