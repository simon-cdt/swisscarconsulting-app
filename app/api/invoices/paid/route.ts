import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (
    !session ||
    !session.user.id ||
    (session.user.role !== "ADMIN" &&
      session.user.role !== "SELLER" &&
      session.user.role !== "BOTH")
  ) {
    return NextResponse.json([], { status: 401 });
  }

  const invoices = await db.invoice.findMany({
    where: {
      status: "PAID",
    },
    select: {
      id: true,
      status: true,
      typeEstimate: true,
      claimNumber: true,
      interventionDate: true,
      description: true,
      medias: true,
      brand: true,
      model: true,
      licensePlate: true,
      name: true,
      firstName: true,
      companyName: true,
      typeClient: true,
      phone: true,
      pdfUrl: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(invoices);
}
