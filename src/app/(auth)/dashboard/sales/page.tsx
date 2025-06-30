
"use client"

import React, { useState, useEffect } from "react"
import { collection, query, orderBy, onSnapshot, where, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Activity } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { DollarSign, Target, Activity as ActivityIcon, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const chartData = [
  { month: "January", sales: 186, target: 200 },
  { month: "February", sales: 305, target: 300 },
  { month: "March", sales: 237, target: 250 },
  { month: "April", sales: 273, target: 280 },
  { month: "May", sales: 209, target: 220 },
  { month: "June", sales: 214, target: 220 },
]

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
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
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
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="opacity-0 animate-fade-up transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_hsl(var(--accent-glow))]" style={{ animationDelay: '200ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+23</div>
            <p className="text-xs text-muted-foreground">
              +18.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="opacity-0 animate-fade-up transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_hsl(var(--accent-glow))]" style={{ animationDelay: '300ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <ActivityIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12.43%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="opacity-0 animate-fade-up transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_hsl(var(--accent-glow))]" style={{ animationDelay: '400ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Target Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">
              $156k of $200k target
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales Performance</CardTitle>
            <CardDescription>Sales vs. Target (Last 6 Months)</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={chartData} accessibilityLayer>
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
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>A log of recent sales activities from the last 3 days.</CardDescription>
          </CardHeader>
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
        </Card>
      </div>
    </div>
  )
}
