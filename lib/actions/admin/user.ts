"use server";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { Role } from "@/generated/prisma/enums";
import bcrypt from "bcrypt";

export const deleteUser = async ({
  userId,
}: {
  userId: string;
}): Promise<
  | { success: false; message: string }
  | { success: true; message: "L'utilisateur a bien été désactivé" }
> => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return { success: false, message: "Vous n'êtes pas autorisé" };
    }

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, message: "L'utilisateur n'existe pas" };
    }

    await db.user.update({
      where: { id: userId },
      data: {
        desactivated: true,
      },
    });

    return { success: true, message: "L'utilisateur a bien été désactivé" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Une erreur est survenue" };
  }
};

export const updateUser = async ({
  user,
}: {
  user: { id: string; username: string; role: Role };
}): Promise<
  | { success: false; message: string }
  | { success: true; message: "L'utilisateur a bien été modifié" }
> => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return { success: false, message: "Vous n'êtes pas autorisé" };
    }

    const findUser = await db.user.findUnique({
      where: { id: user.id },
    });

    if (!findUser) {
      return { success: false, message: "L'utilisateur n'existe pas" };
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        username: user.username,
        role: user.role,
      },
    });

    return { success: true, message: "L'utilisateur a bien été modifié" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Une erreur est survenue" };
  }
};

export const updatePasswordUser = async ({
  user,
}: {
  user: { id: string; password: string };
}): Promise<
  | { success: false; message: string }
  | { success: true; message: "Le mot de passe a bien été modifié" }
> => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return { success: false, message: "Vous n'êtes pas autorisé" };
    }

    const findUser = await db.user.findUnique({
      where: { id: user.id },
    });

    if (!findUser) {
      return { success: false, message: "L'utilisateur n'existe pas" };
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);

    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    return { success: true, message: "Le mot de passe a bien été modifié" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Une erreur est survenue" };
  }
};

export const createUser = async ({
  user,
}: {
  user: { username: string; role: Role; password: string };
}): Promise<
  | { success: false; message: string }
  | { success: true; message: "L'utilisateur a bien été créé" }
> => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return { success: false, message: "Vous n'êtes pas autorisé" };
    }

    const findUser = await db.user.findUnique({
      where: { username: user.username },
    });

    if (findUser) {
      return { success: false, message: "L'utilisateur existe déjà" };
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);

    await db.user.create({
      data: {
        username: user.username,
        password: hashedPassword,
        role: user.role,
      },
    });

    return { success: true, message: "L'utilisateur a bien été créé" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Une erreur est survenue" };
  }
};
