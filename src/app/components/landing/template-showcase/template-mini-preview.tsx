"use client";

import {
  Controls,
  type Edge,
  MarkerType,
  type Node,
  type NodeTypes,
  ReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import { useMemo } from "react";
import "@xyflow/react/dist/style.css";
import { workflowTemplates } from "@/features/dashboard/data/templates";
import { LandingPageNode } from "../workflow-preview/landing-page-node";

interface TemplateMiniPreviewProps {
  templateId: string;
  className?: string;
}

// Map templates to React Flow format
const getMappedTemplate = (templateId: string) => {
  const template = workflowTemplates.find((t) => t.id === templateId);
  if (!template) return { nodes: [], edges: [] };

  const nodes: Node[] = template.nodes.map((node) => ({
    ...node,
    type: "landingPageNode",
    data: {
      ...node.data,
      icon: node.data.icon,
    },
  }));

  const edges: Edge[] = template.edges.map((edge) => ({
    ...edge,
    id: `e-${edge.source}-${edge.target}`,
    type: "default",
    sourceHandle: "source",
    targetHandle: "target",
    animated: false,
    style: { stroke: "#94a3b8", strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#94a3b8" },
  }));

  return { nodes, edges };
};

function MiniPreviewContent({ templateId }: { templateId: string }) {
  const { nodes, edges } = useMemo(() => getMappedTemplate(templateId), [templateId]);

  const nodeTypes = useMemo<NodeTypes>(
    () => ({
      landingPageNode: LandingPageNode as any,
    }),
    []
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.3 }}
      panOnDrag={true}
      zoomOnScroll={true}
      zoomOnPinch={true}
      zoomOnDoubleClick={true}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      minZoom={0.3}
      maxZoom={2}
      proOptions={{ hideAttribution: true }}
    >
      <Controls
        showInteractive={false}
        className="bg-card/90 backdrop-blur-sm border border-border rounded-lg shadow-lg [&>button]:bg-card [&>button]:border-border [&>button]:text-foreground [&>button:hover]:bg-muted"
      />
    </ReactFlow>
  );
}

export function TemplateMiniPreview({ templateId, className = "" }: TemplateMiniPreviewProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <ReactFlowProvider>
        <MiniPreviewContent templateId={templateId} />
      </ReactFlowProvider>
    </div>
  );
}
