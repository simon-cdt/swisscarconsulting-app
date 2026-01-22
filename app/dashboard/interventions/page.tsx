"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  UserIcon,
  FileTextIcon,
  ShieldIcon,
  CarIcon,
  Trash,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import LoadingPage from "@/components/LoadingPage";
import ErrorPage from "@/components/ErrorPage";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { TypeClient } from "@/generated/prisma/enums";
import { GeistMono } from "geist/font/mono";
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
} from "@/components/ui/alert-dialog";
import { addEstimate } from "@/lib/actions/estimate";
import toast from "react-hot-toast";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import { putInTrash } from "@/lib/actions/intervention";
import InformationsDialog from "@/components/InformationsDialog";
import { formatPhoneNumber } from "@/lib/utils";

type FetchAllInterventions = {
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
}[];

function useInterventions() {
  return useQuery({
    queryKey: ["interventions"],
    queryFn: async (): Promise<FetchAllInterventions> => {
      const response = await fetch(`/api/interventions`);
      return await response.json();
    },
  });
}

export default function InterventionsPage() {
  const router = useRouter();

  const {
    data: interventions,
    isLoading,
    isError,
    refetch,
  } = useInterventions();

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredInterventions =
    interventions?.filter((intervention) => {
      const client = intervention.vehicule.client;
      const vehicule = intervention.vehicule;

      const searchLower = searchQuery.toLowerCase();

      const clientName =
        client.typeClient === "individual"
          ? `${client.firstName || ""} ${client.name || ""}`.toLowerCase()
          : (client.companyName || "").toLowerCase();

      const vehiculeName = `${vehicule.brand} ${vehicule.model}`.toLowerCase();
      const licensePlate = vehicule.licensePlate.toLowerCase();
      const phone = client.phone.toLowerCase();

      return (
        clientName.includes(searchLower) ||
        vehiculeName.includes(searchLower) ||
        licensePlate.includes(searchLower) ||
        phone.includes(searchLower)
      );
    }) || [];

  const truncateText = (text: string, maxLength = 55) => {
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

  const createEstimate = async ({
    interventionId,
  }: {
    interventionId: string;
  }) => {
    setLoading(true);
    const response = await addEstimate({ data: { interventionId } });
    if (response.success) {
      toast.success(response.message);
      setLoading(false);
      router.push(`/dashboard/estimates/${response.estimateId}`);
    } else {
      toast.error(response.message);
      setLoading(false);
    }
  };

  return (
    <>
      {isLoading ? (
        <LoadingPage />
      ) : isError ? (
        <ErrorPage />
      ) : (
        interventions && (
          <div className="h-full">
            <div className="container mx-auto px-4 py-8">
              <div className="mb-8">
                <h1 className="text-foreground mb-2 text-4xl font-bold text-balance">
                  Interventions
                </h1>
                <p className="text-muted-foreground text-balance">
                  Gérez et suivez toutes vos interventions clients
                </p>
              </div>

              <div className="mb-6">
                <div className="relative w-1/3">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    type="text"
                    placeholder="Rechercher par client, entreprise, véhicule, plaque ou numéro..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-5">
                {filteredInterventions.length < 1 ? (
                  <div className="flex w-full justify-center">
                    <p className={`${GeistMono.className} text-2xl font-bold`}>
                      {searchQuery
                        ? "Aucune intervention ne correspond à votre recherche !"
                        : "Il n'y a aucune intervention à gérer !"}
                    </p>
                  </div>
                ) : (
                  filteredInterventions.map((intervention) => {
                    const isIndividual =
                      intervention.vehicule.client.typeClient === "individual";
                    return (
                      <Card
                        key={intervention.id}
                        className={`${isIndividual ? "individual-card" : "company-card"} hover:border-primary/50 flex h-47.5 w-150 items-start justify-between gap-0 p-6`}
                      >
                        <div className="flex w-full flex-row items-center justify-between">
                          <div className="flex w-full flex-wrap items-center gap-3">
                            <div className="text-muted-foreground flex items-center gap-2">
                              <CalendarIcon className="size-4" />
                              <span className="text-sm font-medium">
                                {format(intervention.date, "PP", {
                                  locale: fr,
                                })}
                              </span>
                            </div>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger className="trans h-9 w-9 rounded-md p-1 hover:bg-red-200">
                              <Trash className="size-4" />
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Êtes-vous sûr de supprimer cette intervention
                                  ?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  L&apos;intervention se mettera dans la
                                  corbeille, vous pourrez la restaurer à tout
                                  moment.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 text-white hover:bg-red-700"
                                  onClick={async () => {
                                    const response = await putInTrash({
                                      interventionId: intervention.id,
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
                        </div>
                        <div className="flex w-full flex-row justify-between">
                          {/* Informations principales */}
                          <div className="flex h-full w-full flex-col justify-between gap-2">
                            <div className="space-y-2">
                              <h3 className="text-foreground text-lg font-semibold">
                                {`${getClientDisplayName(
                                  intervention.vehicule.client,
                                )} - ${formatPhoneNumber(
                                  intervention.vehicule.client.phone,
                                )}`}
                              </h3>

                              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                <CarIcon className="size-4" />
                                <span>
                                  {intervention.vehicule.brand}{" "}
                                  {intervention.vehicule.model} /{" "}
                                  <span className={`${GeistMono.className}`}>
                                    {intervention.vehicule.licensePlate}
                                  </span>
                                </span>
                              </div>

                              <p className="text-muted-foreground text-sm">
                                {truncateText(intervention.description)}
                              </p>

                              <div className="text-muted-foreground flex items-center gap-2">
                                <UserIcon className="size-4" />
                                <span className="text-sm">
                                  Pris en charge par:{" "}
                                  <span className="text-foreground font-mono font-medium">
                                    {intervention.user.username}
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex h-full w-62.5 flex-col justify-center gap-2">
                            <InformationsDialog
                              estimate={{ intervention }}
                              refetch={refetch}
                            />

                            <div className="flex w-full gap-2">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="default"
                                    className="bg-chart-2 hover:bg-chart-2/90 w-full gap-2"
                                  >
                                    <FileTextIcon className="size-4" />
                                    Devis
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Êtes-vous sûr ?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Vous allez faire de cette intervention un
                                      devis. Vous pourrez revenir en arrière si
                                      besoin plus tard.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Annuler
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-chart-2 hover:bg-chart-2/90 gap-2"
                                      onClick={() =>
                                        createEstimate({
                                          interventionId: intervention.id,
                                        })
                                      }
                                      disabled={isLoading}
                                    >
                                      {loading ? <Spinner /> : "Créer un devis"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>

                              <Button
                                size="sm"
                                variant="default"
                                className="bg-chart-4 hover:bg-chart-4/90 w-full gap-2"
                              >
                                <ShieldIcon className="size-4" />
                                Assurance
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )
      )}
    </>
  );
}
