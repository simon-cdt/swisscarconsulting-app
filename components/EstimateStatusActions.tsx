"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  acceptEstimate,
  refuseEstimate,
  sendEstimateToGarage,
  markEstimateAsWaitingParts,
  markPartsAsArrived,
} from "@/lib/actions/estimate";
import { createInvoice } from "@/lib/actions/invoice";
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
import CreateAppointmentDialog from "./form/CreateAppointmentDialog";
import Link from "next/link";
import { EstimateStatus, TypeEstimate } from "@/generated/prisma/enums";

interface EstimateStatusActionsProps {
  estimateId: string;
  status: EstimateStatus;
  type: TypeEstimate;
  clientId: number;
  vehiculeId: string;
  refetch?: () => void;
}

export default function EstimateStatusActions({
  estimateId,
  status,
  type,
  clientId,
  vehiculeId,
  refetch,
}: EstimateStatusActionsProps) {
  const router = useRouter();
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [appointmentCreated, setAppointmentCreated] = useState(false);

  const zodFormSchema = z.object({
    reason: z.string().nonempty("La raison de refus est requise."),
  });
  type FormSchema = z.infer<typeof zodFormSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormSchema>({
    resolver: zodResolver(zodFormSchema),
  });

  const handleSubmitForm = async (data: FormSchema) => {
    const response = await refuseEstimate({
      estimateId: estimateId,
      reason: data.reason,
    });

    if (response.success) {
      toast.success(response.message);
      reset();
      refetch?.();
    } else {
      toast.error(response.message);
    }
  };

  if (status === "TOFINISH") {
    return null;
  }

  if (status === "PENDING") {
    return (
      <div className="flex flex-col gap-2">
        <Link href={`/dashboard/estimates/${estimateId}`} className="w-full">
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
                  Le client a refusé le devis, veuillez rentrer la raison pour
                  laquelle il a été refusé.
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
                Cela voudrait dire que le client a accepté le devis. Le devis
                sera accepté et passera en accepté.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={async () => {
                  const response = await acceptEstimate({
                    estimateId: estimateId,
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
        <CreateAppointmentDialog
          open={appointmentDialogOpen}
          onOpenChange={(open) => {
            setAppointmentDialogOpen(open);
            if (!open && !appointmentCreated) {
              refetch?.();
            }
          }}
          defaultType={0}
          defaultClientId={clientId.toString()}
          defaultVehiculeId={vehiculeId.toString()}
          defaultEstimateId={estimateId.toString()}
          disableType={true}
          disableClient={true}
          disableVehicule={true}
          disableEstimate={true}
          onSuccess={() => {
            setAppointmentCreated(true);
            setAppointmentDialogOpen(false);
            refetch?.();
          }}
        />
      </div>
    );
  }

  if (status === "ACCEPTED") {
    return (
      <div className="flex flex-col gap-2">
        <Link href={`/dashboard/estimates/${estimateId}`} className="w-full">
          <Button className="w-full" variant={"link"}>
            Voir le devis
          </Button>
        </Link>
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
                    estimateId: estimateId,
                  });

                  if (response.success) {
                    toast.success(response.message);
                    refetch?.();
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
    );
  }

  if (status === "SENT_TO_GARAGE") {
    return (
      <div className="flex flex-col gap-2">
        <Link href={`/dashboard/estimates/${estimateId}`} className="w-full">
          <Button className="w-full" variant={"link"}>
            Voir le devis
          </Button>
        </Link>
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
                Le véhicule sera marqué comme en attente de pièces commandées.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                className="bg-yellow-600 hover:bg-yellow-700"
                onClick={async () => {
                  const response = await markEstimateAsWaitingParts({
                    estimateId: estimateId,
                  });

                  if (response.success) {
                    toast.success(response.message);
                    refetch?.();
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
                Le devis deviendra une facture et un e-mail sera envoyé dans la
                boite mail du client. Cela signifie que les modifications ont
                été faite et que le cas du client sera terminé.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                className="bg-pink-700 hover:bg-pink-800"
                onClick={async () => {
                  const response = await createInvoice({
                    estimateId: estimateId,
                  });

                  if (response.success) {
                    toast.success(response.message);
                    refetch?.();
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
    );
  }

  if (status === "WAITING_PARTS") {
    return (
      <div className="flex flex-col gap-2">
        <Link href={`/dashboard/estimates/${estimateId}`} className="w-full">
          <Button className="w-full" variant={"link"}>
            Voir le devis
          </Button>
        </Link>
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
                Les pièces sont arrivées et le véhicule retournera en &quot;Au
                garage&quot;.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                className="bg-blue-600 hover:bg-blue-700"
                onClick={async () => {
                  const response = await markPartsAsArrived({
                    estimateId: estimateId,
                  });

                  if (response.success) {
                    toast.success(response.message);
                    refetch?.();
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
    );
  }

  return null;
}
