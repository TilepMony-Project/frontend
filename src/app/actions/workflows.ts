'use server';

import type { IntegrationDataFormat } from '@/features/integration/types';
import connectDB from '@/lib/mongodb';
import Workflow from '@/models/Workflow';
import { revalidatePath } from 'next/cache';

/**
 * Server Action to auto-save a workflow
 * This is called with debouncing (500ms) from the client
 */
export async function autoSaveWorkflow(
  workflowId: string | null,
  data: IntegrationDataFormat,
  userId = 'default-user'
): Promise<{ success: boolean; workflowId: string; error?: string }> {
  try {
    await connectDB();

    const { name, nodes, edges } = data;

    // If workflowId exists, update the workflow
    if (workflowId) {
      const workflow = await Workflow.findByIdAndUpdate(
        workflowId,
        {
          name: name || 'Untitled Workflow',
          description: data.layoutDirection ? `Layout: ${data.layoutDirection}` : undefined,
          nodes,
          edges,
          status: 'draft',
        },
        { new: true, runValidators: true }
      );

      if (!workflow) {
        return { success: false, workflowId: '', error: 'Workflow not found' };
      }

      revalidatePath('/');
      return { success: true, workflowId: workflow._id.toString() };
    }

    // Otherwise, create a new workflow
    const workflow = await Workflow.create({
      name: name || 'Untitled Workflow',
      description: data.layoutDirection ? `Layout: ${data.layoutDirection}` : undefined,
      userId,
      nodes,
      edges,
      status: 'draft',
    });

    revalidatePath('/');
    return { success: true, workflowId: workflow._id.toString() };
  } catch (error) {
    console.error('Error auto-saving workflow:', error);
    return {
      success: false,
      workflowId: workflowId || '',
      error: error instanceof Error ? error.message : 'Failed to save workflow',
    };
  }
}

/**
 * Server Action to save a workflow (manual save)
 */
export async function saveWorkflow(
  workflowId: string | null,
  data: IntegrationDataFormat,
  userId = 'default-user'
): Promise<{ success: boolean; workflowId: string; error?: string }> {
  // Same implementation as auto-save, but can be extended with additional logic
  return autoSaveWorkflow(workflowId, data, userId);
}
