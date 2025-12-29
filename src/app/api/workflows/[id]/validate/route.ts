import { PrivyUnauthorizedError, requirePrivySession } from "@/lib/auth/privy";
import connectDB from "@/lib/mongodb";
import Workflow from "@/models/Workflow";
import type { WorkflowBuilderEdge, WorkflowBuilderNode } from "@/types/node-data";
import { type NextRequest, NextResponse } from "next/server";

const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

type ValidationMessage = {
  section: "graph" | "configuration" | "wallet";
  message: string;
};

type ValidationChecklistItem = {
  id: string;
  label: string;
  status: "pass" | "fail" | "warning";
  details?: string;
};

// POST /api/workflows/[id]/validate - Validate workflow before execution
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await requirePrivySession(request);
    await connectDB();

    const { id } = await params;
    const workflow = await Workflow.findOne({ _id: id, userId });

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    const nodes = (workflow.nodes || []) as WorkflowNode[];
    const edges = (workflow.edges || []) as WorkflowEdge[];

    const graphResult = validateGraphStructure(nodes, edges);
    const configResult = validateNodeConfigurations(nodes);
    const walletResult = validateWalletAndAddresses(nodes);

    const errors = [...graphResult.errors, ...configResult.errors, ...walletResult.errors];
    const warnings = [...graphResult.warnings, ...configResult.warnings, ...walletResult.warnings];
    const checklist = [...graphResult.checks, ...configResult.checks, ...walletResult.checks];

    return NextResponse.json(
      {
        valid: errors.length === 0,
        errors,
        warnings,
        checklist,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof PrivyUnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Error validating workflow:", error);
    return NextResponse.json({ error: "Failed to validate workflow" }, { status: 500 });
  }
}

type WorkflowNode = {
  id: string;
  type: string;
  data?: { properties?: Record<string, unknown> };
};

type WorkflowEdge = WorkflowBuilderEdge & { source: string; target: string };

function validateGraphStructure(nodes: WorkflowNode[], edges: WorkflowEdge[]) {
  const errors: ValidationMessage[] = [];
  const warnings: ValidationMessage[] = [];
  const checks: ValidationChecklistItem[] = [];

  const entryNodes = nodes.filter((node) => {
    const nodeType = (node.data as any)?.type || node.type;
    return nodeType === "deposit" || nodeType === "mint";
  });
  if (entryNodes.length === 0) {
    errors.push({
      section: "graph",
      message: "Workflow must include at least one Mint or Deposit node.",
    });
    checks.push({
      id: "entry-node",
      label: "Entry node present",
      status: "fail",
      details: "Add a Mint or Deposit node to start the workflow.",
    });
  } else {
    checks.push({
      id: "entry-node",
      label: "Entry node present",
      status: "pass",
    });
  }

  const adjacency = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const node of nodes) {
    adjacency.set(node.id, []);
    inDegree.set(node.id, 0);
  }

  for (const edge of edges) {
    if (!adjacency.has(edge.source) || !adjacency.has(edge.target)) {
      continue;
    }
    adjacency.get(edge.source)?.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  }

  const queue: string[] = nodes
    .filter((node) => inDegree.get(node.id) === 0)
    .map((node) => node.id);
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;
    visited.add(current);
    for (const neighbor of adjacency.get(current) || []) {
      inDegree.set(neighbor, (inDegree.get(neighbor) || 1) - 1);
      if ((inDegree.get(neighbor) || 0) === 0) {
        queue.push(neighbor);
      }
    }
  }

  if (visited.size !== nodes.length) {
    errors.push({
      section: "graph",
      message: "Graph contains circular dependencies or unreachable nodes.",
    });
    checks.push({
      id: "graph-acyclic",
      label: "No cycles detected",
      status: "fail",
      details: "Ensure the workflow graph has no circular connections.",
    });
  } else {
    checks.push({
      id: "graph-acyclic",
      label: "No cycles detected",
      status: "pass",
    });
  }

  const reachable = new Set<string>();
  const startNodes = entryNodes.map((node) => node.id);
  const stack = [...startNodes];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || reachable.has(current)) continue;
    reachable.add(current);
    for (const neighbor of adjacency.get(current) || []) {
      stack.push(neighbor);
    }
  }

  const disconnected = nodes.filter((node) => !reachable.has(node.id));
  if (disconnected.length > 0) {
    warnings.push({
      section: "graph",
      message: `Found ${disconnected.length} disconnected node(s).`,
    });
    checks.push({
      id: "graph-connected",
      label: "All nodes reachable",
      status: "warning",
      details: "Ensure every node is connected downstream from a Deposit node.",
    });
  } else {
    checks.push({
      id: "graph-connected",
      label: "All nodes reachable",
      status: "pass",
    });
  }

  const invalidEdges = edges.filter((edge) => !edge.source || !edge.target);
  if (invalidEdges.length > 0) {
    errors.push({
      section: "graph",
      message: "Found edges with missing source or target.",
    });
    checks.push({
      id: "edges-valid",
      label: "Edges properly connected",
      status: "fail",
      details: "Remove edges without both source and target nodes.",
    });
  } else {
    checks.push({
      id: "edges-valid",
      label: "Edges properly connected",
      status: "pass",
    });
  }

  return { errors, warnings, checks };
}

