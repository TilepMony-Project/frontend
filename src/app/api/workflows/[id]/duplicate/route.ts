import connectDB from '@/lib/mongodb';
import Workflow from '@/models/Workflow';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

function revalidateWorkflowPaths() {
  const paths = ['/', '/dashboard', '/workspace', '/workspace/[workflowId]'];
  for (const path of paths) {
    if (path.includes('[')) {
      revalidatePath(path, 'page');
    } else {
      revalidatePath(path);
    }
  }
}

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await params;
    const originalWorkflow = await Workflow.findById(id);

    if (!originalWorkflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    const duplicatedWorkflow = await Workflow.create({
      name: `${originalWorkflow.name ?? 'Workflow'} (Copy)`,
      description: originalWorkflow.description,
      userId: originalWorkflow.userId,
      nodes: originalWorkflow.nodes,
      edges: originalWorkflow.edges,
      status: 'draft',
      lastExecutedAt: null,
    });

    revalidateWorkflowPaths();

    return NextResponse.json({ workflow: duplicatedWorkflow }, { status: 201 });
  } catch (error) {
    console.error('Error duplicating workflow:', error);
    return NextResponse.json({ error: 'Failed to duplicate workflow' }, { status: 500 });
  }
}
