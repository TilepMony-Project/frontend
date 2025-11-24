import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkflow extends Document {
  name: string;
  description?: string;
  userId: string;
  status: 'draft' | 'running' | 'running_waiting' | 'stopped' | 'finished' | 'failed';
  nodes: unknown[];
  edges: unknown[];
  createdAt: Date;
  updatedAt: Date;
  lastExecutedAt?: Date;
}

const WorkflowSchema = new Schema<IWorkflow>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'running', 'running_waiting', 'stopped', 'finished', 'failed'],
      default: 'draft',
    },
    nodes: {
      type: Schema.Types.Mixed,
      default: [],
    },
    edges: {
      type: Schema.Types.Mixed,
      default: [],
    },
    lastExecutedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Workflow || mongoose.model<IWorkflow>('Workflow', WorkflowSchema);
