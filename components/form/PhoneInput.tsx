"use client";

import { useState } from "react";
import ReactPhoneInput from "react-phone-number-input";
import {
  FieldError,
  UseFormRegister,
  Controller,
  Control,
} from "react-hook-form";
import { Label } from "@/components/ui/label";
import { useEffect } from "react";

interface PhoneInputProps {
  label: string;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control?: Control<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register?: UseFormRegister<any>;
  error?: FieldError;
  defaultValue?: string;
  nonempty?: boolean;
  optional?: boolean;
}

export const PhoneInput = ({
  label,
  name,
  control,
  error,
  defaultValue = "",
  nonempty,
  optional,
}: PhoneInputProps) => {
  const [value, setValue] = useState<string | undefined>(
    defaultValue || undefined,
  );

  // Ajouter les styles pour les drapeaux au montage du composant
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .PhoneInputCountryIcon {
        width: 1rem !important;
        height: 0.75rem !important;
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  // Si control est fourni, utiliser Controller pour l'intégration avec react-hook-form
  if (control) {
    return (
      <div className="flex flex-col gap-2">
        <Label>
          <p>
            {label}
            {nonempty && <span className="text-red-500">*</span>}
            {optional && (
              <span className="ml-1 text-xs text-gray-500">(optionnel)</span>
            )}
          </p>
        </Label>
        <Controller
          control={control}
          name={name}
          rules={{
            validate: (val) => {
              if (nonempty && !val) {
                return "Le numéro de téléphone est requis.";
              }
              if (val && val.length < 7) {
                return "Le numéro de téléphone doit contenir au moins 7 chiffres";
              }
              return true;
            },
          }}
          render={({ field }) => (
            <>
              <ReactPhoneInput
                {...field}
                defaultCountry="CH"
                placeholder="Enter phone number"
                value={field.value || ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                className={`bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                  error ? "border-red-500" : "border-input"
                }`}
              />
              {error && <p className="text-sm text-red-500">{error.message}</p>}
            </>
          )}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Label>
        <p>
          {label}
          {nonempty && <span className="text-red-500">*</span>}
          {optional && (
            <span className="ml-1 text-xs text-gray-500">(optionnel)</span>
          )}
        </p>
      </Label>
      <ReactPhoneInput
        defaultCountry="CH"
        placeholder="Enter phone number"
        value={value}
        onChange={setValue}
        className={`bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
          error ? "border-red-500" : "border-input"
        }`}
      />
      {error && <p className="text-sm text-red-500">{error.message}</p>}
    </div>
  );
};
