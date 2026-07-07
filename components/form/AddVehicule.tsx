"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { TypeClient } from "@/generated/prisma/enums";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import z from "zod";
import { FormField } from "./FormField";
import { format } from "date-fns";
import { Spinner } from "../ui/spinner";
import { DatePicker } from "./DatePicker";
import {
  addClientVehicule,
  checkLicensePlateExists,
} from "@/lib/actions/vehicule";
import UploadImage from "./UploadImage";
import { useState } from "react";
import SelectSearch from "@/components/form/SelectSearch";
import { useQuery } from "@tanstack/react-query";
import { formatLicensePlate, formatRegistrationNumber } from "@/lib/utils";

type FetchInsurances = {
  id: string;
  name: string;
}[];

function useInsurances() {
  return useQuery({
    queryKey: ["insurances"],
    queryFn: async (): Promise<FetchInsurances> => {
      const response = await fetch(`/api/insurances`);
      return await response.json();
    },
  });
}

export function AddVehicule({
  typeClient,
  clientId,
  refetch,
}: {
  typeClient: TypeClient;
  clientId: number;
  refetch: () => void;
}) {
  const { data: insurances, isLoading, isError } = useInsurances();

  const [open, setOpen] = useState(false);
  const [showPlateConfirmDialog, setShowPlateConfirmDialog] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormSchema | null>(
    null,
  );

  const zodFormSchema = z
    .object({
      brand: z.string().nonempty("La marque est requise."),
      model: z.string().nonempty("Le modèle de la voiture est requis."),
      year: z
        .number("L'année doit être un nombre.")
        .int("L'année doit être un nombre entier.")
        .min(1900, "L'année doit être au moins 1900.")
        .max(
          new Date().getFullYear(),
          `L'année ne peut pas être supérieure à ${new Date().getFullYear()}.`,
        ),
      licensePlate: z
        .string()
        .nonempty("La plaque d'immatriculation est requise.")
        .refine(
          (value) => {
            const cleaned = value.replace(/[\s-]/g, "").toUpperCase();
            // Plaque suisse: 2 lettres + 1 à 6 chiffres (ex: GE123456)
            const swissPlate = /^[A-Z]{2}\d{1,6}$/;
            // Plaque EU: 2 lettres + 3 chiffres + 2 lettres (ex: GE123AB)
            const euPlate = /^[A-Z]{2}\d{3}[A-Z]{2}$/;
            return swissPlate.test(cleaned) || euPlate.test(cleaned);
          },
          {
            message:
              "Format invalide. Acceptés: plaque suisse (2 lettres + 1-6 chiffres) ou EU (2 lettres + 3 chiffres + 2 lettres)",
          },
        ),
      insuranceId: z.string().optional(),
      chassisNumber: z.string().optional(),
      registrationNumber: z
        .string()
        .refine(
          (value) => {
            if (!value) return true;
            const regex = /^\d{3}\.\d{3}\.\d{3}$/;
            return regex.test(value);
          },
          {
            message: "Le format du matricule doit être xxx.xxx.xxx",
          },
        )
        .optional(),
      lastExpertise: z
        .string()
        .refine(
          (value) => {
            if (!value) return true;
            const date = new Date(value);
            return date <= new Date();
          },
          {
            message:
              "La date de la dernière expertise ne peut pas être dans le futur.",
          },
        )
        .optional(),
      receptionType: z.string().optional(),
      certificateImage: z.instanceof(File).optional(),
    })
    .refine(
      (data) => {
        if (!data.lastExpertise || !data.year) return true;
        const expertiseDate = new Date(data.lastExpertise);
        return expertiseDate.getFullYear() >= data.year;
      },
      {
        message:
          "La date d'expertise ne peut pas être avant l'année du véhicule.",
        path: ["lastExpertise"],
      },
    );
  type FormSchema = z.infer<typeof zodFormSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormSchema>({
    resolver: zodResolver(zodFormSchema),
  });

  const handleSubmitForm = async (data: FormSchema) => {
    try {
      let uploadedUrl: string | null = null;

      if (data.certificateImage) {
        const formData = new FormData();
        formData.append("image", data.certificateImage as Blob);

        const res = await fetch("/api/upload/image", {
          method: "POST",
          body: formData,
        });
        const uploadedData = await res.json();
        uploadedUrl = uploadedData.filename;
      }

      // Convertir la date d'expertise en objet Date si elle existe
      let expertiseDate: Date | undefined = undefined;
      if (data.lastExpertise) {
        expertiseDate = new Date(data.lastExpertise);
      }

      const newData = {
        clientId: clientId,
        brand: data.brand,
        model: data.model,
        year: data.year,
        licensePlate: data.licensePlate,
        insuranceId: data.insuranceId,
        chassisNumber: data.chassisNumber,
        registrationNumber: data.registrationNumber,
        lastExpertise: expertiseDate,
        receptionType: data.receptionType,
        certificateImage: uploadedUrl,
      };

      const response = await addClientVehicule({ data: newData });
      if (response.success) {
        toast.success(response.message);
        setOpen(false);
        refetch();
      } else {
        toast.error(response.message);
        setOpen(false);
      }
    } catch (error) {
      toast.error("Une erreur est survenue lors de l'ajout du véhicule.");
      console.error(error);
      setOpen(false);
    }
  };

  const handleCheckAndSubmit = async (data: FormSchema) => {
    // Vérifier si la plaque existe déjà
    const plateExists = await checkLicensePlateExists({
      licensePlate: data.licensePlate,
    });

    if (plateExists) {
      // Afficher le dialog de confirmation
      setPendingFormData(data);
      setShowPlateConfirmDialog(true);
    } else {
      // Soumettre directement si la plaque n'existe pas
      await handleSubmitForm(data);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form onSubmit={handleSubmit(handleSubmitForm)}>
        <DialogTrigger asChild>
          <Button
            className={`${typeClient === "individual" ? "individual-btn" : "company-btn"} gap-1`}
          >
            <Plus className="size-4" />
            Nouveau véhicule
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-150">
          <DialogHeader>
            <DialogTitle>Ajouter un véhicule au client</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Marque"
              name="brand"
              register={register}
              type="text"
              error={errors.brand}
              nonempty
              onChange={(e) => {
                const formatted = e.target.value.toUpperCase();
                setValue("brand", formatted);
              }}
            />
            <FormField
              label="Modèle"
              name="model"
              register={register}
              type="text"
              error={errors.model}
              nonempty
              onChange={(e) => {
                const formatted = e.target.value.toUpperCase();
                setValue("model", formatted);
              }}
            />
            <FormField
              label="Année"
              name="year"
              register={register}
              type="number"
              error={errors.year}
              placeholder={format(new Date(), "yyyy") as string}
              nonempty
              step="1"
            />
            <FormField
              label="Plaque d'immatriculation"
              name="licensePlate"
              register={register}
              type="text"
              error={errors.licensePlate}
              placeholder="GE-960123"
              nonempty
              transformValue={formatLicensePlate}
            />
            <SelectSearch
              label="Séléctionne une assurance"
              name="insuranceId"
              content={
                isLoading
                  ? [{ label: "Chargement...", value: "" }]
                  : isError
                    ? [{ label: "Erreur", value: "" }]
                    : insurances
                      ? insurances.map((insurance) => {
                          return { label: insurance.name, value: insurance.id };
                        })
                      : []
              }
              placeholder="Séléctionne une assurance"
              setValue={setValue}
              research="Recherche une assurance..."
              noFound="Aucune assurance trouvée"
              error={errors.insuranceId}
            />
            <FormField
              label="Numéro de chassis"
              name="chassisNumber"
              register={register}
              type="text"
              error={errors.chassisNumber}
            />
            <FormField
              label="Numéro de matricule"
              name="registrationNumber"
              register={register}
              type="text"
              error={errors.registrationNumber}
              placeholder="123.456.789"
              transformValue={formatRegistrationNumber}
            />
            <DatePicker
              label="Dernière expertise"
              name="lastExpertise"
              setValue={setValue}
              error={errors.lastExpertise}
              placeholder="Sélectionnez une date"
              maxDate={new Date()}
            />
            <div className="col-span-2">
              <FormField
                label="Type de réception"
                name="receptionType"
                register={register}
                type="text"
                error={errors.receptionType}
                onChange={(e) => {
                  const formatted = e.target.value.toUpperCase();
                  setValue("receptionType", formatted);
                }}
              />
            </div>
            <div className="col-span-2">
              <UploadImage
                setValue={setValue}
                errorsForm={errors.certificateImage?.message}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Fermer</Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isSubmitting}
              className={`${typeClient === "individual" ? "individual-btn" : "company-btn"}`}
              onClick={handleSubmit(handleCheckAndSubmit)}
            >
              {isSubmitting ? <Spinner /> : "Enregistrer la voiture"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>

      <AlertDialog
        open={showPlateConfirmDialog}
        onOpenChange={setShowPlateConfirmDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Plaque d&apos;immatriculation existante
            </AlertDialogTitle>
            <AlertDialogDescription>
              Un véhicule avec la plaque{" "}
              <strong>{pendingFormData?.licensePlate}</strong> existe déjà.
              Voulez-vous continuer et ajouter un autre véhicule avec cette même
              plaque ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel onClick={() => setShowPlateConfirmDialog(false)}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowPlateConfirmDialog(false);
                if (pendingFormData) {
                  handleSubmitForm(pendingFormData);
                }
              }}
            >
              Continuer
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
