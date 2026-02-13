"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  UserIcon,
  CarIcon,
  X,
  ArchiveRestore,
} from "lucide-react";
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
import toast from "react-hot-toast";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import { restoreIntervention } from "@/lib/actions/intervention";
import InformationsDialog from "@/components/InformationsDialog";
import { Badge } from "@/components/ui/badge";
import { restoreEstimate } from "@/lib/actions/estimate";

type FetchAllTrash = [
  | {
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
        };
      };
      type: "intervention";
    }
  | {
      id: string;
      intervention: {
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
          };
        };
      };
      type: "estimate";
    },
];

function useTrash() {
  return useQuery({
    queryKey: ["trash"],
    queryFn: async (): Promise<FetchAllTrash> => {
      const response = await fetch(`/api/trash`);
      return await response.json();
    },
  });
}

export default function TrashPage() {
  const router = useRouter();

  const { data: item, isLoading, isError, refetch } = useTrash();

  const [loading, setLoading] = useState(false);

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

  return (
    <>
      {isLoading ? (
        <LoadingPage />
      ) : isError ? (
        <ErrorPage />
      ) : (
        item && (
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
              <div className="flex flex-wrap gap-5">
                {item.length < 1 ? (
                  <div className="flex w-full justify-center">
                    <p className={`${GeistMono.className} text-2xl font-bold`}>
                      Il n&apos;y a aucune intervention à gérer !
                    </p>
                  </div>
                ) : (
                  item.map((item) => {
                    const isIndividual =
                      item.type === "intervention"
                        ? item.vehicule.client.typeClient === "individual"
                        : item.intervention.vehicule.client.typeClient ===
                          "individual";
                    if (item.type === "intervention") {
                      return (
                        <Card
                          key={item.id}
                          className={`${isIndividual ? "individual-card" : "company-card"} hover:border-primary/50 flex h-47.5 w-150 items-start justify-between gap-0 p-6`}
                        >
                          <div className="flex w-full flex-row items-center justify-between">
                            <div className="flex w-full flex-wrap items-center gap-3">
                              <div className="text-muted-foreground flex items-center gap-2">
                                <CalendarIcon className="size-4" />
                                <span className="text-sm font-medium">
                                  {format(item.date, "PP", {
                                    locale: fr,
                                  })}
                                </span>
                              </div>
                            </div>
                            <div className="flex w-full justify-end">
                              <Badge className="border-purple-500 bg-purple-50 text-purple-600">
                                Intervention
                              </Badge>
                            </div>
                          </div>
                          <div className="flex w-full flex-row justify-between">
                            {/* Informations principales */}
                            <div className="flex h-full w-full flex-col justify-between gap-2">
                              <div className="space-y-2">
                                <h3 className="text-foreground text-lg font-semibold">
                                  {getClientDisplayName(item.vehicule.client)}
                                </h3>

                                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                  <CarIcon className="size-4" />
                                  <span>
                                    {item.vehicule.brand} {item.vehicule.model}{" "}
                                    /{" "}
                                    <span className={`${GeistMono.className}`}>
                                      {item.vehicule.licensePlate}
                                    </span>
                                  </span>
                                </div>

                                <p className="text-muted-foreground text-sm">
                                  {truncateText(item.description)}
                                </p>

                                <div className="text-muted-foreground flex items-center gap-2">
                                  <UserIcon className="size-4" />
                                  <span className="text-sm">
                                    Pris en charge par:{" "}
                                    <span className="text-foreground font-mono font-medium">
                                      {item.user.username}
                                    </span>
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex h-full w-62.5 flex-col justify-center gap-2">
                              <InformationsDialog
                                estimate={{
                                  intervention: {
                                    id: item.id,
                                    description: item.description,
                                    medias: item.medias,
                                  },
                                }}
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
                                      <ArchiveRestore className="size-4" />
                                      Restaurer
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Êtes-vous sûr ?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        L&apos;intervention va de nouveau
                                        pouvoir être gérée.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Annuler
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        className="bg-chart-2 hover:bg-chart-2/90 gap-2"
                                        onClick={async () => {
                                          setLoading(true);
                                          const response =
                                            await restoreIntervention({
                                              interventionId: item.id,
                                            });

                                          if (response.success) {
                                            toast.success(response.message);
                                            setLoading(false);
                                            router.push(
                                              "/dashboard/interventions",
                                            );
                                          } else {
                                            setLoading(false);
                                            toast.error(response.message);
                                          }
                                        }}
                                        disabled={isLoading}
                                      >
                                        {loading ? <Spinner /> : "Restaurer"}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>

                                <Button
                                  size="sm"
                                  className="w-full gap-2 bg-red-600 text-white hover:bg-red-700"
                                >
                                  <X className="size-4" />
                                  Supprimer
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    } else {
                      return (
                        <Card
                          key={item.id}
                          className={`${isIndividual ? "individual-card" : "company-card"} hover:border-primary/50 h-47.5 w-150 p-6 transition-colors`}
                        >
                          <div className="flex w-full flex-col gap-1">
                            <div className="flex w-full flex-row items-center justify-between">
                              <div className="flex w-full flex-wrap items-center gap-3">
                                <div className="text-muted-foreground flex items-center gap-2">
                                  <CalendarIcon className="size-4" />
                                  <span className="text-sm font-medium">
                                    {format(item.intervention.date, "PP", {
                                      locale: fr,
                                    })}
                                  </span>
                                </div>
                              </div>
                              <div className="flex w-full justify-end">
                                <Badge className="border-blue-500 bg-blue-50 text-blue-600">
                                  Devis
                                </Badge>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                              {/* Informations principales */}
                              <div className="flex h-full flex-col justify-between gap-2">
                                <div className="space-y-2">
                                  <h3 className="text-foreground text-lg font-semibold">
                                    {getClientDisplayName(
                                      item.intervention.vehicule.client,
                                    )}
                                  </h3>

                                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                    <CarIcon className="size-4" />
                                    <span>
                                      {item.intervention.vehicule.brand}{" "}
                                      {item.intervention.vehicule.model} /{" "}
                                      <span
                                        className={`${GeistMono.className}`}
                                      >
                                        {
                                          item.intervention.vehicule
                                            .licensePlate
                                        }
                                      </span>
                                    </span>
                                  </div>

                                  <p className="text-muted-foreground text-sm">
                                    {truncateText(
                                      item.intervention.description,
                                    )}
                                  </p>

                                  <div className="text-muted-foreground flex items-center gap-2">
                                    <UserIcon className="size-4" />
                                    <span className="text-sm">
                                      Pris en charge par:{" "}
                                      <span className="text-foreground font-mono font-medium">
                                        {item.intervention.user.username}
                                      </span>
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex h-full w-62.5 flex-col justify-center gap-2">
                                <InformationsDialog
                                  estimate={{
                                    ...item,
                                    intervention: {
                                      ...item.intervention,
                                      id: item.id,
                                    },
                                  }}
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
                                        <ArchiveRestore className="size-4" />
                                        Restaurer
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          Êtes-vous sûr ?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Le devis va de nouveau pouvoir être
                                          géré.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>
                                          Annuler
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          className="bg-chart-2 hover:bg-chart-2/90 gap-2"
                                          onClick={async () => {
                                            setLoading(true);
                                            const response =
                                              await restoreEstimate({
                                                estimateId: item.id,
                                              });

                                            if (response.success) {
                                              toast.success(response.message);
                                              setLoading(false);
                                              router.push(
                                                `/dashboard/estimates/tofinish`,
                                              );
                                            } else {
                                              setLoading(false);
                                              toast.error(response.message);
                                            }
                                          }}
                                          disabled={isLoading}
                                        >
                                          {loading ? <Spinner /> : "Restaurer"}
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>

                                  <Button
                                    size="sm"
                                    className="w-full gap-2 bg-red-600 text-white hover:bg-red-700"
                                  >
                                    <X className="size-4" />
                                    Supprimer
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    }
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
