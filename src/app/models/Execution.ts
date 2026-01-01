import mongoose, { Schema, type Document } from "mongoose";

export interface IExecution extends Document {
  workflowId: string;
  userId: string;
  status: "pending_signature" | "running" | "running_waiting" | "stopped" | "finished" | "failed";
  startedAt: Date;
  startedAtLocal?: string;
  finishedAt?: Date;
  finishedAtLocal?: string;
  currentNodeId?: string;
  executionLog: Array<{
    nodeId: string;
    nodeType: string;
    status: "pending" | "processing" | "complete" | "failed";
    timestamp: Date;
    transactionHash?: string;
    error?: string;
    // Granular analytics fields
    // Granular fields moved to detailExecution
    detailExecution?: any;
  }>;
  totalGasUsed?: string;
  gasPriceGwei?: string;
  totalFiatValue?: string;
  stepCount?: number;
  executionType?: "manual" | "scheduled" | "triggered";
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
    startedAtLocal: String,
    finishedAt: {
      type: Date,
    },
    finishedAtLocal: String,
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
        // Granular fields moved to detailExecution
        // Detailed structured data
        detailExecution: {
          type: Schema.Types.Mixed,
        },
      },
    ],
    totalGasUsed: {
      type: String,
    },
    gasPriceGwei: {
      type: String,
    },
    totalFiatValue: {
      type: String,
    },
    stepCount: {
      type: Number,
    },
    executionType: {
      type: String,
      enum: ["manual", "scheduled", "triggered"],
      default: "manual",
    },
    transactionHash: {
      type: String,
    },
    runCount: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Execution ||
  mongoose.model<IExecution>("Execution", ExecutionSchema);
