import { PrivyUnauthorizedError, requirePrivySession } from "@/lib/auth/privy";
import connectDB from "@/lib/mongodb";
import Execution from "@/models/Execution";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { userId } = await requirePrivySession(request);
    await connectDB();

    // Fetch user profile for timezone
    const user = await User.findOne({
      $or: [{ userId }, { privyUserId: userId }],
    });

    const latestProfile =
      user?.profiles && user.profiles.length > 0 ? user.profiles[user.profiles.length - 1] : {};

    // Default to Asia/Jakarta (GMT+7) if not set or UTC
    let userTimezone = latestProfile.timezone || "Asia/Jakarta";
    if (userTimezone === "UTC") {
      userTimezone = "Asia/Jakarta";
    }

    // 1. KPI Aggregation
    const kpiExecutionData = await Execution.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalExecutions: { $sum: 1 },
          successfulExecutions: {
            $sum: { $cond: [{ $eq: ["$status", "finished"] }, 1, 0] },
          },
          failedExecutions: {
            $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] },
          },
          totalGasUsed: {
            $sum: {
              $divide: [
                {
                  $multiply: [
                    { $toDouble: { $ifNull: ["$totalGasUsed", "0"] } },
                    { $toDouble: { $ifNull: ["$gasPriceGwei", "0"] } },
                  ],
                },
                1000000000,
              ],
            },
          },
          totalFiatValue: { $sum: { $toDouble: { $ifNull: ["$totalFiatValue", "0"] } } },
          // Count total node executions from the array length
          totalTransactions: { $sum: { $size: { $ifNull: ["$executionLog", []] } } },
        },
      },
    ]);

    const kpi = kpiExecutionData[0] || {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      totalGasUsed: 0,
      totalFiatValue: 0,
      totalTransactions: 0,
    };

    // 2. Daily Execution Activity (Last 30 days) - Timezone Aware
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyActivity = await Execution.aggregate([
      {
        $match: {
          userId,
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: userTimezone,
            },
          },
          success: { $sum: { $cond: [{ $eq: ["$status", "finished"] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } },
          volume: { $sum: { $toDouble: { $ifNull: ["$totalFiatValue", "0"] } } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 3. Token Distribution
    const tokenVolume = await Execution.aggregate([
      { $match: { userId } },
      { $unwind: "$executionLog" },
      {
        $match: {
          "executionLog.detailExecution.token": { $in: ["USDT", "USDC", "IDRX"] },
        },
      },
      {
        $group: {
          _id: "$executionLog.detailExecution.token",
          volume: {
            $sum: { $toDouble: { $ifNull: ["$executionLog.detailExecution.amount", "0"] } },
          },
          fiatVolume: {
            $sum: { $toDouble: { $ifNull: ["$executionLog.detailExecution.fiatAmount", "0"] } },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { fiatVolume: -1 } },
    ]);

    // 4. Node Usage
    const nodeUsage = await Execution.aggregate([
      { $match: { userId } },
      { $unwind: "$executionLog" },
      {
        $group: {
          _id: "$executionLog.nodeType",
          count: { $sum: 1 },
          gasSpent: {
            $sum: {
              $divide: [
                {
                  $multiply: [
                    { $toDouble: { $ifNull: ["$executionLog.detailExecution.gasUsed", "0"] } },
                    { $toDouble: { $ifNull: ["$executionLog.detailExecution.gasPriceGwei", "0"] } },
                  ],
                },
                1000000000,
              ],
            },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return NextResponse.json({
      success: true,
      kpi,
      dailyActivity,
      tokenVolume,
      nodeUsage,
    });
  } catch (error) {
    if (error instanceof PrivyUnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Analytics API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
