import connectDB from "@/lib/mongodb";
import Workflow from "@/models/Workflow";
import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

function revalidateWorkflowPaths() {
  const paths = ["/", "/dashboard", "/workspace", "/workspace/[workflowId]"];
  for (const path of paths) {
    if (path.includes("[")) {
      revalidatePath(path, "page");
    } else {
      revalidatePath(path);
    }
  }
}

// GET /api/workflows/[id] - Get specific workflow
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await params;
    const workflow = await Workflow.findById(id);

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    revalidateWorkflowPaths();

    return NextResponse.json({ workflow }, { status: 200 });
  } catch (error) {
    console.error("Error fetching workflow:", error);
    return NextResponse.json({ error: "Failed to fetch workflow" }, { status: 500 });
  }
}

// PUT /api/workflows/[id] - Update workflow
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const { name, description, nodes, edges, status } = body;

    const workflow = await Workflow.findByIdAndUpdate(
      id,
      {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(nodes && { nodes }),
        ...(edges && { edges }),
        ...(status && { status }),
      },
      { new: true, runValidators: true }
    );

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    return NextResponse.json({ workflow }, { status: 200 });
  } catch (error) {
    console.error("Error updating workflow:", error);
    return NextResponse.json({ error: "Failed to update workflow" }, { status: 500 });
  }
}

// DELETE /api/workflows/[id] - Delete workflow
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const workflow = await Workflow.findByIdAndDelete(id);

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    revalidateWorkflowPaths();

    return NextResponse.json({ message: "Workflow deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting workflow:", error);
    return NextResponse.json({ error: "Failed to delete workflow" }, { status: 500 });
  }
}
