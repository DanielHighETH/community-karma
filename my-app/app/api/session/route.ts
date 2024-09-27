import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ loggedIn: false }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as jwt.JwtPayload;

    return NextResponse.json({
      loggedIn: true,
      address: (decoded as any).address,
    });
  } catch (error: any) {
    return NextResponse.json({ loggedIn: false, error: error.message }, { status: 401 });
  }
}
