'use client';

import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Activity } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ChevronsUpDown } from "lucide-react";

export function RecentActivities({ className }: { className?: string }) {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loadingActivities, setLoadingActivities] = useState(true);
    const [isOpen, setIsOpen] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        const threeDaysAgoTimestamp = Timestamp.fromDate(threeDaysAgo);

        const q = query(
        collection(db, 'activities'), 
        where('timestamp', '>', threeDaysAgoTimestamp),
        orderBy('timestamp', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
        const activitiesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Activity[];
        setActivities(activitiesData);
        setLoadingActivities(false);
        }, (error) => {
        console.error("Error fetching activities:", error);
        if (error.message.includes('requires an index')) {
            const firestoreLinkRegex = /(https?:\/\/[^\s]+)/;
            const match = error.message.match(firestoreLinkRegex);
            if (match) {
                toast({
                variant: 'destructive',
                title: 'Database Index Required',
                description: (
                    <span>
                    The Recent Activities feed requires a database index.
                    <a
                        href={match[0]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-bold ml-1"
                    >
                        Click here to create it.
                    </a>
                    </span>
                ),
                duration: Infinity,
                });
            }
        }
        setLoadingActivities(false);
        });

        return () => unsubscribe();
    }, [toast]);

    return (
        <Card className={cn("opacity-0 animate-fade-up", className)} style={{ animationDelay: '500ms' }}>
            <Collapsible
                open={isOpen}
                onOpenChange={setIsOpen}
            >
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Recent Activities</CardTitle>
                        <CardDescription>A log of all activities from the last 3 days.</CardDescription>
                    </div>
                     <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-9 p-0">
                            <ChevronsUpDown className="h-4 w-4" />
                            <span className="sr-only">Toggle</span>
                        </Button>
                    </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                    <CardContent>
                        <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Activity</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead className="text-right">Time</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loadingActivities ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">Loading activities...</TableCell>
                            </TableRow>
                            ) : activities.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">No recent activities in the last 3 days.</TableCell>
                            </TableRow>
                            ) : (
                            activities.map((activity, index) => (
                                <TableRow key={activity.id} className="opacity-0 animate-fade-up" style={{ animationDelay: `${index * 50}ms` }}>
                                <TableCell>
                                    <Badge variant="secondary">{activity.type}</Badge>
                                </TableCell>
                                <TableCell className="font-medium">{activity.description}</TableCell>
                                <TableCell>{activity.userName}</TableCell>
                                <TableCell className="text-right">
                                    {activity.timestamp ? formatDistanceToNow(activity.timestamp.toDate(), { addSuffix: true }) : 'N/A'}
                                </TableCell>
                                </TableRow>
                            ))
                            )}
                        </TableBody>
                        </Table>
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}
