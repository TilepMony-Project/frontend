"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePrivySession } from "@/hooks/use-privy-session";
import {
  Activity,
  ArrowLeftRight,
  BarChart3,
  Clock,
  DollarSign,
  PieChart as PieChartIcon,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

const CustomTooltip = ({ active, payload, label, prefix = "" }: any) => {
  if (active && payload && payload.length) {
    const title = label || payload[0]?.name || payload[0]?.payload?._id || "Details";
    return (
      <div className="bg-white dark:bg-[#1f2937] border border-gray-200 dark:border-gray-800 p-3 rounded-lg shadow-xl backdrop-blur-md bg-opacity-95">
        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-wider">
          {title}
        </p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.color || entry.fill }}
                />
                <span className="text-gray-600 dark:text-gray-300 font-medium">{entry.name}</span>
              </div>
              <span className="text-gray-900 dark:text-white font-bold">
                {prefix}
                {typeof entry.value === "number"
                  ? entry.value % 1 !== 0
                    ? entry.value.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : entry.value.toLocaleString()
                  : entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

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

  const successRate =
    data.kpi.totalExecutions > 0
      ? Math.round((data.kpi.successfulExecutions / data.kpi.totalExecutions) * 100)
      : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
          title="Success Rate"
          value={`${successRate}%`}
          icon={<Zap className="text-yellow-500" />}
          description="Workflow completion efficiency"
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
        {/* Execution Activity Chart */}
        <Card className="dark:bg-[#27282b] border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 size={20} className="text-primary" />
              Daily Execution Activity
            </CardTitle>
            <CardDescription>Number of workflow runs over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.dailyActivity}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#374151"
                  opacity={0.1}
                />
                <XAxis
                  dataKey="_id"
                  fontSize={10}
                  tickFormatter={(str) => str.split("-").slice(1).join("/")}
                />
                <YAxis fontSize={10} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="success"
                  name="Finished"
                  stackId="a"
                  fill="#10b981"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="failed"
                  name="Failed"
                  stackId="a"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Volume Trend Chart */}
        <Card className="dark:bg-[#27282b] border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp size={20} className="text-green-500" />
              Volume Trend
            </CardTitle>
            <CardDescription>Fiat value movement across all workflows</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.dailyActivity}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#374151"
                  opacity={0.1}
                />
                <XAxis
                  dataKey="_id"
                  fontSize={10}
                  tickFormatter={(str) => str.split("-").slice(1).join("/")}
                />
                <YAxis fontSize={10} />
                <Tooltip content={<CustomTooltip prefix="$" />} />
                <Area
                  type="monotone"
                  dataKey="volume"
                  name="Volume (USD)"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorVolume)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Token Distribution */}
        <Card className="dark:bg-[#27282b] border-gray-200 dark:border-gray-700 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChartIcon size={20} className="text-orange-500" />
              Token Volume
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.tokenVolume}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="fiatVolume"
                  nameKey="_id"
                >
                  {data.tokenVolume.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip prefix="$" />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Node Usage */}
        <Card className="dark:bg-[#27282b] border-gray-200 dark:border-gray-700 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity size={20} className="text-primary" />
              Node Usage Frequency
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.nodeUsage} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#374151"
                  opacity={0.1}
                />
                <XAxis type="number" fontSize={10} />
                <YAxis dataKey="_id" type="category" fontSize={10} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Usages" radius={[0, 4, 4, 0]}>
                  {data.nodeUsage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                  <LabelList dataKey="count" position="right" fontSize={10} fill="currentColor" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
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
        <div className="p-2 bg-gray-100 dark:bg-[#1a1b1e] rounded-lg">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
          {unit && <span className="text-xs text-gray-500">{unit}</span>}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}
