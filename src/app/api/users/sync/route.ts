import { NextResponse } from "next/server";
import { PrivyUnauthorizedError, requirePrivySession } from "@/lib/auth/privy";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

type PrivyUserPayload = {
  id: string;
  email?: {
    address?: string;
  };
  wallet?: {
    address?: string;
  };
  [key: string]: unknown;
};

type SyncRequest = {
  privyUserId?: string;
  email?: string | null;
  walletAddress?: string | null;
  privyUser?: PrivyUserPayload;
};

export async function POST(request: Request) {
  try {
    const { userId } = await requirePrivySession(request);
    const body = (await request.json()) as SyncRequest;
    const privyUserId = body.privyUserId || body.privyUser?.id;

    if (!privyUserId) {
      return NextResponse.json(
        { success: false, error: "privyUserId is required" },
        { status: 400 }
      );
    }

    if (privyUserId !== userId) {
      return NextResponse.json({ success: false, error: "Privy user mismatch" }, { status: 403 });
    }

    await connectDB();

    const email = body.email || body.privyUser?.email?.address || null;
    const walletAddress = body.walletAddress || body.privyUser?.wallet?.address || null;

    const update = {
      email: email ?? undefined,
      walletAddress: walletAddress?.toLowerCase() ?? undefined,
      privyUser: body.privyUser,
      linkedAccounts: body.privyUser?.linkedAccounts,
      lastSyncedAt: new Date(),
    };

    const result = await User.findOneAndUpdate(
      { privyUserId },
      { $set: update, $setOnInsert: { privyUserId, userId: privyUserId } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );


    return NextResponse.json({
      success: true,
      user: { id: result._id, privyUserId: result.privyUserId },
    });
  } catch (error) {
    if (error instanceof PrivyUnauthorizedError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    }
    console.error("Failed to sync Privy user", error);
    return NextResponse.json({ success: false, error: "Failed to sync user" }, { status: 500 });
  }
}
