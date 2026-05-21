"use client";

import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { Spinner } from "../../ui/spinner";
import { FormField } from "../FormField";
import { PhoneInputField } from "../PhoneInputField";
import { updateClientCompany } from "@/lib/actions/client";
import toast from "react-hot-toast";

export function UpdateClientCompany({
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
    phonePrefix: string;
    phoneNumber: string;
    phone2Prefix: string | null;
    phone2Number: string | null;
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
    phonePrefix: z
      .string()
      .nonempty("Le préfixe est requis.")
      .regex(/^\+\d{1,3}$/, "Le préfixe doit être au format +XX ou +XXX"),
    phoneNumber: z
      .string()
      .nonempty("Le numéro de téléphone est requis.")
      .regex(
        /^[\d\s\-()]+$/,
        "Le numéro ne doit contenir que des chiffres et espaces",
      )
      .refine((val) => {
        const digitCount = val.replace(/\D/g, "").length;
        return digitCount >= 6 && digitCount <= 10;
      }, "Le numéro doit contenir entre 6 et 10 chiffres"),
    phone2Prefix: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^\+\d{1,3}$/.test(val),
        "Le préfixe doit être au format +XX ou +XXX",
      ),
    phone2Number: z
      .string()
      .optional()
      .refine((val) => {
        if (!val) return true;
        const digitCount = val.replace(/\D/g, "").length;
        return digitCount >= 6 && digitCount <= 10;
      }, "Le numéro doit contenir entre 6 et 10 chiffres et des caractères valides"),
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
    defaultValues: {
      companyName: client.companyName || "",
      contactFirstName: client.contactFirstName || client.firstName || "",
      contactName: client.contactName || client.name || "",
      email: client.email,
      phonePrefix: client.phonePrefix,
      phoneNumber: client.phoneNumber,
      phone2Prefix: client.phone2Prefix || "",
      phone2Number: client.phone2Number || "",
      address: client.address || "",
      postalCode: client.postalCode ? parseInt(client.postalCode) : undefined,
      city: client.city || "",
    },
  });

  const handleSubmitForm = async (data: FormSchema) => {
    const response = await updateClientCompany({
      clientId: client.id,
      data: {
        companyName: data.companyName,
        contactFirstName: data.contactFirstName,
        contactName: data.contactName,
        email: data.email,
        phonePrefix: data.phonePrefix,
        phoneNumber: data.phoneNumber,
        phone2Prefix: data.phone2Prefix,
        phone2Number: data.phone2Number,
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
            error={errors.companyName}
            register={register}
            nonempty
          />
        </div>
        <FormField
          label="Prénom du contact"
          name="contactFirstName"
          type="text"
          error={errors.contactFirstName}
          register={register}
          nonempty
        />
        <FormField
          label="Nom du contact"
          name="contactName"
          type="text"
          error={errors.contactName}
          register={register}
          nonempty
        />
        <div className="col-span-2">
          <FormField
            label="Email"
            name="email"
            type="email"
            error={errors.email}
            register={register}
            nonempty
          />
        </div>
        <div className="col-span-2">
          <PhoneInputField
            prefixName="phonePrefix"
            numberName="phoneNumber"
            prefixLabel="Préfixe"
            numberLabel="Numéro de téléphone"
            register={register}
            prefixError={errors.phonePrefix}
            numberError={errors.phoneNumber}
          />
        </div>
        <div className="col-span-2">
          <PhoneInputField
            prefixName="phone2Prefix"
            numberName="phone2Number"
            prefixLabel="Préfixe (optionnel)"
            numberLabel="Numéro de téléphone 2"
            register={register}
            prefixError={errors.phone2Prefix}
            numberError={errors.phone2Number}
            optional={true}
          />
        </div>
        <div className="col-span-2">
          <FormField
            label="Adresse"
            name="address"
            type="text"
            error={errors.address}
            register={register}
          />
        </div>
        <FormField
          label="Code Postal"
          name="postalCode"
          type="number"
          error={errors.postalCode}
          register={register}
          step="1"
        />
        <FormField
          label="Ville"
          name="city"
          type="text"
          error={errors.city}
          register={register}
        />
        <div className="col-span-2 flex w-full justify-end gap-4">
          <Button
            variant="outline"
            type="button"
            onClick={() => setIsOpen(false)}
          >
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
