import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json([], { status: 401 });
  }

  const clients = await db.client.findMany({
    select: {
      id: true,
      name: true,
      firstName: true,
      companyName: true,
      contactFirstName: true,
      contactName: true,

      phone: true,
      email: true,

      typeClient: true,

      vehicules: {
        select: {
          id: true,
          interventions: {
            select: {
              estimates: {
                select: { id: true },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const filteredClients = clients.map((client) => {
    const name =
      client.typeClient === "individual"
        ? [client.firstName, client.name].join(" ")
        : [client.contactFirstName, client.contactName].join(" ");

    // Extraire tous les IDs des devis du client
    const estimateIds = client.vehicules.flatMap((vehicule) =>
      vehicule.interventions.flatMap((intervention) =>
        intervention.estimates.map((estimate) => estimate.id),
      ),
    );

    return {
      id: client.id,
      name: name,
      companyName: client.companyName,
      phone: client.phone,
      email: client.email,
      typeClient: client.typeClient,
      nbVehicule: client.vehicules.length,
      estimateIds: estimateIds,
    };
  });

  return NextResponse.json(filteredClients);
}
