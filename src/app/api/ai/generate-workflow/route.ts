import { type NextRequest, NextResponse } from "next/server";
import { requirePrivySession, PrivyUnauthorizedError } from "@/lib/auth/privy";

const SUMOPOD_API_URL = "https://ai.sumopod.com/v1/chat/completions";
const SUMOPOD_API_KEY = process.env.OPENAI_API_KEY;

// Node registry for LLM context
const NODE_REGISTRY = {
  deposit: {
    description: "Entry point: Receives fiat (USD/IDR) from payment gateway",
    inputs: [],
    outputs: ["USD", "IDR"],
    requiredFields: ["amount", "currency", "paymentGateway"],
  },
  mint: {
    description: "Converts fiat to stablecoin (USD→mUSDT, IDR→IDRX)",
    inputs: ["USD", "IDR"],
    outputs: ["mUSDT", "IDRX"],
    requiredFields: ["amount", "currency"],
  },
  swap: {
    description: "Exchanges one token for another (e.g., IDRX→mUSDT)",
    inputs: ["mUSDT", "IDRX"],
    outputs: ["mUSDT", "IDRX"],
    requiredFields: ["amount", "fromToken", "toToken"],
  },
  bridge: {
    description: "Moves tokens across blockchains",
    inputs: ["mUSDT", "IDRX"],
    outputs: ["mUSDT", "IDRX"],
    requiredFields: ["amount", "fromNetwork", "toNetwork"],
  },
  redeem: {
    description: "Converts stablecoin back to fiat (mUSDT→USD, IDRX→IDR)",
    inputs: ["mUSDT", "IDRX"],
    outputs: ["USD", "IDR"],
    requiredFields: ["amount", "currency"],
  },
  transfer: {
    description: "Sends stablecoins to a wallet address",
    inputs: ["mUSDT", "IDRX"],
    outputs: [],
    requiredFields: ["amount", "toAddress", "token"],
  },
  vault: {
    description: "Deposits into yield vault with stop conditions",
    inputs: ["mUSDT"],
    outputs: ["vaultShares"],
    requiredFields: ["amount", "stopCondition"],
  },
  wait: {
    description: "Delays execution for specified duration",
    inputs: ["*"],
    outputs: ["*"],
    requiredFields: ["duration", "unit"],
  },
  partition: {
    description: "Splits amount into multiple branches (percentages must sum to 100%)",
    inputs: ["mUSDT", "IDRX"],
    outputs: ["mUSDT", "IDRX"],
    requiredFields: ["percentages"],
  },
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
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // System prompt with context
    const systemPrompt = `You are a TilepMoney workflow generator. You convert natural language descriptions into stablecoin workflow configurations.

Available Node Types:
${Object.entries(NODE_REGISTRY)
        .map(
          ([type, info]) =>
            `- ${type.toUpperCase()}: ${info.description}\n  Inputs: ${info.inputs?.join(", ") || "None"}\n  Outputs: ${info.outputs?.join(", ") || "None"}\n  Required Fields: ${info.requiredFields.join(", ")}`
        )
        .join("\n")}

Rules:
1. All workflows must start with a Deposit node (fiat entry point)
2. Fiat-to-fiat flows must go: Deposit → Mint → [Processing] → Redeem
3. Token compatibility: USD→mUSDT, IDR→IDRX
4. Always include ALL required fields for each node type
5. Generate logical node positions (x increases left-to-right by 320px, y for parallel branches)
6. Always include proper edge connections

Example:
Prompt: "Deposit 10,000 USD, mint to stablecoin, wait 7 days, then redeem to USD"
Response: {
  workflowName: "USD Deposit and Redeem with Wait",
  workflowDescription: "Deposit USD, convert to stablecoin, wait 7 days, then redeem back to USD",
  nodes: [
    { 
      id: "deposit-1", 
      type: "deposit", 
      label: "Deposit USD",
      properties: { 
        amount: 10000, 
        currency: "USD",
        paymentGateway: "DummyGatewayA",
        description: "Receive 10,000 USD funding"
      },
      position: { x: 0, y: 0 }
    },
    { 
      id: "mint-1", 
      type: "mint", 
      label: "Mint mUSDT",
      properties: { 
        amount: 10000, 
        currency: "USD",
        issuer: "IssuerA",
        receivingWallet: "0x1111111111111111111111111111111111111111",
        exchangeRate: 1,
        description: "Convert USD to mUSDT stablecoin"
      },
      position: { x: 320, y: 0 }
    },
    { 
      id: "wait-1", 
      type: "wait", 
      label: "Wait 7 Days",
      properties: { 
        delayDuration: 7, 
        timeUnit: "days",
        reason: "Waiting period",
        description: "Wait for 7 days"
      },
      position: { x: 640, y: 0 }
    },
    { 
      id: "redeem-1", 
      type: "redeem", 
      label: "Redeem to USD",
      properties: { 
        amount: 10000, 
        currency: "USD",
        recipientWallet: "Bank-Account-001",
        conversionRate: 1,
        description: "Convert mUSDT back to USD"
      },
      position: { x: 960, y: 0 }
    }
  ],
  edges: [
    { id: "edge-1", source: "deposit-1", target: "mint-1" },
    { id: "edge-2", source: "mint-1", target: "wait-1" },
    { id: "edge-3", source: "wait-1", target: "redeem-1" }
  ]
}`;

    // Call Sumopod API with function calling
    const response = await fetch(SUMOPOD_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUMOPOD_API_KEY}`,
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
      throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
    }

    const completion = await response.json();

    const functionCall = completion.choices[0]?.message?.function_call;

    if (!functionCall || functionCall.name !== "generate_workflow") {
      return NextResponse.json(
        { error: "Failed to generate workflow structure" },
        { status: 500 }
      );
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
    vault: "ShieldCheck",
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

