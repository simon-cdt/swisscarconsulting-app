import { FetchAllEstimates } from "@/types/types";
import React, { useState } from "react";
import LoadingPage from "./LoadingPage";
import ErrorPage from "./ErrorPage";
import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { GeistMono } from "geist/font/mono";
import Estimate from "./Estimate";

export default function EstimatesList({
  estimates,
  isLoading,
  isError,
  refetch,
  label,
  description,
}: {
  estimates: FetchAllEstimates | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  label: string;
  description: string;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEstimates =
    estimates?.filter((estimate) => {
      const client = estimate.intervention.vehicule.client;
      const vehicule = estimate.intervention.vehicule;

      const searchLower = searchQuery.toLowerCase();

      const clientName =
        client.typeClient === "individual"
          ? `${client.firstName || ""} ${client.name || ""}`.toLowerCase()
          : (client.companyName || "").toLowerCase();

      const vehiculeName = `${vehicule.brand} ${vehicule.model}`.toLowerCase();
      const licensePlate = vehicule.licensePlate.toLowerCase();
      const phone = client.phone.toLowerCase();

      return (
        clientName.includes(searchLower) ||
        vehiculeName.includes(searchLower) ||
        licensePlate.includes(searchLower) ||
        phone.includes(searchLower) ||
        estimate.claimNumber?.includes(searchLower)
      );
    }) || [];
  return (
    <>
      {isLoading ? (
        <LoadingPage />
      ) : isError ? (
        <ErrorPage />
      ) : (
        estimates && (
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
                {filteredEstimates.length < 1 ? (
                  <div className="flex w-full justify-center">
                    <p className={`${GeistMono.className} text-2xl font-bold`}>
                      {searchQuery
                        ? "Aucun devis ne correspond à votre recherche !"
                        : "Il n'y a aucun devis à faire !"}
                    </p>
                  </div>
                ) : (
                  filteredEstimates.map((estimate) => {
                    const isIndividual =
                      estimate.intervention.vehicule.client.typeClient ===
                      "individual";
                    return (
                      <Estimate
                        estimate={estimate}
                        isIndividual={isIndividual}
                        key={estimate.id}
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
