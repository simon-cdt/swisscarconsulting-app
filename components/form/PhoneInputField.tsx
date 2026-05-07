"use client";

import { Mail, Phone } from "lucide-react";
import { FormField } from "@/components/form/FormField";
import { UseFormRegister, FieldValues, FieldPath } from "react-hook-form";

interface PhoneInputFieldProps<T extends FieldValues> {
  prefixLabel?: string;
  numberLabel?: string;
  prefixName: FieldPath<T>;
  numberName: FieldPath<T>;
  register: UseFormRegister<T>;
  prefixError?: any;
  numberError?: any;
  optional?: boolean;
}

const POPULAR_PREFIXES = [
  { label: "🇨🇭 Switzerland (+41)", value: "+41" },
  { label: "🇫🇷 France (+33)", value: "+33" },
  { label: "🇩🇪 Germany (+49)", value: "+49" },
  { label: "🇮🇹 Italy (+39)", value: "+39" },
  { label: "🇦🇹 Austria (+43)", value: "+43" },
  { label: "🇬🇧 UK (+44)", value: "+44" },
  { label: "🇪🇸 Spain (+34)", value: "+34" },
  { label: "🇨🇭 Belgium (+32)", value: "+32" },
  { label: "🇳🇱 Netherlands (+31)", value: "+31" },
  { label: "🇱🇺 Luxembourg (+352)", value: "+352" },
];

export function PhoneInputField<T extends FieldValues>({
  prefixLabel = "Préfixe",
  numberLabel = "Numéro de téléphone",
  prefixName,
  numberName,
  register,
  prefixError,
  numberError,
  optional = false,
}: PhoneInputFieldProps<T>) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Prefix Input */}
        <div>
          <label className="text-foreground mb-2 block text-sm font-medium">
            {prefixLabel}
            {!optional && <span className="text-red-500">*</span>}
          </label>
          <div className="relative">
            <Phone className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 transform" />
            <input
              type="text"
              placeholder="+41"
              {...register(prefixName as any)}
              className={`bg-background placeholder:text-muted-foreground w-full rounded-md border py-2 pr-3 pl-9 focus:ring-2 focus:ring-offset-0 focus:outline-none ${
                prefixError
                  ? "border-red-500 focus:ring-red-500"
                  : "border-input focus:ring-sky-500"
              }`}
              list={`prefix-list-${prefixName}`}
            />
            <datalist id={`prefix-list-${prefixName}`}>
              {POPULAR_PREFIXES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </datalist>
          </div>
          {prefixError && (
            <p className="mt-1 text-sm text-red-500">{prefixError.message}</p>
          )}
        </div>

        {/* Number Input */}
        <div className="sm:col-span-2">
          <label className="text-foreground mb-2 block text-sm font-medium">
            {numberLabel}
            {!optional && <span className="text-red-500">*</span>}
          </label>
          <input
            type="tel"
            placeholder="79 123 45 67"
            {...register(numberName as any)}
            className={`bg-background placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-offset-0 focus:outline-none ${
              numberError
                ? "border-red-500 focus:ring-red-500"
                : "border-input focus:ring-sky-500"
            }`}
          />
          {numberError && (
            <p className="mt-1 text-sm text-red-500">{numberError.message}</p>
          )}
        </div>
      </div>
      <p className="text-muted-foreground text-xs">Exemple: +41 79 123 45 67</p>
    </div>
  );
}
