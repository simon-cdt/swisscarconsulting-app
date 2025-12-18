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

export default function AddPartItem({
  ItemsEstimate,
  setOpen,
  setSelectedItems,
}: {
  ItemsEstimate: ItemEstimate;
  setOpen: (value: boolean) => void;
  setSelectedItems: React.Dispatch<React.SetStateAction<ItemEstimate>>;
}) {
  const zodFormSchema = z.object({
    designation: z.string().nonempty("La désignation est requise."),
    description: z.string().optional(),
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
      position: ItemsEstimate.length + 1,
    },
  });

  const handleSubmitForm = async (data: FormSchema) => {
    try {
      // Créer le nouvel item
      const newItem = {
        id: crypto.randomUUID(),
        type: "PART" as const,
        designation: data.designation,
        description: data.description ?? null,
        unitPrice: data.unitPrice,
        quantity: data.quantity,
        discount: null,
        position: data.position,
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

      toast.success("Item ajouté avec succès");
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
            textarea
          />
        </div>
        <FormField
          label="Prix unique"
          name="unitPrice"
          register={register}
          type="number"
          step="0.01"
          error={errors.unitPrice}
          nonempty
        />
        <FormField
          label="Quantité"
          name="quantity"
          register={register}
          type="number"
          error={errors.quantity}
          nonempty
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
          nonempty
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
        >
          {isSubmitting ? <Spinner /> : "Ajouter l'item"}
        </Button>
      </div>
    </form>
  );
}
