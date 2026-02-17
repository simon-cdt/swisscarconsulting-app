import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "../ui/label";
import { FieldError } from "react-hook-form";
import { useEffect, useState } from "react";

export default function SelectField({
  setValue,
  items,
  defaultValue,
  placeHolder,
  name,
  label,
  nonempty,
  error,
  disabled,
}: {
  // eslint-disable-next-line
  setValue: any;
  items: { label: string; value: string }[];
  defaultValue?: string;
  placeHolder: string;
  name: string;
  label: string;
  nonempty?: boolean;
  error?: FieldError;
  disabled?: boolean;
}) {
  const [value, setValue_internal] = useState<string>(defaultValue || "");

  // Mettre à jour la valeur quand defaultValue change
  useEffect(() => {
    if (defaultValue !== undefined && defaultValue !== value) {
      setValue_internal(defaultValue);
      const numValue = parseInt(defaultValue, 10);
      if (!isNaN(numValue)) {
        setValue(name, numValue);
      }
    }
  }, [defaultValue, value, name, setValue]);

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>
        <p>
          {label}&nbsp;
          {nonempty && <span className="text-red-500">*</span>}
        </p>
      </Label>
      <Select
        value={value}
        disabled={disabled}
        onValueChange={(newValue) => {
          setValue_internal(newValue);
          const numValue = parseInt(newValue, 10);
          if (!isNaN(numValue)) {
            setValue(name, numValue);
          }
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeHolder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {items.map((item) => {
              return (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              );
            })}
          </SelectGroup>
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-red-500">{error.message}</p>}
    </div>
  );
}
