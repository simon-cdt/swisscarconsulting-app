"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, ImageIcon, Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  EstimateStatus,
  TypeClient,
  TypeEstimate,
} from "@/generated/prisma/enums";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import LoadingPage from "@/components/LoadingPage";
import ErrorPage from "@/components/ErrorPage";
import { ItemEstimate } from "@/types/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddPartItem from "@/components/form/estimates/AddPartItem";
import toast from "react-hot-toast";
import AddMOItem from "@/components/form/estimates/AddMOItem";
import UpdatePartItem from "@/components/form/estimates/UpdatePartItem";
import UpdateMOItem from "@/components/form/estimates/UpdateMOItem";
import AddUpcomingItem from "@/components/form/estimates/AddUpcomingItem";
import UpdateUpcomingItem from "@/components/form/estimates/UpdateUpcomingItem";
import {
  convertIndividualToInsurance,
  convertInsuranceToIndividual,
  updateEstimateItems,
  validateEstimate,
} from "@/lib/actions/estimate";
import AddMedias from "@/components/form/AddMedias";
import InformationsDialog from "@/components/InformationsDialog";
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
} from "@/components/ui/alert-dialog";
import { UpdateVehicule } from "@/components/form/UpdateForm/UpdateVehicule";
import { FILE_SERVER_URL } from "@/lib/config";
import UpdateClaimNumber from "@/components/form/UpdateForm/UpdateClaimNumber";

type FetchEstimate = {
  id: string;
  status: EstimateStatus;
  type: TypeEstimate;
  items: ItemEstimate;
  claimNumber: string | null;
  refusalReason: string | null;
  intervention: {
    id: string;
    date: Date;
    description: string;
    medias: string | null;
    user: {
      id: string;
      username: string;
    };
    vehicule: {
      id: string;
      brand: string;
      model: string;
      year: number;
      licensePlate: string;
      chassisNumber: string | null;
      registrationNumber: string | null;
      lastExpertise: string | null;
      certificateImage: string | null;
      receptionType: string | null;
      insurance: {
        id: string;
        name: string;
      } | null;
      client: {
        id: string;
        firstName: string | null;
        name: string | null;
        companyName: string | null;
        typeClient: TypeClient;
        email: string;
        phone: string;
        address: string | null;
        postalCode: number | null;
        city: string | null;
      };
    };
  };
};

function useEstimate({ id }: { id: string }) {
  return useQuery({
    queryKey: ["estimate", id],
    queryFn: async (): Promise<FetchEstimate> => {
      const response = await fetch(`/api/estimates/${id}`);
      return await response.json();
    },
  });
}

