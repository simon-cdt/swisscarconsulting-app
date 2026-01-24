"use client";

import { useQuery } from "@tanstack/react-query";
import { FetchAllEstimates } from "@/types/types";
import EstimatesList from "@/components/EstimatesList";

function useEstimatesInsuranceDraft() {
  return useQuery({
    queryKey: ["estimates_Insurance_draft"],
    queryFn: async (): Promise<FetchAllEstimates> => {
      const response = await fetch(`/api/estimates/insurance/draft`);
      return await response.json();
    },
  });
}

export default function EstimateInsuranceDraft() {
  const {
    data: estimates,
    isLoading,
    isError,
    refetch,
  } = useEstimatesInsuranceDraft();

  return (
    <EstimatesList
      estimates={estimates}
      isLoading={isLoading}
      isError={isError}
      refetch={refetch}
      label="Devis en brouillon"
      description="Consultez les devis d'assurance en brouillon"
    />
  );
}
