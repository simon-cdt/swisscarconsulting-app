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
    const estimates = await db.estimate.findMany({
      where: {
        deleted: false,
        status: {
          in: ["ACCEPTED", "PENDING"],
        },
      },
      select: {
        id: true,
        type: true,
        claimNumber: true,
        intervention: {
          select: {
            vehicule: {
              select: {
                brand: true,
                model: true,
                licensePlate: true,
                clientId: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    // Formater les devis pour le select
    const formattedEstimates = estimates.map((estimate) => {
      const vehicleInfo = estimate.intervention.vehicule;
      const displayLabel =
        estimate.claimNumber && estimate.claimNumber.length > 0
          ? `${estimate.id} / ${estimate.claimNumber} / (${vehicleInfo.brand} ${vehicleInfo.model})`
          : `${estimate.id} / ${vehicleInfo.brand} ${vehicleInfo.model} / ${vehicleInfo.licensePlate}`;

      return {
        label: displayLabel,
        value: estimate.id,
        clientId: vehicleInfo.clientId,
      };
    });

    return NextResponse.json(formattedEstimates);
  } catch (error) {
    console.error("Error fetching estimates:", error);
    return NextResponse.json(
      { error: "Failed to fetch estimates" },
      { status: 500 },
    );
  }
}
