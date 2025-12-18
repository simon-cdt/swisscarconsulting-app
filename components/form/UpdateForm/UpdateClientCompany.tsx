"use client";

import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { Spinner } from "../../ui/spinner";
import { FormField } from "../FormField";
import { updateClientCompany } from "@/lib/actions/client";
import toast from "react-hot-toast";

export function UpdateClientCompany({
  client,
  refetch,
  setIsOpen,
}: {
  client: {
    id: string;
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
    companyName: z.string().nonempty("Le nom de l'entreprise est requis."),
    contactFirstName: z.string().nonempty("Le prénom du contact est requis."),
    contactName: z.string().nonempty("Le nom du contact est requis."),
    email: z.email("L'email est invalide."),
    phone: z.string().nonempty("Le téléphone est requis."),
    address: z.string().optional(),
    postalCode: z.string().optional(),
    city: z.string().optional(),
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
    const response = await updateClientCompany({
      clientId: client.id,
      data: {
        companyName: data.companyName,
        contactFirstName: data.contactFirstName,
        contactName: data.contactName,
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
        <div className="col-span-2">
          <FormField
            label="Nom de l'entreprise"
            name="companyName"
            type="text"
            defaultValue={client.companyName || ""}
            error={errors.companyName}
            register={register}
            nonempty
          />
        </div>
        <FormField
          label="Prénom du contact"
          name="contactFirstName"
          type="text"
          defaultValue={client.contactFirstName || client.firstName || ""}
          error={errors.contactFirstName}
          register={register}
          nonempty
        />
        <FormField
          label="Nom du contact"
          name="contactName"
          type="text"
          defaultValue={client.contactName || client.name || ""}
          error={errors.contactName}
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
          type="text"
          defaultValue={client.postalCode || ""}
          error={errors.postalCode}
          register={register}
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
            className="company-btn"
          >
            {isSubmitting ? <Spinner /> : "Enregistrer"}
          </Button>
        </div>
      </div>
    </form>
  );
}
