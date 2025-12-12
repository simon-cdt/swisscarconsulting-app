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
import { Edit2 } from "lucide-react";
import { useState } from "react";

export default function UpdatePartItem({
  ItemsEstimate,
  setSelectedItems,
  item,
}: {
  ItemsEstimate: ItemEstimate;
  setSelectedItems: React.Dispatch<React.SetStateAction<ItemEstimate>>;
  item: {
    id: string;
    description: string;
    unitPrice: number;
    quantity: number | null;
    position: number;
  };
}) {
  const [open, setOpen] = useState(false);

  const zodFormSchema = z.object({
    description: z.string().nonempty("La description est requise."),
    unitPrice: z
      .number("Un nombre est attendu")
      .positive("Le prix doit être positif"),
    quantity: z
      .number("Un nombre est attendu")
      .int("La quantité doit être un entier")
      .positive("La quantité doit être positive"),
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
      description: item.description,
      unitPrice: item.unitPrice,
      quantity: item.quantity ?? 0,
      position: item.position,
    },
  });

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

      // Si la position a changé, réorganiser les positions
      if (oldPosition !== newPosition) {
        updatedItems.forEach((item) => {
          // Si l'item monte (nouvelle position < ancienne position)
          if (newPosition < oldPosition) {
            // Décaler vers le bas les items entre la nouvelle et l'ancienne position
            if (item.position >= newPosition && item.position < oldPosition) {
              item.position += 1;
            }
          }
          // Si l'item descend (nouvelle position > ancienne position)
          else {
            // Décaler vers le haut les items entre l'ancienne et la nouvelle position
            if (item.position > oldPosition && item.position <= newPosition) {
              item.position -= 1;
            }
          }
        });
      }

      // Mettre à jour l'item modifié
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        description: data.description,
        unitPrice: data.unitPrice,
        quantity: data.quantity,
        position: newPosition,
      };

      // Trier par position
      updatedItems.sort((a, b) => a.position - b.position);

      // Mettre à jour l'état
      setSelectedItems(updatedItems);

      toast.success("Item modifié avec succès");
      setOpen(false);
    } catch (error) {
      toast.error("Une erreur est survenue lors de la modification de l'item.");
      console.error(error);
      setOpen(false);
    }
  };
  return (
    <Dialog open={open}>
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
          <div className="grid w-full grid-cols-3 gap-4">
            <div className="col-span-3">
              <FormField
                label="Description"
                name="description"
                register={register}
                type="text"
                error={errors.description}
                defaultValue={item.description}
              />
            </div>
            <FormField
              label="Prix unique"
              name="unitPrice"
              register={register}
              type="number"
              step="0.01"
              error={errors.unitPrice}
              defaultValue={item.unitPrice.toString()}
            />
            <FormField
              label="Quantité"
              name="quantity"
              register={register}
              type="number"
              error={errors.quantity}
              defaultValue={item.quantity?.toString()}
            />
            <SelectField
              items={Array.from({ length: ItemsEstimate.length }, (_, i) => ({
                value: (i + 1).toString(),
                label: `Position ${i + 1}`,
              }))}
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
