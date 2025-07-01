
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, Cpu, Database, Server, Info } from 'lucide-react';
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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
  const projectId = 'apex-workflow-f3d61';

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>System Health Status</CardTitle>
                <CardDescription>Real-time status of all system components.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Card>
                    <CardHeader className="flex flex-row items-start justify-between pb-4">
                        <div className="flex items-center gap-3">
                            <Server className="h-6 w-6 text-muted-foreground" />
                            <h3 className="text-lg font-semibold">Application Servers</h3>
                        </div>
                         <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <a href={`https://console.firebase.google.com/project/${projectId}/app-hosting/production`} target="_blank" rel="noopener noreferrer">
                                        <Info className="h-5 w-5 text-muted-foreground hover:text-primary" />
                                    </a>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>View in Firebase Console</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </CardHeader>
                    <CardContent>
                        <StatusIndicator status="operational" />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-start justify-between pb-4">
                         <div className="flex items-center gap-3">
                            <Database className="h-6 w-6 text-muted-foreground" />
                            <h3 className="text-lg font-semibold">Firestore Database</h3>
                        </div>
                         <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <a href={`https://console.firebase.google.com/project/${projectId}/firestore/data`} target="_blank" rel="noopener noreferrer">
                                        <Info className="h-5 w-5 text-muted-foreground hover:text-primary" />
                                    </a>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>View in Firebase Console</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </CardHeader>
                     <CardContent>
                        <StatusIndicator status="operational" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-start justify-between pb-4">
                         <div className="flex items-center gap-3">
                            <Cpu className="h-6 w-6 text-muted-foreground" />
                            <h3 className="text-lg font-semibold">AI Services (Genkit)</h3>
                        </div>
                         <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                     <a href={`https://console.cloud.google.com/functions?project=${projectId}`} target="_blank" rel="noopener noreferrer">
                                        <Info className="h-5 w-5 text-muted-foreground hover:text-primary" />
                                    </a>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>View in Google Cloud Console</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </CardHeader>
                    <CardContent>
                        <StatusIndicator status="degraded" />
                        <p className="text-sm text-muted-foreground mt-2">We are currently experiencing higher than normal latency with our AI proposal generation service. The team is investigating the issue.</p>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
    </div>
  )
}
