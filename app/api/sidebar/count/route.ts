import { NextResponse } from "next/server";
import { GetSidebarCount } from "@/lib/actions/sidebar";

export async function GET() {
  const counts = await GetSidebarCount();
  return NextResponse.json(counts ?? {});
}
