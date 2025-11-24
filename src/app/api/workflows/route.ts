import connectDB from '@/lib/mongodb';
import Workflow from '@/models/Workflow';
import { revalidatePath } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';

function revalidateWorkflowPaths() {
  const paths = ['/', '/dashboard', '/workspace', '/workspace/[workflowId]'];
  for (const path of paths) {
    revalidatePath(path);
  }
}

// GET /api/workflows - List all workflows for user
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || 'default-user'; // TODO: Get from auth

    const workflows = await Workflow.find({ userId }).sort({ updatedAt: -1 }).lean();

    return NextResponse.json({ workflows }, { status: 200 });
  } catch (error) {
    console.error('Error fetching workflows:', error);
    return NextResponse.json({ error: 'Failed to fetch workflows' }, { status: 500 });
  }
}

// POST /api/workflows - Create new workflow
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, description, nodes = [], edges = [], userId = 'default-user' } = body;

    const workflow = await Workflow.create({
      name,
      description,
      userId,
      nodes,
      edges,
      status: 'draft',
    });

    revalidateWorkflowPaths();

    return NextResponse.json({ workflow }, { status: 201 });
  } catch (error) {
    console.error('Error creating workflow:', error);
    return NextResponse.json({ error: 'Failed to create workflow' }, { status: 500 });
  }
}
