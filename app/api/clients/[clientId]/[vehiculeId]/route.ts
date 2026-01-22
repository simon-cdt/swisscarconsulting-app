import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ clientId: string; vehiculeId: string }> },
) {
  const session = await getServerSession(authOptions);
  const { clientId, vehiculeId } = await params;

  if (!session || !session.user?.id) {
    return NextResponse.json({ vehicules: [] }, { status: 401 });
  }

  const vehicule = await db.vehicule.findUnique({
    where: {
      id: vehiculeId,
    },
    select: {
      id: true,
      brand: true,
      model: true,
      year: true,
      licensePlate: true,
      chassisNumber: true,
      registrationNumber: true,
      lastExpertise: true,
      certificateImage: true,
      insurance: {
        select: {
          id: true,
          name: true,
        },
      },
      interventions: {
        select: {
          id: true,
          date: true,
          description: true,
        },
        orderBy: {
          date: "desc",
        },
      },
    },
  });
  const client = await db.client.findUnique({
    where: { id: Number(clientId) },
    select: {
      id: true,
      typeClient: true,
      companyName: true,
      name: true,
      firstName: true,
      phone: true,
      email: true,
      address: true,
      city: true,
      postalCode: true,
      contactFirstName: true,
      contactName: true,
    },
  });

  return NextResponse.json({ vehicule, client });
}
