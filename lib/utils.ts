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

export const capitalizeFirstLetterInHtml = (html: string): string => {
  if (!html) return html;

  let result = "";
  let inTag = false;
  let inEntity = false;
  let capitalized = false;

  for (let i = 0; i < html.length; i++) {
    const char = html[i];

    if (char === "<") {
      inTag = true;
    } else if (char === ">") {
      inTag = false;
    } else if (char === "&" && !inTag) {
      inEntity = true;
    } else if (char === ";" && inEntity) {
      inEntity = false;
    }

    if (!inTag && !inEntity && !capitalized && /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(char)) {
      result += char.toUpperCase();
      capitalized = true;
      continue;
    }

    result += char;
  }

  return result;
};

export const formatAddress = (str: string): string => {
  const formatted = str
    .replace(/(\d)([a-zA-Z\u00c0-\u00ff])/g, "$1 $2")
    .replace(/([a-zA-Z\u00c0-\u00ff])(\d)/g, "$1 $2");
  return capitalize(formatted);
};

export const formatFullPhoneNumber = (
  prefix: string,
  number: string,
): string => {
  if (!prefix || !number) return "";

  // Nettoyer le préfixe et le numéro
  const cleanedPrefix = prefix.replace(/\D/g, "");
  const cleanedNumber = number.replace(/\D/g, "");

  // Combiner prefix et number
  const fullPhone = cleanedPrefix + cleanedNumber;

  // Format suisse: +CC NN NNN NN NN (ex: +41 76 504 67 47)
  if (fullPhone.startsWith("41") && fullPhone.length === 11) {
    return `+${fullPhone.slice(0, 2)} ${fullPhone.slice(2, 4)} ${fullPhone.slice(4, 7)} ${fullPhone.slice(7, 9)} ${fullPhone.slice(9)}`;
  }

  // Format par défaut: +prefix NN NNN NN NN
  return `+${cleanedPrefix} ${cleanedNumber.slice(0, 2)} ${cleanedNumber.slice(2, 5)} ${cleanedNumber.slice(5, 7)} ${cleanedNumber.slice(7)}`.trim();
};

export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return "";

  // Nettoyer le numéro en supprimant les espaces et caractères spéciaux
  const cleanedPhone = phone.replace(/\D/g, "");

  // Format suisse: +CC NN NNN NN NN (ex: +41 76 504 67 47)
  if (cleanedPhone.startsWith("41") && cleanedPhone.length === 11) {
    return `+${cleanedPhone.slice(0, 2)} ${cleanedPhone.slice(2, 4)} ${cleanedPhone.slice(4, 7)} ${cleanedPhone.slice(7, 9)} ${cleanedPhone.slice(9)}`;
  }

  // Format par défaut: espaces tous les 2 chiffres
  let formattedPhone = "";
  for (let i = 0; i < cleanedPhone.length; i++) {
    if (i > 0 && i % 2 === 0) {
      formattedPhone += " ";
    }
    formattedPhone += cleanedPhone[i];
  }

  return formattedPhone;
};
