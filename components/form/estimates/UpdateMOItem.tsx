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
import { useEffect, useState } from "react";
import { Edit2 } from "lucide-react";
import { updateEstimateItems } from "@/lib/actions/estimate";

export default function UpdateMOItem({
  ItemsEstimate,
  item,
  setSelectedItems,
  estimateId,
  disable,
}: {
  ItemsEstimate: ItemEstimate;
  item: {
    id: string;
    designation: string;
    description: string | null;
    unitPrice: number;
    position: number;
    quantity: number | null;
    calculateByTime: boolean | null;
  };
  setSelectedItems: React.Dispatch<React.SetStateAction<ItemEstimate>>;
  estimateId: string;
  disable?: boolean;
}) {
  const [open, setOpen] = useState(false);

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

  // Convertir la quantity (en minutes) en heures et minutes
  const totalMinutes = item.quantity ?? 0;
  const defaultHours =
    item.quantity !== null ? Math.floor(totalMinutes / 60) : undefined;
  const defaultMinutes = item.quantity !== null ? totalMinutes % 60 : undefined;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormSchema>({
    resolver: zodResolver(zodFormSchema),
    defaultValues: {
      description: item.description || undefined,
      unitPrice: item.unitPrice,
      hours: defaultHours,
      minutes: defaultMinutes,
      calculateByTime: item.calculateByTime ?? undefined,
      position: item.position,
    },
  });

  // eslint-disable-next-line
  const unitPrice = watch("unitPrice");
  const hours = watch("hours");
  const minutes = watch("minutes");
  const calculateByTime = watch("calculateByTime");

  // Initialiser la valeur de position quand le dialog s'ouvre
  useEffect(() => {
    if (open) {
      setValue("position", item.position);
    }
  }, [open, item.position, setValue]);

  const handleSubmitForm = async (data: FormSchema) => {
    try {
      const oldPosition = item.position;
      const newPosition = data.position;

      // Créer une copie du tableau
      const updatedItems = [...ItemsEstimate];

      // Trouver l'index de l'item à modifier
      const itemIndex = updatedItems.findIndex((i) => i.id === item.id);

      if (itemIndex === -1) {
        toast.error("Item non trouvé.");
        return;
      }

      // Si la position a changé, réorganiser les positions uniquement parmi les items LABOR
      if (oldPosition !== newPosition) {
        updatedItems.forEach((currentItem) => {
          // Ne traiter que les items LABOR (sauf celui qu'on modifie)
          if (currentItem.type !== "LABOR" || currentItem.id === item.id)
            return;

          // Si l'item monte (nouvelle position < ancienne position)
          if (newPosition < oldPosition) {
            // Décaler vers le bas les items entre la nouvelle et l'ancienne position
            if (
              currentItem.position >= newPosition &&
              currentItem.position < oldPosition
            ) {
              currentItem.position += 1;
            }
          }
          // Si l'item descend (nouvelle position > ancienne position)
          else {
            // Décaler vers le haut les items entre l'ancienne et la nouvelle position
            if (
              currentItem.position > oldPosition &&
              currentItem.position <= newPosition
            ) {
              currentItem.position -= 1;
            }
          }
        });
      }

      // Calculer la durée totale en minutes si heures/minutes sont fournis
      let totalMinutes: number | null = null;

      if (data.hours !== undefined || data.minutes !== undefined) {
        const calculated = (data.hours || 0) * 60 + (data.minutes || 0);
        // Si le total est 0, on considère qu'il n'y a pas de temps
        totalMinutes = calculated > 0 ? calculated : null;
      }

      // Mettre à jour l'item modifié
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        designation: "Main d'œuvre",
        description: data.description || null,
        unitPrice: data.unitPrice,
        quantity: totalMinutes,
        calculateByTime: data.calculateByTime || null,
        position: newPosition,
      };

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
      toast.error("Une erreur est survenue lors de la modification de l'item.");
      console.error(error);
      setOpen(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-full p-0 hover:bg-black/10"
          onClick={() => setOpen(true)}
          disabled={disable}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-[40vw]">
        <form
          onSubmit={handleSubmit(handleSubmitForm)}
          className="flex w-full flex-col gap-4"
        >
          <DialogHeader>
            <DialogTitle>Modifier un item</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l&apos;item sélectionné.
            </DialogDescription>
          </DialogHeader>
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
                defaultValue={item.description || undefined}
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
              defaultValue={item.unitPrice.toString()}
            />
            <SelectField
              items={Array.from(
                {
                  length: ItemsEstimate.filter((item) => item.type === "LABOR")
                    .length,
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
              defaultValue={item.position.toString()}
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
              defaultValue={
                defaultHours !== undefined ? defaultHours.toString() : undefined
              }
            />
            <FormField
              label="Minutes"
              name="minutes"
              register={register}
              type="number"
              step="1"
              error={errors.minutes}
              defaultValue={
                defaultMinutes !== undefined
                  ? defaultMinutes.toString()
                  : undefined
              }
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
                  {calculateByTime &&
                  (hours !== undefined || minutes !== undefined)
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
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isSubmitting}
              onClick={handleSubmit(handleSubmitForm)}
            >
              {isSubmitting ? <Spinner /> : "Mettre à jour"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
