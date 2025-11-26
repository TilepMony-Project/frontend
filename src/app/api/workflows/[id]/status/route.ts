import { PrivyUnauthorizedError, requirePrivySession } from "@/lib/auth/privy";
import connectDB from "@/lib/mongodb";
import Execution from "@/models/Execution";
import { type NextRequest, NextResponse } from "next/server";

// GET /api/workflows/[id]/status - Get execution status
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await requirePrivySession(request);
    await connectDB();

    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const executionId = searchParams.get("executionId");

    if (executionId) {
      // Get specific execution status
      const execution = await Execution.findOne({ _id: executionId, userId }).lean();

      if (!execution) {
        return NextResponse.json({ error: "Execution not found" }, { status: 404 });
      }

      return NextResponse.json({ execution }, { status: 200 });
    }

    // Get latest execution for workflow
    const execution = await Execution.findOne({ workflowId: id, userId })
      .sort({ createdAt: -1 })
      .lean();

    if (!execution) {
      return NextResponse.json({ error: "No execution found" }, { status: 404 });
    }

    return NextResponse.json({ execution }, { status: 200 });
  } catch (error) {
    if (error instanceof PrivyUnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Error fetching execution status:", error);
    return NextResponse.json({ error: "Failed to fetch execution status" }, { status: 500 });
  }
}
