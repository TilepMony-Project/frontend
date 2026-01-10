import { NextResponse } from "next/server";
import { pollForWorkflowEvents, processAllPendingWorkflows, getPendingWorkflows } from "../service";
import { BRIDGE_EXECUTOR_CONFIG } from "../config";

/**
 * GET /api/bridge-executor/cron
 *
 * Cron endpoint for automated polling and execution.
 * Set up a cron job or Vercel cron to hit this endpoint periodically.
 *
 * Example cron schedule (every 30 seconds):
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/bridge-executor/cron",
 *     "schedule": "* * * * *"
 *   }]
 * }
 *
 * Or use external cron service like cron-job.org
 */
export async function GET() {
  const startTime = Date.now();

  try {
    console.log("[BridgeExecutor Cron] Starting poll cycle...");

    // Poll all configured chains for new workflow events
    const chainIds = Object.keys(BRIDGE_EXECUTOR_CONFIG.chains).map(Number);
    const pollResults: Record<number, number> = {};

    for (const chainId of chainIds) {
      try {
        const events = await pollForWorkflowEvents(chainId);
        pollResults[chainId] = events.length;

        if (events.length > 0) {
          console.log(
            `[BridgeExecutor Cron] Found ${events.length} new events on chain ${chainId}`
          );
        }
      } catch (error) {
        console.error(`[BridgeExecutor Cron] Error polling chain ${chainId}:`, error);
        pollResults[chainId] = -1; // Indicate error
      }
    }

    // Check for pending workflows
    const pending = getPendingWorkflows();

    // Auto-execute pending workflows if configured
    let executionResult = { processed: 0, succeeded: 0, failed: 0 };
    if (pending.length > 0 && process.env.AUTO_EXECUTE_WORKFLOWS === "true") {
      console.log(`[BridgeExecutor Cron] Auto-executing ${pending.length} pending workflows...`);
      executionResult = await processAllPendingWorkflows();
    }

    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      pollResults,
      pendingCount: pending.length,
      execution: executionResult,
    });
  } catch (error) {
    console.error("[BridgeExecutor Cron] Fatal error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
