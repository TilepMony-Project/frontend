import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  walletAddress: string;
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

const UserSchema = new Schema<IUser>(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
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
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
