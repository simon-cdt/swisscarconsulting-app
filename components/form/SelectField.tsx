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

export default function SelectField({
  setValue,
  items,
  defaultValue,
  placeHolder,
  name,
  label,
  nonempty,
  error,
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
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>
        <p>
          {label}&nbsp;
          {nonempty && <span className="text-red-500">*</span>}
        </p>
      </Label>
      <Select
        defaultValue={defaultValue}
        onValueChange={(value) => {
          const numValue = parseInt(value, 10);
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
