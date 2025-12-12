import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json([], { status: 401 });
  }

  const insurances = await db.insurance.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  return NextResponse.json(insurances);
}
