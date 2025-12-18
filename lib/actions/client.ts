"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "../db";

export const addClientIndividual = async ({
  data,
}: {
  data: {
    firstName: string;
    name: string;
    email: string;
    phone: string;
    address?: string;
    postalCode?: string;
    city?: string;
  };
}): Promise<
  | { success: false; message: string }
  | { success: true; message: "Le client a bien été ajouté"; clientId: string }
> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.id) {
      return { success: false, message: "Vous n'êtes pas connecté" };
    }

    const client = await db.client.create({
      data: {
        typeClient: "individual",
        name: data.name,
        firstName: data.firstName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        postalCode: data.postalCode,
        city: data.city,
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
}: {
  data: {
    companyName: string;
    email: string;
    phone: string;
    contactFirstName: string;
    contactName: string;
    address?: string;
    postalCode?: string;
    city?: string;
  };
}): Promise<
  | { success: false; message: string }
  | { success: true; message: "Le client a bien été ajouté"; clientId: string }
> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.id) {
      return { success: false, message: "Vous n'êtes pas connecté" };
    }

    const client = await db.client.create({
      data: {
        typeClient: "company",
        companyName: data.companyName,
        email: data.email,
        phone: data.phone,
        contactFirstName: data.contactFirstName,
        contactName: data.contactName,
        address: data.address,
        postalCode: data.postalCode,
        city: data.city,
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

export const updateClientIndividual = async ({
  clientId,
  data,
}: {
  clientId: string;
  data: {
    name: string;
    firstName: string;
    email: string;
    phone: string;
    address?: string;
    postalCode?: string;
    city?: string;
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
        phone: data.phone,
        address: data.address,
        postalCode: data.postalCode,
        city: data.city,
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
  clientId: string;
  data: {
    companyName: string;
    email: string;
    phone: string;
    contactFirstName: string;
    contactName: string;
    address?: string;
    postalCode?: string;
    city?: string;
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
        phone: data.phone,
        contactFirstName: data.contactFirstName,
        contactName: data.contactName,
        address: data.address,
        postalCode: data.postalCode,
        city: data.city,
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
