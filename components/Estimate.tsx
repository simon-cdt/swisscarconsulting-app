"use client";

import { Card } from "./ui/card";
import { CalendarIcon, CarIcon, Trash, UserIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "./ui/button";
import Link from "next/link";
import { EstimateStatus, TypeClient } from "@/generated/prisma/enums";
import { GeistMono } from "geist/font/mono";
import InformationsDialog from "./InformationsDialog";
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
import {
  acceptEstimate,
  putInTrash,
  refuseEstimate,
} from "@/lib/actions/estimate";
import { useRouter } from "next/navigation";

export default function Estimate({
  estimate,
  isIndividual,
  refetch,
  type,
}: {
  estimate: {
    id: string;
    intervention: {
      id: string;
      date: Date;
      description: string;
      medias: string | null;
      user: {
        username: string;
      };
      vehicule: {
        brand: string;
        model: string;
        licensePlate: string;
        client: {
          name: string | null;
          firstName: string | null;
          companyName: string | null;
          typeClient: TypeClient;
          phone: string;
        };
      };
    };
  };
  isIndividual: boolean;
  refetch: () => void;
  type: EstimateStatus;
}) {
  const router = useRouter();

  const truncateText = (text: string, maxLength = 27) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + "...";
  };

  const getClientDisplayName = (client: {
    name: string | null;
    firstName: string | null;
    companyName: string | null;
  }) => {
    if (client.companyName) {
      return client.companyName;
    }
    return `${client.firstName || ""} ${client.name || ""}`.trim();
  };
  return (
    <Card
      key={estimate.id}
      className={`${isIndividual ? "individual-card" : "company-card"} hover:border-primary/50 w-115 p-6 transition-colors`}
    >
      <div className="flex w-full flex-col gap-1">
        <div className="flex w-full flex-row items-center justify-between">
          <div className="flex w-full flex-wrap items-center gap-3">
            <div className="text-muted-foreground flex items-center gap-2">
              <CalendarIcon className="size-4" />
              <span className="text-sm font-medium">
                {format(estimate.intervention.date, "PP", {
                  locale: fr,
                })}
              </span>
            </div>
          </div>
          {type !== "ACCEPTED" && (
            <AlertDialog>
              <AlertDialogTrigger className="trans h-9 w-9 rounded-md p-1 hover:bg-red-200">
                <Trash className="size-4" />
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Êtes-vous sûr de supprimer ce devis ?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Le devis se mettra dans la corbeille, vous pourrez le
                    restaurer à tout moment.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 text-white hover:bg-red-700"
                    onClick={async () => {
                      const response = await putInTrash({
                        estimateId: estimate.id,
                      });

                      if (response.success) {
                        toast.success(response.message);
                        refetch();
                      } else {
                        toast.error(response.message);
                      }
                    }}
                  >
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          {/* Informations principales */}
          <div className="flex h-full flex-col justify-between gap-2">
            <div className="space-y-2">
              <div className="flex flex-col">
                <h3 className="text-foreground w-full text-lg font-semibold">
                  {`${getClientDisplayName(estimate.intervention.vehicule.client)}`}
                </h3>
                <h3 className="text-foreground w-full text-lg font-semibold">
                  {formatPhoneNumber(
                    estimate.intervention.vehicule.client.phone,
                  )}
                </h3>
              </div>

              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <CarIcon className="size-4" />
                <span>
                  {estimate.intervention.vehicule.brand}{" "}
                  {estimate.intervention.vehicule.model} /{" "}
                  <span className={`${GeistMono.className}`}>
                    {estimate.intervention.vehicule.licensePlate}
                  </span>
                </span>
              </div>

              <p className="text-muted-foreground text-sm">
                {truncateText(estimate.intervention.description)}
              </p>

              <div className="text-muted-foreground flex items-center gap-2">
                <UserIcon className="size-4" />
                <span className="text-sm">
                  Pris en charge par:{" "}
                  <span className="text-foreground font-mono font-medium">
                    {estimate.intervention.user.username}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex h-full flex-col justify-center gap-2">
            {type === "TODO" || type === "DRAFT" ? (
              <>
                <InformationsDialog estimate={estimate} refetch={refetch} />
                <Link
                  href={`/dashboard/estimates/${estimate.id}`}
                  className="w-full"
                >
                  <Button
                    className={`${estimate.intervention.vehicule.client.typeClient === "individual" ? "individual-btn" : "company-btn"} w-full`}
                  >
                    {type === "TODO"
                      ? "Faire le devis"
                      : type === "DRAFT" && "Modifier le devis"}
                  </Button>
                </Link>
              </>
            ) : type === "PENDING" ? (
              <>
                <Link
                  href={`/dashboard/estimates/${estimate.id}`}
                  className="w-full"
                >
                  <Button className="w-full" variant={"link"}>
                    Voir le devis
                  </Button>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="bg-red-600 hover:bg-red-700">
                      Refuser le devis
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Le devis repassera en type &quot;Brouillon&quot; ou vous
                        devrez à nouveau le valider.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        onClick={async () => {
                          const response = await refuseEstimate({
                            estimateId: estimate.id,
                          });

                          if (response.success) {
                            toast.success(response.message);
                            router.push(`/dashboard/estimates/${estimate.id}`);
                          } else {
                            toast.error(response.message);
                          }
                        }}
                      >
                        Refuser
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      Accepter le devis
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cela voudrait dire que le client a accepté le devis. Le
                        devis sera accepté et passera en facture.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={async () => {
                          const response = await acceptEstimate({
                            estimateId: estimate.id,
                          });

                          if (response.success) {
                            toast.success(response.message);
                            router.push("/dashboard/estimates/accepted");
                          } else {
                            toast.error(response.message);
                          }
                        }}
                      >
                        Accepter
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            ) : (
              type === "ACCEPTED" && (
                <>
                  <Link
                    href={`/dashboard/estimates/${estimate.id}`}
                    className="w-full"
                  >
                    <Button className="w-full" variant={"link"}>
                      Voir le devis
                    </Button>
                  </Link>
                  <InformationsDialog estimate={estimate} refetch={refetch} />
                </>
              )
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
