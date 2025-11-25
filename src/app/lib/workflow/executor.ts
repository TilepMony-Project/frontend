'use server';

import { randomBytes } from 'node:crypto';

import type { HydratedDocument } from 'mongoose';

import Execution, { type IExecution } from '@/models/Execution';
import Transaction from '@/models/Transaction';
import Workflow, { type IWorkflow } from '@/models/Workflow';
import type { WorkflowBuilderEdge, WorkflowBuilderNode } from '@/types/node-data';

type WorkflowDocument = HydratedDocument<IWorkflow> | (IWorkflow & { _id: string });

type ExecutionContext = {
  workflow: WorkflowDocument | IWorkflow;
  executionId: string;
  workflowId: string;
  userId: string;
  fiatBalances: Record<string, number>;
  tokenBalances: Record<string, number>;
};

type ExecutionResult =
  | {
    status: 'success';
    transaction?: TransactionPayload;
    metadata?: Record<string, unknown>;
  }
  | {
    status: 'waiting';
    waitDurationMs: number;
  }
  | {
    status: 'failed';
    error: string;
  };

type TransactionPayload = {
  hash: string;
  from: string;
  to: string;
  amount: number;
  token: string;
};

/**
 * Starts workflow execution in the background so the API route can respond immediately.
 */
export async function startWorkflowExecution(workflow: WorkflowDocument, execution: IExecution) {
  const workflowSnapshot = workflow.toObject();
  const executionId = execution._id.toString();

  // Run workflow processing asynchronously
  process.nextTick(() =>
    runWorkflowExecution(workflowSnapshot, executionId).catch((error) => {
      console.error('[Workflow Executor] Unhandled execution error:', error);
    })
  );
}

async function runWorkflowExecution(workflow: WorkflowDocument | IWorkflow, executionId: string) {
  const workflowId = workflow._id?.toString() ?? '';
  const userId = workflow.userId;
  const nodes = (workflow.nodes || []) as WorkflowBuilderNode[];
  const edges = (workflow.edges || []) as WorkflowBuilderEdge[];

  const executionOrder = determineExecutionOrder(nodes, edges);

  const context: ExecutionContext = {
    workflow,
    executionId,
    workflowId,
    userId,
    fiatBalances: { USD: 0, IDR: 0 },
    tokenBalances: {},
  };

  const logEntries: IExecution['executionLog'] = [];

  try {
    for (const nodeId of executionOrder) {
      const node = nodes.find((item) => item.id === nodeId);
      if (!node) {
        continue;
      }

      logEntries.push({
        nodeId: node.id,
        nodeType: node.type ?? 'unknown',
        status: 'processing',
        timestamp: new Date(),
      });

      await Execution.findByIdAndUpdate(executionId, {
        currentNodeId: node.id,
        executionLog: logEntries,
        status: 'running',
      });

      const result = await executeNode(node, context);

      if (result.status === 'waiting') {
        await Execution.findByIdAndUpdate(executionId, {
          status: 'running_waiting',
        });
        await delay(Math.min(result.waitDurationMs, 2000));
        await Execution.findByIdAndUpdate(executionId, {
          status: 'running',
        });
        logEntries[logEntries.length - 1] = {
          ...logEntries[logEntries.length - 1],
          status: 'complete',
          timestamp: new Date(),
        };
      } else if (result.status === 'success') {
        logEntries[logEntries.length - 1] = {
          ...logEntries[logEntries.length - 1],
          status: 'complete',
          timestamp: new Date(),
          ...(result.transaction ? { transactionHash: result.transaction.hash } : {}),
        };

        if (result.transaction) {
          await Transaction.create({
            workflowId,
            executionId,
            nodeId: node.id,
            nodeType: node.type ?? 'unknown',
            transactionHash: result.transaction.hash,
            from: result.transaction.from,
            to: result.transaction.to,
            amount: result.transaction.amount.toString(),
            token: result.transaction.token,
            gasUsed: (Math.floor(Math.random() * 500_000) + 50_000).toString(),
            status: 'confirmed',
          });
        }
      } else if (result.status === 'failed') {
        logEntries[logEntries.length - 1] = {
          ...logEntries[logEntries.length - 1],
          status: 'failed',
          timestamp: new Date(),
          error: result.error,
        };

        await Execution.findByIdAndUpdate(executionId, {
          executionLog: logEntries,
          currentNodeId: node.id,
          status: 'failed',
          finishedAt: new Date(),
        });
        await Workflow.findByIdAndUpdate(workflowId, { status: 'failed' });
        return;
      }

      await Execution.findByIdAndUpdate(executionId, {
        executionLog: logEntries,
        currentNodeId: null,
      });
    }

    await Execution.findByIdAndUpdate(executionId, {
      executionLog: logEntries,
      currentNodeId: null,
      status: 'finished',
      finishedAt: new Date(),
    });
    await Workflow.findByIdAndUpdate(workflowId, {
      status: 'finished',
      lastExecutedAt: new Date(),
    });
  } catch (error) {
    console.error('[Workflow Executor] Failed to execute workflow:', error);
    await Execution.findByIdAndUpdate(executionId, {
      executionLog: logEntries,
      currentNodeId: null,
      status: 'failed',
      finishedAt: new Date(),
    });
    await Workflow.findByIdAndUpdate(workflowId, { status: 'failed' });
  }
}

