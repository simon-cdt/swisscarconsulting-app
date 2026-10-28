"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { normalizeCountryName } from "@/lib/utils";
import { db } from "../db";

const normalizePhoneNumber = (value: string) => value.replace(/\s/g, "");
const normalizeAddress = (value?: string | null) => value?.trim().toLowerCase();

// ============ FONCTIONS DE VÉRIFICATION (AVANT LES AUTRES) ============

export const checkClientIndividualExists = async ({
  firstName,
  name,
  phonePrefix,
  phoneNumber,
  email,
  address,
}: {
  firstName: string;
  name: string;
  phonePrefix: string;
  phoneNumber: string;
  email: string;
  address?: string;
}): Promise<
  | { exists: false }
  | {
      exists: true;
      message: string;
      existingClient: {
        id: number;
        firstName: string | null;
        name: string | null;
        email: string;
        phoneNumber: string;
        address: string | null;
      };
      conflicts: string[];
    }
> => {
  try {
    const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);

    const allClients = await db.client.findMany({
      select: {
        id: true,
        typeClient: true,
        firstName: true,
        name: true,
        companyName: true,
        email: true,
        phoneNumber: true,
        phonePrefix: true,
        address: true,
      },
    });

    const existingClient =
      allClients.find((client) => {
        const sameEmail = client.email?.toLowerCase() === email.toLowerCase();
        const samePhone =
          client.phonePrefix === phonePrefix &&
          normalizePhoneNumber(client.phoneNumber) === normalizedPhoneNumber;
        const sameAddress =
          !!address &&
          normalizeAddress(client.address) === normalizeAddress(address);
        const sameName =
          client.firstName?.toLowerCase() === firstName.toLowerCase() &&
          client.name?.toLowerCase() === name.toLowerCase();
        return sameEmail || samePhone || sameAddress || sameName;
      }) || null;

    if (existingClient) {
      const conflicts = [
        existingClient.email?.toLowerCase() === email.toLowerCase() &&
          "l'adresse e-mail",
        existingClient.phonePrefix === phonePrefix &&
          normalizePhoneNumber(existingClient.phoneNumber) ===
            normalizedPhoneNumber &&
          "le numéro de téléphone",
        !!address &&
          normalizeAddress(existingClient.address) ===
            normalizeAddress(address) &&
          "l'adresse",
        existingClient.firstName?.toLowerCase() === firstName.toLowerCase() &&
          existingClient.name?.toLowerCase() === name.toLowerCase() &&
          "le prénom et le nom",
      ].filter((conflict): conflict is string => Boolean(conflict));
      return {
        exists: true,
        message: `Les informations suivantes existent déjà : ${conflicts.join(", ")}.`,
        conflicts,
        existingClient,
      };
    }

    return { exists: false };
  } catch (error) {
    console.error(error);
    return { exists: false };
  }
};

export const checkCompanyExists = async ({
  companyName,
  phonePrefix,
  phoneNumber,
  email,
  address,
}: {
  companyName: string;
  phonePrefix: string;
  phoneNumber: string;
  email: string;
  address?: string;
}): Promise<
  | { exists: false }
  | {
      exists: true;
      message: string;
      existingClient: {
        id: number;
        companyName: string | null;
        email: string;
        phoneNumber: string;
        address: string | null;
      };
      conflicts: string[];
    }
> => {
  try {
    const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);

    const allClients = await db.client.findMany({
      select: {
        id: true,
        typeClient: true,
        companyName: true,
        email: true,
        phoneNumber: true,
        phonePrefix: true,
        address: true,
      },
    });

    const existingClient =
      allClients.find((client) => {
        const sameEmail = client.email?.toLowerCase() === email.toLowerCase();
        const samePhone =
          client.phonePrefix === phonePrefix &&
          normalizePhoneNumber(client.phoneNumber) === normalizedPhoneNumber;
        const sameAddress =
          !!address &&
          normalizeAddress(client.address) === normalizeAddress(address);
        const sameCompanyName =
          client.companyName?.toLowerCase() === companyName.toLowerCase();
        return sameEmail || samePhone || sameAddress || sameCompanyName;
      }) || null;

    if (existingClient) {
      const conflicts = [
        existingClient.email?.toLowerCase() === email.toLowerCase() &&
          "l'adresse e-mail",
        existingClient.phonePrefix === phonePrefix &&
          normalizePhoneNumber(existingClient.phoneNumber) ===
            normalizedPhoneNumber &&
          "le numéro de téléphone",
        !!address &&
          normalizeAddress(existingClient.address) ===
            normalizeAddress(address) &&
          "l'adresse",
        existingClient.companyName?.toLowerCase() ===
          companyName.toLowerCase() && "le nom de l'entreprise",
      ].filter((conflict): conflict is string => Boolean(conflict));
      return {
        exists: true,
        message: `Les informations suivantes existent déjà : ${conflicts.join(", ")}.`,
        conflicts,
        existingClient,
      };
    }

    return { exists: false };
  } catch (error) {
    console.error(error);
    return { exists: false };
  }
};

// ============ FONCTIONS DE CRÉATION ============

export const addClientIndividual = async ({
  data,
  forceCreate = false,
}: {
  data: {
    firstName: string;
    name: string;
    email: string;
    phonePrefix: string;
    phoneNumber: string;
    phone2Prefix?: string;
    phone2Number?: string;
    address?: string;
    postalCode?: number;
    city?: string;
    country?: string;
  };
  forceCreate?: boolean;
}): Promise<
  | { success: false; message: string }
  | { success: true; message: "Le client a bien été ajouté"; clientId: number }
> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.id) {
      return { success: false, message: "Vous n'êtes pas connecté" };
    }

    // Vérifier si le client existe déjà
    const checkResult = await checkClientIndividualExists({
      firstName: data.firstName,
      name: data.name,
      phonePrefix: data.phonePrefix,
      phoneNumber: data.phoneNumber,
      email: data.email,
      address: data.address,
    });

    if (checkResult.exists && !forceCreate) {
      return { success: false, message: checkResult.message };
    }

    const lastClient = await db.client.findFirst({
      orderBy: { id: "desc" },
      select: { id: true },
    });

    const client = await db.client.create({
      data: {
        id: lastClient ? lastClient.id + 1 : 1,
        typeClient: "individual",
        name: data.name,
        firstName: data.firstName,
        email: data.email,
        phonePrefix: data.phonePrefix,
        phoneNumber: data.phoneNumber,
        phone2Prefix: data.phone2Prefix,
        phone2Number: data.phone2Number,
        address: data.address,
        postalCode: data.postalCode,
        city: data.city,
        country: normalizeCountryName(data.country),
      },
      select: { id: true },
    });

    if (!client.id) {
      return { success: false, message: "Le client n'a pas été ajouté" };
    }

    return {
      success: true,
      message: "Le client a bien été ajouté",
      clientId: client.id,
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Une erreur est survenue." };
  }
};

export const addClientCompany = async ({
  data,
  forceCreate = false,
}: {
  data: {
    companyName: string;
    email: string;
    phonePrefix: string;
    phoneNumber: string;
    phone2Prefix?: string;
    phone2Number?: string;
    contactFirstName: string;
    contactName: string;
    address?: string;
    postalCode?: number;
    city?: string;
    country?: string;
  };
  forceCreate?: boolean;
}): Promise<
  | { success: false; message: string }
  | { success: true; message: "Le client a bien été ajouté"; clientId: number }
> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.id) {
      return { success: false, message: "Vous n'êtes pas connecté" };
    }

    // Vérifier si l'entreprise existe déjà
    const checkResult = await checkCompanyExists({
      companyName: data.companyName,
      phonePrefix: data.phonePrefix,
      phoneNumber: data.phoneNumber,
      email: data.email,
      address: data.address,
    });

    if (checkResult.exists && !forceCreate) {
      return { success: false, message: checkResult.message };
    }

    const lastClient = await db.client.findFirst({
      orderBy: { id: "desc" },
      select: { id: true },
    });

    const client = await db.client.create({
      data: {
        id: lastClient ? lastClient.id + 1 : 1,
        typeClient: "company",
        companyName: data.companyName,
        email: data.email,
        phonePrefix: data.phonePrefix,
        phoneNumber: data.phoneNumber,
        phone2Prefix: data.phone2Prefix,
        phone2Number: data.phone2Number,
        contactFirstName: data.contactFirstName,
        contactName: data.contactName,
        address: data.address,
        postalCode: data.postalCode,
        city: data.city,
        country: normalizeCountryName(data.country),
      },
      select: { id: true },
    });

    if (!client.id) {
      return { success: false, message: "Le client n'a pas été ajouté" };
    }

    return {
      success: true,
      message: "Le client a bien été ajouté",
      clientId: client.id,
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Une erreur est survenue." };
  }
};

// ============ FONCTIONS DE MISE À JOUR ============

export const updateClientIndividual = async ({
  clientId,
  data,
}: {
  clientId: number;
  data: {
    name: string;
    firstName: string;
    email: string;
    phonePrefix: string;
    phoneNumber: string;
    phone2Prefix?: string;
    phone2Number?: string;
    address?: string;
    postalCode?: number;
    city?: string;
    country?: string;
  };
}): Promise<
  | { success: false; message: string }
  | { success: true; message: "Le client a bien été mis à jour" }
> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.id) {
      return { success: false, message: "Vous n'êtes pas connecté" };
    }

    await db.client.update({
      where: { id: clientId },
      data: {
        name: data.name,
        firstName: data.firstName,
        email: data.email,
        phonePrefix: data.phonePrefix,
        phoneNumber: data.phoneNumber,
        phone2Prefix: data.phone2Prefix,
        phone2Number: data.phone2Number,
        address: data.address,
        postalCode: data.postalCode === undefined ? null : data.postalCode,
        city: data.city,
        country: normalizeCountryName(data.country),
        typeClient: "individual",
      },
    });

    return {
      success: true,
      message: "Le client a bien été mis à jour",
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Une erreur est survenue." };
  }
};

export const updateClientCompany = async ({
  clientId,
  data,
}: {
  clientId: number;
  data: {
    companyName: string;
    email: string;
    phonePrefix: string;
    phoneNumber: string;
    phone2Prefix?: string;
    phone2Number?: string;
    contactFirstName: string;
    contactName: string;
    address?: string;
    postalCode?: number;
    city?: string;
    country?: string;
  };
}): Promise<
  | { success: false; message: string }
  | { success: true; message: "Le client a bien été mis à jour" }
> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.id) {
      return { success: false, message: "Vous n'êtes pas connecté" };
    }

    await db.client.update({
      where: { id: clientId },
      data: {
        companyName: data.companyName,
        email: data.email,
        phonePrefix: data.phonePrefix,
        phoneNumber: data.phoneNumber,
        phone2Prefix: data.phone2Prefix,
        phone2Number: data.phone2Number,
        contactFirstName: data.contactFirstName,
        contactName: data.contactName,
        address: data.address,
        postalCode: data.postalCode === undefined ? null : data.postalCode,
        city: data.city,
        country: normalizeCountryName(data.country),
        typeClient: "company",
      },
    });

    return {
      success: true,
      message: "Le client a bien été mis à jour",
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Une erreur est survenue." };
  }
};
