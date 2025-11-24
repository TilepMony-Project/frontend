import connectDB from '@/lib/mongodb';
import Execution from '@/models/Execution';
import Workflow from '@/models/Workflow';
import { type NextRequest, NextResponse } from 'next/server';

// POST /api/workflows/[id]/execute - Execute workflow
export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await params;
    const workflow = await Workflow.findById(id);

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    // TODO: Add pre-execution validation
    // - Validate graph structure
    // - Validate node configurations
    // - Check wallet connection and balance

    // Create execution record
    const execution = await Execution.create({
      workflowId: id,
      userId: workflow.userId,
      status: 'running',
      startedAt: new Date(),
      executionLog: [],
    });

    // Update workflow status
    await Workflow.findByIdAndUpdate(id, {
      status: 'running',
      lastExecutedAt: new Date(),
    });

    // TODO: Start workflow execution in background
    // This should be handled by a job queue or background process
    // For now, we'll return the execution ID and handle execution via polling

    return NextResponse.json(
      {
        executionId: execution._id.toString(),
        status: 'running',
        message: 'Workflow execution started',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error executing workflow:', error);
    return NextResponse.json({ error: 'Failed to execute workflow' }, { status: 500 });
  }
}
