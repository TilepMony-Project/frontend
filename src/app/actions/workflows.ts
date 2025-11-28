"use server";

import type { IntegrationDataFormat } from "@/features/integration/types";
import connectDB from "@/lib/mongodb";
import Workflow from "@/models/Workflow";
import { revalidatePath } from "next/cache";

export type WorkflowSummary = {
  id: string;
  name: string;
  description?: string;
  status: "draft" | "running" | "running_waiting" | "stopped" | "finished" | "failed";
  createdAt: string;
  updatedAt: string;
  lastExecutedAt: string | null;
  nodesCount: number;
  edgesCount: number;
};

function serializeWorkflow(workflow: unknown): WorkflowSummary {
  const plainWorkflow = workflow as {
    _id: string;
    id?: string;
    name: string;
    description?: string;
    status: WorkflowSummary["status"];
    createdAt: Date;
    updatedAt: Date;
    lastExecutedAt?: Date | null;
    nodes?: unknown[];
    edges?: unknown[];
  };

  return {
    id: plainWorkflow._id?.toString() ?? plainWorkflow.id ?? "",
    name: plainWorkflow.name,
    description: plainWorkflow.description,
    status: plainWorkflow.status,
    createdAt: plainWorkflow.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: plainWorkflow.updatedAt?.toISOString() ?? new Date().toISOString(),
    lastExecutedAt: plainWorkflow.lastExecutedAt
      ? plainWorkflow.lastExecutedAt.toISOString()
      : null,
    nodesCount: Array.isArray(plainWorkflow.nodes) ? plainWorkflow.nodes.length : 0,
    edgesCount: Array.isArray(plainWorkflow.edges) ? plainWorkflow.edges.length : 0,
  };
}

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

/**
 * Server Action to auto-save a workflow
 * This is called with debouncing (500ms) from the client
 */
export async function autoSaveWorkflow(
  workflowId: string | null,
  data: IntegrationDataFormat,
  userId = "default-user"
): Promise<{ success: boolean; workflowId: string; error?: string }> {
  try {
    await connectDB();

    const { name, nodes, edges } = data;

    // If workflowId exists, update the workflow
    if (workflowId) {
      const workflow = await Workflow.findByIdAndUpdate(
        workflowId,
        {
          name: name || "Untitled Workflow",
          description: data.description,
          nodes,
          edges,
          status: "draft",
        },
        { new: true, runValidators: true }
      );

      if (!workflow) {
        return { success: false, workflowId: "", error: "Workflow not found" };
      }

      revalidateWorkflowPaths();
      return { success: true, workflowId: workflow._id.toString() };
    }

    // Otherwise, create a new workflow
    const workflow = await Workflow.create({
      name: name || "Untitled Workflow",
      description: data.description,
      userId,
      nodes,
      edges,
      status: "draft",
    });

    revalidateWorkflowPaths();
    return { success: true, workflowId: workflow._id.toString() };
  } catch (error) {
    console.error("Error auto-saving workflow:", error);
    return {
      success: false,
      workflowId: workflowId || "",
      error: error instanceof Error ? error.message : "Failed to save workflow",
    };
  }
}

/**
 * Server Action to save a workflow (manual save)
 */
export async function saveWorkflow(
  workflowId: string | null,
  data: IntegrationDataFormat,
  userId = "default-user"
): Promise<{ success: boolean; workflowId: string; error?: string }> {
  // Same implementation as auto-save, but can be extended with additional logic
  return autoSaveWorkflow(workflowId, data, userId);
}

export async function getWorkflowsForUser(userId = "default-user"): Promise<WorkflowSummary[]> {
  await connectDB();
  const workflows = await Workflow.find({ userId }).sort({ updatedAt: -1 }).lean();
  return workflows.map((workflow) => serializeWorkflow(workflow));
}
