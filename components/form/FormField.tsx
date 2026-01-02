import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FieldError, UseFormSetValue } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { HTMLInputTypeAttribute } from "react";
import RichTextEditor from "./RichTextEditor";

interface FormFieldProps {
  label: string;
  name: string;
  type: HTMLInputTypeAttribute;
  placeholder?: string;
  // eslint-disable-next-line
  register: any;
  error?: FieldError;
  icon?: React.ReactNode;
  defaultValue?: string;
  textarea?: boolean;
  nonempty?: boolean;
  step?: string;
  richText?: boolean;
  // eslint-disable-next-line
  setValue?: UseFormSetValue<any>;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// CHAMP DE FORMULAIRE
export const FormField = ({
  label,
  name,
  type,
  placeholder,
  register,
  error,
  icon,
  defaultValue,
  textarea,
  nonempty,
  step,
  richText,
  setValue,
  onChange,
}: FormFieldProps) => {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>
        <p>
          {label}&nbsp;
          {nonempty && <span className="text-red-500">*</span>}
        </p>
      </Label>
      <div className="relative">
        {icon && (
          <div className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">
            {icon}
          </div>
        )}
        {richText && setValue ? (
          <RichTextEditor
            value={defaultValue}
            onChange={(value) => setValue(name, value)}
            placeholder={placeholder}
          />
        ) : textarea ? (
          <Textarea
            id={name}
            placeholder={placeholder}
            {...register(name)}
            className={`${icon && "pl-9"} h-44`}
            defaultValue={defaultValue}
          />
        ) : (
          <Input
            id={name}
            type={type}
            placeholder={placeholder}
            {...register(name, {
              setValueAs:
                type === "number"
                  ? (v: string) => {
                      if (v === "" || v === null || v === undefined) {
                        return undefined;
                      }
                      const parsed = parseFloat(v);
                      return isNaN(parsed) ? undefined : parsed;
                    }
                  : undefined,
              onChange: onChange,
            })}
            className={icon ? "pl-9" : ""}
            defaultValue={defaultValue}
            step={step}
          />
        )}
      </div>
      {error && <p className="text-sm text-red-500">{error.message}</p>}
    </div>
  );
};
