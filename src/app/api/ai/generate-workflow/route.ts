import { type NextRequest, NextResponse } from "next/server";
import { requirePrivySession, PrivyUnauthorizedError } from "@/lib/auth/privy";
import { generateSystemPrompt } from "./prompts";

// Import node schemas for property information
import { schema as depositSchema } from "@/data/nodes/deposit/schema";
import { schema as mintSchema } from "@/data/nodes/mint/schema";
import { schema as swapSchema } from "@/data/nodes/swap/schema";
import { schema as bridgeSchema } from "@/data/nodes/bridge/schema";
import { schema as redeemSchema } from "@/data/nodes/redeem/schema";
import { schema as transferSchema } from "@/data/nodes/transfer/schema";
import { schema as yieldDepositSchema } from "@/data/nodes/yield-deposit/schema";
import { schema as yieldWithdrawSchema } from "@/data/nodes/yield-withdraw/schema";
import { schema as waitSchema } from "@/data/nodes/wait/schema";
import { schema as partitionSchema } from "@/data/nodes/partition/schema";

const SUMOPOD_API_URL = "https://ai.sumopod.com/v1/chat/completions";
const SUMOPOD_API_KEY = process.env.OPENAI_API_KEY;

if (!SUMOPOD_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable");
}

// Helper to extract property info from schema
function extractPropertyInfo(schema: any) {
  const properties = schema.properties || {};
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(properties)) {
    const prop = value as any;
    result[key] = {
      type: prop.type,
      description: prop.description,
      minimum: prop.minimum,
      maximum: prop.maximum,
      pattern: prop.pattern,
      readOnly: prop.readOnly,
      placeholder: prop.placeholder,
    };

    if (prop.options) {
      result[key].options = prop.options.map((opt: any) => opt.value);
      result[key].optionLabels = prop.options.map((opt: any) => opt.label);
    }
  }

  return result;
}

// Node registry for LLM context with property details
const NODE_REGISTRY = {
  deposit: {
    description: "Entry point: Receives fiat (USD/IDR) from payment gateway",
    inputs: [],
    outputs: ["USD", "IDR"],
    requiredFields: ["amount", "currency", "paymentGateway"],
    properties: extractPropertyInfo(depositSchema),
  },
  mint: {
    description: "Converts fiat to stablecoin (USD→mUSDT, IDR→IDRX)",
    inputs: ["USD", "IDR"],
    outputs: ["mUSDT", "IDRX"],
    requiredFields: ["amount", "currency", "issuer", "receivingWallet"],
    properties: extractPropertyInfo(mintSchema),
  },
  swap: {
    description: "Exchanges one token for another (e.g., IDRX→mUSDT)",
    inputs: ["mUSDT", "IDRX"],
    outputs: ["mUSDT", "IDRX"],
    requiredFields: ["amount", "inputToken", "outputToken"],
    properties: extractPropertyInfo(swapSchema),
  },
  bridge: {
    description: "Moves tokens across blockchains",
    inputs: ["mUSDT", "IDRX"],
    outputs: ["mUSDT", "IDRX"],
    requiredFields: ["amount", "bridgeProvider", "receiverWallet"],
    properties: extractPropertyInfo(bridgeSchema),
  },
  redeem: {
    description: "Converts stablecoin back to fiat (mUSDT→USD, IDRX→IDR)",
    inputs: ["mUSDT", "IDRX"],
    outputs: ["USD", "IDR"],
    requiredFields: ["amount", "currency", "recipientWallet"],
    properties: extractPropertyInfo(redeemSchema),
  },
  transfer: {
    description: "Sends stablecoins to a wallet address",
    inputs: ["mUSDT", "IDRX"],
    outputs: ["mUSDT", "IDRX"], // Transfer now has outputs
    requiredFields: ["amount", "recipientAddress"],
    properties: extractPropertyInfo(transferSchema),
  },
  "yield-deposit": {
    description: "Deposits stablecoins into yield protocols (Aave, etc.)",
    inputs: ["mUSDT", "IDRX"],
    outputs: ["vaultShares"],
    requiredFields: ["amount", "yieldAdapter", "underlyingToken"],
    properties: extractPropertyInfo(yieldDepositSchema),
  },
  "yield-withdraw": {
    description: "Withdraws from yield protocols back to stablecoins",
    inputs: ["vaultShares"],
    outputs: ["mUSDT", "IDRX"],
    requiredFields: ["amount", "yieldAdapter"],
    properties: extractPropertyInfo(yieldWithdrawSchema),
  },
  wait: {
    description: "Delays execution for specified duration",
    inputs: ["*"],
    outputs: ["*"],
    requiredFields: ["delayDuration", "timeUnit"],
    properties: extractPropertyInfo(waitSchema),
  },
  partition: {
    description: "Splits amount into multiple branches (percentages must sum to 100%)",
    inputs: ["mUSDT", "IDRX"],
    outputs: ["mUSDT", "IDRX"],
    requiredFields: ["numberOfBranches", "branches"],
    properties: extractPropertyInfo(partitionSchema),
  },
};

