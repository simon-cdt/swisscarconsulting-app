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
      receptionType: true,
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
          estimates: {
            where: {
              deleted: false,
            },
            select: {
              id: true,
              status: true,
            },
          },
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
      phone2: true,
      email: true,
      address: true,
      city: true,
      postalCode: true,
      contactFirstName: true,
      contactName: true,
    },
  });

  // Chercher s'il existe une intervention en cours (avec devis non terminé)
  const interventionInProgress = await db.intervention.findFirst({
    where: {
      vehiculeId,
      deleted: false,
      estimates: {
        some: {
          deleted: false,
          status: {
            not: "FINISHED",
          },
        },
      },
    },
    select: {
      id: true,
      estimates: {
        where: {
          deleted: false,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
        select: {
          id: true,
        },
      },
    },
  });

  const formattedVehicule = vehicule
    ? {
        ...vehicule,
        interventions: vehicule.interventions.map((intervention) => {
          // Trouver le devis actif le plus récent
          const activeEstimate = intervention.estimates.find(
            (est) => est.status !== "FINISHED",
          );
          const estimate = activeEstimate || intervention.estimates[0];

          return {
            id: intervention.id,
            date: intervention.date,
            description: intervention.description,
            isFinished: intervention.estimates.some(
              (est) => est.status === "FINISHED",
            ),
            estimateId: estimate?.id ?? null,
          };
        }),
      }
    : null;

  return NextResponse.json({
    vehicule: formattedVehicule,
    client,
    hasInterventionToday: !!interventionInProgress,
    todayIntervention: interventionInProgress
      ? {
          id: interventionInProgress.id,
          estimateId: interventionInProgress.estimates[0]?.id ?? null,
        }
      : null,
  });
}
