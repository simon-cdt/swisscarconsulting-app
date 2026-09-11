"use client";

import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FieldError } from "react-hook-form";

export default function SelectSearch({
  label,
  placeholder,
  content,
  setValue,
  name,
  research,
  noFound,
  error,
  defaultValue,
  disabled,
  onValueChange,
  nonempty,
}: {
  label: string;
  placeholder: string;
  content: { label: string; value: string }[];
  // eslint-disable-next-line
  setValue: any;
  name: string;
  research: string;
  noFound: string;
  error?: FieldError;
  defaultValue?: string;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
  nonempty?: boolean;
}) {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<string>(defaultValue || "");
  const prevContentRef = useRef<{ label: string; value: string }[]>([]);
  const prevSelectedRef = useRef<string>("");

  // Mettre à jour selected quand defaultValue change (pour les valeurs pré-remplies)
  useEffect(() => {
    if (defaultValue && defaultValue !== selected) {
      setSelected(defaultValue);
    }
  }, [defaultValue, selected]);

  // Appeler setValue UNIQUEMENT quand selected change vraiment
  useEffect(() => {
    if (selected !== prevSelectedRef.current) {
      setValue(name, selected);
      if (onValueChange) {
        onValueChange(selected);
      }
      prevSelectedRef.current = selected;
    }
  }, [selected, name, setValue, onValueChange]);

  // Réinitialiser si le selected n'est plus dans le content (seulement si content a vraiment changé)
  useEffect(() => {
    // Ne pas réinitialiser si désactivé
    if (disabled) {
      prevContentRef.current = content;
      return;
    }

    // Vérifier si le content a vraiment changé (pas juste un re-render)
    const contentChanged =
      content.length !== prevContentRef.current.length ||
      content.some(
        (item, idx) =>
          !prevContentRef.current[idx] ||
          item.value !== prevContentRef.current[idx].value,
      );

    if (
      contentChanged &&
      selected &&
      !content.find((item) => item.value === selected)
    ) {
      setSelected("");
    }

    prevContentRef.current = content;
  }, [content, selected, disabled]);

  const suppressNextFocusOpen = useRef(false);

  return (
    <div>
      <Label htmlFor={id}>
        {label} {nonempty && <span>*</span>}
      </Label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            onPointerDown={() => {
              suppressNextFocusOpen.current = true; // NOUVEAU — un clic gère déjà l'ouverture via Radix
            }}
            onFocus={() => {
              if (suppressNextFocusOpen.current) {
                suppressNextFocusOpen.current = false; // NOUVEAU — on ignore ce focus-ci
                return;
              }
              setOpen(true); // s'exécute uniquement pour un vrai Tab clavier
            }}
            className={cn(
              "w-full justify-between font-normal",
              !selected && "text-muted-foreground",
            )}
          >
            {selected
              ? content.find((item) => item.value === selected)?.label
              : placeholder}
            <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-full p-0"
          align="start"
          onCloseAutoFocus={() => {
            suppressNextFocusOpen.current = true; // NOUVEAU — évite la réouverture après sélection
          }}
        >
          <Command>
            <CommandInput placeholder={research} />
            <CommandList
              onWheel={(e) => {
                const el = e.currentTarget;
                el.scrollTop += e.deltaY;
                e.stopPropagation();
              }}
            >
              <CommandEmpty>{noFound}</CommandEmpty>
              <CommandGroup>
                {content.map((item) => (
                  <CommandItem
                    key={item.value}
                    onSelect={() => {
                      setSelected(item.value === selected ? "" : item.value);
                      setOpen(false);
                    }}
                    value={item.label}
                    className="pointer"
                  >
                    {item.label}
                    {selected === item.value && (
                      <CheckIcon className="ml-auto h-4 w-4" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {error && <p className="text-destructive text-sm">{error.message}</p>}
    </div>
  );
}
