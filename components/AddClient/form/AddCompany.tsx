"use client";

import { UseFormReturn } from "react-hook-form";
import z from "zod";
import { FormField } from "@/components/form/FormField";
import { Button } from "../../ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Mail, Phone } from "lucide-react";
import { addClientCompany } from "@/lib/actions/client";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { SharedFormData } from "../CustomTabs";
import { useState } from "react";

const companySchema = z.object({
  companyName: z.string().nonempty("Le nom de l'entreprise est requis."),
  email: z
    .string()
    .email("Ce n'est pas un e-mail.")
    .nonempty("L'e-mail est requis."),
  phone: z
    .string()
    .nonempty("Le numéro de téléphone est requis.")
    .regex(
      /^[\d\s\+\-\(\)]+$/,
      "Le numéro de téléphone contient des caractères invalides",
    )
    .min(8, "Le numéro de téléphone doit contenir au moins 8 chiffres"),
  contactFirstName: z.string().nonempty("Le prénom du contact est requis."),
  contactName: z.string().nonempty("Le nom du contact est requis."),
  address: z.string().optional(),
  postalCode: z
    .number()
    .int("Le code postal doit être un nombre entier")
    .min(1000, "Le format est incorrecte")
    .max(99999, "Le format est incorrecte")
    .optional(),
  city: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[a-zA-ZÀ-ÿ\s\-']+$/.test(val),
      "La ville ne doit contenir que des lettres",
    ),
});

type CompanyFormData = z.infer<typeof companySchema>;

interface AddCompanyProps {
  sharedForm: UseFormReturn<SharedFormData>;
}

export default function AddCompany({ sharedForm }: AddCompanyProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = sharedForm;

  const handleSubmitForm = async (data: SharedFormData) => {
    // Valider avec le schéma spécifique
    const validationResult = companySchema.safeParse(data);

    if (!validationResult.success) {
      validationResult.error.issues.forEach((err) => {
        toast.error(err.message);
      });
      return;
    }

    setIsSubmitting(true);
    const response = await addClientCompany({
      data: validationResult.data as CompanyFormData,
    });
    setIsSubmitting(false);

    if (response.success) {
      toast.success(response.message);
      router.push(`/client-handle/${response.clientId}`);
    } else {
      toast.error(response.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleSubmitForm)} className="grid gap-4">
      <div className="grid gap-4">
        <FormField
          label="Nom de l'entreprise"
          name="companyName"
          type="text"
          register={register}
          error={errors.companyName}
          nonempty
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="E-mail"
            name="email"
            type="email"
            register={register}
            error={errors.email}
            nonempty
            icon={<Mail className="size-4" />}
            placeholder="exemple@mail.com"
          />
          <FormField
            label="Numéro de téléphone"
            name="phone"
            type="text"
            register={register}
            error={errors.phone}
            placeholder="+41 79 123 45 67"
            nonempty
            icon={<Phone className="size-4" />}
          />
          <FormField
            label="Prénom du contact"
            name="contactFirstName"
            type="text"
            register={register}
            error={errors.contactFirstName}
            nonempty
          />
          <FormField
            label="Nom du contact"
            name="contactName"
            type="text"
            register={register}
            error={errors.contactName}
            nonempty
          />
        </div>
      </div>
      <div className="grid gap-4">
        <FormField
          label="Adresse"
          name="address"
          type="text"
          register={register}
          error={errors.address}
          placeholder="Rue des Marronniers 12"
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Ville"
            name="city"
            type="text"
            register={register}
            error={errors.city}
            placeholder="Genève"
          />
          <FormField
            label="Code postal"
            name="postalCode"
            type="number"
            register={register}
            error={errors.postalCode}
            placeholder="1204"
            step="1"
          />
        </div>
      </div>
      <Button
        type="submit"
        className="w-full bg-amber-500 hover:bg-amber-600"
        disabled={isSubmitting}
      >
        {isSubmitting ? <Spinner /> : "Créer un client entreprise"}
      </Button>
    </form>
  );
}