function validateNodeConfigurations(nodes: WorkflowNode[]) {
  const errors: ValidationMessage[] = [];
  const warnings: ValidationMessage[] = [];
  const checks: ValidationChecklistItem[] = [];

  const missingConfigs: string[] = [];
  const partitionIssues: string[] = [];

  for (const node of nodes) {
    const props = getNodeProperties(node);
    if (!props) {
      missingConfigs.push(node.id);
      continue;
    }

    const nodeType = getNodeType(node);

    switch (nodeType) {
      case "deposit": {
        const amount = toNumber(props.amount);
        if (amount < 100 || amount > 100_000_000) {
          errors.push({
            section: "configuration",
            message: `Deposit node "${getNodeLabel(node)}" amount must be between 100 and 100,000,000.`,
          });
        }
        if (!props.currency) {
          errors.push({
            section: "configuration",
            message: `Deposit node "${getNodeLabel(node)}" must have a currency selected.`,
          });
        }
        break;
      }
      case "mint": {
        // Mint automatically goes to user wallet, so no wallet check needed
        if (toNumber(props.amount) <= 0) {
          errors.push({
            section: "configuration",
            message: `Mint node "${getNodeLabel(node)}" must have a positive amount.`,
          });
        }
        break;
      }
      case "swap": {
        const inputToken = props.inputToken as string | undefined;
        const outputToken = props.outputToken as string | undefined;
        const slippage = toNumber(props.slippageTolerance);
        if (inputToken && outputToken && inputToken === outputToken) {
          errors.push({
            section: "configuration",
            message: `Swap node "${getNodeLabel(node)}" input and output tokens must differ.`,
          });
        }
        if (slippage < 0.1 || slippage > 5) {
          errors.push({
            section: "configuration",
            message: `Swap node "${getNodeLabel(node)}" slippage tolerance must be between 0.1% and 5%.`,
          });
        }
        break;
      }
      case "transfer": {
        const wallet = props.recipientAddress as string | undefined;
        // Transfer uses percentageOfInput instead of absolute amount usually, but we check if configured
        if (!wallet || !ETH_ADDRESS_REGEX.test(wallet)) {
          errors.push({
            section: "configuration",
            message: `Transfer node "${getNodeLabel(node)}" requires a valid recipient wallet address.`,
          });
        }
        break;
      }
      case "bridge": {
        const wallet = props.receiverWallet as string | undefined;
        if (!wallet || !ETH_ADDRESS_REGEX.test(wallet)) {
          errors.push({
            section: "configuration",
            message: `Bridge node "${getNodeLabel(node)}" requires a valid receiver wallet address.`,
          });
        }
        if (toNumber(props.amount) <= 0) {
          errors.push({
            section: "configuration",
            message: `Bridge node "${getNodeLabel(node)}" amount must be greater than zero.`,
          });
        }
        break;
      }
      case "vault": {
        if (!props.stopCondition) {
          warnings.push({
            section: "configuration",
            message: `Vault node "${getNodeLabel(node)}" should define a stop condition.`,
          });
        }
        break;
      }
      case "partition": {
        const branches = Array.isArray(props.branches)
          ? (props.branches as Array<{ percentage: number }>)
          : [];
        const total = branches.reduce((sum, branch) => sum + toNumber(branch.percentage), 0);
        if (Math.round(total) !== 100) {
          partitionIssues.push(getNodeLabel(node));
        }
        break;
      }
      case "wait": {
        const duration = toNumber(props.delayDuration);
        if (duration <= 0) {
          errors.push({
            section: "configuration",
            message: `Wait node "${getNodeLabel(node)}" must have a positive delay duration.`,
          });
        }
        break;
      }
      default:
        break;
    }
  }

  if (missingConfigs.length > 0) {
    errors.push({
      section: "configuration",
      message: "Some nodes are missing configuration data. Please fill in required fields.",
    });
    checks.push({
      id: "config-complete",
      label: "Node configuration completeness",
      status: "fail",
      details: `Incomplete nodes: ${missingConfigs.length}`,
    });
  } else {
    checks.push({
      id: "config-complete",
      label: "Node configuration completeness",
      status: "pass",
    });
  }

  if (partitionIssues.length > 0) {
    errors.push({
      section: "configuration",
      message: "Partition nodes must allocate exactly 100% across branches.",
    });
    checks.push({
      id: "partition-percent",
      label: "Partition allocations sum to 100%",
      status: "fail",
    });
  } else {
    checks.push({
      id: "partition-percent",
      label: "Partition allocations sum to 100%",
      status: "pass",
    });
  }

  if (errors.filter((e) => e.section === "configuration").length === 0) {
    checks.push({
      id: "config-valid",
      label: "Node inputs valid",
      status: "pass",
    });
  } else {
    checks.push({
      id: "config-valid",
      label: "Node inputs valid",
      status: "fail",
      details: "Fix invalid amounts and tokens before execution.",
    });
  }

  return { errors, warnings, checks };
}

