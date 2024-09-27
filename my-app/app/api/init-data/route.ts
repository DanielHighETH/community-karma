import { NextResponse, NextRequest } from "next/server";
import { queryDatabase } from "@/app/lib/backend-utils";
export async function GET() {
    const res = await queryDatabase(
    `SELECT * FROM comments`,
  );

    return NextResponse.json(
      res,
      { status: 200 }
    );
}
