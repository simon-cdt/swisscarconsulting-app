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
import { PARTS_CATALOG, PartTemplate } from "@/lib/mock/parts-catalog";
import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";

export default function AddPartItem({
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
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormSchema>({
    resolver: zodResolver(zodFormSchema),
    defaultValues: {
      position:
        ItemsEstimate.filter((item) => item.type !== "UPCOMING").length + 1,
    },
  });

  // État pour l'autocomplétion
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<PartTemplate[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [descriptionValue, setDescriptionValue] = useState("");
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Surveiller les changements dans le champ de désignation
  const designation = watch("designation");

  // Filtrer les suggestions basées sur la recherche
  useEffect(() => {
    if (searchTerm.length >= 2) {
      const filtered = PARTS_CATALOG.filter((part) =>
        part.designation.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm]);

  // Fermer les suggestions quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Gérer la sélection d'une suggestion
  const handleSelectSuggestion = (part: PartTemplate) => {
    setValue("designation", part.designation);
    setValue("description", part.description);
    setValue("unitPrice", part.unitPrice);
    setValue("quantity", part.quantity);
    setDescriptionValue(part.description);
    setSearchTerm("");
    setShowSuggestions(false);
  };

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
          type: "PART",
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
        <div className="relative col-span-3">
          <FormField
            label="Désignation"
            name="designation"
            register={register}
            type="text"
            error={errors.designation}
            nonempty
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Message d'aide */}
          {searchTerm.length > 0 && searchTerm.length < 2 && (
            <div className="absolute z-50 mt-1 w-full rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-700">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <span>
                  Tapez au moins 2 caractères pour voir les suggestions...
                </span>
              </div>
            </div>
          )}

          {/* Message : Aucun résultat */}
          {searchTerm.length >= 2 && suggestions.length === 0 && (
            <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <span>Aucune pièce trouvée pour &quot;{searchTerm}&quot;</span>
              </div>
            </div>
          )}

          {/* Liste de suggestions d'autocomplétion */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute z-50 mt-1 max-h-80 w-full overflow-y-auto rounded-lg border border-gray-300 bg-white shadow-xl"
              style={{
                boxShadow:
                  "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div className="sticky top-0 border-b border-gray-200 bg-gray-50 px-4 py-2 text-xs font-medium text-gray-500">
                {suggestions.length} pièce{suggestions.length > 1 ? "s" : ""}{" "}
                trouvée{suggestions.length > 1 ? "s" : ""}
              </div>
              {suggestions.map((part, index) => (
                <div
                  key={part.id}
                  className={`cursor-pointer border-b border-gray-100 px-4 py-3 transition-all duration-150 last:border-b-0 hover:bg-blue-50 ${
                    index === 0 ? "bg-gray-50/50" : ""
                  }`}
                  onClick={() => handleSelectSuggestion(part)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-1 text-sm font-semibold text-gray-900">
                        {part.designation}
                      </div>
                      <div className="text-xs leading-relaxed text-gray-600">
                        {part.description}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2.5 flex gap-4 border-t border-gray-100 pt-2">
                    <span className="inline-flex items-center gap-1 text-xs">
                      <span className="text-gray-500">Prix:</span>
                      <span className="font-bold text-green-700">
                        CHF {part.unitPrice.toFixed(2)}
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs">
                      <span className="text-gray-500">Quantité:</span>
                      <span className="font-semibold text-gray-700">
                        {part.quantity}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="col-span-3">
          <FormField
            label="Description"
            name="description"
            register={register}
            type="text"
            error={errors.description}
            richText
            setValue={(_, value) => {
              setValue("description", value);
              setDescriptionValue(value);
            }}
            defaultValue={descriptionValue}
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
