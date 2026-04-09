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
  const clientIdNumber = Number(clientId);

  if (!session || !session.user?.id) {
    return NextResponse.json({ vehicules: [] }, { status: 401 });
  }

  const vehicules = await db.vehicule.findMany({
    where: {
      clientId: clientIdNumber,
    },
    select: {
      id: true,
      brand: true,
      model: true,
      year: true,
      licensePlate: true,
      certificateImage: true,
      chassisNumber: true,
      registrationNumber: true,
      lastExpertise: true,
      insuranceId: true,
    },
  });

  const finishedInterventions = await db.$queryRaw<{ id: string }[]>`
    SELECT DISTINCT i.id
    FROM Intervention i
    INNER JOIN Vehicule v ON v.id = i.vehiculeId
    WHERE v.clientId = ${clientIdNumber}
      AND i.deleted = false
      AND EXISTS (
        SELECT 1
        FROM Estimate e
        WHERE e.interventionId = i.id
          AND e.deleted = false
          AND e.status = 'FINISHED'
      )
  `;

  const finishedInterventionIds = new Set(
    finishedInterventions.map((intervention) => intervention.id),
  );

  const client = await db.client.findUnique({
    where: { id: clientIdNumber },
    select: {
      id: true,
      typeClient: true,
      email: true,
      phone: true,
      phone2: true,
      name: true,
      firstName: true,
      companyName: true,
      contactFirstName: true,
      contactName: true,
      address: true,
      city: true,
      postalCode: true,
      vehicules: {
        select: {
          brand: true,
          model: true,
          licensePlate: true,
          interventions: {
            where: {
              deleted: false,
            },
            select: {
              id: true,
              date: true,
              description: true,
            },
          },
        },
      },
    },
  });

  const formattedClient = client
    ? {
        ...client,
        vehicules: client.vehicules.map((vehicule) => ({
          ...vehicule,
          interventions: vehicule.interventions.map((intervention) => ({
            id: intervention.id,
            date: intervention.date,
            description: intervention.description,
            isFinished: finishedInterventionIds.has(intervention.id),
          })),
        })),
      }
    : null;

  return NextResponse.json({ vehicules, client: formattedClient });
}
