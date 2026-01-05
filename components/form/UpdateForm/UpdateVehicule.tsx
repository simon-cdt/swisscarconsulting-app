"use client";

import { Button } from "@/components/ui/button";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit } from "lucide-react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Spinner } from "../../ui/spinner";
import { FormField } from "../FormField";
import toast from "react-hot-toast";
import { useState } from "react";
import { updateVehicule } from "@/lib/actions/vehicule";
import UploadImage from "../UploadImage";
import { FILE_SERVER_URL } from "@/lib/config";
import SelectSearch from "../SelectSearch";
import DateInputField from "../DateInputField";
import { useQuery } from "@tanstack/react-query";

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

export function UpdateVehicule({
  vehicule,
  refetch,
}: {
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
    insurance: {
      id: string;
      name: string;
    } | null;
  };
  refetch: () => void;
}) {
  const { data: insurances, isLoading, isError } = useInsurances();

  const [isOpen, setIsOpen] = useState(false);

  const formatLicensePlate = (value: string) => {
    // Supprimer tous les caractères non alphanumériques
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "");

    if (cleaned.length === 0) return "";

    let formatted = "";

    // Ajouter les 2 premières lettres
    if (cleaned.length <= 2) {
      formatted = cleaned;
    }
    // Ajouter un tiret après 2 lettres
    else if (cleaned.length <= 5) {
      formatted = cleaned.slice(0, 2) + "-" + cleaned.slice(2);
    }
    // Si après 3 chiffres il y a des lettres (plaque française)
    else if (cleaned.length > 5 && /[A-Z]/.test(cleaned[5])) {
      formatted =
        cleaned.slice(0, 2) +
        "-" +
        cleaned.slice(2, 5) +
        "-" +
        cleaned.slice(5);
    }
    // Sinon plaque suisse
    else {
      formatted = cleaned.slice(0, 2) + "-" + cleaned.slice(2);
    }

    return formatted;
  };

  const zodFormSchema = z
    .object({
      brand: z.string().nonempty("La marque est requise."),
      model: z.string().nonempty("Le modèle est requis."),
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
        .nonempty("La plaque d'immatriculation est requise."),
      insuranceId: z.string().optional(),
      chassisNumber: z.string().optional(),
      registrationNumber: z.string().optional(),
      lastExpertise: z
        .date()
        .max(
          new Date(),
          "La date de la dernière expertise ne peut pas être dans le futur.",
        )
        .optional(),
      certificateImage: z.instanceof(File).optional(),
    })
    .refine(
      (data) => {
        if (!data.lastExpertise || !data.year) return true;
        const expertiseYear = data.lastExpertise.getFullYear();
        return expertiseYear >= data.year;
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
      let uploadedUrl: string[] = [];

      await fetch(`${FILE_SERVER_URL}/files/${vehicule.certificateImage}`, {
        method: "DELETE",
      });

      if (data.certificateImage) {
        const formData = new FormData();
        formData.append("files", data.certificateImage);

        const res = await fetch(`${FILE_SERVER_URL}/upload`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Erreur lors de l'envoi de l'image");

        const json = await res.json();
        uploadedUrl = json.files.map((url: string) => `${url}`);
      }

      const response = await updateVehicule({
        vehiculeId: vehicule.id,
        data: {
          brand: data.brand,
          model: data.model,
          year: data.year,
          licensePlate: data.licensePlate,
          certificateImage: uploadedUrl.length === 0 ? null : uploadedUrl[0],
          insuranceId: data.insuranceId,
          chassisNumber: data.chassisNumber,
          lastExpertise: data.lastExpertise,
          registrationNumber: data.registrationNumber,
        },
      });
      if (response.success) {
        toast.success(response.message);
        refetch();
        setIsOpen(false);
      } else {
        toast.error(response.message);
        refetch();
        setIsOpen(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Une erreur est survenue");
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <form onSubmit={handleSubmit(handleSubmitForm)}>
        <DialogTrigger asChild>
          <Button className={`flex items-center gap-3`}>
            <span>Modifier</span>
            <Edit className="size-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-150">
          <DialogHeader>
            <DialogTitle>Modifier la voiture</DialogTitle>
            <DialogDescription>
              Apportez des modifications à la voiture ici. Cliquez sur
              enregistrer lorsque vous avez terminé.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Marque"
              name="brand"
              type="text"
              defaultValue={vehicule.brand}
              error={errors.brand}
              register={register}
            />
            <FormField
              label="Modèle"
              name="model"
              type="text"
              defaultValue={vehicule.model}
              error={errors.model}
              register={register}
            />
            <FormField
              label="Année"
              name="year"
              type="number"
              defaultValue={vehicule.year}
              error={errors.year}
              register={register}
              step="1"
            />
            <FormField
              label="Plaque d'immatriculation"
              name="licensePlate"
              type="text"
              defaultValue={vehicule.licensePlate}
              error={errors.licensePlate}
              register={register}
              onChange={(e) => {
                const formatted = formatLicensePlate(e.target.value);
                setValue("licensePlate", formatted);
              }}
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
              defaultValue={vehicule.insurance?.id || undefined}
            />
            <FormField
              label="Numéro de chassis"
              name="chassisNumber"
              register={register}
              type="text"
              error={errors.chassisNumber}
              defaultValue={vehicule.chassisNumber || undefined}
            />
            <FormField
              label="Numéro de matricule"
              name="registrationNumber"
              register={register}
              type="text"
              error={errors.registrationNumber}
              defaultValue={vehicule.registrationNumber || undefined}
            />
            <DateInputField
              name="lastExpertise"
              label="Dernière expertise"
              setValue={setValue}
              error={errors.lastExpertise}
              defaultValue={
                vehicule.lastExpertise
                  ? new Date(vehicule.lastExpertise)
                  : undefined
              }
            />
            <div className="col-span-2">
              <UploadImage
                setValue={setValue}
                errorsForm={errors.certificateImage?.message}
                update
                defaultImg={vehicule.certificateImage || undefined}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button
              type="submit"
              onClick={handleSubmit(handleSubmitForm)}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Spinner /> : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
