"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Lock } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { FormField } from "../FormField";
import { updatePasswordUser } from "@/lib/actions/admin/user";

export default function UpdatePassword({ id }: { id: string }) {
  const [open, setOpen] = useState(false);

  const zodFormSchema = z
    .object({
      password: z.string().nonempty("Le mot de passe est requis."),
      passwordConfirm: z
        .string()
        .nonempty("La confirmation du mot de passe est requise."),
    })
    .refine((data) => data.password === data.passwordConfirm, {
      path: ["passwordConfirm"],
      message: "Les mots de passe ne correspondent pas.",
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
    const response = await updatePasswordUser({
      user: {
        id,
        password: data.password,
      },
    });
    if (response.success) {
      toast.success(response.message);
      setOpen(false);
    } else {
      toast.error(response.message);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <div className="flex items-center gap-2">
            <Lock className="size-4" />
            <p>Modifier</p>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle>Modifier</DialogTitle>
          <DialogDescription>
            Vous pouvez changer le mot de passe de l&apos;étudiant ici.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleSubmitForm)}>
          <div className="grid gap-4 py-4">
            <FormField
              error={errors.password}
              name="password"
              type="password"
              placeholder="********"
              label="Nouveau mot de passe"
              register={register}
            />
            <FormField
              error={errors.passwordConfirm}
              name="passwordConfirm"
              type="password"
              placeholder="********"
              label="Confirmation du nouveau mot de passe"
              register={register}
            />

            <div className="flex w-full items-center justify-between gap-2">
              <Button
                type="button"
                className="w-max"
                variant={"outline"}
                onClick={() => setOpen(false)}
              >
                Fermer
              </Button>
              <Button
                disabled={isSubmitting}
                variant={"default"}
                className="w-max"
                type="submit"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Sauvegarder le nouveau mot de passe"
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
