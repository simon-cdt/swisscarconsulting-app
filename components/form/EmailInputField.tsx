"use client";

import { useState, useRef, useEffect } from "react";
import { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { Mail } from "lucide-react";

const EMAIL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "icloud.com",
  "outlook.com",
  "hotmail.com",
  "bluewin.ch",
];

type EmailInputFieldProps = {
  name: string;
  label: string;
  register: any;
  setValue: any;
  error?: FieldError;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function EmailInputField({
  name,
  label,
  register,
  setValue,
  error,
  placeholder = "exemple@mail.com",
  onChange,
}: EmailInputFieldProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredDomains, setFilteredDomains] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Appeler le onChange personnalisé s'il existe
    onChange?.(e);

    // Extraire la partie avant le @
    const atIndex = value.indexOf("@");

    if (atIndex === -1) {
      // Pas encore de @, ne pas afficher les suggestions
      setShowSuggestions(false);
      setFilteredDomains([]);
    } else {
      // Il y a un @, afficher les suggestions
      const beforeAt = value.substring(0, atIndex);
      if (beforeAt.length > 0) {
        setShowSuggestions(true);
        setFilteredDomains(EMAIL_DOMAINS);
      }
    }
  };

  const handleSelectDomain = (domain: string) => {
    const atIndex = inputValue.indexOf("@");
    if (atIndex !== -1) {
      const beforeAt = inputValue.substring(0, atIndex);
      const newValue = `${beforeAt}@${domain}`;

      // Mettre à jour avec setValue de react-hook-form
      setValue(name, newValue);
      setInputValue(newValue);

      setShowSuggestions(false);
      setFilteredDomains([]);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative mt-1">
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            type="email"
            placeholder={placeholder}
            {...register(name)}
            onChange={handleInputChange}
            className={`w-full rounded-lg border px-3 py-2 pl-9 text-sm transition-all ${
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            } focus:ring-1 focus:outline-none`}
          />
          <Mail className="absolute left-3 h-4 w-4 text-gray-400" />
        </div>

        {showSuggestions && filteredDomains.length > 0 && (
          <div className="absolute top-full right-0 left-0 z-50 mt-1 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
            {filteredDomains.map((domain) => (
              <button
                key={domain}
                type="button"
                onClick={() => handleSelectDomain(domain)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50 focus:outline-none active:bg-blue-100"
              >
                <span className="text-gray-400">
                  {inputValue.substring(0, inputValue.indexOf("@"))}
                </span>
                <span className="text-gray-600">@</span>
                <span className="font-medium text-gray-900">{domain}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-xs text-red-500">{error.message}</p>}
    </div>
  );
}