export default function QuoteGeneratorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const {
    data: estimate,
    isLoading,
    isError,
    refetch,
  } = useEstimate({ id: params.id });

  const [updateDisable, setUpdateDisable] = useState(true);

  const [selectedItems, setSelectedItems] = useState<ItemEstimate>([]);
  const loadingItems = useRef(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);

  const handleRemoveItem = async (id: string) => {
    // Trouver l'item à supprimer pour récupérer sa position
    const itemToRemove = selectedItems.find((item) => item.id === id);

    if (!itemToRemove) return;

    // Filtrer l'item à supprimer
    const updatedItems = selectedItems.filter((item) => item.id !== id);

    // Décaler les positions des items de la même catégorie qui étaient après l'item supprimé
    updatedItems.forEach((item) => {
      if (
        item.type === itemToRemove.type &&
        item.position > itemToRemove.position
      ) {
        item.position -= 1;
      }
    });

    // Trier par type puis par position
    updatedItems.sort((a, b) => {
      // PART en premier
      if (a.type === "PART" && b.type !== "PART") return -1;
      if (a.type !== "PART" && b.type === "PART") return 1;
      // LABOR en deuxième
      if (a.type === "LABOR" && b.type === "UPCOMING") return -1;
      if (a.type === "UPCOMING" && b.type === "LABOR") return 1;
      // Sinon trier par position
      return a.position - b.position;
    });

    setSelectedItems(updatedItems);

    const response = await updateEstimateItems({
      items: updatedItems.map((item) => ({
        ...item,
      })),
      estimateId: params.id,
    });

    if (response.success) {
      toast.success(response.message);
    } else {
      toast.error(response.message);
    }
  };

  const calculateTotal = () => {
    return selectedItems.reduce((sum, item) => {
      let itemTotal: number;

      if (item.type === "LABOR") {
        // Si calculateByTime est true ET qu'il y a une quantity (temps en minutes)
        if (item.calculateByTime && item.quantity) {
          itemTotal = (item.unitPrice * item.quantity) / 60;
        } else {
          // Sinon, utiliser simplement le unitPrice
          itemTotal = item.unitPrice;
        }
      } else {
        itemTotal = item.unitPrice * (item.quantity ?? 0);
      }

      return sum + itemTotal;
    }, 0);
  };

  useEffect(() => {
    if (estimate?.items && !loadingItems.current) {
      setSelectedItems(estimate.items);
      loadingItems.current = true;
    }
  }, [estimate?.items, loadingItems]);

  // Générer la prévisualisation du PDF
  useEffect(() => {
    const generatePreview = async () => {
      if (!estimate) return;

      setUpdateDisable(
        estimate.status === "ACCEPTED" ||
          estimate.status === "PENDING" ||
          estimate.status === "SENT_TO_GARAGE",
      );

      try {
        const pdfData = {
          id: estimate.id,
          type: estimate.type,
          claimNumber: estimate.claimNumber,
          items: selectedItems.map((item) => ({
            id: item.id,
            type: item.type,
            designation: item.designation,
            description: item.description,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            calculateByTime: item.calculateByTime,
            position: item.position,
          })),
          intervention: {
            vehicule: {
              brand: estimate.intervention.vehicule.brand,
              model: estimate.intervention.vehicule.model,
              year: estimate.intervention.vehicule.year,
              licensePlate: estimate.intervention.vehicule.licensePlate,
              client: {
                id: estimate.intervention.vehicule.client.id,
                typeClient: estimate.intervention.vehicule.client.typeClient,
                firstName: estimate.intervention.vehicule.client.firstName,
                name: estimate.intervention.vehicule.client.name,
                companyName: estimate.intervention.vehicule.client.companyName,
                address: estimate.intervention.vehicule.client.address,
                city: estimate.intervention.vehicule.client.city,
                postalCode: estimate.intervention.vehicule.client.postalCode,
              },
            },
          },
        };

        const response = await fetch("/api/pdf", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data: pdfData }),
        });

        if (!response.ok) {
          throw new Error(
            "Erreur lors de la génération de la prévisualisation",
          );
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        // Nettoyer l'ancienne URL si elle existe
        if (pdfPreviewUrl) {
          window.URL.revokeObjectURL(pdfPreviewUrl);
        }

        setPdfPreviewUrl(url);
      } catch (error) {
        console.error(error);
      }
    };

    generatePreview();

    // Cleanup function
    return () => {
      if (pdfPreviewUrl) {
        window.URL.revokeObjectURL(pdfPreviewUrl);
      }
    };
    // eslint-disable-next-line
  }, [estimate, selectedItems]);

  return (
    <>
      {isLoading ? (
        <LoadingPage />
      ) : isError ? (
        <ErrorPage />
      ) : (
        estimate && (
          <div className="bg-background min-h-screen px-4 py-8">
            <div className="mx-auto flex max-w-6xl flex-col gap-3">
              <div className="mb-8 text-center">
                <h1 className="text-foreground mb-2 font-sans text-4xl font-bold tracking-tight">
                  {"Création du devis"}
                </h1>
                <p className="text-muted-foreground text-lg">
                  {"Ajouter les éléments pour les devis et téléchargez-le !"}
                </p>
              </div>

              <Card className="shadow-none">
                <CardContent>
                  <div className="flex flex-col gap-3">
                    <p className="font-semibold">Informations devis</p>
                    {estimate.type === "INSURANCE" && (
                      <div className="flex w-full items-center justify-between">
                        <p className="text-sm">
                          Numéro de sinistre :{" "}
                          <span
                            className={`${estimate.claimNumber ? "text-black" : "text-red-500"} font-semibold`}
                          >
                            {estimate.claimNumber || "NON RENSEIGNÉ"}
                          </span>
                        </p>
                        <div>
                          <UpdateClaimNumber
                            estimateId={estimate.id}
                            claimNumber={estimate.claimNumber}
                            refetch={refetch}
                            updateDisable={updateDisable}
                          />
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="text-sm">
                        Type de devis :{" "}
                        <span className="font-semibold">
                          {estimate.type === "INSURANCE"
                            ? `Assurance${estimate.intervention.vehicule.insurance ? ` - ${estimate.intervention.vehicule.insurance.name}` : " - NON RENSEIGNÉE"}`
                            : "Individuel"}
                        </span>
                      </p>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size={"sm"}
                            variant={"secondary"}
                            disabled={updateDisable}
                          >
                            Modifier le type de devis
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Êtes-vous absolument sûr ?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {estimate.type === "INDIVIDUAL"
                                ? "Le devis deviendra un devis d'assurance."
                                : "Le devis deviendra un devis de particulier et le numéro de sinistre sera supprimé."}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={async () => {
                                const response =
                                  estimate.type === "INDIVIDUAL"
                                    ? await convertIndividualToInsurance({
                                        estimateId: estimate.id,
                                      })
                                    : await convertInsuranceToIndividual({
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
                              Confirmer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {estimate.refusalReason && (
                <Card className="border-red-500/10 bg-red-50 shadow-none">
                  <CardContent className="flex flex-col gap-4">
                    <CardTitle className="font-semibold">
                      Raison du devis refusé
                    </CardTitle>
                    <div className="bg-muted/30 max-h-40 overflow-y-auto rounded-md border p-4">
                      <p className="text-sm leading-relaxed font-semibold whitespace-pre-wrap text-red-500">
                        {estimate.refusalReason}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
              <div className="flex flex-col gap-6">
                {/* Colonne gauche - Constat et Médias */}
                <div className="flex w-full justify-between gap-6">
                  {/* Zone de constat */}
                  <Card className="w-full shadow-none">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="text-primary h-5 w-5" />
                          {"Résumé de l'intervention"}
                        </div>
                        <div className="flex items-center gap-2">
                          <UpdateVehicule
                            vehicule={estimate.intervention.vehicule}
                            refetch={refetch}
                            label="Modifier le véhicule"
                          />
                          {estimate.intervention.vehicule.certificateImage ? (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant={"outline"}>
                                  Voir la carte grise
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-150">
                                <DialogTitle />
                                {/* eslint-disable-next-line */}
                                <img
                                  src={`${FILE_SERVER_URL}/uploads/${estimate.intervention.vehicule.certificateImage}`}
                                  alt="Carte grise du véhicule"
                                  className="w-full"
                                />
                              </DialogContent>
                            </Dialog>
                          ) : (
                            <div className="hover:cursor-not-allowed">
                              <Button
                                className="border-input bg-background border text-black/70"
                                disabled
                                size={"sm"}
                              >
                                Carte grise non disponible
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardTitle>
                      <CardDescription>
                        {estimate.intervention.vehicule.client.typeClient ===
                        "individual"
                          ? `${estimate.intervention.vehicule.client.firstName} ${estimate.intervention.vehicule.client.name}`
                          : estimate.intervention.vehicule.client.companyName}
                        {" - "}
                        {formatPhoneNumber(
                          estimate.intervention.vehicule.client.phone,
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted/30 max-h-24 overflow-y-auto rounded-md border p-4">
                        <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                          {estimate.intervention.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="w-full shadow-none">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="h-5 w-5 text-black/50" />
                          {"Photos et Vidéos"}
                        </div>
                        <AddMedias
                          refetch={refetch}
                          interventionId={estimate.intervention.id}
                        />
                      </CardTitle>
                      <CardDescription>
                        {estimate.intervention.medias
                          ? `${estimate.intervention.medias.split(",").length} fichier(s) disponible(s)`
                          : "Aucun média n'a été ajouté à l'intervention"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <InformationsDialog
                        onlyMedias
                        estimate={estimate}
                        refetch={refetch}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Colonne droite - Items et Total */}
                <div className="flex flex-col gap-6">
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{"Items du devis"}</span>
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant={"outline"}
                              disabled={updateDisable}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Ajouter
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="min-w-[40vw]">
                            <DialogHeader>
                              <DialogTitle>{"Ajouter un item"}</DialogTitle>
                              <DialogDescription>
                                Ajoutez un nouvel item au devis avec sa
                                description et son prix
                              </DialogDescription>
                            </DialogHeader>
                            <Tabs defaultValue="piece" className="w-full">
                              <TabsList className="w-full">
                                <TabsTrigger className="w-full" value="piece">
                                  Pièce
                                </TabsTrigger>
                                <TabsTrigger className="w-full" value="MO">
                                  Main d&apos;oeuvre
                                </TabsTrigger>
                                <TabsTrigger
                                  className="w-full"
                                  value="upcoming"
                                >
                                  À venir
                                </TabsTrigger>
                              </TabsList>
                              <TabsContent value="piece">
                                <AddPartItem
                                  ItemsEstimate={selectedItems}
                                  setOpen={setDialogOpen}
                                  setSelectedItems={setSelectedItems}
                                  estimateId={params.id}
                                />
                              </TabsContent>
                              <TabsContent value="MO">
                                <AddMOItem
                                  ItemsEstimate={selectedItems}
                                  setOpen={setDialogOpen}
                                  setSelectedItems={setSelectedItems}
                                  estimateId={params.id}
                                />
                              </TabsContent>
                              <TabsContent value="upcoming">
                                <AddUpcomingItem
                                  ItemsEstimate={selectedItems}
                                  setOpen={setDialogOpen}
                                  setSelectedItems={setSelectedItems}
                                  estimateId={params.id}
                                />
                              </TabsContent>
                            </Tabs>
                          </DialogContent>
                        </Dialog>
                      </CardTitle>
                      <CardDescription>
                        {"Liste des prestations du devis"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {selectedItems.length > 0 ? (
                        <div className="max-h-96 space-y-2 overflow-y-auto">
                          {selectedItems
                            .sort((a, b) => {
                              // PART en premier
                              if (a.type === "PART" && b.type !== "PART")
                                return -1;
                              if (a.type !== "PART" && b.type === "PART")
                                return 1;
                              // LABOR en deuxième
                              if (a.type === "LABOR" && b.type === "UPCOMING")
                                return -1;
                              if (a.type === "UPCOMING" && b.type === "LABOR")
                                return 1;
                              // Sinon, trier par position
                              return a.position - b.position;
                            })
                            .map((item) => (
                              <div
                                key={item.id}
                                className="bg-card flex items-center justify-between rounded-lg border p-3"
                              >
                                <div className="w-[50%] overflow-hidden">
                                  <div
                                    className={`${item.type === "UPCOMING" && "text-red-500"} prose prose-sm max-w-none font-semibold`}
                                    dangerouslySetInnerHTML={{
                                      __html: item.designation,
                                    }}
                                  />
                                  {item.description && (
                                    <div
                                      className="prose prose-sm max-w-none text-sm text-black/70"
                                      dangerouslySetInnerHTML={{
                                        __html: item.description,
                                      }}
                                    />
                                  )}
                                </div>
                                <div className="flex w-[47%] items-center justify-between">
                                  <div className="w-[53%]">
                                    {item.type ===
                                    "UPCOMING" ? null : item.type ===
                                      "LABOR" ? (
                                      <>
                                        <div className="text-primary font-semibold">
                                          {(() => {
                                            let itemTotal: number;

                                            // Si calculateByTime est true ET qu'il y a une quantity
                                            if (
                                              item.calculateByTime &&
                                              item.quantity
                                            ) {
                                              itemTotal =
                                                (item.unitPrice *
                                                  item.quantity) /
                                                60;
                                            } else {
                                              // Sinon, utiliser simplement le unitPrice
                                              itemTotal = item.unitPrice;
                                            }

                                            return (
                                              itemTotal
                                                .toFixed(2)
                                                .replaceAll(".", ",") + " CHF"
                                            );
                                          })()}
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <div className="text-primary font-semibold">
                                          {item.unitPrice
                                            .toFixed(2)
                                            .replaceAll(".", ",")}{" "}
                                          CHF
                                        </div>
                                      </>
                                    )}
                                  </div>
                                  {estimate.status !== "ACCEPTED" &&
                                    estimate.status !== "PENDING" && (
                                      <div className="flex w-[40%]">
                                        {item.type === "PART" ? (
                                          <UpdatePartItem
                                            ItemsEstimate={selectedItems}
                                            setSelectedItems={setSelectedItems}
                                            item={{
                                              ...item,
                                              unitPrice: item.unitPrice,
                                            }}
                                            estimateId={params.id}
                                            disable={updateDisable}
                                          />
                                        ) : item.type === "LABOR" ? (
                                          <UpdateMOItem
                                            ItemsEstimate={selectedItems}
                                            setSelectedItems={setSelectedItems}
                                            item={{
                                              ...item,
                                              unitPrice: item.unitPrice,
                                              quantity: item.quantity,
                                              calculateByTime:
                                                item.calculateByTime || null,
                                            }}
                                            estimateId={params.id}
                                            disable={updateDisable}
                                          />
                                        ) : (
                                          item.type === "UPCOMING" && (
                                            <UpdateUpcomingItem
                                              ItemsEstimate={selectedItems}
                                              setSelectedItems={
                                                setSelectedItems
                                              }
                                              item={{
                                                ...item,
                                              }}
                                              estimateId={params.id}
                                              disable={updateDisable}
                                            />
                                          )
                                        )}
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleRemoveItem(item.id)
                                          }
                                          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-full p-0"
                                          disabled={updateDisable}
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    )}
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground py-8 text-center text-sm">
                          {
                            "Aucun item ajouté. Cliquez sur Ajouter pour commencer."
                          }
                        </p>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <div className="flex items-center justify-between">
                        <p>
                          Total&nbsp;
                          <span className="font-semibold">
                            {calculateTotal().toFixed(2)}&nbsp;CHF
                          </span>
                        </p>
                      </div>
                    </CardFooter>
                  </Card>
                </div>
              </div>

              {/* Prévisualisation du PDF */}
              <Card className="relative mb-6 border-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      className={`absolute top-5 right-5 ${estimate.status === "ACCEPTED" || estimate.status === "PENDING" ? "cursor-not-allowed bg-gray-400" : "bg-emerald-600 hover:bg-emerald-700"}`}
                      disabled={updateDisable}
                    >
                      {estimate.status === "PENDING"
                        ? "Devis en attente"
                        : estimate.status === "ACCEPTED"
                          ? "Devis accepté"
                          : estimate.status === "SENT_TO_GARAGE"
                            ? "Voiture au garage"
                            : "Valider le PDF"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Êtes-vous sûr de valider le PDF ?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Vous devrez ensuite l&apos;envoyer au client pour
                        qu&apos;il le valide à son tour !
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={async () => {
                          const response = await validateEstimate({
                            estimateId: estimate.id,
                          });

                          if (response.success) {
                            toast.success(response.message);
                            router.push(
                              `/dashboard/estimates/${estimate.type === "INDIVIDUAL" ? "individual" : "insurance"}/pending`,
                            );
                          } else {
                            toast.error(response.message);
                          }
                        }}
                      >
                        Valider
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="text-primary h-5 w-5" />
                    {"Prévisualisation du PDF"}
                  </CardTitle>
                  <CardDescription>
                    {"Aperçu du document qui sera généré (format A4)"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  {pdfPreviewUrl ? (
                    <iframe
                      src={`${pdfPreviewUrl}#zoom=100`}
                      className="h-297.5 w-full border"
                      title="Prévisualisation du PDF"
                    />
                  ) : (
                    <div className="flex h-297.5 w-full items-center justify-center border bg-gray-50">
                      <p className="text-gray-500">
                        Chargement de la prévisualisation...
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )
      )}
    </>
  );
}
