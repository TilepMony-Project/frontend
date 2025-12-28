import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Workflow from "@/models/Workflow";
import User from "@/models/User";
import Execution from "@/models/Execution";
import { buildWorkflowActions } from "@/utils/workflow-executor";
import { requirePrivySession, PrivyUnauthorizedError } from "@/lib/auth/privy";
import { ActionType } from "@/utils/mainController";

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
    const { userWalletAddress } = body; 

    if (!userWalletAddress) {
        return NextResponse.json({ error: "User wallet address required" }, { status: 400 });
    }

    const { actions, initialToken, initialAmount } = await buildWorkflowActions(
      workflow.nodes,
      workflow.edges,
      userWalletAddress
    );

    // 1. Check & Deduct Balance if MINT is involved
    const mintAction = actions.find(a => a.actionType === ActionType.MINT);
    if (mintAction) {
       const user = await User.findOne({ 
         $or: [{ userId }, { privyUserId: userId }]
       });
       
       if (user) {
          // Verification logic placeholders
       }
    }

    // Create Execution Record (Pending Signature)
    const execution = await Execution.create({
      workflowId: id,
      userId,
      status: "pending_signature",
      startedAt: new Date(),
      executionLog: [], 
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
