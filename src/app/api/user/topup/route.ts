import { PrivyUnauthorizedError, requirePrivySession } from "@/lib/auth/privy";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { type NextRequest, NextResponse } from "next/server";

interface TopupRequest {
  currency: "IDR" | "USD";
  amount: number;
}

/**
 * POST /api/user/topup
 * Manually add fiat balance to user's account (for testing/demo purposes)
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await requirePrivySession(request);
    const body: TopupRequest = await request.json();
    const { currency, amount } = body;

    // Validation
    if (!currency || !["IDR", "USD"].includes(currency)) {
      return NextResponse.json(
        { error: "Invalid currency. Must be 'IDR' or 'USD'" },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOneAndUpdate(
      { $or: [{ userId }, { privyUserId: userId }] },
      {
        $inc: {
          [`fiatBalances.${currency}`]: amount,
        },
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Added ${amount} ${currency} to your balance`,
      fiatBalances: user.fiatBalances,
    });
  } catch (error) {
    if (error instanceof PrivyUnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Error processing topup:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
