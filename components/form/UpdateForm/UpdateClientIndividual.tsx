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
import { updateClientIndividual } from "@/lib/actions/client";
import toast from "react-hot-toast";
import { useState } from "react";

export function UpdateClientIndividual({
  client,
  refetch,
}: {
  client: {
    id: string;
    name: string;
    firstName: string;
    email: string;
    phone: string;
    address: string | null;
    postalCode: string | null;
    city: string | null;
  };
  refetch: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const zodFormSchema = z.object({
    name: z.string().nonempty("Le nom est requis."),
    firstName: z.string().nonempty("Le prénom est requis."),
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <form onSubmit={handleSubmit(handleSubmitForm)}>
        <DialogTrigger asChild>
          <Button className={`individual-btn flex items-center gap-3`}>
            <span>Modifier</span>
            <Edit className="size-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Modifier le client</DialogTitle>
            <DialogDescription>
              Apportez des modifications au client ici. Cliquez sur enregistrer
              lorsque vous avez terminé.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Nom"
              name="name"
              type="text"
              defaultValue={client.name}
              error={errors.name}
              register={register}
              nonempty
            />
            <FormField
              label="Prénom"
              name="firstName"
              type="text"
              defaultValue={client.firstName}
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
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button
              type="submit"
              onClick={handleSubmit(handleSubmitForm)}
              disabled={isSubmitting}
              className="individual-btn"
            >
              {isSubmitting ? <Spinner /> : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
