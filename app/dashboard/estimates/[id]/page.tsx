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
import { FileText, ImageIcon, Download, Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TypeClient } from "@/generated/prisma/enums";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import LoadingPage from "@/components/LoadingPage";
import ErrorPage from "@/components/ErrorPage";
import { ItemEstimate } from "@/types/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddPartItem from "@/components/form/estimates/AddPartItem";
import toast from "react-hot-toast";
import AddMOItem from "@/components/form/estimates/AddMOItem";
import UpdatePartItem from "@/components/form/estimates/UpdatePartItem";
import UpdateMOItem from "@/components/form/estimates/UpdateMOItem";
import { FILE_SERVER_URL } from "@/lib/config";
import AddUpcomingItem from "@/components/form/estimates/AddUpcomingItem";
import UpdateUpcomingItem from "@/components/form/estimates/UpdateUpcomingItem";
import { updateEstimateItems } from "@/lib/actions/estimate";

type FetchEstimate = {
  id: string;
  items: ItemEstimate;
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

  const { data: estimate, isLoading, isError } = useEstimate({ id: params.id });

  const [selectedItems, setSelectedItems] = useState<ItemEstimate>([]);
  const loadingItems = useRef(false);

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleRemoveItem = async (id: string) => {
    // Trouver l'item à supprimer pour récupérer sa position
    const itemToRemove = selectedItems.find((item) => item.id === id);

    if (!itemToRemove) return;

    // Filtrer l'item à supprimer
    const updatedItems = selectedItems.filter((item) => item.id !== id);

    // Décaler les positions des items qui étaient après l'item supprimé
    updatedItems.forEach((item) => {
      if (item.position > itemToRemove.position) {
        item.position -= 1;
      }
    });

    // Trier par position
    updatedItems.sort((a, b) => a.position - b.position);

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
      const itemTotal = item.unitPrice * (item.quantity ?? 0);
      const discountAmount = item.discount
        ? (itemTotal * item.discount) / 100
        : 0;
      return sum + (itemTotal - discountAmount);
    }, 0);
  };

  const generatePDF = async () => {
    if (!estimate) return;

    try {
      const previewElement = document.getElementById("pdf-preview");
      if (!previewElement) return;

      // Cloner l'élément pour ne pas modifier l'original
      const clonedElement = previewElement.cloneNode(true) as HTMLElement;

      // Convertir l'image en base64
      const img = clonedElement.querySelector(
        'img[alt="logo"]',
      ) as HTMLImageElement;
      if (img) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const image = new Image();
        image.crossOrigin = "anonymous";

        await new Promise((resolve, reject) => {
          image.onload = () => {
            canvas.width = image.width;
            canvas.height = image.height;
            ctx?.drawImage(image, 0, 0);
            const base64 = canvas.toDataURL("image/png");
            img.src = base64;
            resolve(null);
          };
          image.onerror = reject;
          image.src = "/logo.png";
        });
      }

      // Capturer le HTML avec les styles inline
      const html = clonedElement.outerHTML;

      const response = await fetch("/api/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ html }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la génération du PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `devis-${estimate.intervention.vehicule.licensePlate}-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("PDF généré avec succès");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la génération du PDF");
    }
  };

  useEffect(() => {
    if (estimate?.items && !loadingItems.current) {
      setSelectedItems(estimate.items);
      loadingItems.current = true;
    }
  }, [estimate?.items, loadingItems]);

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

              <div className="flex flex-col gap-6">
                {/* Colonne gauche - Constat et Médias */}
                <div className="flex w-full justify-between gap-6">
                  {/* Zone de constat */}
                  <Card className="w-full border-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="text-primary h-5 w-5" />
                        {"Constat"}
                      </CardTitle>
                      <CardDescription>
                        {"Description du constat"}
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

                  <Card className="w-full border-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-black/50" />
                        {"Photos et Vidéos"}
                      </CardTitle>
                      <CardDescription>
                        {estimate.intervention.medias
                          ? `${estimate.intervention.medias.split(",").length} fichier(s) disponible(s)`
                          : "Aucun média n'a été ajouté à l'intervention"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full bg-transparent"
                            disabled={!estimate.intervention.medias}
                          >
                            <ImageIcon className="mr-2 h-4 w-4" />
                            {"Voir les médias"}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[80vh] min-w-[30vw] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Photos et vidéos</DialogTitle>
                          </DialogHeader>
                          <div className="flex flex-wrap gap-2">
                            {estimate.intervention.medias
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
                                      className="bg-muted relative col-span-full aspect-video overflow-hidden rounded-lg"
                                    >
                                      <video
                                        controls
                                        className="h-full w-full object-contain"
                                        src={`${FILE_SERVER_URL}/uploads/${fileName}`}
                                      >
                                        Votre navigateur ne supporte pas la
                                        lecture de vidéos.
                                      </video>
                                    </div>
                                  );
                                }

                                if (isImage) {
                                  return (
                                    <div
                                      key={index}
                                      className="bg-muted relative flex h-75 items-center justify-center overflow-hidden rounded-lg"
                                    >
                                      {/* eslint-disable-next-line */}
                                      <img
                                        src={`${FILE_SERVER_URL}/uploads/${fileName}`}
                                        alt={`Image ${index + 1}`}
                                        className="h-full w-full object-contain"
                                      />
                                    </div>
                                  );
                                }

                                return null;
                              })}
                          </div>
                        </DialogContent>
                      </Dialog>
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
                            <Button size="sm">
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
                              // Séparer les items UPCOMING des autres
                              if (
                                a.type === "UPCOMING" &&
                                b.type !== "UPCOMING"
                              )
                                return 1;
                              if (
                                a.type !== "UPCOMING" &&
                                b.type === "UPCOMING"
                              )
                                return -1;
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
                                    {item.type === "UPCOMING" ? null : (
                                      <>
                                        <div className="text-primary font-semibold">
                                          {item.unitPrice
                                            .toFixed(2)
                                            .replaceAll(".", ",")}{" "}
                                          .-
                                          {item.discount && (
                                            <span className="ml-1 text-xs text-red-600">
                                              (-{item.discount}%)
                                            </span>
                                          )}
                                        </div>
                                        {item.discount && (
                                          <div className="text-sm font-semibold text-green-600">
                                            {(() => {
                                              const itemTotal =
                                                item.unitPrice *
                                                (item.quantity ?? 0);
                                              const discountAmount =
                                                (itemTotal * item.discount) /
                                                100;
                                              return (
                                                (itemTotal - discountAmount)
                                                  .toFixed(2)
                                                  .replaceAll(".", ",") + " .-"
                                              );
                                            })()}
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>
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
                                      />
                                    ) : item.type === "LABOR" ? (
                                      <UpdateMOItem
                                        ItemsEstimate={selectedItems}
                                        setSelectedItems={setSelectedItems}
                                        item={{
                                          ...item,
                                          unitPrice: item.unitPrice,
                                        }}
                                        estimateId={params.id}
                                      />
                                    ) : (
                                      item.type === "UPCOMING" && (
                                        <UpdateUpcomingItem
                                          ItemsEstimate={selectedItems}
                                          setSelectedItems={setSelectedItems}
                                          item={{
                                            ...item,
                                          }}
                                          estimateId={params.id}
                                        />
                                      )
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveItem(item.id)}
                                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-full p-0"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
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
                      <div className="flex gap-4">
                        <Button
                          onClick={generatePDF}
                          disabled={selectedItems.length === 0}
                          className="flex gap-2"
                        >
                          <Download className="size-4" />
                          {"Générer le PDF"}
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </div>
              </div>
              {/* Prévisualisation du PDF */}
              <Card className="relative mb-6 border-2">
                <Button className="absolute top-5 right-5 bg-emerald-600 hover:bg-emerald-700">
                  Valider le PDF
                </Button>
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
                  <div className="h-280.75 w-198.5 border bg-white">
                    <div
                      id="pdf-preview"
                      className="pdf-container relative flex h-full w-full flex-col rounded p-14"
                    >
                      <div className="pdf-content flex flex-col gap-4">
                        <div className="flex flex-col">
                          {/* eslint-disable-next-line */}
                          <img src={"/logo.png"} alt="logo" className="w-60" />
                          {/* <div>info devis</div> */}
                        </div>
                        <div className="flex flex-row justify-between">
                          <div>
                            <p className="font-semibold">
                              Swiss Car Consulting
                            </p>
                            <p>18, rue des travaux</p>
                            <p>1234, Ville</p>
                            <p>Tel: +41 79 123 45 67</p>
                            <p>Mail: exemple@mail.com</p>
                          </div>
                          <div>
                            <p className="font-semibold">
                              {estimate.intervention.vehicule.client
                                .typeClient === TypeClient.individual
                                ? `${estimate.intervention.vehicule.client.firstName} ${estimate.intervention.vehicule.client.name}`
                                : estimate.intervention.vehicule.client
                                    .companyName}
                            </p>
                            {estimate.intervention.vehicule.client.address &&
                              estimate.intervention.vehicule.client.city &&
                              estimate.intervention.vehicule.client
                                .postalCode && (
                                <>
                                  <p>
                                    {
                                      estimate.intervention.vehicule.client
                                        .address
                                    }
                                  </p>
                                  <p>
                                    {
                                      estimate.intervention.vehicule.client
                                        .postalCode
                                    }
                                    ,{" "}
                                    {estimate.intervention.vehicule.client.city}
                                  </p>
                                </>
                              )}
                          </div>
                        </div>
                        <div className="">
                          <h2 className="mb-2 text-xl font-semibold text-black">
                            Véhicule
                          </h2>
                          <p className="text-black">
                            {estimate.intervention.vehicule.brand}{" "}
                            {estimate.intervention.vehicule.model} (
                            {estimate.intervention.vehicule.year})
                          </p>
                          <p className="text-black">
                            <strong>Plaque:</strong>{" "}
                            {estimate.intervention.vehicule.licensePlate}
                          </p>
                        </div>

                        {/* Tableau des pièces et main d'œuvre */}
                        <div>
                          {selectedItems.filter(
                            (item) => item.type !== "UPCOMING",
                          ).length > 0 ? (
                            <table className="w-full border border-black/50">
                              <thead>
                                <tr className="bg-blue-400">
                                  <th className="w-[55%] border border-black/50 text-center text-sm">
                                    Désignation
                                  </th>
                                  <th className="w-[15%] border border-black/50 px-2 text-center text-sm">
                                    Quantité
                                  </th>
                                  <th className="w-[15%] border border-black/50 text-center text-sm">
                                    Prix unitaire
                                  </th>
                                  <th className="w-[15%] border border-black/50 text-center text-sm">
                                    Total HT
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedItems
                                  .filter((item) => item.type !== "UPCOMING")
                                  .sort((a, b) => a.position - b.position)
                                  .map((item, i, arr) => (
                                    <tr
                                      key={item.id}
                                      className={`${arr.length - 1 !== i && "border-b"} border-black/50`}
                                    >
                                      <td className="flex w-full flex-col gap-1 p-1">
                                        <div
                                          className="prose prose-sm text-sm font-semibold wrap-break-word text-black"
                                          dangerouslySetInnerHTML={{
                                            __html: item.designation,
                                          }}
                                        />
                                        <div
                                          className="prose prose-sm text-xs wrap-break-word text-black/70"
                                          dangerouslySetInnerHTML={{
                                            __html: item.description || "",
                                          }}
                                        />
                                      </td>
                                      <td className="border border-black/50 p-0.5 text-right align-bottom text-sm text-black">
                                        {item.quantity ?? 0}
                                      </td>
                                      <td className="border border-black/50 p-0.5 text-right align-bottom text-sm text-black">
                                        {item.unitPrice.toFixed(2)} CHF
                                        {item.discount && (
                                          <div className="text-xs text-red-600">
                                            -{item.discount}%
                                          </div>
                                        )}
                                      </td>
                                      <td className="border border-black/50 p-0.5 text-right align-bottom text-sm text-black">
                                        {(() => {
                                          const itemTotal =
                                            item.unitPrice *
                                            (item.quantity ?? 0);
                                          const discountAmount = item.discount
                                            ? (itemTotal * item.discount) / 100
                                            : 0;
                                          return (
                                            itemTotal - discountAmount
                                          ).toFixed(2);
                                        })()}{" "}
                                        CHF
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          ) : (
                            <p className="text-gray-500 italic">
                              Aucune prestation ajoutée
                            </p>
                          )}
                        </div>

                        {/* Tableau des items à venir */}
                        {selectedItems.filter(
                          (item) => item.type === "UPCOMING",
                        ).length > 0 && (
                          <div className="mt-6">
                            <h3 className="mb-2 text-lg font-semibold text-black">
                              À venir
                            </h3>
                            <table className="w-full border border-black/50">
                              <thead>
                                <tr className="bg-red-400">
                                  <th className="w-full border border-black/50 text-center text-sm">
                                    Désignation
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedItems
                                  .filter((item) => item.type === "UPCOMING")
                                  .sort((a, b) => a.position - b.position)
                                  .map((item, i, arr) => (
                                    <tr
                                      key={item.id}
                                      className={`${arr.length - 1 !== i && "border-b"} border-black/50`}
                                    >
                                      <td className="flex w-full flex-col gap-1 p-1">
                                        <div
                                          className="prose prose-sm text-sm font-semibold wrap-break-word text-red-500"
                                          dangerouslySetInnerHTML={{
                                            __html: item.designation,
                                          }}
                                        />
                                        <div
                                          className="prose prose-sm text-xs wrap-break-word text-black/70"
                                          dangerouslySetInnerHTML={{
                                            __html: item.description || "",
                                          }}
                                        />
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                      <div className="pdf-footer mt-auto border-t-2 border-black pt-4">
                        <div className="flex justify-between">
                          <div className="text-left text-sm text-black">
                            <p className="mb-2 font-semibold">
                              Conditions de paiement :
                            </p>
                            <p className="mb-1">
                              Paiement à effectuer dans un délai de 30 jours
                            </p>
                            <p className="mb-1">
                              Date limite :{" "}
                              {new Date(
                                new Date().setMonth(new Date().getMonth() + 1),
                              ).toLocaleDateString("fr-CH")}
                            </p>
                            <p className="mt-3 font-semibold">IBAN :</p>
                            <p>CH00 0000 0000 0000 0000 0</p>
                          </div>
                          <div className="text-right">
                            <div className="mb-2 flex justify-between gap-8">
                              <p className="text-base text-black">Total HT :</p>
                              <p className="text-base font-semibold text-black">
                                {calculateTotal().toFixed(2)} CHF
                              </p>
                            </div>
                            <div className="mb-2 flex justify-between gap-8">
                              <p className="text-base text-black">
                                TVA (10%) :
                              </p>
                              <p className="text-base font-semibold text-black">
                                {(calculateTotal() * 0.1).toFixed(2)} CHF
                              </p>
                            </div>
                            <div className="flex justify-between gap-8 border-t-2 border-black pt-2">
                              <p className="text-xl font-bold text-black">
                                Total TTC :
                              </p>
                              <p className="text-xl font-bold text-black">
                                {(calculateTotal() * 1.1).toFixed(2)} CHF
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )
      )}
    </>
  );
}
