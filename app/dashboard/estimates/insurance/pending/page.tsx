"use client";

import { useQuery } from "@tanstack/react-query";
import EstimatesList from "@/components/EstimatesList";
import { FetchAllEstimates } from "@/types/types";

function useEstimatesInsurancePending() {
  return useQuery({
    queryKey: ["estimates_insurance_pending"],
    queryFn: async (): Promise<FetchAllEstimates> => {
      const response = await fetch(`/api/estimates/insurance/pending`);
      return await response.json();
    },
  });
}

export default function EstimateInsurancePending() {
  const {
    data: estimates,
    isLoading,
    isError,
    refetch,
  } = useEstimatesInsurancePending();

  return (
    <EstimatesList
      estimates={estimates}
      isLoading={isLoading}
      isError={isError}
      refetch={refetch}
      label="Devis d'assurance en attente d'acceptation"
      description="Consultez les devis d'assurance en attente"
    />
  );
}
