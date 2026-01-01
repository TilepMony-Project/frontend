import { PrivyUnauthorizedError, requirePrivySession } from "@/lib/auth/privy";
import connectDB from "@/lib/mongodb";
import Execution from "@/models/Execution";
import User from "@/models/User";
import Workflow from "@/models/Workflow";
import { NextResponse } from "next/server";

/**
 * PATCH /api/executions/[id]
 * Updates execution status (e.g., adding tx hash, marking as success/failed)
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
        const nodeIndex = execution.executionLog.findIndex(
          (log: any) => log.nodeId === update.nodeId
        );
        if (nodeIndex > -1) {
          if (update.status) execution.executionLog[nodeIndex].status = update.status;
          if (update.transactionHash)
            execution.executionLog[nodeIndex].transactionHash = update.transactionHash;
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
        error,
      });
    }

    if (status === "finished" || status === "failed") {
      execution.finishedAt = new Date();
    }

    // Also update Workflow status if needed
    if (status) {
      await Workflow.findByIdAndUpdate(execution.workflowId, {
        status: status === "running" ? "running" : "idle", // Reset to idle when done
        lastExecutedAt: new Date(),
      });

      if (status === "finished") {
        let totalValueProcessed = 0;
        await Workflow.findByIdAndUpdate(execution.workflowId, {
          $inc: { runCount: 1 },
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
                // Normalize volume to USD for the summary KPI
                let usdValue = 0;

                // Construct detailed execution info based on node type
                const normalizedType = type.toLowerCase();
                let detailExecution: any = {
                  gasPriceGwei: gasPriceGwei || "0",
                  gasUsed: totalGasUsed || "0", // Node specific if available, otherwise total?
                  // For now, we use the totalGasUsed of the tx passed in.
                  // Ideally, if multiple nodes share a tx, this is shared.
                };

                if (
                  [
                    "mint",
                    "redeem",
                    "swap",
                    "bridge",
                    "transfer",
                    "yield-deposit",
                    "yield-withdraw",
                    "deposit",
                  ].includes(normalizedType)
                ) {
                  if (token === "IDR" || token === "IDRX") {
                    usdValue = amountNum / 15000;
                  } else {
                    usdValue = amountNum;
                  }
                  totalValueProcessed += usdValue;
                }
                detailExecution.fiatAmount = usdValue.toFixed(2);

                if (normalizedType === "swap") {
                  detailExecution = {
                    ...detailExecution,
                    token: token, // Primary token for analytics
                    amount: displayAmount, // Primary amount for analytics
                    tokenIn: props.inputToken || "UNKNOWN",
                    tokenOut: props.outputToken || "UNKNOWN",
                    amountIn: displayAmount,
                    percentage: props.inputAmountPercentage || "0",
                    slippage: props.slippage || "0",
                  };
                } else if (normalizedType === "transfer") {
                  detailExecution = {
                    ...detailExecution,
                    token: token,
                    amount: displayAmount,
                    percentage: props.inputAmountPercentage || "0",
                    from: user.walletAddress || "0x0",
                    to: props.recipientWallet || "0x0",
                  };
                } else if (
                  normalizedType === "mint" ||
                  normalizedType === "redeem" ||
                  normalizedType === "deposit"
                ) {
                  detailExecution = {
                    ...detailExecution,
                    token: token,
                    amount: displayAmount,
                    currency: props.currency || "USD",
                  };
                } else if (
                  normalizedType === "yield-deposit" ||
                  normalizedType === "yield-withdraw"
                ) {
                  detailExecution = {
                    ...detailExecution,
                    token: token,
                    amount: displayAmount,
                    percentage: props.inputAmountPercentage || "0",
                    protocol: props.yieldAdapter || "UNKNOWN",
                  };
                }

                // Apply updates to the log item safely
                // Only update transactionHash and detailExecution
                const logEntry = execution.executionLog[i];
                logEntry.transactionHash =
                  logItem.transactionHash || transactionHash || execution.transactionHash;
                logEntry.detailExecution = detailExecution;

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

    execution.markModified("executionLog");
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
