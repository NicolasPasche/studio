
'use client';

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Users, FileText, BarChart3, AlertTriangle } from "lucide-react";
import { RecentActivities } from "@/components/recent-activities";
import { Skeleton } from '@/components/ui/skeleton';
import type { Lead } from '@/lib/types';
import Link from 'next/link';


export default function AdminDashboard() {
  const [userCount, setUserCount] = useState(0);
  const [leadCount, setLeadCount] = useState(0);
  const [newLeadsThisWeek, setNewLeadsThisWeek] = useState(0);
  const [alertCount, setAlertCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const projectId = 'apex-workflow-f3d61';

  useEffect(() => {
    const usersQuery = collection(db, 'users');
    const leadsQuery = collection(db, 'leads');

    let loadedSources = 0;
    const totalSources = 2; // We are only loading users and leads for now
    const checkLoadingDone = () => {
        loadedSources++;
        if (loadedSources === totalSources) {
            setLoading(false);
        }
    };

    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      setUserCount(snapshot.size);
      checkLoadingDone();
    }, (error) => {
      console.error("Error fetching users count:", error);
      checkLoadingDone();
    });

    const unsubscribeLeads = onSnapshot(leadsQuery, (snapshot) => {
      const leadsData = snapshot.docs.map(doc => doc.data() as Lead);
      setLeadCount(leadsData.length);

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const weeklyLeadsCount = leadsData.filter(lead => 
        lead.createdAt && lead.createdAt.toDate() > oneWeekAgo
      ).length;
      
      setNewLeadsThisWeek(weeklyLeadsCount);
      checkLoadingDone();
    }, (error) => {
      console.error("Error fetching leads count:", error);
      checkLoadingDone();
    });

    // Note: Alert count is static for now to avoid permission errors.
    // To make this dynamic, create an 'alerts' collection in Firestore
    // and set security rules to allow admins to read from it.

    return () => {
      unsubscribeUsers();
      unsubscribeLeads();
    };
  }, []);

  return (
    <div className="space-y-6">
       <Card>
        <CardHeader>
          <CardTitle>Admin Overview</CardTitle>
          <CardDescription>System-wide statistics and management tools.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/users" className="block">
              <Card className="opacity-0 animate-fade-up transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_hsl(var(--accent-glow))]" style={{ animationDelay: '100ms' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{userCount}</div>}
                  <p className="text-xs text-muted-foreground">All registered users</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/opportunities" className="block">
              <Card className="opacity-0 animate-fade-up transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_hsl(var(--accent-glow))]" style={{ animationDelay: '200ms' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{leadCount}</div>}
                  {loading ? <Skeleton className="h-4 w-1/2 mt-1" /> : <p className="text-xs text-muted-foreground">+{newLeadsThisWeek} this week</p>}
                </CardContent>
              </Card>
            </Link>
            <Link href="/system-health" className="block">
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
            </Link>
            <a href={`https://console.cloud.google.com/monitoring/alerting?project=${projectId}`} target="_blank" rel="noopener noreferrer" className="block">
              <Card className="opacity-0 animate-fade-up transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_hsl(var(--accent-glow))]" style={{ animationDelay: '400ms' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Alerts</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  {loading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{alertCount}</div>}
                  <p className="text-xs text-muted-foreground">Requires immediate attention</p>
                </CardContent>
              </Card>
            </a>
          </div>
        </CardContent>
      </Card>
      <RecentActivities />
    </div>
  );
}
