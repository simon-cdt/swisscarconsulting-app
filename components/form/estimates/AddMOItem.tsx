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

export default function AddMOItem({
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
    description: z.string().optional(),
    unitPrice: z
      .number("Un nombre est attendu")
      .positive("Le prix doit être positif"),
    discount: z
      .number()
      .min(1, "Le rabais doit être au minimum 1%")
      .max(100, "Le rabais doit être au maximum 100%")
      .optional(),
    position: z.number().min(1, "La position doit être positive."),
  });
  type FormSchema = z.infer<typeof zodFormSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormSchema>({
    resolver: zodResolver(zodFormSchema),
    defaultValues: {
      position:
        ItemsEstimate.filter((item) => item.type !== "UPCOMING").length + 1,
      discount: undefined,
    },
  });

  const unitPrice = watch("unitPrice");
  const discount = watch("discount");

  const handleSubmitForm = async (data: FormSchema) => {
    try {
      // Créer le nouvel item
      const newItem = {
        id: crypto.randomUUID(),
        type: "LABOR" as const,
        designation: data.designation,
        description: data.description || null,
        unitPrice: data.unitPrice,
        quantity: 1,
        discount: data.discount ?? null,
        position: data.position,
      };

      // Créer une copie du tableau
      const updatedItems = [...ItemsEstimate];

      // Décaler uniquement les items PART et LABOR dont la position est >= à la nouvelle position
      updatedItems.forEach((item) => {
        if (item.type !== "UPCOMING" && item.position >= data.position) {
          item.position += 1;
        }
      });

      // Ajouter le nouvel item
      updatedItems.push(newItem);

      // Trier par type puis par position
      updatedItems.sort((a, b) => {
        if (a.type === "UPCOMING" && b.type !== "UPCOMING") return 1;
        if (a.type !== "UPCOMING" && b.type === "UPCOMING") return -1;
        return a.position - b.position;
      });

      // Mettre à jour l'état
      setSelectedItems(updatedItems);

      const response = await updateEstimateItems({
        items: updatedItems.map((item) => ({
          ...item,
          type: "LABOR",
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
      <div className="grid w-full grid-cols-3 gap-4">
        <div className="col-span-3">
          <FormField
            label="Désignation"
            name="designation"
            register={register}
            type="text"
            error={errors.designation}
            nonempty
          />
        </div>
        <div className="col-span-3">
          <FormField
            label="Description"
            name="description"
            register={register}
            type="text"
            error={errors.description}
            richText
            setValue={setValue}
          />
        </div>
        <FormField
          label="Prix unique"
          name="unitPrice"
          register={register}
          type="number"
          step="1"
          error={errors.unitPrice}
          nonempty
        />
        <FormField
          label="Rabais (%)"
          name="discount"
          register={register}
          type="number"
          error={errors.discount}
          step="1"
        />
        <SelectField
          items={Array.from(
            {
              length:
                ItemsEstimate.filter((item) => item.type !== "UPCOMING")
                  .length + 1,
            },
            (_, i) => ({
              value: (i + 1).toString(),
              label: `Position ${i + 1}`,
            }),
          )}
          label="Position"
          name="position"
          placeHolder="Choisissez la position"
          setValue={setValue}
          defaultValue={(
            ItemsEstimate.filter((item) => item.type !== "UPCOMING").length + 1
          ).toString()}
          error={errors.position}
          nonempty
        />
      </div>
      {unitPrice && discount && (
        <div className="mt-4 rounded-lg border border-green-600 bg-green-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">
              Prix final après rabais:
            </span>
            <span className="text-lg font-bold text-green-600">
              {(unitPrice - (unitPrice * discount) / 100).toFixed(2)} CHF
            </span>
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {unitPrice.toFixed(2)} CHF - {discount}% ={" "}
            {(unitPrice - (unitPrice * discount) / 100).toFixed(2)} CHF
          </div>
        </div>
      )}
      <div className="mt-4 flex w-full justify-end gap-3">
        <Button variant="outline" type="button" onClick={() => setOpen(false)}>
          Fermer
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          onClick={handleSubmit(handleSubmitForm)}
        >
          {isSubmitting ? <Spinner /> : "Ajouter l'item"}
        </Button>
      </div>
    </form>
  );
}
