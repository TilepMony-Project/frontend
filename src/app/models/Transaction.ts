import mongoose, { type Document, Schema } from "mongoose";

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
  createdAt?: Date;
  updatedAt?: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    workflowId: { type: String, required: true, index: true },
    executionId: { type: String, required: true, index: true },
    nodeId: { type: String, required: true },
    nodeType: { type: String, required: true },
    transactionHash: { type: String, required: true, unique: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    amount: { type: String, required: true },
    token: { type: String, required: true },
    gasUsed: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Transaction =
  (mongoose.models.Transaction as mongoose.Model<ITransaction>) ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);

export default Transaction;
