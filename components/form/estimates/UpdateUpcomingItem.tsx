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

export default function UpdateUpcomingItem({
  ItemsEstimate,
  item,
  setSelectedItems,
  estimateId,
}: {
  ItemsEstimate: ItemEstimate;
  item: {
    id: string;
    designation: string;
    position: number;
  };
  setSelectedItems: React.Dispatch<React.SetStateAction<ItemEstimate>>;
  estimateId: string;
}) {
  const [open, setOpen] = useState(false);

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
      designation: item.designation,
      position: item.position,
    },
  });

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

      // Si la position a changé, réorganiser les positions uniquement parmi les items UPCOMING
      if (oldPosition !== newPosition) {
        updatedItems.forEach((currentItem) => {
          // Ne traiter que les items UPCOMING (sauf celui qu'on modifie)
          if (currentItem.type !== "UPCOMING" || currentItem.id === item.id)
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

      // Mettre à jour l'item modifié
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        designation: data.designation,
        position: newPosition,
      };

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
          <div className="flex w-full flex-col gap-4">
            <FormField
              label="Désignation"
              name="designation"
              register={register}
              type="text"
              error={errors.designation}
              richText
              setValue={setValue}
              defaultValue={item.designation}
            />

            <SelectField
              items={Array.from(
                {
                  length: ItemsEstimate.filter(
                    (item) => item.type === "UPCOMING",
                  ).length,
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
            />
          </div>
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
