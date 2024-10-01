import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { updateDatabase } from '@/app/lib/backend-utils';

export async function POST(req: NextRequest) {
  const { id, reportReason } = await req.json();
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
      `UPDATE comments SET reported = true, reported_by = $2, report_reason = $3 WHERE id = $1`,
      [id, decoded.address, reportReason]
    )

    return NextResponse.json(
      { success:true },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error reporting comment:", error.message);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
