import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { updateDatabase } from '@/app/lib/backend-utils';

export async function POST(req: NextRequest) {
  const { id } = await req.json();
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
      `DELETE FROM comments WHERE id = $1 AND author_address = $2`,
      [id, decoded.address]
    )

    return NextResponse.json(
      { success:true },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting comment:", error.message);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
