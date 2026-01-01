"use client";

import { Activity } from "lucide-react";
import { Bar, BarChart, XAxis, YAxis, Cell } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useMemo } from "react";

const VIBRANT_COLORS = [
  "#6366f1", // Indigo
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Violet
  "#ec4899", // Pink
];

interface NodeUsageData {
  _id: string; // Node type
  count: number;
}

export function NodeUsageChart({ data }: { data: NodeUsageData[] }) {
  const { chartData, chartConfig } = useMemo(() => {
    const config: ChartConfig = {
      count: {
        label: "Usages",
      },
    };

    const transformedData = data.map((item, index) => {
      const nodeKey = item._id.toLowerCase();
      const color = VIBRANT_COLORS[index % VIBRANT_COLORS.length];

      config[nodeKey] = {
        label: item._id,
        color: color,
      };

      return {
        node: item._id,
        count: item.count,
        fill: color,
      };
    });

    return { chartData: transformedData, chartConfig: config };
  }, [data]);

  return (
    <Card className="dark:bg-[#27282b] border-gray-200 dark:border-gray-700 lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity size={20} className="text-[#6366f1]" />
          Node Usage Frequency
        </CardTitle>
        <CardDescription>Most commonly used workflow nodes</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="max-h-[500px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: 20,
              right: 20,
            }}
          >
            <YAxis
              dataKey="node"
              type="category"
              tickLine={false}
              tickMargin={8}
              axisLine={false}
              tickFormatter={(value) =>
                (chartConfig[value.toLowerCase() as keyof typeof chartConfig]
                  ?.label as string) || value
              }
              fontSize={14}
              width={120}
            />
            <XAxis dataKey="count" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="count" layout="vertical" radius={10} barSize={50}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
