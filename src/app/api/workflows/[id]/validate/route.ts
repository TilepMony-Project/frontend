import connectDB from '@/lib/mongodb';
import Workflow from '@/models/Workflow';
import { type NextRequest, NextResponse } from 'next/server';

// POST /api/workflows/[id]/validate - Validate workflow before execution
export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await params;
    const workflow = await Workflow.findById(id);

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    const validationErrors: string[] = [];
    const validationWarnings: string[] = [];

    // Validate graph structure
    const nodes = workflow.nodes as Array<{ id: string; type: string; data: unknown }>;
    const edges = workflow.edges as Array<{ source: string; target: string }>;

    // Check for at least one entry node (Deposit)
    const hasDepositNode = nodes.some((node) => node.type === 'deposit');
    if (!hasDepositNode) {
      validationErrors.push('Workflow must have at least one Deposit node');
    }

    // Check for disconnected nodes
    const connectedNodeIds = new Set<string>();
    for (const edge of edges) {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    }

    const disconnectedNodes = nodes.filter((node) => {
      if (node.type === 'deposit') {
        // Deposit nodes don't need incoming connections
        return false;
      }
      return !connectedNodeIds.has(node.id);
    });

    if (disconnectedNodes.length > 0) {
      validationWarnings.push(`Found ${disconnectedNodes.length} disconnected node(s)`);
    }

    // Check for circular dependencies (basic check)
    // TODO: Implement proper cycle detection

    // Validate node configurations
    // TODO: Validate each node's configuration based on its schema

    return NextResponse.json(
      {
        valid: validationErrors.length === 0,
        errors: validationErrors,
        warnings: validationWarnings,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error validating workflow:', error);
    return NextResponse.json({ error: 'Failed to validate workflow' }, { status: 500 });
  }
}
