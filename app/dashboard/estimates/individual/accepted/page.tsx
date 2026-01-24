"use client";

import { useQuery } from "@tanstack/react-query";
import { FetchAllEstimates } from "@/types/types";
import EstimatesList from "@/components/EstimatesList";

function useEstimatesIndividualAccepted() {
  return useQuery({
    queryKey: ["estimates_individual_accepted"],
    queryFn: async (): Promise<FetchAllEstimates> => {
      const response = await fetch(`/api/estimates/individual/accepted`);
      return await response.json();
    },
  });
}

export default function EstimateIndividualAccepted() {
  const {
    data: estimates,
    isLoading,
    isError,
    refetch,
  } = useEstimatesIndividualAccepted();

  return (
    <EstimatesList
      estimates={estimates}
      isLoading={isLoading}
      isError={isError}
      refetch={refetch}
      label="Devis acceptés"
      description="Consultez les devis acceptés"
    />
  );
}
