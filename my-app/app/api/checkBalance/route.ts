import { NextRequest, NextResponse } from "next/server";
import { tokenBalance } from "@/app/lib/aptos-utils";

export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json();

    if (!address) {
      return NextResponse.json(
        { message: "User address is required." },
        { status: 400 }
      );
    }

    const balance = await tokenBalance(address);

    return NextResponse.json(
      {
        balance,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error when fetching token balance:", error);

    return NextResponse.json(
      {
        balance: 0,
      },
      { status: 500 }
    );
  }
}
