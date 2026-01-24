"use client";

import { useQuery } from "@tanstack/react-query";
import { FetchAllEstimates } from "@/types/types";
import EstimatesList from "@/components/EstimatesList";

function useEstimatesIndividualDraft() {
  return useQuery({
    queryKey: ["estimates_individual_draft"],
    queryFn: async (): Promise<FetchAllEstimates> => {
      const response = await fetch(`/api/estimates/individual/draft`);
      return await response.json();
    },
  });
}

export default function EstimateIndividualDraft() {
  const {
    data: estimates,
    isLoading,
    isError,
    refetch,
  } = useEstimatesIndividualDraft();

  return (
    <EstimatesList
      estimates={estimates}
      isLoading={isLoading}
      isError={isError}
      refetch={refetch}
      label="Devis en brouillon"
      description="Consultez les devis en brouillon"
    />
  );
}
