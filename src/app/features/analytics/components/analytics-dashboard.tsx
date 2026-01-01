"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { usePrivySession } from "@/hooks/use-privy-session";
import { Activity, ArrowLeftRight, Clock, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import { DailyExecutionActivityChart } from "./daily-execution-activity-chart";
import { TokenVolumeChart } from "./token-volume-chart";
import { NodeUsageChart } from "./node-usage-chart";
import { VolumeTrendChart } from "./volume-trend-chart";

interface AnalyticsData {
  kpi: {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    totalGasUsed: number;
    totalFiatValue: number;
    totalTransactions: number;
  };
  dailyActivity: Array<{
    _id: string;
    success: number;
    failed: number;
    volume: number;
    volumeIDR: number;
  }>;
  tokenVolume: Array<{
    _id: string;
    volume: number;
    fiatVolume: number;
    count: number;
  }>;
  nodeUsage: Array<{
    _id: string;
    count: number;
    gasSpent: number;
  }>;
}

export function AnalyticsDashboard() {
  const { accessToken } = usePrivySession();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      if (!accessToken) return;
      try {
        const response = await fetch("/api/analytics", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error("Failed to fetch analytics", error);
      } finally {
        setIsLoading(false);
      }
    }
    void fetchAnalytics();
  }, [accessToken]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Executions"
          value={data.kpi.totalExecutions.toString()}
          icon={<Activity className="text-blue-500" />}
          description="Total workflows triggered"
        />
        <KPICard
          title="Total Transactions"
          value={data.kpi.totalTransactions.toString()}
          icon={<ArrowLeftRight className="text-indigo-500" />}
          description="Total node steps executed"
        />
        <KPICard
          title="Total Volume"
          value={`$${Math.round(data.kpi.totalFiatValue).toLocaleString()}`}
          icon={<DollarSign className="text-green-500" />}
          description="Cumulative fiat value processed"
        />
        <KPICard
          title="Gas Spent"
          value={data.kpi.totalGasUsed.toFixed(4)}
          unit="ETH"
          icon={<Clock className="text-purple-500" />}
          description="Automation costs (estimated)"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailyExecutionActivityChart data={data.dailyActivity} />

        <VolumeTrendChart data={data.dailyActivity} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TokenVolumeChart data={data.tokenVolume} />

        <NodeUsageChart data={data.nodeUsage} />
      </div>
    </div>
  );
}

function KPICard({
  title,
  value,
  unit,
  icon,
  description,
}: {
  title: string;
  value: string;
  unit?: string;
  icon: React.ReactNode;
  description: string;
}) {
  return (
    <Card className="dark:bg-[#27282b] border-gray-200 dark:border-gray-700 transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </CardTitle>
        <div className="p-2 bg-gray-100 dark:bg-[#1a1b1e] rounded-lg">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </div>
          {unit && <span className="text-xs text-gray-500">{unit}</span>}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
