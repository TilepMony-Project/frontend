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
    const { status, transactionHash, error, nodeUpdates, totalGasUsed, gasPriceGwei } = body;

    const execution = await Execution.findOne({ _id: id, userId });

    if (!execution) {
      return NextResponse.json({ error: "Execution not found" }, { status: 404 });
    }

    if (status) execution.status = status;
    if (transactionHash) execution.transactionHash = transactionHash;
    if (totalGasUsed) execution.totalGasUsed = totalGasUsed;
    if (gasPriceGwei) execution.gasPriceGwei = gasPriceGwei;
    
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
    
    // Also update Workflow status if needed
    if (status) {
        await Workflow.findByIdAndUpdate(execution.workflowId, {
            status: status === "running" ? "running" : "idle", // Reset to idle when done
            lastExecutedAt: new Date()
        });
        
        if (status === "finished") {
             let totalValueProcessed = 0;
             await Workflow.findByIdAndUpdate(execution.workflowId, {
                $inc: { runCount: 1 }
             });

             // --- Post-Execution Balance Updates (Mint & Redeem) & Transaction Recording ---
             try {
                const workflow = await Workflow.findById(execution.workflowId);
                if (workflow) {
                    const user = await User.findOne({ $or: [{ userId }, { privyUserId: userId }] });
                    if (user) {
                        let netIDR = 0;
                        let netUSD = 0;
                        
                        // Analytics: record details directly into the existing executionLog items
                        for (let i = 0; i < execution.executionLog.length; i++) {
                            const logItem = execution.executionLog[i];
                            if (logItem.status !== "complete") continue;
                            
                            // Find corresponding node data from workflow for properties
                            const nodeData = workflow.nodes.find((n: any) => n.id === logItem.nodeId);
                            const type = logItem.nodeType || nodeData?.data?.type || nodeData?.type;
                            const props = nodeData?.data?.properties || {};
                            
                            const amountStr = props.amount || props.inputAmount || "0";
                            const amountNum = Number(amountStr) || 0;
                            const displayAmount = amountNum > 0 ? amountNum.toString() : "0";
                            const token = props.token || props.currency || props.inputToken || "UNKNOWN";

                            // Normalize volume to USD for the summary KPI
                            let usdValue = 0;

                            // Init update object
                            const updateData: any = {
                                transactionHash: logItem.transactionHash || transactionHash || execution.transactionHash,
                                from: user.walletAddress || "0x0",
                                to: props.recipientWallet || props.to || "0x0",
                                amount: displayAmount,
                                token,
                                gasUsed: totalGasUsed || "0",
                                gasPriceGwei: gasPriceGwei || "0",
                                slippage: props.slippage || "0"
                            };

                            if (["mint", "redeem", "swap", "bridge", "transfer", "yield-deposit", "yield-withdraw", "deposit"].includes(type)) {
                                if (token === "IDR" || token === "IDRX") {
                                    usdValue = amountNum / 15000;
                                } else {
                                    usdValue = amountNum;
                                }
                                totalValueProcessed += usdValue;
                                updateData.fiatAmount = usdValue.toFixed(2);
                            } else {
                                updateData.fiatAmount = "0";
                            }

                            // Apply updates to the log item safely
                            // Mongoose subdocuments cannot be spread like plain objects. 
                            // Using .set() or individual assignment is safer.
                            
                            const logEntry = execution.executionLog[i];
                            logEntry.transactionHash = updateData.transactionHash;
                            logEntry.from = updateData.from;
                            logEntry.to = updateData.to;
                            logEntry.amount = updateData.amount;
                            logEntry.token = updateData.token;
                            logEntry.gasUsed = updateData.gasUsed;
                            logEntry.gasPriceGwei = updateData.gasPriceGwei;
                            logEntry.slippage = updateData.slippage;
                            logEntry.fiatAmount = updateData.fiatAmount;

                            // Balance Updates (Fiat/Token specific logic)
                            if (type === "mint" || type === "deposit") {
                                const currency = token === "IDRX" || token === "IDR" ? "IDR" : "USD";
                                if (currency === "IDR") netIDR -= amountNum;
                                else netUSD -= amountNum;
                            } else if (type === "redeem") {
                                let currency = props.currency;
                                if (!currency && props.token) {
                                    currency = props.token === "IDRX" ? "IDR" : "USD";
                                }
                                if (currency === "IDR") netIDR += amountNum;
                                else netUSD += amountNum;
                            }
                        }

                        if (netIDR !== 0 || netUSD !== 0) {
                            if (!user.fiatBalances) user.fiatBalances = { USD: 0, IDR: 0 };
                            user.fiatBalances.IDR = Math.max(0, (user.fiatBalances.IDR || 0) + netIDR);
                            user.fiatBalances.USD = Math.max(0, (user.fiatBalances.USD || 0) + netUSD);
                            await user.save();
                        }

                        execution.totalFiatValue = totalValueProcessed.toString();
                    }
                }
             } catch (err) {
                console.error("Failed to post-process execution analytics:", err);
             }
        }
    }
    
    await execution.save();

    return NextResponse.json({ success: true, execution });

  } catch (error) {
    if (error instanceof PrivyUnauthorizedError) {
        return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Execution update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
