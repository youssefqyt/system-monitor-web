import { NextResponse } from "next/server";
import { getNetworkInfo } from "@/lib/systemInfo";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getNetworkInfo();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch network info" },
      { status: 500 }
    );
  }
}
