import mongoose, { Schema, type Document } from "mongoose";

export interface IMstUser extends Document {
  privyUserId: string;
  email?: string;
  walletAddress?: string;
  linkedAccounts?: Record<string, unknown>;
  privyUser?: Record<string, unknown>;
  lastSyncedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MstUserSchema = new Schema<IMstUser>(
  {
    privyUserId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    walletAddress: {
      type: String,
      lowercase: true,
      trim: true,
    },
    linkedAccounts: {
      type: Schema.Types.Mixed,
      default: {},
    },
    privyUser: {
      type: Schema.Types.Mixed,
      default: {},
    },
    lastSyncedAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  {
    collection: "mst_users",
    timestamps: true,
  }
);

export default mongoose.models.MstUser || mongoose.model<IMstUser>("MstUser", MstUserSchema);
