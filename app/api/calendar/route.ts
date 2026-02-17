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
    const appointments = await db.appointment.findMany({
      include: {
        client: {
          select: {
            id: true,
            name: true,
            firstName: true,
            companyName: true,
            phone: true,
            typeClient: true,
          },
        },
        vehicule: {
          select: {
            id: true,
            brand: true,
            model: true,
            licensePlate: true,
          },
        },
        estimate: {
          select: {
            id: true,
            claimNumber: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 },
    );
  }
}
