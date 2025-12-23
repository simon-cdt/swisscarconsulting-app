"use client";

import { ItemEstimate } from "@/types/types";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import z from "zod";
import { FormField } from "@/components/form/FormField";
import { Spinner } from "@/components/ui/spinner";
import SelectField from "../SelectField";
import { updateEstimateItems } from "@/lib/actions/estimate";

export default function AddUpcomingItem({
  ItemsEstimate,
  setOpen,
  setSelectedItems,
  estimateId,
}: {
  ItemsEstimate: ItemEstimate;
  setOpen: (value: boolean) => void;
  setSelectedItems: React.Dispatch<React.SetStateAction<ItemEstimate>>;
  estimateId: string;
}) {
  const zodFormSchema = z.object({
    designation: z.string().nonempty("La désignation est requise."),
    position: z.number().min(1, "La position doit être positive."),
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
      position: ItemsEstimate.length + 1,
    },
  });

  const handleSubmitForm = async (data: FormSchema) => {
    try {
      // Créer le nouvel item
      const newItem = {
        id: crypto.randomUUID(),
        type: "UPCOMING" as const,
        designation: data.designation,
        position: data.position,
        description: null,
        unitPrice: 0,
        quantity: null,
        discount: null,
      };

      // Créer une copie du tableau
      const updatedItems = [...ItemsEstimate];

      // Décaler les items dont la position est >= à la nouvelle position
      updatedItems.forEach((item) => {
        if (item.position >= data.position) {
          item.position += 1;
        }
      });

      // Ajouter le nouvel item
      updatedItems.push(newItem);

      // Trier par position
      updatedItems.sort((a, b) => a.position - b.position);

      // Mettre à jour l'état
      setSelectedItems(updatedItems);

      const response = await updateEstimateItems({
        items: updatedItems.map((item) => ({
          ...item,
        })),
        estimateId: estimateId,
      });

      if (response.success) {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }

      setOpen(false);
    } catch (error) {
      toast.error("Une erreur est survenue lors de l'ajout de l'item.");
      console.error(error);
      setOpen(false);
    }
  };
  return (
    <form onSubmit={handleSubmit(handleSubmitForm)} className="w-full">
      <div className="flex w-full flex-col gap-4">
        <FormField
          label="Désignation"
          name="designation"
          register={register}
          type="text"
          error={errors.designation}
          textarea
        />
        <SelectField
          items={Array.from({ length: ItemsEstimate.length + 1 }, (_, i) => ({
            value: (i + 1).toString(),
            label: `Position ${i + 1}`,
          }))}
          label="Position"
          name="position"
          placeHolder="Choisissez la position"
          setValue={setValue}
          defaultValue={(ItemsEstimate.length + 1).toString()}
          error={errors.position}
        />
      </div>
      <div className="mt-4 flex w-full justify-end gap-3">
        <Button variant="outline" type="button" onClick={() => setOpen(false)}>
          Fermer
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          onClick={handleSubmit(handleSubmitForm)}
          variant={"destructive"}
          className="text-white"
        >
          {isSubmitting ? <Spinner /> : "Ajouter le à venir"}
        </Button>
      </div>
    </form>
  );
}
