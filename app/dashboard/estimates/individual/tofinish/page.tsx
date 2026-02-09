"use client";

import { useQuery } from "@tanstack/react-query";
import { FetchAllEstimates } from "@/types/types";
import EstimatesList from "@/components/EstimatesList";

function useEstimatesIndividualToFinish() {
  return useQuery({
    queryKey: ["estimates_individual_tofinish"],
    queryFn: async (): Promise<FetchAllEstimates> => {
      const response = await fetch(`/api/estimates/individual/tofinish`);
      return await response.json();
    },
  });
}

export default function EstimateIndividualToFinish() {
  const {
    data: estimates,
    isLoading,
    isError,
    refetch,
  } = useEstimatesIndividualToFinish();

  return (
    <EstimatesList
      estimates={estimates}
      isLoading={isLoading}
      isError={isError}
      refetch={refetch}
      label="Devis à finir"
      description="Consultez les devis à finir"
    />
  );
}
