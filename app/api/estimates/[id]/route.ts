import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session || !session.user?.id) {
    return NextResponse.json({ vehicules: [] }, { status: 401 });
  }

  const estimate = await db.estimate.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      type: true,
      claimNumber: true,
      items: {
        select: {
          id: true,
          designation: true,
          description: true,
          quantity: true,
          unitPrice: true,
          discount: true,
          type: true,
          position: true,
        },
        orderBy: {
          position: "asc",
        },
      },
      intervention: {
        select: {
          id: true,
          date: true,
          description: true,
          medias: true,
          user: {
            select: {
              id: true,
              username: true,
            },
          },
          vehicule: {
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
              receptionType: true,
              insurance: {
                select: {
                  id: true,
                  name: true,
                },
              },
              client: {
                select: {
                  id: true,
                  firstName: true,
                  name: true,
                  companyName: true,
                  typeClient: true,
                  address: true,
                  postalCode: true,
                  city: true,
                  phone: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return NextResponse.json(estimate);
}
