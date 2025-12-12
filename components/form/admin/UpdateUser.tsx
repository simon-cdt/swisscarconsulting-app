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
import { Pencil } from "lucide-react";
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
import { updateUser } from "@/lib/actions/admin/user";
import { Roles } from "@/types/types";

export function UpdateUser({
  user,
  refetch,
}: {
  user: {
    id: string;
    username: string;
    role: string;
  };
  refetch: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const zodFormSchema = z.object({
    username: z.string().nonempty("Le username est requis."),
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
    defaultValues: {
      role: user.role as Role,
    },
  });

  const handleSubmitForm = async (data: FormSchema) => {
    const response = await updateUser({
      user: {
        id: user.id,
        username: data.username,
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
          <button className="hover:bg-primary/10 trans pointer rounded-md p-1.5">
            <Pencil className="size-4" />
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Modifier l&apos;utilisateur</DialogTitle>
            <DialogDescription>
              Apportez des modifications à l&apos;utilisateur ici. Cliquez sur
              enregistrer lorsque vous avez terminé.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Nom d'utilisateur"
              name="username"
              type="text"
              defaultValue={user.username}
              error={errors.username}
              register={register}
            />
            <div className="flex flex-col gap-2">
              <Label htmlFor="sectors">Secteur</Label>
              <Select
                onValueChange={(value) => setValue("role", value as Role)}
                defaultValue={user.role}
              >
                <SelectTrigger className="pointer w-full">
                  <SelectValue placeholder="Sélectionne un secteur" />
                </SelectTrigger>
                <SelectContent>
                  {Roles?.map((role) => (
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
