"use client";

import { Card } from "./ui/card";
import { CalendarIcon, CarIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "./ui/button";
import { GeistMono } from "geist/font/mono";
import { formatPhoneNumber } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import toast from "react-hot-toast";
import { Invoice as InvoiceType } from "@/types/types";
import Link from "next/link";
import { FILE_SERVER_URL } from "@/lib/config";

export default function Invoice({
  invoice,
  isIndividual,
  refetch,
}: {
  invoice: InvoiceType;
  isIndividual: boolean;
  refetch: () => void;
}) {
  const getClientDisplayName = (client: {
    name: string;
    firstName: string;
    companyName: string | null;
  }) => {
    if (client.companyName) {
      return client.companyName;
    }
    return `${client.firstName || ""} ${client.name || ""}`.trim();
  };

  return (
    <Card
      key={invoice.id}
      className={`${isIndividual ? "individual-card" : "company-card"} hover:border-primary/50 w-115 p-6 transition-colors`}
    >
      <div className="flex w-full flex-col gap-1">
        <div className="flex w-full flex-row items-center justify-between">
          <div className="flex w-full flex-wrap items-center gap-3">
            <div className="text-muted-foreground flex items-center gap-2">
              <CalendarIcon className="size-4" />
              <span className="text-sm font-medium">
                {format(invoice.interventionDate, "PP", {
                  locale: fr,
                })}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          {/* Informations principales */}
          <div className="flex h-full flex-col justify-between gap-2">
            <div className="space-y-2">
              <div className="flex flex-col">
                <h3 className="text-foreground w-full text-lg font-semibold">
                  {`${getClientDisplayName(invoice)}`}
                </h3>
                <h3 className="text-foreground w-full text-lg font-semibold">
                  {formatPhoneNumber(invoice.phone)}
                </h3>
              </div>

              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <CarIcon className="size-4" />
                <span>
                  {invoice.brand} {invoice.model} /{" "}
                  <span className={`${GeistMono.className}`}>
                    {invoice.licensePlate}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex h-full flex-col justify-center gap-2">
            <Link
              href={`${FILE_SERVER_URL}/uploads/${invoice.pdfUrl}`}
              target="_blank"
            >
              <Button className="w-full" variant={"outline"}>
                Voir la facture
              </Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  Marquer comme payé
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    La facture sera marquée comme payée et sera archivée.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={async () => {
                      // TODO: Implémenter l'action de marquer comme payé
                      toast.success("Facture marquée comme payée");
                      refetch();
                    }}
                  >
                    Confirmer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </Card>
  );
}
