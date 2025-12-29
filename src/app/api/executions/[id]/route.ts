import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Execution from "@/models/Execution";
import Workflow from "@/models/Workflow";
import User from "@/models/User";
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
    const { status, transactionHash, error, nodeUpdates } = body;

    const execution = await Execution.findOne({ _id: id, userId });

    if (!execution) {
      return NextResponse.json({ error: "Execution not found" }, { status: 404 });
    }

    if (status) execution.status = status;
    if (transactionHash) execution.transactionHash = transactionHash;
    
    // Update individual nodes if provided
    if (nodeUpdates && Array.isArray(nodeUpdates)) {
        for (const update of nodeUpdates) {
            const nodeIndex = execution.executionLog.findIndex((log: any) => log.nodeId === update.nodeId);
            if (nodeIndex > -1) {
                if (update.status) execution.executionLog[nodeIndex].status = update.status;
                if (update.transactionHash) execution.executionLog[nodeIndex].transactionHash = update.transactionHash;
                if (update.error) execution.executionLog[nodeIndex].error = update.error;
                execution.executionLog[nodeIndex].timestamp = new Date();
            }
        }
    }

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

        if (
            (status === "finished" || status === "failed") && 
            execution.status !== "finished" && 
            execution.status !== "failed"
        ) {
             // --- Consolidated Atomic Balance Update (Deposit & Mint) ---
             try {
                const workflow = await Workflow.findById(execution.workflowId);
                if (workflow) {
                    let netIDR = 0;
                    let netUSD = 0;

                    for (const node of workflow.nodes) {
                        const type = node.data?.type || node.type;
                        const props = node.data?.properties || {};
                        const amount = Number(props.amount || 0);

                        if (type === "deposit") {
                            // Deposits are credited even if the transaction fails, 
                            // as they happen off-chain before the mint.
                            let currency = props.currency || "USD";
                            if (!props.currency && amount > 10000) currency = "IDR";
                            
                            if (currency === "IDR") netIDR += amount;
                            else netUSD += amount;
                        } else if (type === "mint" && status === "finished") {
                            // Mints are subtracted only on workflow SUCCESS
                            const token = props.token || "";
                            const currency = token === "IDRX" ? "IDR" : "USD";
                            
                            if (currency === "IDR") netIDR -= amount;
                            else netUSD -= amount;
                        }
                    }

                    if (netIDR !== 0 || netUSD !== 0) {
                        await User.updateOne(
                            { $or: [{ userId }, { privyUserId: userId }] },
                            { 
                                $inc: { 
                                    "fiatBalances.IDR": netIDR,
                                    "fiatBalances.USD": netUSD
                                } 
                            }
                        );
                    }
                }
             } catch (err) {
                console.error("Failed to update balances atomically:", err);
             }
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
