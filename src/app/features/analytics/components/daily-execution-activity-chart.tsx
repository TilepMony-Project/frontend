"use client";

import { BarChart3 } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  total: {
    label: "Workflows",
    color: "#6366f1", // Modern indigo
  },
} satisfies ChartConfig;

interface DailyActivityData {
  _id: string;
  success: number;
  failed: number;
}

export function DailyExecutionActivityChart({
  data,
}: {
  data: DailyActivityData[];
}) {
  // Transform data to include total workflows
  const chartData = data.map((d) => ({
    ...d,
    total: d.success + d.failed,
  }));

  return (
    <Card className="dark:bg-[#27282b] border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 size={20} className="text-[#6366f1]" />
          Daily Execution Activity
        </CardTitle>
        <CardDescription>Total workflow runs over the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
            }}
          >
            <CartesianGrid vertical={false} strokeOpacity={0.1} />
            <XAxis
              dataKey="_id"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.split("-").slice(1).join("/")}
              fontSize={10}
            />
            <YAxis tickLine={false} axisLine={false} fontSize={10} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              dataKey="total"
              type="natural"
              fill="url(#fillTotal)"
              stroke="#6366f1"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
