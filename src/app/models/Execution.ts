import mongoose, { Schema, type Document } from "mongoose";

export interface IExecution extends Document {
  workflowId: string;
  userId: string;
  status: "pending_signature" | "running" | "running_waiting" | "stopped" | "finished" | "failed";
  startedAt: Date;
  finishedAt?: Date;
  currentNodeId?: string;
  executionLog: Array<{
    nodeId: string;
    nodeType: string;
    status: "pending" | "processing" | "complete" | "failed";
    timestamp: Date;
    transactionHash?: string;
    error?: string;
  }>;
  totalGasUsed?: string;
  transactionHash?: string; // Main controller tx hash
  runCount?: number;
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
      enum: ["pending_signature", "running", "running_waiting", "stopped", "finished", "failed"],
      default: "pending_signature",
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
          enum: ["pending", "processing", "complete", "failed"],
        },
        timestamp: Date,
        transactionHash: String,
        error: String,
      },
    ],
    totalGasUsed: {
      type: String,
    },
    transactionHash: {
      type: String,
    },
    runCount: {
      type: Number,
      default: 1,
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Execution ||
  mongoose.model<IExecution>("Execution", ExecutionSchema);
