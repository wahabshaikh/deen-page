import { NextResponse } from "next/server";

function removedResponse() {
  return NextResponse.json(
    { error: "Invitation system has been removed." },
    { status: 410 },
  );
}

export async function GET() {
  return removedResponse();
}

export async function POST() {
  return removedResponse();
}
