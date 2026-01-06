import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatLicensePlate = (value: string) => {
  // Supprimer tous les caractères non alphanumériques
  const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "");

  if (cleaned.length === 0) return "";

  let formatted = "";

  for (let i = 0; i < cleaned.length; i++) {
    const currentChar = cleaned[i];
    const prevChar = cleaned[i - 1];

    // Ajouter un espace si on passe d'une lettre à un chiffre ou vice-versa
    if (i > 0) {
      const currentIsDigit = /\d/.test(currentChar);
      const prevIsDigit = /\d/.test(prevChar);

      if (currentIsDigit !== prevIsDigit) {
        formatted += " ";
      }
    }

    formatted += currentChar;
  }

  return formatted;
};
