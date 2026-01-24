"use client";

import { useQuery } from "@tanstack/react-query";
import EstimatesList from "@/components/EstimatesList";
import { FetchAllEstimates } from "@/types/types";

function useEstimatesIndividualPending() {
  return useQuery({
    queryKey: ["estimates_individual_pending"],
    queryFn: async (): Promise<FetchAllEstimates> => {
      const response = await fetch(`/api/estimates/individual/pending`);
      return await response.json();
    },
  });
}

export default function EstimateIndividualPending() {
  const {
    data: estimates,
    isLoading,
    isError,
    refetch,
  } = useEstimatesIndividualPending();

  return (
    <EstimatesList
      estimates={estimates}
      isLoading={isLoading}
      isError={isError}
      refetch={refetch}
      label="Devis en attente d'acceptation du client"
      description="Consultez les devis en attente"
    />
  );
}
