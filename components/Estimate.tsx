"use client";

import { useState } from "react";
import { Card } from "./ui/card";
import { CalendarIcon, CarIcon, Trash, UserIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "./ui/button";
import Link from "next/link";
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
  sendEstimateToGarage,
  markEstimateAsWaitingParts,
  markPartsAsArrived,
} from "@/lib/actions/estimate";
import { useRouter } from "next/navigation";
import { Estimate as EstimateType } from "@/types/types";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormField } from "./form/FormField";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Spinner } from "./ui/spinner";
import { createInvoice } from "@/lib/actions/invoice";
import CreateAppointmentDialog from "./form/CreateAppointmentDialog";

export default function Estimate({
  estimate,
  isIndividual,
  refetch,
}: {
  estimate: EstimateType;
  isIndividual: boolean;
  refetch: () => void;
}) {
  const router = useRouter();
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [appointmentCreated, setAppointmentCreated] = useState(false);

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

  const zodFormSchema = z.object({
    reason: z.string().nonempty("La raison de refus est requise."),
  });
  type FormSchema = z.infer<typeof zodFormSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormSchema>({
    resolver: zodResolver(zodFormSchema),
  });

  const handleSubmitForm = async (data: FormSchema) => {
    const response = await refuseEstimate({
      estimateId: estimate.id,
      reason: data.reason,
    });

    if (response.success) {
      toast.success(response.message);
      router.push(`/dashboard/estimates/${estimate.id}`);
    } else {
      toast.error(response.message);
    }
  };

  return (
    <Card
      key={estimate.id}
      className={`${estimate.type === "INSURANCE" ? "insurance-card" : isIndividual ? "individual-card" : "company-card"} hover:border-primary/50 w-115 p-6 transition-colors`}
    >
      <div className="flex w-full flex-col gap-1">
        <div className="flex w-full flex-row items-center justify-between">
          <div className="flex w-full items-center justify-between gap-3">
            <div className="text-muted-foreground flex items-center gap-2">
              <CalendarIcon className="size-4" />
              <span className="text-sm font-medium">
                {format(estimate.intervention.date, "PP", {
                  locale: fr,
                })}
              </span>
            </div>
            {estimate.status === "SENT_TO_GARAGE" &&
              estimate.sentToGarageAt && (
                <div className="text-muted-foreground flex items-center gap-2">
                  <span className="text-sm font-medium">
                    Envoyé:{" "}
                    {format(estimate.sentToGarageAt, "PP", { locale: fr })}
                  </span>
                </div>
              )}
            {estimate.status === "ACCEPTED" && estimate.acceptedAt && (
              <div className="text-muted-foreground flex items-center gap-2">
                <span className="text-sm font-medium">
                  Accepté: {format(estimate.acceptedAt, "PP", { locale: fr })}
                </span>
              </div>
            )}
            {estimate.status === "TOFINISH" && estimate.refusals && estimate.refusals.length > 0 && (
              <Dialog>
                <DialogTrigger asChild>
                  <button className="text-muted-foreground flex items-center gap-2 hover:underline">
                    <span className="text-sm font-medium">
                      Refusé ({estimate.refusals.length})
                    </span>
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Historique des refus</DialogTitle>
                    <DialogDescription>
                      Consultez l'historique de toutes les demandes de refus pour ce devis
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col gap-3 max-h-96 overflow-y-auto">
                    {estimate.refusals.map((refusal) => (
                      <div
                        key={refusal.id}
                        className="rounded-lg border border-gray-200 p-3"
                      >
                        <p className="text-sm font-semibold">
                          {format(refusal.refusedAt, "PPP 'à' HH:mm", { locale: fr })}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {refusal.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Fermer</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            {estimate.paidAt && (
              <div className="text-muted-foreground flex items-center gap-2">
                <span className="text-sm font-medium">
                  Payé le: {format(estimate.paidAt, "PP", { locale: fr })}
                </span>
              </div>
            )}
            {estimate.status === "WAITING_PARTS" &&
              estimate.partsOrderedAt && (
                <div className="text-muted-foreground flex items-center gap-2">
                  <span className="text-sm font-medium">
                    Commandé:{" "}
                    {format(estimate.partsOrderedAt, "PP", { locale: fr })}
                  </span>
                </div>
              )}
            {estimate.partsArrivedAt && (
              <div className="text-muted-foreground flex items-center gap-2">
                <span className="text-sm font-medium">
                  Arrivé:{" "}
                  {format(estimate.partsArrivedAt, "PP", { locale: fr })}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {estimate.status === "TOFINISH" && (
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
              {estimate.type === "INSURANCE" && (
                <span className="text-sm">
                  Numéro de sinistre :{" "}
                  <span
                    className={`${estimate.claimNumber ? "text-foreground" : "text-red-500"} font-mono font-medium`}
                  >
                    {estimate.claimNumber || "NON RENSEIGNÉ"}
                  </span>
                </span>
              )}
              {estimate.status === "TOFINISH" && estimate._count && (
                <div className="flex items-center gap-2">
                  {estimate._count.items === 0 ? (
                    <span className="flex items-center gap-1 text-sm text-red-500">
                      <span className="size-2 rounded-full bg-red-500"></span>
                      Devis vide - Aucun item ajouté
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-sm text-green-600">
                      <span className="size-2 rounded-full bg-green-600"></span>
                      {estimate._count.items} item
                      {estimate._count.items > 1 ? "s" : ""} ajouté
                      {estimate._count.items > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex h-full flex-col justify-center gap-2">
            {estimate.status === "TOFINISH" ? (
              <>
                <InformationsDialog estimate={estimate} refetch={refetch} />
                <Link
                  href={`/dashboard/estimates/${estimate.id}`}
                  className="w-full"
                >
                  <Button
                    className={`${estimate.type === "INSURANCE" ? "insurance-btn" : isIndividual ? "individual-btn" : "company-btn"} w-full`}
                  >
                    {"Modifier le devis"}
                  </Button>
                </Link>
              </>
            ) : estimate.status === "PENDING" ? (
              <>
                <Link
                  href={`/dashboard/estimates/${estimate.id}`}
                  className="w-full"
                >
                  <Button className="w-full" variant={"link"}>
                    Voir le devis
                  </Button>
                </Link>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-red-600 hover:bg-red-700">
                      Refuser le devis
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <form
                      className="flex flex-col gap-3"
                      onSubmit={handleSubmit(handleSubmitForm)}
                    >
                      <DialogHeader>
                        <DialogTitle>Refuser le devis</DialogTitle>
                        <DialogDescription>
                          Le client a refusé le devis, veuillez rentrer la
                          raison pour laquelle il a été refusé.
                        </DialogDescription>
                      </DialogHeader>
                      <FormField
                        label="Raison du refus"
                        name="reason"
                        type="text"
                        register={register}
                        nonempty
                        textarea
                        error={errors.reason}
                      />
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Annuler</Button>
                        </DialogClose>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {isSubmitting ? <Spinner /> : "Refuser le devis"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
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
                        devis sera accepté et passera en accpeté.
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
                            setAppointmentCreated(false);
                            setAppointmentDialogOpen(true);
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
            ) : estimate.status === "ACCEPTED" ? (
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
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="bg-gray-600 hover:bg-gray-700">
                      Voiture au garage
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Le devis passera en &quot;Envoyé au garage&quot;.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-gray-600 hover:bg-gray-700"
                        onClick={async () => {
                          const response = await sendEstimateToGarage({
                            estimateId: estimate.id,
                          });

                          if (response.success) {
                            toast.success(response.message);
                            router.push(`/dashboard/mechanical`);
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
              </>
            ) : (
              estimate.status === "SENT_TO_GARAGE" && (
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
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="bg-yellow-600 hover:bg-yellow-700">
                        Pièces en attente
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Le véhicule sera marqué comme en attente de pièces
                          commandées.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-yellow-600 hover:bg-yellow-700"
                          onClick={async () => {
                            const response = await markEstimateAsWaitingParts({
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
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="bg-pink-700 hover:bg-pink-800">
                        Envoyer en facture
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Le devis deviendra une facture et un e-mail sera
                          envoyé dans la boite mail du client. Cela signifie que
                          les modifications ont été faite et que le cas du
                          client sera terminé.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-pink-700 hover:bg-pink-800"
                          onClick={async () => {
                            const response = await createInvoice({
                              estimateId: estimate.id,
                            });

                            if (response.success) {
                              toast.success(response.message);
                              router.push(`/dashboard/mechanical`);
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
                </>
              )
            )}
            {estimate.status === "WAITING_PARTS" && (
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
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Pièces arrivées
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Les pièces sont arrivées et le véhicule retournera en
                        &quot;Au garage&quot;.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={async () => {
                          const response = await markPartsAsArrived({
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
              </>
            )}
          </div>
        </div>
      </div>

      {/* Dialog de création de rendez-vous après acceptation */}
      <CreateAppointmentDialog
        open={appointmentDialogOpen}
        onOpenChange={(open) => {
          setAppointmentDialogOpen(open);
          // Si le dialog se ferme et qu'aucun rendez-vous n'a été créé, rediriger vers la page acceptée
          if (!open && !appointmentCreated) {
            const acceptedPath = estimate.type === "INDIVIDUAL"
              ? "/dashboard/estimates/individual/accepted"
              : "/dashboard/estimates/insurance/accepted";
            router.push(acceptedPath);
          }
        }}
        defaultType={0}
        defaultClientId={estimate.intervention.vehicule.client.id.toString()}
        defaultVehiculeId={estimate.intervention.vehicule.id.toString()}
        defaultEstimateId={estimate.id.toString()}
        disableType={true}
        disableClient={true}
        disableVehicule={true}
        disableEstimate={true}
        onSuccess={() => {
          setAppointmentCreated(true);
          setAppointmentDialogOpen(false);
          const acceptedPath = estimate.type === "INDIVIDUAL"
            ? "/dashboard/estimates/individual/accepted"
            : "/dashboard/estimates/insurance/accepted";
          router.push(acceptedPath);
        }}
      />
    </Card>
  );
}
