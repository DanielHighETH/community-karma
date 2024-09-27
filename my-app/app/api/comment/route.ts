import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { updateDatabase } from '@/app/lib/backend-utils';
import moment from 'moment';

export async function POST(req: NextRequest, res: NextResponse) {
  const { targetId, author, content } = await req.json();
  const token = req.cookies.get("auth-token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { address: string };

    if (!decoded.address) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await updateDatabase(
      `INSERT INTO comments (targetid, author, content, timestamp) VALUES ($1, $2, $3, $4)`,
      [targetId, author, content, (new Date()).toISOString()]
    );

    return NextResponse.json(
      { success:true },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error adding comment:", error.message);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
