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
      estimateIndividualDraft={count?.estimateIndividualDraft}
      estimateIndividualTodo={count?.estimateIndividualTodo}
      estimateInsuranceAccepted={count?.estimateInsuranceAccepted}
      estimateInsuranceDraft={count?.estimateInsuranceDraft}
      estimateInsuranceTodo={count?.estimateInsuranceTodo}
      estimateSentGarage={count?.estimateSentGarage}
    />
  );
}
