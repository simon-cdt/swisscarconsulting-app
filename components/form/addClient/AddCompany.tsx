"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { FormField } from "@/components/form/FormField";
import { Button } from "../../ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Mail, Phone } from "lucide-react";
import { addClientCompany } from "@/lib/actions/client";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { SharedFormData } from "./CustomTabs";
import { useEffect } from "react";
import { formatAddress, toCamelCase, capitalize } from "@/lib/utils";

type AddCompanyProps = {
  sharedData: SharedFormData;
  setSharedData: (data: SharedFormData) => void;
};

export default function AddCompany({
  sharedData,
  setSharedData,
}: AddCompanyProps) {
  const router = useRouter();

  const zodFormSchema = z.object({
    companyName: z.string().nonempty("Le nom de l'entreprise est requis."),
    email: z.email("Ce n'est pas e-mail.").nonempty("L'e-mail est requis."),
    phone: z
      .string()
      .nonempty("Le numéro de téléphone est requis.")
      .regex(
        /^[\d\s\+\-\(\)]+$/,
        "Le numéro de téléphone contient des caractères invalides",
      )
      .min(9, "Le numéro de téléphone doit contenir au moins 9 chiffres"),
    contactFirstName: z.string().nonempty("Le prénom du contact est requis."),
    contactName: z.string().nonempty("Le nom du contact est requis."),
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
    watch,
    setValue,
  } = useForm<FormSchema>({
    resolver: zodResolver(zodFormSchema),
    defaultValues: {
      companyName: "",
      contactFirstName: sharedData.firstName,
      contactName: sharedData.name,
      email: sharedData.email,
      phone: sharedData.phone,
      address: sharedData.address,
      postalCode: sharedData.postalCode,
      city: sharedData.city,
    },
  });

  //eslint-disable-next-line
  const watchedContactFirstName = watch("contactFirstName");
  const watchedContactName = watch("contactName");
  const watchedEmail = watch("email");
  const watchedPhone = watch("phone");
  const watchedAddress = watch("address");
  const watchedPostalCode = watch("postalCode");
  const watchedCity = watch("city");

  useEffect(() => {
    setSharedData({
      firstName: watchedContactFirstName || "",
      name: watchedContactName || "",
      email: watchedEmail || "",
      phone: watchedPhone || "",
      address: watchedAddress || "",
      postalCode: watchedPostalCode,
      city: watchedCity || "",
    });
  }, [
    watchedContactFirstName,
    watchedContactName,
    watchedEmail,
    watchedPhone,
    watchedAddress,
    watchedPostalCode,
    watchedCity,
  ]);

  // Mettre à jour les valeurs du formulaire quand sharedData change (depuis l'autre formulaire)
  useEffect(() => {
    setValue("contactFirstName", sharedData.firstName, {
      shouldValidate: false,
      shouldDirty: false,
    });
    setValue("contactName", sharedData.name, {
      shouldValidate: false,
      shouldDirty: false,
    });
    setValue("email", sharedData.email, {
      shouldValidate: false,
      shouldDirty: false,
    });
    setValue("phone", sharedData.phone, {
      shouldValidate: false,
      shouldDirty: false,
    });
    setValue("address", sharedData.address, {
      shouldValidate: false,
      shouldDirty: false,
    });
    setValue("postalCode", sharedData.postalCode, {
      shouldValidate: false,
      shouldDirty: false,
    });
    setValue("city", sharedData.city, {
      shouldValidate: false,
      shouldDirty: false,
    });
  }, [sharedData, setValue]);

  const handleSubmitForm = async (data: FormSchema) => {
    const response = await addClientCompany({ data });
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
          onChange={(e) => {
            const formatted = capitalize(e.target.value);
            setValue("companyName", formatted);
          }}
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
            onChange={(e) => {
              const formatted = toCamelCase(e.target.value);
              setValue("contactFirstName", formatted);
            }}
          />
          <FormField
            label="Nom du contact"
            name="contactName"
            type="text"
            register={register}
            error={errors.contactName}
            nonempty
            onChange={(e) => {
              const formatted = toCamelCase(e.target.value);
              setValue("contactName", formatted);
            }}
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
          onChange={(e) => {
            const formatted = formatAddress(e.target.value);
            setValue("address", formatted);
          }}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Ville"
            name="city"
            type="text"
            register={register}
            error={errors.city}
            placeholder="Genève"
            onChange={(e) => {
              const formatted = toCamelCase(e.target.value);
              setValue("city", formatted);
            }}
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
