import { getTokenDecimals } from "@/config/contractConfig";
import { PrivyUnauthorizedError, requirePrivySession } from "@/lib/auth/privy";
import connectDB from "@/lib/mongodb";
import Execution from "@/models/Execution";
import User from "@/models/User";
import Workflow from "@/models/Workflow";
import { ActionType } from "@/utils/mainController";
import { buildWorkflowActions } from "@/utils/workflow-executor";
import { NextResponse } from "next/server";
import { formatUnits } from "viem";

/**
 * POST /api/workflows/[id]/execute
 * Prepares execution configuration and handles off-chain logic (balances)
 * Returns the arguments needed for MainController.executeWorkflow()
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { userId } = await requirePrivySession(request);

    await connectDB();

    const workflow = await Workflow.findOne({ _id: id });

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    const body = await request.json();
    const { userWalletAddress, nodeId } = body;

    if (!userWalletAddress) {
      return NextResponse.json({ error: "User wallet address required" }, { status: 400 });
    }

    const { actions, initialToken, initialAmount } = await buildWorkflowActions(
      workflow.nodes,
      workflow.edges,
      userWalletAddress,
      nodeId
    );

    // 0. Handle Deposit (Fiat Top-up)
    const depositNode = workflow.nodes.find(
      (n: any) => n.type === "deposit" || n.data?.type === "deposit"
    );

    if (depositNode) {
      const user = await User.findOne({
        $or: [{ userId }, { privyUserId: userId }],
      });

      if (!user) {
        return NextResponse.json({ error: "User profile not found for deposit" }, { status: 404 });
      }

      const props = depositNode.data?.properties || {};
      const amount = Number(props.amount || 0);

      // Detect currency if not explicit, default rule: > 10000 is IDR
      let currency = props.currency || "USD";
      if (!props.currency && amount > 10000) {
        currency = "IDR";
      }

      if (amount > 0) {
        if (!user.fiatBalances) user.fiatBalances = { USD: 0, IDR: 0 };

        if (currency === "IDR") {
          user.fiatBalances.IDR = (user.fiatBalances.IDR || 0) + amount;
        } else {
          user.fiatBalances.USD = (user.fiatBalances.USD || 0) + amount;
        }
        await user.save();
      }
    }

    // 1. Check Balance if MINT is involved (Do not deduct yet)
    const mintNodes = workflow.nodes.filter((n: any) => {
      const type = n.data?.type || n.type;
      return type === "mint" && (!nodeId || n.id === nodeId);
    });

    if (mintNodes.length > 0) {
      const user = await User.findOne({
        $or: [{ userId }, { privyUserId: userId }],
      });

      if (!user) {
        return NextResponse.json({ error: "User profile not found" }, { status: 404 });
      }

      let totalIDR = 0;
      let totalUSD = 0;

      for (const node of mintNodes) {
        const props = node.data?.properties || {};
        const amount = Number(props.amount || 0);

        // Determine currency based on token symbol
        const token = props.token || "";
        const currency = token === "IDRX" ? "IDR" : "USD";

        if (currency === "IDR") totalIDR += amount;
        else totalUSD += amount;
      }

      const balanceIDR = user.fiatBalances?.IDR || 0;
      const balanceUSD = user.fiatBalances?.USD || 0;

      if (balanceIDR < totalIDR) {
        return NextResponse.json(
          {
            error: `Insufficient IDR balance. Required: ${totalIDR}, Available: ${balanceIDR}`,
          },
          { status: 400 }
        );
      }
      if (balanceUSD < totalUSD) {
        return NextResponse.json(
          {
            error: `Insufficient USD balance. Required: ${totalUSD}, Available: ${balanceUSD}`,
          },
          { status: 400 }
        );
      }
      // Balance is sufficient, proceed with preparing execution record
      // Actual deduction will happen in PATCH /api/executions/[id] upon success
    }

    // Create Execution Record (Pending Signature)
    const execution = await Execution.create({
      workflowId: id,
      userId,
      status: "pending_signature",
      startedAt: new Date(),
      stepCount: workflow.nodes.length,
      executionType: "manual",
      executionLog: workflow.nodes.map((node: any) => ({
        nodeId: node.id,
        nodeType: node.data?.type || node.type || "node",
        status: "pending",
        timestamp: new Date(),
      })),
    });

    // Serialize actions for JSON (BigInt cannot be serialized)
    const serializedActions = actions.map((action) => ({
      ...action,
      inputAmountPercentage: action.inputAmountPercentage.toString(),
    }));

    return NextResponse.json({
      success: true,
      executionId: execution._id,
      config: {
        actions: serializedActions,
        initialToken,
        initialAmount: initialAmount.toString(),
      },
    });
  } catch (error) {
    if (error instanceof PrivyUnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Execution config error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
