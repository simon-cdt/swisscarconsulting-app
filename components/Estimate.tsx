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
                    className={`${estimate.intervention.vehicule.client.typeClient === "individual" ? "individual-btn" : "company-btn"} w-full`}
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
          </div>
        </div>
      </div>

      {/* Dialog de création de rendez-vous après acceptation */}
      <CreateAppointmentDialog
        open={appointmentDialogOpen}
        onOpenChange={(open) => {
          setAppointmentDialogOpen(open);
          // Si le dialog se ferme et qu'aucun rendez-vous n'a été créé, rediriger
          if (!open && !appointmentCreated) {
            router.push("/dashboard/mechanical");
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
          router.push("/dashboard/calendar");
        }}
      />
    </Card>
  );
}
