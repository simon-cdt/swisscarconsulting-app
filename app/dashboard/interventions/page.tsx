"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  UserIcon,
  EyeIcon,
  FileTextIcon,
  ShieldIcon,
  CarIcon,
  Trash,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import LoadingPage from "@/components/LoadingPage";
import ErrorPage from "@/components/ErrorPage";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FILE_SERVER_URL } from "@/lib/config";
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
              <div className="flex flex-wrap gap-5">
                {interventions.length < 1 ? (
                  <div className="flex w-full justify-center">
                    <p className={`${GeistMono.className} text-2xl font-bold`}>
                      Il n&apos;y a aucune intervention à gérer !
                    </p>
                  </div>
                ) : (
                  interventions.map((intervention) => {
                    const isIndividual =
                      intervention.vehicule.client.typeClient === "individual";
                    return (
                      <Card
                        key={intervention.id}
                        className={`${isIndividual ? "individual-card" : "company-card"} hover:border-primary/50 flex h-[190px] w-[600px] items-start justify-between gap-0 p-6`}
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
                                {getClientDisplayName(
                                  intervention.vehicule.client,
                                )}
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
                          <div className="flex h-full w-[250px] flex-col justify-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="col-span-2 gap-2 bg-transparent"
                                  disabled={!intervention.medias}
                                >
                                  <EyeIcon className="size-4" />
                                  Photos et vidéos
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-h-[80vh] min-w-[30vw] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Photos et vidéos</DialogTitle>
                                </DialogHeader>
                                <div className="flex flex-wrap gap-5">
                                  <p>{intervention.description}</p>
                                  {intervention.medias
                                    ?.split(",")
                                    .map((file, index) => {
                                      const fileName = file.trim();
                                      const isVideo =
                                        /\.(mp4|webm|ogg|mov|avi|mkv)$/i.test(
                                          fileName,
                                        );
                                      const isImage =
                                        /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(
                                          fileName,
                                        );

                                      if (isVideo) {
                                        return (
                                          <div
                                            key={index}
                                            className="bg-muted relative aspect-video overflow-hidden rounded-lg"
                                          >
                                            <video
                                              controls
                                              className="h-full w-full object-contain"
                                              src={`${FILE_SERVER_URL}/uploads/${fileName}`}
                                            >
                                              Votre navigateur ne supporte pas
                                              la lecture de vidéos.
                                            </video>
                                          </div>
                                        );
                                      }

                                      if (isImage) {
                                        return (
                                          <div
                                            key={index}
                                            className="bg-muted relative aspect-video overflow-hidden rounded-lg border border-black/20"
                                          >
                                            {/* eslint-disable-next-line */}
                                            <img
                                              src={`${FILE_SERVER_URL}/uploads/${fileName}`}
                                              alt={`Image ${index + 1}`}
                                              className="object-contain"
                                            />
                                          </div>
                                        );
                                      }

                                      return null;
                                    })}
                                </div>
                              </DialogContent>
                            </Dialog>

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
