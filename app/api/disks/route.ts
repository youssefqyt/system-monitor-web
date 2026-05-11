import { NextResponse } from "next/server";
import { getDiskInfo } from "@/lib/systemInfo";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getDiskInfo();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch disk info" },
      { status: 500 }
    );
  }
}
