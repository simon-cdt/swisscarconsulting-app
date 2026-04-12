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
          deleted: false,
        },
      });
      const estimateIndividualToFinish = await db.estimate.count({
        where: {
          status: "TOFINISH",
          type: "INDIVIDUAL",
          deleted: false,
        },
      });
      const estimateIndividualAccepted = await db.estimate.count({
        where: {
          status: "ACCEPTED",
          type: "INDIVIDUAL",
          deleted: false,
        },
      });

      const estimateInsuranceToFinish = await db.estimate.count({
        where: {
          status: "TOFINISH",
          type: "INSURANCE",
          deleted: false,
        },
      });

      const estimateInsurancePending = await db.estimate.count({
        where: {
          status: "PENDING",
          type: "INSURANCE",
          deleted: false,
        },
      });

      const estimateInsuranceAccepted = await db.estimate.count({
        where: {
          status: "ACCEPTED",
          type: "INSURANCE",
          deleted: false,
        },
      });

      const estimateSentGarage = await db.estimate.count({
        where: {
          status: "SENT_TO_GARAGE",
          deleted: false,
        },
      });

      const invoicePending = await db.invoice.count({
        where: {
          status: "PENDING_PAYMENT",
        },
      });

      const invoicePaid = await db.invoice.count({
        where: {
          status: "PAID",
        },
      });

      return {
        intervention,
        estimateIndividualPending,
        estimateIndividualToFinish,
        estimateIndividualAccepted,
        estimateInsuranceToFinish,
        estimateInsurancePending,
        estimateInsuranceAccepted,
        estimateSentGarage,
        invoicePending,
        invoicePaid,
      };
    }
  } catch (error) {
    console.error(error);
  }
};
