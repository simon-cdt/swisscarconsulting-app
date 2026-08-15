"use client";

import { useState, useEffect, useRef } from "react";
import { FormField } from "./FormField";
import type { UseFormSetValue, FieldError } from "react-hook-form";

type Suggestion = {
  label: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
};

export function AddressAutocomplete<T extends Record<string, unknown>>({
  register,
  setValue,
  error,
  fieldName = "address",
  postalCodeField = "postalCode",
  cityField = "city",
  countryField = "country",
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  setValue: UseFormSetValue<T>;
  error?: FieldError;
  fieldName?: string;
  postalCodeField?: string;
  cityField?: string;
  countryField?: string;
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();

    // NOUVEAU — tout est désormais dans le setTimeout, plus rien
    // n'appelle setState de façon synchrone au moment où l'effet s'exécute.
    const timeout = setTimeout(async () => {
      if (query.trim().length < 3) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const res = await fetch(
          `/api/address/autocomplete?q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );
        const data = await res.json();
        setSuggestions(data.suggestions || []);
        setShowSuggestions(true);
      } catch (error) {
        // On ignore les erreurs dues à l'annulation (nouvelle frappe pendant le fetch)
        if ((error as Error).name !== "AbortError") {
          console.error("Erreur lors de la recherche d'adresse:", error);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (suggestion: Suggestion) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue(fieldName as any, suggestion.address as any, {
      shouldValidate: true,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue(postalCodeField as any, suggestion.postalCode as any, {
      shouldValidate: true,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue(cityField as any, suggestion.city as any, {
      shouldValidate: true,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue(countryField as any, suggestion.country as any, {
      shouldValidate: true,
    });

    setQuery(suggestion.address);
    setShowSuggestions(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <FormField
        label="Adresse"
        name={fieldName}
        type="text"
        register={register}
        error={error}
        placeholder="Rue des Marronniers 12"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setQuery(e.target.value);
        }}
      />

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="cursor-pointer px-3 py-2 text-sm hover:bg-sky-50"
              onClick={() => handleSelect(suggestion)}
            >
              {suggestion.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
