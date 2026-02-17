import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json([], { status: 401 });
  }

  try {
    const vehicules = await db.vehicule.findMany({
      select: {
        id: true,
        brand: true,
        model: true,
        licensePlate: true,
        clientId: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Formater les véhicules pour le select
    const formattedVehicules = vehicules.map((vehicule) => ({
      label: `${vehicule.brand} ${vehicule.model} - ${vehicule.licensePlate}`,
      value: vehicule.id,
      clientId: vehicule.clientId,
    }));

    return NextResponse.json(formattedVehicules);
  } catch (error) {
    console.error("Error fetching vehicules:", error);
    return NextResponse.json(
      { error: "Failed to fetch vehicules" },
      { status: 500 },
    );
  }
}
