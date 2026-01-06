"use client";

import { useQuery } from "@tanstack/react-query";
import LoadingPage from "@/components/LoadingPage";
import ErrorPage from "@/components/ErrorPage";
import { TypeClient } from "@/generated/prisma/enums";
import { GeistMono } from "geist/font/mono";
import Estimate from "@/components/Estimate";

type FetchAllEstimatesTodo = {
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

function useEstimatesTodo() {
  return useQuery({
    queryKey: ["estimates_todo"],
    queryFn: async (): Promise<FetchAllEstimatesTodo> => {
      const response = await fetch(`/api/estimates/todo`);
      return await response.json();
    },
  });
}

export default function EstimateTodo() {
  const { data: estimates, isLoading, isError, refetch } = useEstimatesTodo();

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
                  Devis à faire
                </h1>
                <p className="text-muted-foreground text-balance">
                  Consultez les devis à faire
                </p>
              </div>
              <div className="flex flex-wrap gap-5">
                {estimates.length < 1 ? (
                  <div className="flex w-full justify-center">
                    <p className={`${GeistMono.className} text-2xl font-bold`}>
                      Il n&apos;y a aucun devis à faire !
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
