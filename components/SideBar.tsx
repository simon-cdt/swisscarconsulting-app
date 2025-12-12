"use server";

import { GetSidebarCount } from "@/lib/actions/sidebar";
import { AppSidebar } from "./AppSidebar";

export default async function SideBar() {
  const count = await GetSidebarCount();

  return (
    <AppSidebar
      intervention={count?.intervention}
      estimatePending={count?.estimatePending}
      estimateAccepted={count?.estimateAccepted}
      estimateDraft={count?.estimateDraft}
      estimateTodo={count?.estimateTodo}
    />
  );
}