async function executeNode(
  node: WorkflowBuilderNode,
  context: ExecutionContext
): Promise<ExecutionResult> {
  const nodeType = (node.type || '').toLowerCase();
  const properties = (node.data?.properties || {}) as Record<string, unknown>;

  switch (nodeType) {
    case 'deposit': {
      const amount = getNumberProperty(properties, 'amount');
      const currency = getStringProperty(properties, 'currency', 'USD');
      if (Number.isNaN(amount) || amount <= 0) {
        return { status: 'failed', error: 'Invalid deposit amount' };
      }
      context.fiatBalances[currency] = (context.fiatBalances[currency] ?? 0) + amount;
      return { status: 'success' };
    }
    case 'mint': {
      const amount = getNumberProperty(properties, 'amount');
      const issuer = getStringProperty(properties, 'issuer', 'DummyIssuerA');
      const receivingWallet = getStringProperty(properties, 'receivingWallet', '0xwallet');
      const inputCurrency = getStringProperty(properties, 'currency', 'USD');
      if (context.fiatBalances[inputCurrency] < amount) {
        return { status: 'failed', error: 'Insufficient fiat balance for mint' };
      }
      context.fiatBalances[inputCurrency] -= amount;
      const outputToken = inputCurrency === 'IDR' ? 'IDRX' : 'USDX';
      context.tokenBalances[outputToken] = (context.tokenBalances[outputToken] ?? 0) + amount;
      return {
        status: 'success',
        transaction: {
          hash: generateMockHash(),
          from: issuer,
          to: receivingWallet,
          amount,
          token: outputToken,
        },
      };
    }
    case 'swap': {
      const amount = getNumberProperty(properties, 'amount');
      const inputToken = getStringProperty(properties, 'inputToken', 'USDX');
      const outputToken = getStringProperty(properties, 'outputToken', 'IDRX');
      if ((context.tokenBalances[inputToken] ?? 0) < amount) {
        return { status: 'failed', error: 'Insufficient token balance for swap' };
      }
      context.tokenBalances[inputToken] -= amount;
      context.tokenBalances[outputToken] = (context.tokenBalances[outputToken] ?? 0) + amount;
      return {
        status: 'success',
        transaction: {
          hash: generateMockHash(),
          from: 'DummyDEX',
          to: 'WorkflowWallet',
          amount,
          token: outputToken,
        },
      };
    }
    case 'bridge': {
      const amount = getNumberProperty(properties, 'amount');
      const receiverWallet = getStringProperty(properties, 'receiverWallet', '0xreceiver');
      const token = getStringProperty(properties, 'token', 'USDX');
      if ((context.tokenBalances[token] ?? 0) < amount) {
        return { status: 'failed', error: 'Insufficient funds for bridge' };
      }
      context.tokenBalances[token] -= amount;
      // Assume bridged tokens are credited back after transfer
      context.tokenBalances[token] = (context.tokenBalances[token] ?? 0) + amount;
      return {
        status: 'success',
        transaction: {
          hash: generateMockHash(),
          from: 'BridgeContract',
          to: receiverWallet,
          amount,
          token,
        },
      };
    }
    case 'redeem': {
      const amount = getNumberProperty(properties, 'amount');
      const sourceToken = getStringProperty(properties, 'token', 'USDX');
      const fiatCurrency = getStringProperty(properties, 'currency', 'USD');
      if ((context.tokenBalances[sourceToken] ?? 0) < amount) {
        return { status: 'failed', error: 'Insufficient tokens for redeem' };
      }
      context.tokenBalances[sourceToken] -= amount;
      context.fiatBalances[fiatCurrency] = (context.fiatBalances[fiatCurrency] ?? 0) + amount;
      return {
        status: 'success',
        transaction: {
          hash: generateMockHash(),
          from: 'RedeemContract',
          to: 'CorporateAccount',
          amount,
          token: sourceToken,
        },
      };
    }
    case 'transfer': {
      const amount = getNumberProperty(properties, 'amount');
      const recipientWallet = getStringProperty(properties, 'recipientWallet', '0xrecipient');
      const token = getStringProperty(properties, 'token', 'USDX');
      if ((context.tokenBalances[token] ?? 0) < amount) {
        return { status: 'failed', error: 'Insufficient tokens for transfer' };
      }
      context.tokenBalances[token] -= amount;
      return {
        status: 'success',
        transaction: {
          hash: generateMockHash(),
          from: 'WorkflowWallet',
          to: recipientWallet,
          amount,
          token,
        },
      };
    }
    case 'vault': {
      const amount = getNumberProperty(properties, 'amount');
      const token = 'mUSDT';
      if ((context.tokenBalances[token] ?? 0) < amount) {
        return { status: 'failed', error: 'Insufficient vault balance' };
      }
      context.tokenBalances[token] -= amount;
      return {
        status: 'success',
        transaction: {
          hash: generateMockHash(),
          from: 'WorkflowWallet',
          to: 'VaultContract',
          amount,
          token,
        },
      };
    }
    case 'wait': {
      const duration = getNumberProperty(properties, 'delayDuration', 1);
      const unit = getStringProperty(properties, 'timeUnit', 'seconds');
      const waitDurationMs = convertToMilliseconds(duration, unit);
      return { status: 'waiting', waitDurationMs };
    }
    case 'partition': {
      // Partition nodes simply log that branching decisions were evaluated.
      return { status: 'success' };
    }
    default: {
      return { status: 'success' };
    }
  }
}

