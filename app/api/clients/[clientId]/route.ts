import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ clientId: string }> },
) {
  const session = await getServerSession(authOptions);
  const { clientId } = await params;

  if (!session || !session.user?.id) {
    return NextResponse.json({ vehicules: [] }, { status: 401 });
  }

  const vehicules = await db.vehicule.findMany({
    where: {
      clientId: clientId,
    },
    select: {
      id: true,
      brand: true,
      model: true,
      year: true,
      licensePlate: true,
    },
  });
  const client = await db.client.findUnique({
    where: { id: clientId },
    select: {
      id: true,
      typeClient: true,
      email: true,
      phone: true,
      name: true,
      firstName: true,
      companyName: true,
      contactFirstName: true,
      contactName: true,
      address: true,
      city: true,
      postalCode: true,
    },
  });

  return NextResponse.json({ vehicules, client });
}