function validateWalletAndAddresses(nodes: WorkflowNode[]) {
  const errors: ValidationMessage[] = [];
  const warnings: ValidationMessage[] = [];
  const checks: ValidationChecklistItem[] = [];

  const nodesWithWallets = nodes.filter((node) => {
    const nodeType = getNodeType(node);
    return ["transfer", "bridge"].includes(nodeType);
  });

  let invalidAddresses = 0;

  for (const node of nodesWithWallets) {
    const props = getNodeProperties(node);
    if (!props) continue;

    const address =
      (props.recipientAddress as string | undefined) ||
      (props.recipientWallet as string | undefined) ||
      (props.receiverWallet as string | undefined) ||
      (props.receivingWallet as string | undefined);

    if (!address || !ETH_ADDRESS_REGEX.test(address)) {
      invalidAddresses += 1;
      errors.push({
        section: "wallet",
        message: `Node "${getNodeLabel(node)}" must have a valid Ethereum address.`,
      });
    }
  }

  if (invalidAddresses === 0) {
    checks.push({
      id: "wallet-addresses",
      label: "Wallet addresses valid",
      status: "pass",
    });
  } else {
    checks.push({
      id: "wallet-addresses",
      label: "Wallet addresses valid",
      status: "fail",
      details: `${invalidAddresses} node(s) contain invalid wallet addresses.`,
    });
  }

  if (errors.filter((e) => e.section === "wallet").length === 0) {
    warnings.push({
      section: "wallet",
      message:
        "Wallet connection verification is not yet implemented. Ensure your wallet is connected before running.",
    });
    checks.push({
      id: "wallet-connection",
      label: "Wallet connected",
      status: "warning",
      details: "Wallet connectivity check is not automated yet.",
    });
  } else {
    checks.push({
      id: "wallet-connection",
      label: "Wallet connected",
      status: "fail",
    });
  }

  return { errors, warnings, checks };
}

function getNodeType(node: WorkflowNode): string {
  return (node.data as any)?.type || node.type || "";
}

function getNodeProperties(node: WorkflowNode) {
  return node.data?.properties as Record<string, unknown> | undefined;
}

function getNodeLabel(node: WorkflowNode) {
  const props = getNodeProperties(node);
  return (props?.label as string) || getNodeType(node) || node.id;
}

function toNumber(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}