function determineExecutionOrder(nodes: WorkflowBuilderNode[], edges: WorkflowBuilderEdge[]) {
  if (!nodes?.length) {
    return [];
  }

  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, Set<string>>();

  for (const node of nodes) {
    inDegree.set(node.id, 0);
    adjacency.set(node.id, new Set());
  }

  for (const edge of edges) {
    if (!edge.source || !edge.target) {
      continue;
    }
    adjacency.get(edge.source)?.add(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  }

  const queue: string[] = [];
  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) {
      queue.push(nodeId);
    }
  });

  const order: string[] = [];
  while (queue.length) {
    const current = queue.shift();
    if (!current) {
      break;
    }
    order.push(current);
    const neighbors = adjacency.get(current);
    if (neighbors) {
      for (const neighbor of neighbors) {
        inDegree.set(neighbor, (inDegree.get(neighbor) || 1) - 1);
        if ((inDegree.get(neighbor) || 0) === 0) {
          queue.push(neighbor);
        }
      }
    }
  }

  // Fallback: if there is a cycle, append remaining nodes in their original order
  if (order.length !== nodes.length) {
    for (const node of nodes) {
      if (!order.includes(node.id)) {
        order.push(node.id);
      }
    }
  }

  return order;
}

function convertToMilliseconds(duration: number, unit: string) {
  const base = Number.isFinite(duration) ? duration : 0;
  switch (unit) {
    case 'minutes':
      return base * 60 * 1000;
    case 'hours':
      return base * 60 * 60 * 1000;
    case 'days':
      return base * 24 * 60 * 60 * 1000;
    default:
      return base * 1000;
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateMockHash() {
  return `0x${randomBytes(32).toString('hex')}`;
}

function getNumberProperty(properties: Record<string, unknown>, key: string, fallback = 0) {
  const value = properties[key];
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function getStringProperty(properties: Record<string, unknown>, key: string, fallback = '') {
  const value = properties[key];
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }
  return fallback;
}
