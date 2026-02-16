"use server";

import { GetSidebarCount } from "@/lib/actions/sidebar";
import { AppSidebar } from "./AppSidebar";

export default async function SideBar() {
  const count = await GetSidebarCount();

  return (
    <AppSidebar
      intervention={count?.intervention}
      estimateIndividualPending={count?.estimateIndividualPending}
      estimateIndividualAccepted={count?.estimateIndividualAccepted}
      estimateIndividualToFinish={count?.estimateIndividualToFinish}
      estimateInsuranceAccepted={count?.estimateInsuranceAccepted}
      estimateInsuranceToFinish={count?.estimateInsuranceToFinish}
      estimateSentGarage={count?.estimateSentGarage}
      invoicePending={count?.invoicePending}
      invoicePaid={count?.invoicePaid}
    />
  );
}
