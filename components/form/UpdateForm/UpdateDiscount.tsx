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
import { updateDiscount } from "@/lib/actions/estimate";

export default function UpdateDiscount({
  estimateId,
  discount,
  refetch,
  updateDisable,
}: {
  estimateId: string;
  discount: number | null;
  refetch: () => void;
  updateDisable: boolean;
}) {
  const [open, setOpen] = useState(false);

  const zodFormSchema = z.object({
    discount: z
      .number("Un nombre est attendu")
      .int("La réduction doit être un entier")
      .min(0, "La réduction doit être plus grande ou égal 0")
      .max(100, "La réduction doit être plus petite ou égal 100")
      .optional(),
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
    const response = await updateDiscount({
      estimateId,
      discount: data.discount || 0,
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
          {discount ? "Modifier la réduction" : "Ajouter une réduction"}
        </Button>
      </DialogTrigger>
      <form onSubmit={handleSubmit(handleSubmitForm)}>
        <DialogContent className="flex flex-col">
          <DialogHeader>
            <DialogTitle>Réduction globale</DialogTitle>
            <DialogDescription>
              Ajoutez ou modifiez une réduction globale (en pourcentage) qui
              sera appliquée au total HT du devis.
            </DialogDescription>
          </DialogHeader>
          <FormField
            label="Réduction (%)"
            name="discount"
            type="number"
            defaultValue={discount || undefined}
            error={errors.discount}
            register={register}
            step="1"
          />
          <div className="col-span-2 flex w-full justify-end gap-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
            >
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
