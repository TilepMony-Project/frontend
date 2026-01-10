"use client";

import { Coins } from "lucide-react";
import { Cell, Pie, PieChart } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useMemo } from "react";

// Modern color palette: purple, green, and blue
const MODERN_COLORS = [
  "#8b5cf6", // Purple
  "#10b981", // Green
  "#12a5ea", // Blue
  "#f59e0b", // Amber (fallback)
  "#ef4444", // Red (fallback)
];

interface TokenVolumeData {
  _id: string; // Token name
  volume: number;
  fiatVolume: number;
  count: number;
}

export function TokenVolumeChart({ data }: { data: TokenVolumeData[] }) {
  const { chartData, chartConfig, totalVolume } = useMemo(() => {
    const config: ChartConfig = {
      fiatVolume: {
        label: "Volume",
      },
    };

    // Sort data by fiatVolume descending to ensure consistent color assignment
    const sortedData = [...data].sort((a, b) => b.fiatVolume - a.fiatVolume);

    const transformedData = sortedData.map((item, index) => {
      const tokenKey = item._id.toLowerCase();
      // Use modern colors: purple, green, blue
      const color = MODERN_COLORS[index % MODERN_COLORS.length];

      config[tokenKey] = {
        label: item._id,
        color: color,
      };

      return {
        token: item._id,
        fiatVolume: item.fiatVolume,
        volume: item.volume,
        count: item.count,
        fill: color,
      };
    });

    // Calculate total volume
    const total = transformedData.reduce((sum, item) => sum + item.fiatVolume, 0);

    return { chartData: transformedData, chartConfig: config, totalVolume: total };
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <Card className="dark:bg-[#27282b] border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Coins size={20} className="text-[#10b981]" />
            Token Volume Distribution
          </CardTitle>
          <CardDescription>Volume by token type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[250px] text-muted-foreground">
            No token data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="dark:bg-[#27282b] border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Coins size={20} className="text-[#10b981]" />
          Token Volume Distribution
        </CardTitle>
        <CardDescription>Volume by token type</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={chartData}
              dataKey="fiatVolume"
              nameKey="token"
              innerRadius={60}
              paddingAngle={2}
              minAngle={1}
              startAngle={90}
              endAngle={-270}
            >
              {chartData.map((entry) => (
                <Cell
                  key={`cell-${entry.token}`}
                  fill={entry.fill}
                  stroke={entry.fill}
                  strokeWidth={1}
                />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="mt-4 space-y-3">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Total Volume</div>
            <div className="text-xl font-semibold text-foreground">
              $
              {totalVolume.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
          <div className="border-t pt-3">
            <div className="text-xs font-medium text-muted-foreground mb-2">Token Breakdown</div>
            <div className="space-y-1.5">
              {chartData.map((entry) => {
                const percentage = ((entry.fiatVolume / totalVolume) * 100).toFixed(2);
                return (
                  <div key={entry.token} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: entry.fill }} />
                      <span className="font-medium">{entry.token}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        $
                        {entry.fiatVolume.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                      <div className="text-muted-foreground text-[10px]">{percentage}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
