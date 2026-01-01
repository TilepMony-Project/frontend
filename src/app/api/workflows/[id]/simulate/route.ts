import { mantleSepoliaTestnet } from "@/config/chains";
import { CONTRACT_ADDRESS } from "@/config/contractConfig";
import { MAIN_CONTROLLER_ABI } from "@/config/contractConfig";
import { PrivyUnauthorizedError, requirePrivySession } from "@/lib/auth/privy";
import connectDB from "@/lib/mongodb";
import Workflow from "@/models/Workflow";
import { buildWorkflowActions } from "@/utils/workflow-executor";
import { NextResponse } from "next/server";
import { http, type Address, createPublicClient } from "viem";

/**
 * POST /api/workflows/[id]/simulate
 * Simulates a workflow execution on-chain safely
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { userId } = await requirePrivySession(request);

    await connectDB();

    const workflow = await Workflow.findOne({
      _id: id,
      userId,
    });

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    // Pass dummy address for simulation
    const userAddress = "0x0000000000000000000000000000000000000000";

    const { actions, initialToken, initialAmount } = await buildWorkflowActions(
      workflow.nodes,
      workflow.edges,
      userAddress
    );

    const publicClient = createPublicClient({
      chain: mantleSepoliaTestnet,
      transport: http(),
    });

    try {
      const { request: simRequest } = await publicClient.simulateContract({
        address: CONTRACT_ADDRESS,
        abi: MAIN_CONTROLLER_ABI,
        functionName: "executeWorkflow",
        args: [actions, initialToken as Address, initialAmount] as any,
        account: "0x0000000000000000000000000000000000000000" as Address,
      });

      return NextResponse.json({
        success: true,
        gas: Number(simRequest.gas),
        actions: actions.length,
      });
    } catch (simError: any) {
      console.error("Simulation revert:", simError);
      return NextResponse.json({
        success: false,
        error: simError.shortMessage || simError.message || "Simulation failed",
      });
    }
  } catch (error) {
    if (error instanceof PrivyUnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Simulation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
