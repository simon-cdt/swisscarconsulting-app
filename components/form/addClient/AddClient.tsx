"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { FormField } from "@/components/form/FormField";
import { PhoneInputField } from "@/components/form/PhoneInputField";
import EmailInputField from "@/components/form/EmailInputField";
import { Button } from "../../ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  addClientIndividual,
  checkClientIndividualExists,
} from "@/lib/actions/client";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { SharedFormData } from "./CustomTabs";
import { useEffect, forwardRef, useImperativeHandle } from "react";
import { formatAddress, toCamelCase } from "@/lib/utils";

type AddClientProps = {
  sharedData: SharedFormData;
  setSharedData: (data: SharedFormData) => void;
};

export default forwardRef(function AddClient(
  { sharedData }: AddClientProps,
  ref,
) {
  const router = useRouter();

  const zodFormSchema = z.object({
    firstName: z.string().nonempty("Le prénom est requis."),
    name: z.string().nonempty("Le nom est requis."),
    email: z.email("Ce n'est pas un e-mail.").nonempty("L'e-mail est requis."),
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
    country: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^[a-zA-ZÀ-ÿ\s\-']+$/.test(val),
        "Le pays ne doit contenir que des lettres",
      ),
  });
  type FormSchema = z.infer<typeof zodFormSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    getValues,
  } = useForm<FormSchema>({
    resolver: zodResolver(zodFormSchema),
    defaultValues: {
      firstName: sharedData.firstName,
      name: sharedData.name,
      email: sharedData.email,
      phonePrefix: sharedData.phonePrefix,
      phoneNumber: sharedData.phoneNumber,
      phone2Prefix: sharedData.phone2Prefix,
      phone2Number: sharedData.phone2Number,
      address: sharedData.address,
      postalCode: sharedData.postalCode,
      city: sharedData.city,
      country: sharedData.country,
    },
  });

  useImperativeHandle(ref, () => ({
    getSyncData: () => {
      const formValues = getValues();
      return {
        firstName: formValues.firstName || "",
        name: formValues.name || "",
        email: formValues.email || "",
        phonePrefix: formValues.phonePrefix || "",
        phoneNumber: formValues.phoneNumber || "",
        phone2Prefix: formValues.phone2Prefix || "",
        phone2Number: formValues.phone2Number || "",
        address: formValues.address || "",
        postalCode: formValues.postalCode,
        city: formValues.city || "",
        country: formValues.country || "",
      };
    },
  }));

  // Charger les données quand sharedData change
  useEffect(() => {
    // Rien à faire ici maintenant, les données sont chargées au montage et on synchronise au changement de tab
  }, []);

  const handleSubmitForm = async (data: FormSchema) => {
    // Vérifier si le client existe déjà
    const checkResult = await checkClientIndividualExists({
      firstName: data.firstName,
      name: data.name,
      phonePrefix: data.phonePrefix,
      phoneNumber: data.phoneNumber,
      email: data.email,
    });

    if (checkResult.exists) {
      toast.error(checkResult.message);
      return;
    }

    const response = await addClientIndividual({ data });
    if (response.success) {
      toast.success(response.message);
      router.push(`/client-handle/${response.clientId}`);
    } else {
      toast.error(response.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleSubmitForm)} className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Prénom"
          name="firstName"
          type="text"
          register={register}
          error={errors.firstName}
          nonempty
          onChange={(e) => {
            const formatted = toCamelCase(e.target.value);
            setValue("firstName", formatted);
          }}
        />
        <FormField
          label="Nom"
          name="name"
          type="text"
          register={register}
          error={errors.name}
          nonempty
          onChange={(e) => {
            const formatted = toCamelCase(e.target.value);
            setValue("name", formatted);
          }}
        />
        <EmailInputField
          label="E-mail"
          name="email"
          register={register}
          setValue={setValue}
          error={errors.email}
          placeholder="exemple@mail.com"
        />
      </div>
      <div className="grid gap-4">
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
      <div className="grid gap-4">
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
        <div className="grid gap-4 md:grid-cols-3">
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
            step="1"
            placeholder="1204"
          />
          <FormField
            label="Pays"
            name="country"
            type="text"
            register={register}
            error={errors.country}
            placeholder="Suisse"
            onChange={(e) => {
              const formatted = toCamelCase(e.target.value);
              setValue("country", formatted);
            }}
          />
        </div>
      </div>
      <Button
        type="submit"
        className="w-full bg-sky-500 hover:bg-sky-600"
        disabled={isSubmitting}
      >
        {isSubmitting ? <Spinner /> : "Créer un client particulier"}
      </Button>
    </form>
  );
});

