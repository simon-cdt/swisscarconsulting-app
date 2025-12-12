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
import { useForm } from "react-hook-form";
import z from "zod";
import { Spinner } from "../../ui/spinner";
import { FormField } from "../FormField";
import toast from "react-hot-toast";
import { useState } from "react";
import { Label } from "../../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Role } from "@/generated/prisma/enums";
import { createUser } from "@/lib/actions/admin/user";
import { Roles } from "@/types/types";

export function CreateUser({ refetch }: { refetch: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  const zodFormSchema = z.object({
    username: z.string().nonempty("Le username est requis."),
    password: z.string().nonempty("Le mot de passe est requis."),
    role: z.enum(["ADMIN", "MECHANIC", "SELLER", "BOTH"]),
  });
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
    const response = await createUser({
      user: {
        username: data.username,
        password: data.password,
        role: data.role,
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
          <Button>Créer un utilisateur</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Créer un utilisateur</DialogTitle>
            <DialogDescription>
              Remplissez le formulaire pour créer un nouvel utilisateur.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Nom d'utilisateur"
              name="username"
              type="text"
              error={errors.username}
              register={register}
            />
            <div className="flex flex-col gap-2">
              <Label htmlFor="sectors">Secteur</Label>
              <Select
                onValueChange={(value) => setValue("role", value as Role)}
              >
                <SelectTrigger className="pointer w-full">
                  <SelectValue placeholder="Sélectionne un secteur" />
                </SelectTrigger>
                <SelectContent>
                  {Roles.map((role) => (
                    <SelectItem
                      key={role.value}
                      value={role.value}
                      className="pointer"
                    >
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && (
                <small className="text-red-500">{errors.role.message}</small>
              )}
            </div>
            <div className="col-span-2">
              <FormField
                label="Mot de passe"
                name="password"
                type="password"
                error={errors.password}
                register={register}
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
