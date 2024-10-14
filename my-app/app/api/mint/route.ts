import { NextRequest, NextResponse } from "next/server";
import { mint } from "@/app/lib/aptos-utils";

export async function POST(req: NextRequest) {
  try {
    const { address, amount } = await req.json();

    if (!address || !amount) {
      return NextResponse.json(
        { message: "Address and amount are required." },
        { status: 400 }
      );
    }

    const txHash = await mint(address, amount);

    return NextResponse.json(
      {
        txHash,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error when minting tokens:", error);
    return NextResponse.json(
      { success: false, message: "Error when minting tokens." },
      { status: 500 }
    );
  }
}
