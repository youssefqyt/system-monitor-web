import { NextResponse } from "next/server";
import { getSystemOverview } from "@/lib/systemInfo";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getSystemOverview();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch system info" },
      { status: 500 }
    );
  }
}
