import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({ admin: true });
}
