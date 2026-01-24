"use client";

import { useQuery } from "@tanstack/react-query";
import { FetchAllEstimates } from "@/types/types";
import EstimatesList from "@/components/EstimatesList";

function useEstimatesInsuranceTodo() {
  return useQuery({
    queryKey: ["estimates_insurance_todo"],
    queryFn: async (): Promise<FetchAllEstimates> => {
      const response = await fetch(`/api/estimates/insurance/todo`);
      return await response.json();
    },
  });
}

export default function EstimateInsuranceTodo() {
  const {
    data: estimates,
    isLoading,
    isError,
    refetch,
  } = useEstimatesInsuranceTodo();

  return (
    <EstimatesList
      estimates={estimates}
      isLoading={isLoading}
      isError={isError}
      refetch={refetch}
      label="Devis à faire"
      description="Consultez les devis d'assurance à faire"
    />
  );
}
