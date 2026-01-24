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
          deleted: false,
        },
      });
      const estimateIndividualPending = await db.estimate.count({
        where: {
          status: "PENDING",
          type: "INDIVIDUAL",
        },
      });
      const estimateIndividualDraft = await db.estimate.count({
        where: {
          status: "DRAFT",
          type: "INDIVIDUAL",
        },
      });
      const estimateIndividualAccepted = await db.estimate.count({
        where: {
          status: "ACCEPTED",
          type: "INDIVIDUAL",
        },
      });
      const estimateIndividualTodo = await db.estimate.count({
        where: {
          status: "TODO",
          type: "INDIVIDUAL",
        },
      });

      const estimateInsuranceTodo = await db.estimate.count({
        where: {
          status: "TODO",
          type: "INSURANCE",
        },
      });
      const estimateInsuranceAccepted = await db.estimate.count({
        where: {
          status: "ACCEPTED",
          type: "INSURANCE",
        },
      });
      const estimateInsuranceDraft = await db.estimate.count({
        where: {
          status: "DRAFT",
          type: "INSURANCE",
        },
      });
      const estimateSentGarage = await db.estimate.count({
        where: {
          status: "SENT_TO_GARAGE",
        },
      });
      return {
        intervention,
        estimateIndividualPending,
        estimateIndividualDraft,
        estimateIndividualAccepted,
        estimateIndividualTodo,
        estimateInsuranceTodo,
        estimateInsuranceAccepted,
        estimateInsuranceDraft,
        estimateSentGarage,
      };
    }
  } catch (error) {
    console.error(error);
  }
};
