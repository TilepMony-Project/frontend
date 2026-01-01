import mongoose, { Schema, type Document } from "mongoose";

export interface IUser extends Document {
  // Authentication & Identity (from MstUser)
  privyUserId?: string;
  userId?: string;
  walletAddress?: string;
  email?: string;
  linkedAccounts?: Record<string, unknown>;
  privyUser?: Record<string, unknown>;
  lastSyncedAt?: Date;
  // Profile Information
  profiles?: Array<{
    fullName?: string;
    jobTitle?: string;
    company?: string;
    location?: string;
    timezone?: string;
    phone?: string;
    website?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    bio?: string;
    avatarUrl?: string;
    notificationPreferences?: {
      workflowAlerts: boolean;
      productUpdates: boolean;
    };
    updatedAt?: Date;
  }>;

  notificationPreferences: {
    workflowAlerts: boolean;
    productUpdates: boolean;
  };
  fiatBalances: {
    IDR: number;
    USD: number;
  };
  tokenBalances: {
    [token: string]: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema(
  {
    fullName: { type: String, trim: true, maxLength: 120 },
    jobTitle: { type: String, trim: true, maxLength: 80 },
    company: { type: String, trim: true, maxLength: 120 },
    location: { type: String, trim: true, maxLength: 120 },
    timezone: { type: String, trim: true, default: "UTC" },
    phone: { type: String, trim: true, maxLength: 40 },
    website: { type: String, trim: true },
    linkedinUrl: { type: String, trim: true },
    githubUrl: { type: String, trim: true },
    bio: { type: String, trim: true, maxLength: 1000 },
    avatarUrl: { type: String, trim: true },
    notificationPreferences: {
      workflowAlerts: { type: Boolean, default: true },
      productUpdates: { type: Boolean, default: true },
    },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    // Authentication & Identity (from MstUser)
    privyUserId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    userId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    walletAddress: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },

    // Profiles Array (Source of Truth)
    profiles: {
      type: [ProfileSchema],
      default: [],
    },

    notificationPreferences: {
      workflowAlerts: {
        type: Boolean,
        default: true,
      },
      productUpdates: {
        type: Boolean,
        default: true,
      },
    },
    fiatBalances: {
      IDR: {
        type: Number,
        default: 0,
      },
      USD: {
        type: Number,
        default: 0,
      },
    },
    tokenBalances: {
      type: Schema.Types.Mixed,
      default: {},
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
    },
  },
  {
    collection: "users",
    timestamps: true,
  }
);

// Prevent Mongoose MstUser model overwrite error in development
// Delete the model if it exists to ensure new schema changes are picked up
if (mongoose.models.User) {
  delete mongoose.models.User;
}

export default mongoose.model<IUser>("User", UserSchema);
