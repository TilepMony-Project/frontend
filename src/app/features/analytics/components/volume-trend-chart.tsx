"use client";

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  volume: {
    label: "Volume (USD)",
    color: "#10b981", // Emerald
  },
  volumeIDR: {
    label: "Volume (IDR)",
    color: "#6366f1", // Indigo
  },
} satisfies ChartConfig;

interface VolumeActivityData {
  _id: string; // Date
  volume: number;
  volumeIDR: number;
}

export function VolumeTrendChart({ data }: { data: VolumeActivityData[] }) {
  return (
    <Card className="dark:bg-[#27282b] border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp size={20} className="text-[#10b981]" />
          Volume Trend
        </CardTitle>
        <CardDescription>Fiat value movement (USD & IDR)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart
            accessibilityLayer
            data={data}
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
            <YAxis
              yAxisId="left"
              tickLine={false}
              axisLine={false}
              fontSize={10}
              tickFormatter={(value) =>
                `$${value < 1000 ? value : (value / 1000).toFixed(1) + "k"}`
              }
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
              fontSize={10}
              tickFormatter={(value) =>
                `${
                  value < 1000000
                    ? (value / 1000).toFixed(0) + "k"
                    : (value / 1000000).toFixed(1) + "m"
                }`
              }
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <defs>
              <linearGradient id="fillVolumeUSD" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fillVolumeIDR" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              yAxisId="left"
              dataKey="volume"
              type="natural"
              fill="url(#fillVolumeUSD)"
              stroke="#10b981"
              strokeWidth={2}
              stackId="a"
            />
            <Area
              yAxisId="right"
              dataKey="volumeIDR"
              type="natural"
              fill="url(#fillVolumeIDR)"
              stroke="#6366f1"
              strokeWidth={2}
              stackId="b"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
