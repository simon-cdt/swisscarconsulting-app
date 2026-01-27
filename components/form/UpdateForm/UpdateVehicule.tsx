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
import { useQuery } from "@tanstack/react-query";
import { formatLicensePlate, formatRegistrationNumber } from "@/lib/utils";
import { format } from "date-fns";

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
  label,
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
  label?: string;
}) {
  const { data: insurances, isLoading, isError } = useInsurances();

  const [isOpen, setIsOpen] = useState(false);

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
        .nonempty("La plaque d'immatriculation est requise.")
        .refine(
          (value) => {
            // Vérifier qu'il y a au moins 2 lettres au début
            const regex = /^[A-Z]{2,}/;
            return regex.test(value.replace(/[\s-]/g, ""));
          },
          {
            message:
              "La plaque doit commencer par au moins 2 lettres (ex: GE, VD).",
          },
        ),
      insuranceId: z.string().optional(),
      chassisNumber: z.string().optional(),
      registrationNumber: z
        .string()
        .refine(
          (value) => {
            if (!value) return true;
            // Vérifier le format : exactement 3 groupes de 3 chiffres séparés par des points
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
            const [day, month, yearStr] = value.split("/");
            if (!day || !month || !yearStr) return false;

            let year = parseInt(yearStr);
            // Convertir l'année à 2 chiffres en 4 chiffres
            if (year < 100) {
              year = year >= 50 ? 1900 + year : 2000 + year;
            }

            const date = new Date(year, parseInt(month) - 1, parseInt(day));
            return date <= new Date();
          },
          {
            message:
              "La date de la dernière expertise ne peut pas être dans le futur.",
          },
        )
        .optional(),
      certificateImage: z.instanceof(File).optional(),
    })
    .refine(
      (data) => {
        if (!data.lastExpertise || !data.year) return true;
        // eslint-disable-next-line
        const [day, month, yearStr] = data.lastExpertise.split("/");
        let year = parseInt(yearStr);

        // Convertir l'année à 2 chiffres en 4 chiffres
        if (year < 100) {
          year = year >= 50 ? 1900 + year : 2000 + year;
        }

        return year >= data.year;
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

      // Convertir la date d'expertise en objet Date si elle existe
      let expertiseDate: Date | undefined = undefined;
      if (data.lastExpertise) {
        const [day, month, yearStr] = data.lastExpertise.split("/");
        let year = parseInt(yearStr);

        // Si l'année a 2 chiffres, convertir en 4 chiffres
        if (year < 100) {
          // Si l'année est >= 50, on considère que c'est 19xx, sinon 20xx
          year = year >= 50 ? 1900 + year : 2000 + year;
        }

        expertiseDate = new Date(year, parseInt(month) - 1, parseInt(day));
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
          lastExpertise: expertiseDate,
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
            <span>{label || "Modifier"}</span>
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
              placeholder="123.456.789"
              onChange={(e) => {
                const formatted = formatRegistrationNumber(e.target.value);
                setValue("registrationNumber", formatted);
              }}
            />
            <FormField
              label="Dernière expertise"
              name="lastExpertise"
              register={register}
              type="text"
              error={errors.lastExpertise}
              placeholder={format(new Date(), "dd/MM/yyyy") as string}
              defaultValue={
                vehicule.lastExpertise
                  ? format(vehicule.lastExpertise, "dd/MM/yyyy")
                  : ""
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
