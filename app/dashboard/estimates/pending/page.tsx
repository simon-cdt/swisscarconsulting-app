"use client";

import { useQuery } from "@tanstack/react-query";
import LoadingPage from "@/components/LoadingPage";
import ErrorPage from "@/components/ErrorPage";
import { TypeClient } from "@/generated/prisma/enums";
import { GeistMono } from "geist/font/mono";
import Estimate from "@/components/Estimate";

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
              <div className="flex flex-wrap gap-5">
                {estimates.length < 1 ? (
                  <div className="flex w-full justify-center">
                    <p className={`${GeistMono.className} text-2xl font-bold`}>
                      Il n&apos;y a aucun devis en attente !
                    </p>
                  </div>
                ) : (
                  estimates.map((estimate) => {
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
