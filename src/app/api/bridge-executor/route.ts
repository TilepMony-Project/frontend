import { type NextRequest, NextResponse } from "next/server";
import {
  pollForWorkflowEvents,
  executeWorkflow,
  getPendingWorkflows,
  getAllWorkflows,
  processAllPendingWorkflows,
  getWorkflow,
} from "./service";
import { BRIDGE_EXECUTOR_CONFIG } from "./config";

// Import worker to auto-start background polling (if enabled via env)
import "./worker";

/**
 * GET /api/bridge-executor
 * Get all workflows or filter by status
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const messageId = searchParams.get("messageId");
    const status = searchParams.get("status");

    // If messageId provided, return specific workflow
    if (messageId) {
      const workflow = getWorkflow(messageId);
      if (!workflow) {
        return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
      }
      return NextResponse.json({ workflow });
    }

    // Get all workflows and optionally filter by status
    let workflows = getAllWorkflows();
    if (status) {
      workflows = workflows.filter((w) => w.status === status);
    }

    return NextResponse.json({
      count: workflows.length,
      workflows,
    });
  } catch (error) {
    console.error("[BridgeExecutor API] GET error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/bridge-executor
 * Actions: poll, execute, process-all
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, messageId, chainId } = body;

    switch (action) {
      case "poll": {
        // Poll for new workflow events on specified chain or all chains
        const chainIds = chainId
          ? [chainId]
          : Object.keys(BRIDGE_EXECUTOR_CONFIG.chains).map(Number);

        const results: Record<number, number> = {};
        for (const id of chainIds) {
          const events = await pollForWorkflowEvents(id);
          results[id] = events.length;
        }

        const pending = getPendingWorkflows();
        return NextResponse.json({
          success: true,
          eventsFound: results,
          pendingCount: pending.length,
        });
      }

      case "execute": {
        // Execute a specific workflow by messageId
        if (!messageId) {
          return NextResponse.json({ error: "messageId required" }, { status: 400 });
        }

        const result = await executeWorkflow(messageId);
        return NextResponse.json(result);
      }

      case "process-all": {
        // Process all pending workflows
        const result = await processAllPendingWorkflows();
        return NextResponse.json({
          success: true,
          ...result,
        });
      }

      default:
        return NextResponse.json(
          { error: "Invalid action. Use: poll, execute, or process-all" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[BridgeExecutor API] POST error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
