import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { type NextRequest, NextResponse } from "next/server";

// GET /api/blockchain/balance - Get user balances
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get("walletAddress");

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address required" }, { status: 400 });
    }

    // Find or create user
    let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });

    if (!user) {
      user = await User.create({
        walletAddress: walletAddress.toLowerCase(),
        fiatBalances: { IDR: 0, USD: 0 },
        tokenBalances: {},
      });
    }

    return NextResponse.json(
      {
        fiatBalances: user.fiatBalances,
        tokenBalances: user.tokenBalances,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching balances:", error);
    return NextResponse.json({ error: "Failed to fetch balances" }, { status: 500 });
  }
}
