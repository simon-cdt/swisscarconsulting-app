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
    const clients = await db.client.findMany({
      select: {
        id: true,
        name: true,
        firstName: true,
        companyName: true,
        contactFirstName: true,
        contactName: true,
        typeClient: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Formater les clients pour le select
    const formattedClients = clients.map((client) => {
      const displayName =
        client.typeClient === "individual"
          ? `${client.firstName || ""} ${client.name || ""}`.trim()
          : client.companyName || "";

      return {
        label: displayName,
        value: client.id.toString(),
      };
    });

    return NextResponse.json(formattedClients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 },
    );
  }
}
