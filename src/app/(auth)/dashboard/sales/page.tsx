
"use client"

import React, { useState, useEffect, useMemo } from "react"
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Lead } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { DollarSign, Target, Activity as ActivityIcon, Users } from "lucide-react"
import { RecentActivities } from "@/components/recent-activities"
import { Skeleton } from "@/components/ui/skeleton";
import { format, startOfMonth, subMonths, differenceInCalendarMonths } from 'date-fns';


const chartConfig = {
  sales: {
    label: "Sales ($k)",
    color: "hsl(var(--chart-2))",
  },
  target: {
    label: "Target ($k)",
    color: "hsl(var(--chart-1))",
  },
}

export default function SalesDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const leadsData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
            } as Lead;
        });
        setLeads(leadsData);
        setLoading(false);
    }, (error) => {
        console.error("Firebase Error fetching leads:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const salesStats = useMemo(() => {
    const now = new Date();
    const startOfThisMonth = startOfMonth(now);
    
    const wonLeads = leads.filter(l => l.status === 'Won');
    const lostLeads = leads.filter(l => l.status === 'Lost');
    
    // Monthly Sales
    const wonThisMonth = wonLeads.filter(l => l.closedAt && l.closedAt.toDate() >= startOfThisMonth);
    const monthlySales = wonThisMonth.reduce((sum, l) => sum + (l.value || 0), 0);
    
    // New Leads
    const newThisMonth = leads.filter(l => l.createdAt && l.createdAt.toDate() >= startOfThisMonth);
    const newLeadsCount = newThisMonth.length;
    
    // Conversion Rate
    const totalClosed = wonLeads.length + lostLeads.length;
    const conversionRate = totalClosed > 0 ? (wonLeads.length / totalClosed) * 100 : 0;
    
    // Target Progress
    const monthlyTarget = 200000;
    const targetProgress = monthlySales > 0 ? (monthlySales / monthlyTarget) * 100 : 0;
    
    // Chart Data
    const monthlyTargetK = monthlyTarget / 1000;
    const chartData = [...Array(6)].map((_, i) => {
        const date = subMonths(now, 5 - i);
        return {
            month: format(date, 'MMMM'),
            sales: 0,
            target: monthlyTargetK
        };
    });

    wonLeads.forEach(l => {
        if (l.closedAt) {
            const closedDate = l.closedAt.toDate();
            const monthIndex = 5 - differenceInCalendarMonths(now, closedDate);
            if (monthIndex >= 0 && monthIndex < 6) {
                chartData[monthIndex].sales += (l.value || 0) / 1000;
            }
        }
    });

    return {
        monthlySales,
        newLeads: newLeadsCount,
        conversionRate,
        targetProgress,
        monthlyTarget,
        chartData,
    };
  }, [leads]);


  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="opacity-0 animate-fade-up transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_hsl(var(--accent-glow))]" style={{ animationDelay: '100ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Sales
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">${salesStats.monthlySales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>}
            {loading ? <Skeleton className="h-4 w-1/2 mt-1" /> : <p className="text-xs text-muted-foreground">Revenue generated this month</p>}
          </CardContent>
        </Card>
        <Card className="opacity-0 animate-fade-up transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_hsl(var(--accent-glow))]" style={{ animationDelay: '200ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">+{salesStats.newLeads}</div>}
             {loading ? <Skeleton className="h-4 w-1/2 mt-1" /> : <p className="text-xs text-muted-foreground">New leads created this month</p>}
          </CardContent>
        </Card>
        <Card className="opacity-0 animate-fade-up transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_hsl(var(--accent-glow))]" style={{ animationDelay: '300ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <ActivityIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">{salesStats.conversionRate.toFixed(1)}%</div>}
             {loading ? <Skeleton className="h-4 w-1/2 mt-1" /> : <p className="text-xs text-muted-foreground">All-time lead to close rate</p>}
          </CardContent>
        </Card>
        <Card className="opacity-0 animate-fade-up transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_hsl(var(--accent-glow))]" style={{ animationDelay: '400ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Target Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">{salesStats.targetProgress.toFixed(0)}%</div>}
            {loading ? <Skeleton className="h-4 w-1/2 mt-1" /> : <p className="text-xs text-muted-foreground">${(salesStats.monthlySales/1000).toFixed(0)}k of ${(salesStats.monthlyTarget/1000).toFixed(0)}k target</p>}
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="opacity-0 animate-fade-up" style={{ animationDelay: '500ms' }}>
          <CardHeader>
            <CardTitle>Sales Performance</CardTitle>
            <CardDescription>Sales vs. Target (Last 6 Months)</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={salesStats.chartData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                 <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    tickFormatter={(value) => `$${value}k`}
                  />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                />
                <Bar dataKey="sales" fill="var(--color-sales)" radius={4} />
                <Bar dataKey="target" fill="var(--color-target)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <RecentActivities />
      </div>
    </div>
  )
}
