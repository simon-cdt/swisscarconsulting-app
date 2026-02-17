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

  const estimates = await db.estimate.findMany({
    where: {
      status: "PENDING",
      deleted: false,
      type: "INDIVIDUAL",
    },
    select: {
      id: true,
      status: true,
      type: true,
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
              id: true,
              brand: true,
              model: true,
              licensePlate: true,
              client: {
                select: {
                  id: true,
                  name: true,
                  firstName: true,
                  companyName: true,
                  typeClient: true,
                  phone: true,
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

  return NextResponse.json(estimates);
}
