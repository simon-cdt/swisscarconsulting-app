import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { FormField } from "../FormField";
import { Spinner } from "@/components/ui/spinner";
import { updateClaimNumber } from "@/lib/actions/estimate";

export default function UpdateClaimNumber({
  estimateId,
  claimNumber,
  refetch,
  updateDisable,
}: {
  estimateId: string;
  claimNumber: string | null;
  refetch: () => void;
  updateDisable: boolean;
}) {
  const [open, setOpen] = useState(false);

  const zodFormSchema = z.object({
    claimNumber: z.string().nonempty("Le numéro de sinistre est requis."),
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
    const response = await updateClaimNumber({
      estimateId,
      claimNumber: data.claimNumber,
    });
    if (response.success) {
      toast.success(response.message);
      refetch();
      setOpen(false);
    } else {
      toast.error(response.message);
      refetch();
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={"sm"} variant={"outline"} disabled={updateDisable}>
          Modifier le numéro
        </Button>
      </DialogTrigger>
      <form onSubmit={handleSubmit(handleSubmitForm)}>
        <DialogContent className="flex flex-col">
          <DialogHeader>
            <DialogTitle>Changer le numéro de sinistre</DialogTitle>
            <DialogDescription>
              Modifiez le numéro de sinistre associé à ce devis. Cette
              modification permettra de mieux suivre le dossier.
            </DialogDescription>
          </DialogHeader>
          <FormField
            label="Numéro de sinistre"
            name="claimNumber"
            type="text"
            defaultValue={claimNumber || ""}
            error={errors.claimNumber}
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
            >
              {isSubmitting ? <Spinner /> : "Enregistrer"}
            </Button>
          </div>
        </DialogContent>
      </form>
    </Dialog>
  );
}
