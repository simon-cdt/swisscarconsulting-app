"use client";

import { useQuery } from "@tanstack/react-query";
import LoadingPage from "@/components/LoadingPage";
import ErrorPage from "@/components/ErrorPage";
import { TypeClient } from "@/generated/prisma/enums";
import { GeistMono } from "geist/font/mono";
import Estimate from "@/components/Estimate";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

type FetchAllEstimatesPending = {
  id: string;
  intervention: {
    id: string;
    date: Date;
    description: string;
    medias: string | null;
    user: {
      username: string;
    };
    vehicule: {
      brand: string;
      model: string;
      licensePlate: string;
      client: {
        name: string | null;
        firstName: string | null;
        companyName: string | null;
        typeClient: TypeClient;
        phone: string;
      };
    };
  };
}[];

function useEstimatesPending() {
  return useQuery({
    queryKey: ["estimates_pending"],
    queryFn: async (): Promise<FetchAllEstimatesPending> => {
      const response = await fetch(`/api/estimates/pending`);
      return await response.json();
    },
  });
}

export default function EstimatePending() {
  const {
    data: estimates,
    isLoading,
    isError,
    refetch,
  } = useEstimatesPending();
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
        phone.includes(searchLower)
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
                  Devis en attente d&apos;acceptation du client
                </h1>
                <p className="text-muted-foreground text-balance">
                  Consultez les devis en attente
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
                        : "Il n'y a aucun devis en attente !"}
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
                        type="PENDING"
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
