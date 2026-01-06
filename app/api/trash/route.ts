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

  const interventions = await db.intervention.findMany({
    where: {
      deleted: true,
    },
    select: {
      id: true,
      date: true,
      description: true,
      medias: true,
      user: {
        select: {
          username: true,
        },
      },
      vehicule: {
        select: {
          brand: true,
          model: true,
          licensePlate: true,
          client: {
            select: {
              name: true,
              firstName: true,
              companyName: true,
              typeClient: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const estimates = await db.estimate.findMany({
    where: {
      deleted: true,
    },
    select: {
      id: true,
      intervention: {
        select: {
          date: true,
          description: true,
          medias: true,
          user: {
            select: {
              username: true,
            },
          },
          vehicule: {
            select: {
              brand: true,
              model: true,
              licensePlate: true,
              client: {
                select: {
                  name: true,
                  firstName: true,
                  companyName: true,
                  typeClient: true,
                },
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

  const combined = [
    ...interventions.map((intervention) => ({
      ...intervention,
      type: "intervention" as const,
    })),
    ...estimates.map((estimate) => ({
      ...estimate,
      type: "estimate" as const,
    })),
  ].sort(
    (a, b) =>
      new Date(b.type === "estimate" ? b.intervention.date : b.date).getTime() -
      new Date(a.type === "estimate" ? a.intervention.date : a.date).getTime(),
  );

  return NextResponse.json(combined);
}
