import mongoose, { Schema, Document } from 'mongoose';

export interface IExecution extends Document {
  workflowId: string;
  userId: string;
  status: 'running' | 'running_waiting' | 'stopped' | 'finished' | 'failed';
  startedAt: Date;
  finishedAt?: Date;
  currentNodeId?: string;
  executionLog: Array<{
    nodeId: string;
    nodeType: string;
    status: 'pending' | 'processing' | 'complete' | 'failed';
    timestamp: Date;
    transactionHash?: string;
    error?: string;
  }>;
  totalGasUsed?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExecutionSchema = new Schema<IExecution>(
  {
    workflowId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['running', 'running_waiting', 'stopped', 'finished', 'failed'],
      default: 'running',
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    finishedAt: {
      type: Date,
    },
    currentNodeId: {
      type: String,
    },
    executionLog: [
      {
        nodeId: String,
        nodeType: String,
        status: {
          type: String,
          enum: ['pending', 'processing', 'complete', 'failed'],
        },
        timestamp: Date,
        transactionHash: String,
        error: String,
      },
    ],
    totalGasUsed: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.Execution || mongoose.model<IExecution>('Execution', ExecutionSchema);

