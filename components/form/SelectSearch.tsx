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

  return (
    <div className="*:not-first:mt-2">
      <Label htmlFor={id}>
        <p>
          {label}&nbsp;
          {nonempty && <span className="text-red-500">*</span>}
        </p>
      </Label>
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button
            aria-expanded={open}
            className="border-input bg-background hover:bg-background w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]"
            id={id}
            role="combobox"
            variant="outline"
            tabIndex={0}
            type="button"
            disabled={disabled}
          >
            <span
              className={cn("truncate", !selected && "text-muted-foreground")}
            >
              {selected
                ? content.find((item) => item.value === selected)?.label
                : placeholder}
            </span>
            <ChevronDownIcon
              aria-hidden="true"
              className="text-muted-foreground/80 shrink-0"
              size={16}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="border-input w-full min-w-(--radix-popper-anchor-width) p-0"
          onWheel={(e) => {
            const el = e.currentTarget;
            el.scrollTop += e.deltaY;
            e.stopPropagation();
          }}
        >
          <Command>
            <CommandInput placeholder={research} />
            <CommandList>
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
                      <CheckIcon className="ml-auto" size={16} />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-red-500">{error.message}</p>}
    </div>
  );
}
