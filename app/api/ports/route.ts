import { NextResponse } from "next/server";
import { getPortsAndServices } from "@/lib/systemInfo";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getPortsAndServices();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch port info" },
      { status: 500 }
    );
  }
}
