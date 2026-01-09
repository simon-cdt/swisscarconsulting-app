"use client";

import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { Spinner } from "../../ui/spinner";
import { FormField } from "../FormField";
import { updateClientIndividual } from "@/lib/actions/client";
import toast from "react-hot-toast";

export function UpdateClientIndividual({
  client,
  refetch,
  setIsOpen,
}: {
  client: {
    id: number;
    name: string | null;
    firstName: string | null;
    companyName: string | null;
    contactFirstName: string | null;
    contactName: string | null;
    email: string;
    phone: string;
    address: string | null;
    postalCode: string | null;
    city: string | null;
  };
  refetch: () => void;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const zodFormSchema = z.object({
    name: z.string().nonempty("Le nom est requis."),
    firstName: z.string().nonempty("Le prénom est requis."),
    email: z.email("L'email est invalide."),
    phone: z
      .string()
      .nonempty("Le numéro de téléphone est requis.")
      .regex(
        /^[\d\s\+\-\(\)]+$/,
        "Le numéro de téléphone contient des caractères invalides",
      )
      .min(9, "Le numéro de téléphone doit contenir au moins 9 chiffres"),
    address: z
      .string()
      .optional()
      .refine(
        (val) => !val || (/\d/.test(val) && /[a-zA-ZÀ-ÿ]/.test(val)),
        "L'adresse doit contenir au moins un chiffre et une lettre",
      ),
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
  type FormSchema = z.infer<typeof zodFormSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormSchema>({
    resolver: zodResolver(zodFormSchema),
  });

  const handleSubmitForm = async (data: FormSchema) => {
    const response = await updateClientIndividual({
      clientId: client.id,
      data: {
        name: data.name,
        firstName: data.firstName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        postalCode: data.postalCode,
        city: data.city,
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
  };
  return (
    <form onSubmit={handleSubmit(handleSubmitForm)}>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Nom"
          name="name"
          type="text"
          defaultValue={client.name || client.contactName || ""}
          error={errors.name}
          register={register}
          nonempty
        />
        <FormField
          label="Prénom"
          name="firstName"
          type="text"
          defaultValue={client.firstName || client.contactFirstName || ""}
          error={errors.firstName}
          register={register}
          nonempty
        />
        <FormField
          label="Email"
          name="email"
          type="email"
          defaultValue={client.email}
          error={errors.email}
          register={register}
          nonempty
        />
        <FormField
          label="Téléphone"
          name="phone"
          type="text"
          defaultValue={client.phone}
          error={errors.phone}
          register={register}
          nonempty
        />
        <div className="col-span-2">
          <FormField
            label="Adresse"
            name="address"
            type="text"
            defaultValue={client.address || ""}
            error={errors.address}
            register={register}
          />
        </div>
        <FormField
          label="Code Postal"
          name="postalCode"
          type="number"
          defaultValue={client.postalCode || undefined}
          error={errors.postalCode}
          register={register}
          step="1"
        />
        <FormField
          label="Ville"
          name="city"
          type="text"
          defaultValue={client.city || ""}
          error={errors.city}
          register={register}
        />
        <div className="col-span-2 flex w-full justify-end gap-4">
          <Button variant="outline" type="button">
            Annuler
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit(handleSubmitForm)}
            disabled={isSubmitting}
            className="individual-btn"
          >
            {isSubmitting ? <Spinner /> : "Enregistrer"}
          </Button>
        </div>
      </div>
    </form>
  );
}