// ...

// Icon mapping for each node type
  const iconMap: Record<string, string> = {
    deposit: "DollarSign",
    mint: "Coins",
    swap: "ArrowLeftRight",
    bridge: "Link2",
    redeem: "Building2",
    transfer: "Send",
    "yield-deposit": "TrendingUp",
    "yield-withdraw": "TrendingDown",
    wait: "Clock",
    partition: "GitBranch",
  };

// Function definition for OpenAI function calling
const generateWorkflowFunction = {
  name: "generate_workflow",
  description: "Generates a TilepMoney workflow configuration from natural language description",
  parameters: {
    type: "object",
    properties: {
      workflowName: {
        type: "string",
        description: "A descriptive name for the workflow",
      },
      workflowDescription: {
        type: "string",
        description: "Detailed description of what the workflow does",
      },
      nodes: {
        type: "array",
        description: "Array of node configurations",
        items: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Unique node ID (e.g., 'deposit-1', 'mint-1')",
            },
            type: {
              type: "string",
              enum: Object.keys(NODE_REGISTRY),
              description: "Node type",
            },
            label: {
              type: "string",
              description: "Human-readable label for the node",
            },
            properties: {
              type: "object",
              description: "Node-specific properties based on schema",
            },
            position: {
              type: "object",
              properties: {
                x: { type: "number" },
                y: { type: "number" },
              },
            },
          },
          required: ["id", "type", "label", "properties"],
        },
      },
      edges: {
        type: "array",
        description: "Array of edge connections between nodes",
        items: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Unique edge ID",
            },
            source: {
              type: "string",
              description: "Source node ID",
            },
            target: {
              type: "string",
              description: "Target node ID",
            },
            sourceHandle: {
              type: "string",
              description: "Output handle (usually 'output')",
            },
            targetHandle: {
              type: "string",
              description: "Input handle (usually 'input')",
            },
          },
          required: ["id", "source", "target"],
        },
      },
    },
    required: ["workflowName", "workflowDescription", "nodes", "edges"],
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Generate system prompt with node registry
    const systemPrompt = generateSystemPrompt(NODE_REGISTRY);

    // Call Sumopod API with function calling
    const response = await fetch(SUMOPOD_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUMOPOD_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Generate a workflow for: "${prompt}"`,
          },
        ],
        functions: [generateWorkflowFunction],
        function_call: { name: "generate_workflow" },
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `API request failed with status ${response.status}`
      );
    }

    const completion = await response.json();

    const functionCall = completion.choices[0]?.message?.function_call;

    if (!functionCall || functionCall.name !== "generate_workflow") {
      return NextResponse.json({ error: "Failed to generate workflow structure" }, { status: 500 });
    }

    const workflowConfig = JSON.parse(functionCall.arguments);

    // Validate and enhance the workflow
    const validatedWorkflow = validateAndEnhanceWorkflow(workflowConfig);

    return NextResponse.json({
      success: true,
      workflow: validatedWorkflow,
    });
  } catch (error: unknown) {
    if (error instanceof PrivyUnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    console.error("Error generating workflow:", error);
    return NextResponse.json(
      {
        error: "Failed to generate workflow",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

function validateAndEnhanceWorkflow(config: any) {
  // Ensure workflow starts with Deposit
  const hasDeposit = config.nodes.some((n: any) => n.type === "deposit");
  if (!hasDeposit) {
    throw new Error("Workflow must start with a Deposit node");
  }

  // Icon mapping for each node type
  const iconMap: Record<string, string> = {
    deposit: "DollarSign",
    mint: "Coins",
    swap: "ArrowLeftRight",
    bridge: "Link2",
    redeem: "Building2",
    transfer: "Send",
    "yield-deposit": "TrendingUp",
    "yield-withdraw": "TrendingDown",
    wait: "Clock",
    partition: "GitBranch",
  };

  // Transform nodes to ReactFlow format
  const nodesWithReactFlowFormat = config.nodes.map((node: any, index: number) => {
    const nodeType = node.type;
    const icon = iconMap[nodeType] || "Circle";

    return {
      id: node.id,
      type: "Node", // ReactFlow node type
      position: node.position || {
        x: index * 320,
        y: 0,
      },
      data: {
        segments: [],
        type: nodeType, // Our custom node type (deposit, mint, etc.)
        icon: icon,
        properties: {
          label: node.label || `${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} Node`,
          description: node.properties?.description || `${nodeType} operation`,
          ...node.properties,
        },
      },
    };
  });

  // Transform edges to ReactFlow format with proper handles
  const edgesWithReactFlowFormat = config.edges.map((edge: any, index: number) => ({
    animated: false,
    id: edge.id || `edge-${index}`,
    type: "labelEdge",
    source: edge.source,
    target: edge.target,
    sourceHandle: `${edge.source}:source`,
    targetHandle: `${edge.target}:target`,
  }));

  return {
    ...config,
    nodes: nodesWithReactFlowFormat,
    edges: edgesWithReactFlowFormat,
  };
}
