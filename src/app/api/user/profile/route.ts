import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { PrivyUnauthorizedError, requirePrivySession } from "@/lib/auth/privy";

/**
 * GET /api/user/profile
 * Returns the authenticated user's profile data including fiat balances
 */
export async function GET(request: Request) {
  try {
    const { userId } = await requirePrivySession(request);
    await connectDB();

    const user = await User.findOne({
      $or: [{ userId }, { privyUserId: userId }],
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      fullName: user.fullName ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
      company: user.company ?? "",
      location: user.location ?? "",
      fiatBalances: user.fiatBalances ?? { IDR: 0, USD: 0 },
      tokenBalances: user.tokenBalances ?? {},
    });
  } catch (error) {
    if (error instanceof PrivyUnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
