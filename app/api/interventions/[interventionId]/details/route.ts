import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ interventionId: string }> },
) {
  const session = await getServerSession(authOptions);
  const { interventionId } = await params;

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Récupérer l'intervention avec ses devis
  const intervention = await db.intervention.findUnique({
    where: { id: interventionId },
    select: {
      id: true,
      estimates: {
        select: {
          id: true,
          status: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!intervention) {
    return NextResponse.json(
      { error: "Intervention not found" },
      { status: 404 },
    );
  }

  // Récupérer les factures pour tous les devis de cette intervention
  const invoices = await db.invoice.findMany({
    where: {
      estimateId: {
        in: intervention.estimates.map((e) => e.id),
      },
    },
    select: {
      id: true,
      estimateId: true,
      pdfUrl: true,
      status: true,
    },
  });

  // Déterminer quoi faire
  // 1. S'il y a une facture PAID → ouvrir le PDF
  const paidInvoice = invoices.find((inv) => inv.status === "PAID");
  if (paidInvoice && paidInvoice.pdfUrl) {
    return NextResponse.json({
      action: "openPdf",
      url: paidInvoice.pdfUrl,
    });
  }

  // 2. S'il y a une facture PENDING_PAYMENT → ouvrir le PDF
  const pendingInvoice = invoices.find(
    (inv) => inv.status === "PENDING_PAYMENT",
  );
  if (pendingInvoice && pendingInvoice.pdfUrl) {
    return NextResponse.json({
      action: "openPdf",
      url: pendingInvoice.pdfUrl,
    });
  }

  // 3. S'il y a un devis pas terminé → ouvrir le devis
  const unfinishedEstimate = intervention.estimates.find(
    (est) => est.status !== "FINISHED",
  );
  if (unfinishedEstimate) {
    return NextResponse.json({
      action: "openEstimate",
      estimateId: unfinishedEstimate.id,
    });
  }

  // 4. Sinon → ouvrir la liste des interventions avec l'ID en paramètre
  return NextResponse.json({
    action: "openInterventionsList",
    interventionId: intervention.id,
  });
}
