import { PrivyUnauthorizedError, requirePrivySession } from "@/lib/auth/privy";
import connectDB from "@/lib/mongodb";
import { startWorkflowExecution } from "@/lib/workflow/executor";
import Execution from "@/models/Execution";
import Workflow from "@/models/Workflow";
import { type NextRequest, NextResponse } from "next/server";

// POST /api/workflows/[id]/execute - Execute workflow
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await requirePrivySession(request);
    await connectDB();

    const { id } = await params;
    const workflow = await Workflow.findOne({ _id: id, userId });

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    // TODO: Add pre-execution validation
    // - Validate graph structure
    // - Validate node configurations
    // - Check wallet connection and balance

    // Create execution record
    const execution = await Execution.create({
      workflowId: id,
      userId,
      status: "running",
      startedAt: new Date(),
      executionLog: [],
    });

    // Update workflow status
    await Workflow.findByIdAndUpdate(id, {
      status: "running",
      lastExecutedAt: new Date(),
    });

    // Start workflow execution in the background
    startWorkflowExecution(workflow, execution);

    return NextResponse.json(
      {
        executionId: execution._id.toString(),
        status: "running",
        message: "Workflow execution started",
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof PrivyUnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Error executing workflow:", error);
    return NextResponse.json({ error: "Failed to execute workflow" }, { status: 500 });
  }
}