// type AddClientProps = {
//   sharedData: SharedFormData;
//   setSharedData: (data: SharedFormData) => void;
// };

// export default function AddClient({
//   sharedData,
//   setSharedData,
// }: AddClientProps) {
//   const router = useRouter();

//   const zodFormSchema = z.object({
//     firstName: z.string().nonempty("Le prénom est requis."),
//     name: z.string().nonempty("Le nom est requis."),
//     email: z.email("Ce n'est pas un e-mail.").nonempty("L'e-mail est requis."),
//     phone: z
//       .string()
//       .nonempty("Le numéro de téléphone est requis.")
//       .regex(
//         /^[\d\s\+\-\(\)]+$/,
//         "Le numéro de téléphone contient des caractères invalides",
//       )
//       .min(9, "Le numéro de téléphone doit contenir au moins 9 chiffres"),
//     phone2: z
//       .string()
//       .optional()
//       .refine(
//         (val) => !val || (val.length >= 9 && /^[\d\s\+\-\(\)]+$/.test(val)),
//         "Le numéro de téléphone contient des caractères invalides ou est trop court",
//       ),
//     address: z
//       .string()
//       .optional()
//       .refine(
//         (val) => !val || (/\d/.test(val) && /[a-zA-ZÀ-ÿ]/.test(val)),
//         "L'adresse doit contenir au moins un chiffre et une lettre",
//       ),
//     postalCode: z
//       .number()
//       .int("Le code postal doit être un nombre entier")
//       .min(1000, "Le format est incorrecte")
//       .max(99999, "Le format est incorrecte")
//       .optional(),
//     city: z
//       .string()
//       .optional()
//       .refine(
//         (val) => !val || /^[a-zA-ZÀ-ÿ\s\-']+$/.test(val),
//         "La ville ne doit contenir que des lettres",
//       ),
//   });
//   type FormSchema = z.infer<typeof zodFormSchema>;

//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//     watch,
//     setValue,
//   } = useForm<FormSchema>({
//     resolver: zodResolver(zodFormSchema),
//     defaultValues: {
//       firstName: sharedData.firstName,
//       name: sharedData.name,
//       email: sharedData.email,
//       phone: sharedData.phone,
//       phone2: sharedData.phone2,
//       address: sharedData.address,
//       postalCode: sharedData.postalCode,
//       city: sharedData.city,
//     },
//   });

//   //eslint-disable-next-line
//   const watchedFirstName = watch("firstName");
//   const watchedName = watch("name");
//   const watchedEmail = watch("email");
//   const watchedPhone = watch("phone");
//   const watchedPhone2 = watch("phone2");
//   const watchedAddress = watch("address");
//   const watchedPostalCode = watch("postalCode");
//   const watchedCity = watch("city");

//   useEffect(() => {
//     setSharedData({
//       firstName: watchedFirstName || "",
//       name: watchedName || "",
//       email: watchedEmail || "",
//       phone: watchedPhone || "",
//       phone2: watchedPhone2 || "",
//       address: watchedAddress || "",
//       postalCode: watchedPostalCode,
//       city: watchedCity || "",
//     });
//   }, [
//     watchedFirstName,
//     watchedName,
//     watchedEmail,
//     watchedPhone,
//     watchedPhone2,
//     watchedAddress,
//     watchedPostalCode,
//     watchedCity,
//   ]);

