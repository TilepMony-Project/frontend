import mongoose, { Schema, type Document } from "mongoose";

export interface ITransaction extends Document {
  workflowId: string;
  executionId: string;
  nodeId: string;
  nodeType: string;
  transactionHash: string;
  from: string;
  to: string;
  amount: string;
  token: string;
  gasUsed: string;
  status: "pending" | "confirmed" | "failed";
  blockNumber?: number;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    workflowId: {
      type: String,
      required: true,
      index: true,
    },
    executionId: {
      type: String,
      required: true,
      index: true,
    },
    nodeId: {
      type: String,
      required: true,
    },
    nodeType: {
      type: String,
      required: true,
    },
    transactionHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    from: {
      type: String,
      required: true,
    },
    to: {
      type: String,
      required: true,
    },
    amount: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    gasUsed: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "failed"],
      default: "pending",
    },
    blockNumber: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);
