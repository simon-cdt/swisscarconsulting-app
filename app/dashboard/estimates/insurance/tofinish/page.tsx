"use client";

import { useQuery } from "@tanstack/react-query";
import { FetchAllEstimates } from "@/types/types";
import EstimatesList from "@/components/EstimatesList";

function useEstimatesInsuranceToFinish() {
  return useQuery({
    queryKey: ["estimates_insurance_tofinish"],
    queryFn: async (): Promise<FetchAllEstimates> => {
      const response = await fetch(`/api/estimates/insurance/tofinish`);
      return await response.json();
    },
  });
}

export default function EstimateInsuranceToFinish() {
  const {
    data: estimates,
    isLoading,
    isError,
    refetch,
  } = useEstimatesInsuranceToFinish();

  return (
    <EstimatesList
      estimates={estimates}
      isLoading={isLoading}
      isError={isError}
      refetch={refetch}
      label="Devis à finir"
      description="Consultez les devis d'assurance à finir"
    />
  );
}
