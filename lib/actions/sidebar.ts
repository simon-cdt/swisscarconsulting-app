"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { db } from "../db";

export const GetSidebarCount = async () => {
  try {
    const session = await getServerSession(authOptions);
    if (session) {
      const intervention = await db.intervention.count({
        where: {
          NOT: {
            estimates: {
              some: {},
            },
          },
        },
      });
      const estimatePending = await db.estimate.count({
        where: {
          status: "PENDING",
        },
      });
      const estimateDraft = await db.estimate.count({
        where: {
          status: "DRAFT",
        },
      });
      const estimateAccepted = await db.estimate.count({
        where: {
          status: "ACCEPTED",
        },
      });
      const estimateTodo = await db.estimate.count({
        where: {
          status: "TODO",
        },
      });
      return {
        intervention,
        estimatePending,
        estimateDraft,
        estimateAccepted,
        estimateTodo,
      };
    }
  } catch (error) {
    console.error(error);
  }
};
