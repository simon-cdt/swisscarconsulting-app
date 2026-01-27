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
import { zodResolver } from "@hookform/resolvers/zod";
import { TypeClient } from "@/generated/prisma/enums";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import z from "zod";
import { FormField } from "./FormField";
import { format } from "date-fns";
import { Spinner } from "../ui/spinner";
import { addClientVehicule } from "@/lib/actions/vehicule";
import UploadImage from "./UploadImage";
import { useState } from "react";
import { FILE_SERVER_URL } from "@/lib/config";
import SelectSearch from "@/components/form/SelectSearch";
import { useQuery } from "@tanstack/react-query";
import {
  formatLicensePlate,
  formatExpertiseDate,
  formatRegistrationNumber,
  capitalize,
} from "@/lib/utils";

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
        certificateImage: uploadedUrl[0],
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
                const formatted = capitalize(e.target.value);
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
                const formatted = capitalize(e.target.value);
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
              onChange={(e) => {
                const formatted = formatExpertiseDate(e.target.value);
                setValue("lastExpertise", formatted);
              }}
            />
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
              onClick={handleSubmit(handleSubmitForm)}
            >
              {isSubmitting ? <Spinner /> : "Enregistrer la voiture"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
