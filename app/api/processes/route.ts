import { NextResponse } from "next/server";
import { getProcesses } from "@/lib/systemInfo";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getProcesses();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch processes" },
      { status: 500 }
    );
  }
}
