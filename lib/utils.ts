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

export const formatExpertiseDate = (value: string) => {
  // Supprimer tous les caractères non numériques
  const cleaned = value.replace(/\D/g, "");

  if (cleaned.length === 0) return "";

  let formatted = "";

  for (let i = 0; i < cleaned.length && i < 8; i++) {
    // Limiter à 8 chiffres (ddmmaaaa)
    if (i === 2 || i === 4) {
      formatted += "/";
    }
    formatted += cleaned[i];
  }

  return formatted;
};

export const formatRegistrationNumber = (value: string) => {
  // Supprimer tous les caractères non numériques
  const cleaned = value.replace(/\D/g, "");

  if (cleaned.length === 0) return "";

  let formatted = "";

  for (let i = 0; i < cleaned.length; i++) {
    // Ajouter un point après chaque série de 3 chiffres (sauf à la fin)
    if (i > 0 && i % 3 === 0) {
      formatted += ".";
    }
    formatted += cleaned[i];
  }

  return formatted;
};

export const formatPhoneNumber = (phone: string) => {
  // Si le numéro commence par +41, formater comme +41 76 123 45 67
  if (phone.startsWith("+41")) {
    const cleaned = phone.replace(/\D/g, ""); // Supprimer tous les non-chiffres
    if (cleaned.length === 11) {
      // +41 (2) + 9 chiffres
      return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`;
    }
    return phone;
  }

  // Si le numéro commence par 0, formater comme 076 123 45 67
  if (phone.startsWith("0")) {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8)}`;
    }
    return phone;
  }

  return phone;
};

export const toCamelCase = (str: string): string => {
  return str
    .toLowerCase()
    .split(/[\s-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const capitalize = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const formatAddress = (str: string): string => {
  const formatted = str
    .replace(/(\d)([a-zA-Z\u00c0-\u00ff])/g, "$1 $2")
    .replace(/([a-zA-Z\u00c0-\u00ff])(\d)/g, "$1 $2");
  return capitalize(formatted);
};
