"use client";

import { useQuery } from "@tanstack/react-query";
import { FetchAllInvoices } from "@/types/types";
import InvoicesList from "@/components/InvoicesList";

function useInvoicesPaid() {
  return useQuery({
    queryKey: ["invoices_paid"],
    queryFn: async (): Promise<FetchAllInvoices> => {
      const response = await fetch(`/api/invoices/paid`);
      return await response.json();
    },
  });
}

export default function InvoicesPaid() {
  const { data: invoices, isLoading, isError, refetch } = useInvoicesPaid();

  return (
    <InvoicesList
      invoices={invoices}
      isLoading={isLoading}
      isError={isError}
      refetch={refetch}
      label="Factures payées"
      description="Consultez les factures déjà payées"
    />
  );
}
