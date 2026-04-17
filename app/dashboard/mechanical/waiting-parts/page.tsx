"use client";

import { useQuery } from "@tanstack/react-query";
import { FetchAllEstimates } from "@/types/types";
import EstimatesList from "@/components/EstimatesList";

function useEstimatesWaitingParts() {
  return useQuery({
    queryKey: ["estimates_waiting-parts"],
    queryFn: async (): Promise<FetchAllEstimates> => {
      const response = await fetch(`/api/estimates/waiting-parts`);
      return await response.json();
    },
  });
}

export default function EstimateWaitingParts() {
  const {
    data: estimates,
    isLoading,
    isError,
    refetch,
  } = useEstimatesWaitingParts();

  return (
    <EstimatesList
      estimates={estimates}
      isLoading={isLoading}
      isError={isError}
      refetch={refetch}
      label="Véhicules en attente de pièces"
      description="Consultez les véhicules qui attendent l'arrivée des pièces commandées"
    />
  );
}
