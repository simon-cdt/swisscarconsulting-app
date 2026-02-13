"use client";

import { FetchAllInvoices } from "@/types/types";
import React, { useState } from "react";
import LoadingPage from "./LoadingPage";
import ErrorPage from "./ErrorPage";
import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { GeistMono } from "geist/font/mono";
import Invoice from "@/components/Invoice";

export default function InvoicesList({
  invoices,
  isLoading,
  isError,
  refetch,
  label,
  description,
}: {
  invoices: FetchAllInvoices | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  label: string;
  description: string;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredInvoices =
    invoices?.filter((invoice) => {
      const searchLower = searchQuery.toLowerCase();

      const clientName =
        invoice.typeClient === "individual"
          ? `${invoice.firstName || ""} ${invoice.name || ""}`.toLowerCase()
          : (invoice.companyName || "").toLowerCase();

      const vehiculeName = `${invoice.brand} ${invoice.model}`.toLowerCase();
      const licensePlate = invoice.licensePlate.toLowerCase();
      const phone = invoice.phone.toLowerCase();

      return (
        clientName.includes(searchLower) ||
        vehiculeName.includes(searchLower) ||
        licensePlate.includes(searchLower) ||
        phone.includes(searchLower) ||
        invoice.claimNumber?.includes(searchLower)
      );
    }) || [];

  return (
    <>
      {isLoading ? (
        <LoadingPage />
      ) : isError ? (
        <ErrorPage />
      ) : (
        invoices && (
          <div className="h-full">
            <div className="container mx-auto px-4 py-8">
              <div className="mb-8">
                <h1 className="text-foreground mb-2 text-4xl font-bold text-balance">
                  {label}
                </h1>
                <p className="text-muted-foreground text-balance">
                  {description}
                </p>
              </div>

              <div className="mb-6">
                <div className="relative w-1/3">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    type="text"
                    placeholder="Rechercher par client, entreprise, véhicule, plaque ou numéro..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-5">
                {filteredInvoices.length < 1 ? (
                  <div className="flex w-full justify-center">
                    <p className={`${GeistMono.className} text-2xl font-bold`}>
                      {searchQuery
                        ? "Aucune facture ne correspond à votre recherche !"
                        : "Il n'y a aucune facture en attente !"}
                    </p>
                  </div>
                ) : (
                  filteredInvoices.map((invoice) => {
                    const isIndividual = invoice.typeClient === "individual";
                    return (
                      <Invoice
                        invoice={invoice}
                        isIndividual={isIndividual}
                        key={invoice.id}
                        refetch={refetch}
                      />
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )
      )}
    </>
  );
}
