"use client";

import { useQuery } from "@tanstack/react-query";
import { FetchAllInvoices } from "@/types/types";
import InvoicesList from "@/components/InvoicesList";

function useInvoicesPending() {
  return useQuery({
    queryKey: ["invoices_pending"],
    queryFn: async (): Promise<FetchAllInvoices> => {
      const response = await fetch(`/api/invoices/pending`);
      return await response.json();
    },
  });
}

export default function InvoicesPending() {
  const { data: invoices, isLoading, isError, refetch } = useInvoicesPending();

  return (
    <InvoicesList
      invoices={invoices}
      isLoading={isLoading}
      isError={isError}
      refetch={refetch}
      label="Factures en attente"
      description="Consultez les factures en attente de paiement"
    />
  );
}
