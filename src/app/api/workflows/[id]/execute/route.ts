import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Workflow from "@/models/Workflow";
import User from "@/models/User";
import Execution from "@/models/Execution";
import { buildWorkflowActions } from "@/utils/workflow-executor";
import { requirePrivySession, PrivyUnauthorizedError } from "@/lib/auth/privy";
import { ActionType } from "@/utils/mainController";
import { getTokenDecimals } from "@/config/contractConfig";
import { formatUnits } from "viem";

/**
 * POST /api/workflows/[id]/execute
 * Prepares execution configuration and handles off-chain logic (balances)
 * Returns the arguments needed for MainController.executeWorkflow()
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const depositNode = workflow.nodes.find((n: any) => n.type === "deposit" || n.data?.type === "deposit");
    
    if (depositNode) {
       const user = await User.findOne({ 
         $or: [{ userId }, { privyUserId: userId }]
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

    // 1. Check & Deduct Balance if MINT is involved
    const mintAction = actions.find(a => a.actionType === ActionType.MINT);
    
    if (mintAction) {
       const user = await User.findOne({ 
         $or: [{ userId }, { privyUserId: userId }]
       });
       
       if (!user) {
          console.error("[Execute] User not found for deduction");
          return NextResponse.json({ error: "User profile not found" }, { status: 404 });
       }

       const decimals = getTokenDecimals(initialToken);
       const humanAmount = Number(formatUnits(initialAmount, decimals));
       const amount = humanAmount;
       
       let currency = "USD";
       if (amount > 10000) {
           currency = "IDR";
       }
       
       const balance = user.fiatBalances?.[currency as "IDR"|"USD"] || 0;
       
       if (balance < amount) {
          console.error("[Execute] Insufficient Balance");
          return NextResponse.json({ 
              error: `Insufficient ${currency} balance. Required: ${amount}, Available: ${balance}` 
          }, { status: 400 });
       }
       
       // Deduct
       if (currency === "IDR") {
           user.fiatBalances.IDR -= amount;
       } else {
           user.fiatBalances.USD -= amount;
       }
       await user.save();
    }

    // Create Execution Record (Pending Signature)
    const execution = await Execution.create({
      workflowId: id,
      userId,
      status: "pending_signature",
      startedAt: new Date(),
      executionLog: workflow.nodes.map((node: any) => ({
        nodeId: node.id,
        nodeType: node.type || "node",
        status: "pending",
        timestamp: new Date(),
      })),
    });

    return NextResponse.json({
      success: true,
      executionId: execution._id,
      config: {
        actions,
        initialToken,
        initialAmount: initialAmount.toString() // Serialize bigint for JSON
      }
    });

  } catch (error) {
    if (error instanceof PrivyUnauthorizedError) {
        return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Execution config error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
