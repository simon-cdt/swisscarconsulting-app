"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { FormField } from "@/components/form/FormField";
import { Button } from "../../ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Mail, Phone } from "lucide-react";
import { addClientIndividual } from "@/lib/actions/client";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function AddClient() {
  const router = useRouter();

  const zodFormSchema = z.object({
    firstName: z.string().nonempty("Le prénom est requis."),
    name: z.string().nonempty("Le nom est requis."),
    email: z.email("Ce n'est pas un e-mail.").nonempty("L'e-mail est requis."),
    phone: z.string().nonempty("Le numéro de téléphone est requis."),
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
        />
        <FormField
          label="Nom"
          name="name"
          type="text"
          register={register}
          error={errors.name}
          nonempty
        />
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
            type="text"
            register={register}
            error={errors.postalCode}
            placeholder="1204"
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
}
