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
  const zodFormSchema = z
    .object({
      description: z.string().optional(),
      unitPrice: z
        .number("Un nombre est attendu")
        .positive("Le prix doit être positif"),
      discount: z
        .number()
        .min(1, "Le rabais doit être au minimum 1%")
        .max(100, "Le rabais doit être au maximum 100%")
        .optional(),
      hours: z
        .number("Un nombre est attendu")
        .int("Les heures doivent être un entier")
        .min(0, "Les heures doivent être >= 0"),
      minutes: z
        .number("Un nombre est attendu")
        .int("Les minutes doivent être un entier")
        .min(0, "Les minutes doivent être >= 0")
        .max(59, "Les minutes doivent être <= 59"),
      position: z.number().min(1, "La position doit être positive."),
    })
    .refine((data) => data.hours > 0 || data.minutes > 0, {
      message: "La durée doit être supérieure à 0",
      path: ["hours"],
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
        ItemsEstimate.filter((item) => item.type === "LABOR").length + 1,
    },
  });

  // eslint-disable-next-line
  const unitPrice = watch("unitPrice");
  const hours = watch("hours");
  const minutes = watch("minutes");
  const discount = watch("discount");

  const handleSubmitForm = async (data: FormSchema) => {
    try {
      // Calculer la durée totale en minutes
      const totalMinutes = data.hours * 60 + data.minutes;

      // Créer le nouvel item
      const newItem = {
        id: crypto.randomUUID(),
        type: "LABOR" as const,
        designation: "Main d'œuvre",
        description: data.description || null,
        unitPrice: data.unitPrice,
        quantity: totalMinutes,
        discount: data.discount ?? null,
        position: data.position,
      };

      // Créer une copie du tableau
      const updatedItems = [...ItemsEstimate];

      // Décaler uniquement les items LABOR dont la position est >= à la nouvelle position
      updatedItems.forEach((item) => {
        if (item.type === "LABOR" && item.position >= data.position) {
          item.position += 1;
        }
      });

      // Ajouter le nouvel item
      updatedItems.push(newItem);

      // Trier par type puis par position
      updatedItems.sort((a, b) => {
        // PART en premier
        if (a.type === "PART" && b.type !== "PART") return -1;
        if (a.type !== "PART" && b.type === "PART") return 1;
        // LABOR en deuxième
        if (a.type === "LABOR" && b.type === "UPCOMING") return -1;
        if (a.type === "UPCOMING" && b.type === "LABOR") return 1;
        // Sinon trier par position
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
      <div className="grid w-full grid-cols-2 gap-4">
        <div className="col-span-2">
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
          label="Prix unique (par heure)"
          name="unitPrice"
          register={register}
          type="number"
          step="1"
          error={errors.unitPrice}
          nonempty
          defaultValue={100}
        />
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <FormField
            label="Heures"
            name="hours"
            register={register}
            type="number"
            step="1"
            error={errors.hours}
            nonempty
            defaultValue={0}
          />
          <FormField
            label="Minutes"
            name="minutes"
            register={register}
            type="number"
            step="1"
            error={errors.minutes}
            nonempty
            defaultValue={0}
          />
        </div>
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
                ItemsEstimate.filter((item) => item.type === "LABOR").length +
                1,
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
            ItemsEstimate.filter((item) => item.type === "LABOR").length + 1
          ).toString()}
          error={errors.position}
          nonempty
        />
      </div>
      {unitPrice && (hours > 0 || minutes > 0) && (
        <div className="mt-4 rounded-lg border border-blue-600 bg-blue-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Durée totale:</span>
            <span className="text-lg font-bold text-blue-600">
              {hours}h {minutes}min
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Prix avant rabais:</span>
            <span className="text-base font-semibold text-gray-700">
              {(unitPrice * ((hours * 60 + minutes) / 60)).toFixed(2)} CHF
            </span>
          </div>
          {discount && discount > 0 && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">
                  Rabais ({discount}%):
                </span>
                <span className="text-base font-semibold text-red-600">
                  -
                  {(
                    unitPrice *
                    ((hours * 60 + minutes) / 60) *
                    (discount / 100)
                  ).toFixed(2)}{" "}
                  CHF
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-green-600 pt-2">
                <span className="text-sm font-semibold text-gray-700">
                  Prix final:
                </span>
                <span className="text-xl font-bold text-green-600">
                  {(
                    unitPrice *
                    ((hours * 60 + minutes) / 60) *
                    (1 - discount / 100)
                  ).toFixed(2)}{" "}
                  CHF
                </span>
              </div>
            </>
          )}
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
