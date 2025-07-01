
"use client"

import React from "react"
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
        <Card className="opacity-0 animate-fade-up" style={{ animationDelay: '500ms' }}>
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
        <RecentActivities />
      </div>
    </div>
  )
}
