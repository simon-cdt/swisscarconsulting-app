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
    description: z.string().optional(),
    unitPrice: z
      .number("Un nombre est attendu")
      .positive("Le prix doit être positif"),
    hours: z
      .number("Un nombre est attendu")
      .int("Les heures doivent être un entier")
      .min(0, "Les heures doivent être >= 0")
      .optional(),
    minutes: z
      .number("Un nombre est attendu")
      .int("Les minutes doivent être un entier")
      .min(0, "Les minutes doivent être >= 0")
      .max(59, "Les minutes doivent être <= 59")
      .optional(),
    calculateByTime: z.boolean().optional(),
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
        ItemsEstimate.filter((item) => item.type === "LABOR").length + 1,
    },
  });

  // eslint-disable-next-line
  const unitPrice = watch("unitPrice");
  const hours = watch("hours");
  const minutes = watch("minutes");
  const calculateByTime = watch("calculateByTime");

  const handleSubmitForm = async (data: FormSchema) => {
    try {
      // Calculer la durée totale en minutes si heures/minutes sont fournis
      let totalMinutes: number | null = null;

      if (data.hours !== undefined || data.minutes !== undefined) {
        const calculated = (data.hours || 0) * 60 + (data.minutes || 0);
        // Si le total est 0, on considère qu'il n'y a pas de temps
        totalMinutes = calculated > 0 ? calculated : null;
      }

      // Créer le nouvel item
      const newItem = {
        id: crypto.randomUUID(),
        type: "LABOR" as const,
        designation: "Main d'œuvre",
        description: data.description || null,
        unitPrice: data.unitPrice,
        quantity: totalMinutes,
        discount: null,
        calculateByTime: data.calculateByTime || null,
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
          label="Prix unique"
          name="unitPrice"
          register={register}
          type="number"
          step="1"
          error={errors.unitPrice}
          nonempty
          defaultValue={100}
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
        <FormField
          label="Heures"
          name="hours"
          register={register}
          type="number"
          step="1"
          error={errors.hours}
        />
        <FormField
          label="Minutes"
          name="minutes"
          register={register}
          type="number"
          step="1"
          error={errors.minutes}
        />
        {((hours !== undefined && hours > 0) ||
          (minutes !== undefined && minutes > 0)) && (
          <div className="col-span-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="calculateByTime"
              {...register("calculateByTime")}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="calculateByTime" className="text-sm">
              Calculer le prix selon le temps (heures × prix/h)
            </label>
          </div>
        )}
      </div>
      {unitPrice && (
        <div className="mt-4 rounded-lg border border-blue-600 bg-blue-50 p-4">
          {(hours !== undefined || minutes !== undefined) && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Durée totale:</span>
              <span className="text-lg font-bold text-blue-600">
                {hours || 0}h {minutes || 0}min
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Prix total:</span>
            <span className="text-xl font-bold text-green-600">
              {calculateByTime && (hours !== undefined || minutes !== undefined)
                ? (
                    unitPrice *
                    (((hours || 0) * 60 + (minutes || 0)) / 60)
                  ).toFixed(2)
                : unitPrice.toFixed(2)}{" "}
              CHF
            </span>
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