//   // Mettre à jour les valeurs du formulaire quand sharedData change (depuis l'autre formulaire)
//   useEffect(() => {
//     setValue("firstName", sharedData.firstName, {
//       shouldValidate: false,
//       shouldDirty: false,
//     });
//     setValue("name", sharedData.name, {
//       shouldValidate: false,
//       shouldDirty: false,
//     });
//     setValue("email", sharedData.email, {
//       shouldValidate: false,
//       shouldDirty: false,
//     });
//     setValue("phone", sharedData.phone, {
//       shouldValidate: false,
//       shouldDirty: false,
//     });
//     setValue("phone2", sharedData.phone2, {
//       shouldValidate: false,
//       shouldDirty: false,
//     });
//     setValue("address", sharedData.address, {
//       shouldValidate: false,
//       shouldDirty: false,
//     });
//     setValue("postalCode", sharedData.postalCode, {
//       shouldValidate: false,
//       shouldDirty: false,
//     });
//     setValue("city", sharedData.city, {
//       shouldValidate: false,
//       shouldDirty: false,
//     });
//   }, [sharedData, setValue]);

//   const handleSubmitForm = async (data: FormSchema) => {
//     const response = await addClientIndividual({ data });
//     if (response.success) {
//       toast.success(response.message);
//       router.push(`/client-handle/${response.clientId}`);
//     } else {
//       toast.error(response.message);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit(handleSubmitForm)} className="grid gap-4">
//       <div className="grid grid-cols-2 gap-4">
//         <FormField
//           label="Prénom"
//           name="firstName"
//           type="text"
//           register={register}
//           error={errors.firstName}
//           nonempty
//           onChange={(e) => {
//             const formatted = toCamelCase(e.target.value);
//             setValue("firstName", formatted);
//           }}
//         />
//         <FormField
//           label="Nom"
//           name="name"
//           type="text"
//           register={register}
//           error={errors.name}
//           nonempty
//           onChange={(e) => {
//             const formatted = toCamelCase(e.target.value);
//             setValue("name", formatted);
//           }}
//         />
//         <FormField
//           label="E-mail"
//           name="email"
//           type="email"
//           register={register}
//           error={errors.email}
//           nonempty
//           icon={<Mail className="size-4" />}
//           placeholder="exemple@mail.com"
//         />
//         <FormField
//           label="Numéro de téléphone"
//           name="phone"
//           type="tel"
//           register={register}
//           error={errors.phone}
//           placeholder="+41 79 123 45 67"
//           nonempty
//           icon={<Phone className="size-4" />}
//         />
//       </div>
//       <div className="grid gap-4">
//         <FormField
//           label="Numéro de téléphone 2 (optionnel)"
//           name="phone2"
//           type="tel"
//           register={register}
//           error={errors.phone2}
//           placeholder="+41 79 123 45 67"
//           icon={<Phone className="size-4" />}
//         />
//       </div>
//       <div className="grid gap-4">
//         <FormField
//           label="Adresse"
//           name="address"
//           type="text"
//           register={register}
//           error={errors.address}
//           placeholder="Rue des Marronniers 12"
//           onChange={(e) => {
//             const formatted = formatAddress(e.target.value);
//             setValue("address", formatted);
//           }}
//         />
//         <div className="grid grid-cols-2 gap-4">
//           <FormField
//             label="Ville"
//             name="city"
//             type="text"
//             register={register}
//             error={errors.city}
//             placeholder="Genève"
//             onChange={(e) => {
//               const formatted = toCamelCase(e.target.value);
//               setValue("city", formatted);
//             }}
//           />
//           <FormField
//             label="Code postal"
//             name="postalCode"
//             type="number"
//             register={register}
//             error={errors.postalCode}
//             step="1"
//             placeholder="1204"
//           />
//         </div>
//       </div>
//       <Button
//         type="submit"
//         className="w-full bg-sky-500 hover:bg-sky-600"
//         disabled={isSubmitting}
//       >
//         {isSubmitting ? <Spinner /> : "Créer un client particulier"}
//       </Button>
//     </form>
//   );
// }
