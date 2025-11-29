"use client";

import { useCallback, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  type NodeTypes,
  Position,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { LandingPageNode } from "./landing-page-node";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { depositNode } from "@/data/nodes/deposit/deposit";
import { swapNode } from "@/data/nodes/swap/swap";
import { waitNode } from "@/data/nodes/wait/wait";
import { transferNode } from "@/data/nodes/transfer/transfer";
import { bridgeNode } from "@/data/nodes/bridge/bridge";
import { mintNode } from "@/data/nodes/mint/mint";
import { partitionNode } from "@/data/nodes/partition/partition";
import { redeemNode } from "@/data/nodes/redeem/redeem";
import { vaultNode } from "@/data/nodes/vault/vault";

const ALL_NODES = [
  depositNode,
  swapNode,
  waitNode,
  transferNode,
  bridgeNode,
  mintNode,
  partitionNode,
  redeemNode,
  vaultNode,
];

import { workflowTemplates } from "@/features/dashboard/data/templates";

// Map real templates to the format needed for the preview
const MAPPED_TEMPLATES = workflowTemplates.reduce(
  (acc, template) => {
    acc[template.id] = {
      label: template.name,
      nodes: template.nodes.map((node) => ({
        ...node,
        type: "landingPageNode", // Override type for landing page
        data: {
          ...node.data,
          // Ensure icon is passed correctly if it exists in data
          icon: node.data.icon,
        },
      })),
      edges: template.edges.map((edge) => ({
        ...edge,
        id: `e-${edge.source}-${edge.target}`, // Ensure unique ID
        type: "default", // Use default edge type
        sourceHandle: "source", // Match LandingPageNode handle ID
        targetHandle: "target", // Match LandingPageNode handle ID
        animated: true,
        style: { stroke: "#94a3b8", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#94a3b8" },
      })),
    };
    return acc;
  },
  {} as Record<string, { label: string; nodes: Node[]; edges: Edge[] }>
);

const DEFAULT_TEMPLATE_ID = "cross-border-treasury-transfer";

function WorkflowPreviewContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState(
    MAPPED_TEMPLATES[DEFAULT_TEMPLATE_ID]?.nodes || []
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    MAPPED_TEMPLATES[DEFAULT_TEMPLATE_ID]?.edges || []
  );
  const { fitView } = useReactFlow();

  const nodeTypes = useMemo<NodeTypes>(
    () => ({
      landingPageNode: LandingPageNode as any,
    }),
    []
  );

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: "#94a3b8", strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: "#94a3b8",
            },
          },
          eds
        )
      ),
    [setEdges]
  );

  const handleAddNode = (nodeDef: (typeof ALL_NODES)[0]) => {
    const id = Math.random().toString(36).substring(7);
    const newNode: Node = {
      id,
      type: "landingPageNode",
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 200 + 100,
      },
      data: {
        icon: nodeDef.icon,
        properties: {
          label: nodeDef.label,
          description: nodeDef.description,
        },
      },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const handleTemplateChange = (value: string) => {
    const template = MAPPED_TEMPLATES[value];
    if (template) {
      setNodes(template.nodes);
      setEdges(template.edges);
      setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 100);
    }
  };

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const nodeType = event.dataTransfer.getData("application/reactflow");
      if (!nodeType) return;

      const nodeDef = ALL_NODES.find((n) => n.type === nodeType);
      if (!nodeDef) return;

      // Get the React Flow instance to convert screen coordinates to flow coordinates
      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      const id = Math.random().toString(36).substring(7);
      const newNode: Node = {
        id,
        type: "landingPageNode",
        position,
        data: {
          icon: nodeDef.icon,
          properties: {
            label: nodeDef.label,
            description: nodeDef.description,
          },
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  return (
    <div className="w-full h-full relative bg-white dark:bg-[#151516]">
      {/* Node Selector (Left) */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 bg-white/80 dark:bg-[#1b1b1d]/80 backdrop-blur-sm p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm min-w-[180px] max-h-[200px] overflow-y-scroll">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-1 mb-1">
          Add Node
        </span>
        <div className="flex flex-col gap-2 overflow-y-auto pr-1 ">
          {ALL_NODES.map((node) => (
            <Button
              key={node.label}
              variant="ghost"
              size="sm"
              className="justify-start gap-2 py-4 text-xs w-full cursor-grab active:cursor-grabbing"
              onClick={() => handleAddNode(node)}
              draggable
              onDragStart={(e) => onDragStart(e, node.type)}
            >
              <Icon name={node.icon} size={14} />
              {node.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Template Selector (Right) */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5 bg-white/80 dark:bg-[#1b1b1d]/80 backdrop-blur-sm p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm min-w-[200px]">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-1">
          Templates
        </span>
        <Select defaultValue={DEFAULT_TEMPLATE_ID} onValueChange={handleTemplateChange}>
          <SelectTrigger className="h-8 w-full bg-white dark:bg-[#242427] border-gray-200 dark:border-gray-700">
            <SelectValue placeholder="Select template" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(MAPPED_TEMPLATES).map(([key, template]) => (
              <SelectItem key={key} value={key}>
                {template.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gray-50/50 dark:bg-[#0c0c0e]/50"
        minZoom={0.5}
        maxZoom={1}
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#94a3b8" gap={20} size={1} className="opacity-20" />
        <Controls className="bg-white dark:bg-[#1b1b1d] border-gray-200 dark:border-gray-700 fill-gray-900 dark:fill-gray-100 [&>button]:border-gray-200 dark:[&>button]:border-gray-700 [&>button]:bg-white dark:[&>button]:bg-[#1b1b1d] [&>button]:fill-gray-900 dark:[&>button]:fill-gray-100 [&>button:hover]:bg-gray-50 dark:[&>button:hover]:bg-[#242427]" />
      </ReactFlow>
    </div>
  );
}

export default function WorkflowPreview() {
  return (
    <ReactFlowProvider>
      <WorkflowPreviewContent />
    </ReactFlowProvider>
  );
}
