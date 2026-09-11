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
import { DatePicker } from "../DatePicker";
import toast from "react-hot-toast";
import { useState } from "react";
import { updateVehicule } from "@/lib/actions/vehicule";
import UploadImage from "../UploadImage";
import SelectSearch from "../SelectSearch";
import { useQuery } from "@tanstack/react-query";
import {
  formatChassisNumber,
  formatLicensePlate,
  formatRegistrationNumber,
} from "@/lib/utils";
import { format, parse } from "date-fns";

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
    year: string;
    licensePlate: string;
    chassisNumber: string | null;
    registrationNumber: string | null;
    lastExpertise: string | null;
    receptionType: string | null;
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
  const [showManualInsurance, setShowManualInsurance] = useState(false);

  const zodFormSchema = z
    .object({
      brand: z.string().nonempty("La marque est requise."),
      model: z.string().nonempty("Le modèle est requis."),
      year: z
        .string()
        .nonempty("La date du véhicule est requise.")
        .refine(
          (value) => {
            const regex = /^\d{2}\/\d{2}\/\d{4}$/;
            if (!regex.test(value)) return false;
            const [day, month, yearNum] = value.split("/").map(Number);
            const date = new Date(yearNum, month - 1, day);
            return (
              date.getFullYear() === yearNum &&
              date.getMonth() === month - 1 &&
              date.getDate() === day &&
              date <= new Date()
            );
          },
          {
            message:
              "La date doit être au format jj/mm/aaaa et ne peut pas être dans le futur.",
          },
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
      insuranceName: z.string().optional(),
      insuranceEmail: z
        .email("L'e-mail de l'assurance est invalide.")
        .optional(),
      insurancePhone: z.string().optional(),
      chassisNumber: z
        .string()
        .refine(
          (value) => {
            if (!value) return true;
            // Groupes de 3 caractères alphanumériques séparés par un espace
            const regex = /^[A-Z0-9]{3}(?: [A-Z0-9]{3})*$/;
            return regex.test(value);
          },
          {
            message:
              "Le format doit être XXX XXX XXX (groupes de 3 caractères séparés par un espace).",
          },
        )
        .optional(),
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
            const date = new Date(value);
            return date <= new Date();
          },
          {
            message:
              "La date de la dernière expertise ne peut pas être dans le futur.",
          },
        )
        .optional(),
      receptionType: z
        .string()
        .optional()
        .refine(
          (value) => {
            if (!value) return true;
            return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9\s-]+$/.test(value);
          },
          {
            message:
              "Le type de réception doit contenir au moins une lettre et un chiffre.",
          },
        ),
      certificateImage: z.instanceof(File).optional(),
    })
    .refine(
      (data) => {
        const hasManualInsurance =
          !!data.insuranceName ||
          !!data.insuranceEmail ||
          !!data.insurancePhone;

        if (!hasManualInsurance) return true;

        return (
          !!data.insuranceName && !!data.insuranceEmail && !!data.insurancePhone
        );
      },
      {
        message:
          "Merci de renseigner le nom, l'e-mail et le téléphone de l'assurance.",
        path: ["insuranceName"],
      },
    );
  type FormSchema = z.infer<typeof zodFormSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormSchema>({
    resolver: zodResolver(zodFormSchema),
  });

  const handleSubmitForm = async (data: FormSchema) => {
    try {
      let uploadedUrl = null;

      if (data.certificateImage) {
        await fetch(`/api/images/${vehicule.certificateImage}`, {
          method: "DELETE",
        });

        const formData = new FormData();
        formData.append("image", data.certificateImage as Blob);
        const res = await fetch("/api/upload/image", {
          method: "POST",
          body: formData,
        });
        const uploadedData = await res.json();
        uploadedUrl = uploadedData.filename;
      }

      let expertiseDate: Date | undefined = undefined;
      if (data.lastExpertise) {
        expertiseDate = new Date(data.lastExpertise);
      }

      const response = await updateVehicule({
        vehiculeId: vehicule.id,
        data: {
          brand: data.brand,
          model: data.model,
          year: data.year,
          licensePlate: data.licensePlate,
          certificateImage: uploadedUrl ?? null,
          insuranceId: data.insuranceId,
          insuranceName: data.insuranceName,
          insuranceEmail: data.insuranceEmail,
          insurancePhone: data.insurancePhone,
          chassisNumber: data.chassisNumber,
          lastExpertise: expertiseDate,
          registrationNumber: data.registrationNumber,
          receptionType: data.receptionType,
        },
      });

      if (response.success) {
        toast.success(response.message);
        refetch();
        setIsOpen(false);
      } else {
        if (response.field) {
          setError(response.field, {
            type: "manual",
            message: response.message,
          });
        }
        toast.error(response.message);
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
            <DatePicker
              label="Date du véhicule"
              name="year"
              setValue={(_name, date: Date) =>
                setValue("year", format(date, "dd/MM/yyyy"))
              }
              error={errors.year}
              placeholder="Sélectionnez une date"
              maxDate={new Date()}
              defaultValue={
                vehicule.year
                  ? (() => {
                      const parsed = parse(
                        vehicule.year,
                        "dd/MM/yyyy",
                        new Date(),
                      );
                      parsed.setHours(12, 0, 0, 0);
                      return parsed.toISOString();
                    })()
                  : undefined
              }
            />
            <FormField
              label="Plaque d'immatriculation"
              name="licensePlate"
              type="text"
              defaultValue={vehicule.licensePlate}
              error={errors.licensePlate}
              register={register}
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
              defaultValue={vehicule.insurance?.id || undefined}
            />
            <div className="col-span-2 flex justify-start">
              <Button
                type="button"
                variant="ghost"
                className="px-0 text-sm"
                onClick={() => setShowManualInsurance((current) => !current)}
              >
                {showManualInsurance
                  ? "Masquer l'assurance manuelle"
                  : "Ajouter une autre assurance"}
              </Button>
            </div>
            {showManualInsurance && (
              <div className="col-span-2 grid gap-4 md:grid-cols-3">
                <FormField
                  label="Nom de l'assurance"
                  name="insuranceName"
                  register={register}
                  type="text"
                  error={errors.insuranceName}
                  placeholder="Assura"
                />
                <FormField
                  label="E-mail de l'assurance"
                  name="insuranceEmail"
                  register={register}
                  type="email"
                  error={errors.insuranceEmail}
                  placeholder="contact@assura.ch"
                />
                <FormField
                  label="Téléphone de l'assurance"
                  name="insurancePhone"
                  register={register}
                  type="text"
                  error={errors.insurancePhone}
                  placeholder="+41 21 123 45 67"
                />
              </div>
            )}
            <FormField
              label="Numéro de chassis"
              name="chassisNumber"
              register={register}
              type="text"
              error={errors.chassisNumber}
              placeholder="WVW ZZZ 1KZ AM"
              transformValue={formatChassisNumber} // NOUVEAU
            />
            <FormField
              label="Numéro de matricule"
              name="registrationNumber"
              register={register}
              type="text"
              error={errors.registrationNumber}
              defaultValue={vehicule.registrationNumber || undefined}
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
              defaultValue={vehicule.lastExpertise || undefined}
            />
            <div className="col-span-2">
              <FormField
                label="Type de réception"
                name="receptionType"
                register={register}
                type="text"
                error={errors.receptionType}
                defaultValue={vehicule.receptionType || undefined}
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
