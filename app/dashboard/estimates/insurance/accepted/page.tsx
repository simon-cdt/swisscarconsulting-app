"use client";

import { useQuery } from "@tanstack/react-query";
import { FetchAllEstimates } from "@/types/types";
import EstimatesList from "@/components/EstimatesList";

function useEstimatesInsuranceAccepted() {
  return useQuery({
    queryKey: ["estimates_insurance_accepted"],
    queryFn: async (): Promise<FetchAllEstimates> => {
      const response = await fetch(`/api/estimates/insurance/accepted`);
      return await response.json();
    },
  });
}

export default function EstimateInsuranceAccepted() {
  const {
    data: estimates,
    isLoading,
    isError,
    refetch,
  } = useEstimatesInsuranceAccepted();

  return (
    <EstimatesList
      estimates={estimates}
      isLoading={isLoading}
      isError={isError}
      refetch={refetch}
      label="Devis terminés"
      description="Consultez les devis d'assurance terminés"
    />
  );
}
