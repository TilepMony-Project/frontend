import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Execution from "@/models/Execution";
import Workflow from "@/models/Workflow";
import { requirePrivySession, PrivyUnauthorizedError } from "@/lib/auth/privy";

/**
 * PATCH /api/executions/[id]
 * Updates execution status (e.g., adding tx hash, marking as success/failed)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await requirePrivySession(request);
    
    await connectDB();
    
    const body = await request.json();
    const { status, transactionHash, error } = body;

    const execution = await Execution.findOne({ _id: id, userId });

    if (!execution) {
      return NextResponse.json({ error: "Execution not found" }, { status: 404 });
    }

    if (status) execution.status = status;
    if (transactionHash) execution.transactionHash = transactionHash;
    if (error) {
        // Log global error
        execution.executionLog.push({
            nodeId: "GLOBAL",
            nodeType: "SYSTEM",
            status: "failed",
            timestamp: new Date(),
            error
        });
    }

    if (status === "finished" || status === "failed") {
        execution.finishedAt = new Date();
    }
    
    await execution.save();
    
    // Also update Workflow status if needed
    if (status) {
        await Workflow.findByIdAndUpdate(execution.workflowId, {
            status: status === "running" ? "running" : "idle", // Reset to idle when done
            lastExecutedAt: new Date()
        });
        
        // If success, increment runCount on Workflow?
        // Or we rely on Execution count. 
        // Let's increment runCount on workflow for easy stats.
        if (status === "finished") {
             await Workflow.findByIdAndUpdate(execution.workflowId, {
                $inc: { runCount: 1 }
             });
        }
    }

    return NextResponse.json({ success: true, execution });

  } catch (error) {
    if (error instanceof PrivyUnauthorizedError) {
        return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Execution update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
