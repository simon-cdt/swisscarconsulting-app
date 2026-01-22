"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { GeistMono } from "geist/font/mono";
import { ArrowLeft, Car, Search, User, History } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { TypeClient } from "@/generated/prisma/enums";
import { AddVehicule } from "@/components/form/AddVehicule";
import { Separator } from "@/components/ui/separator";
import ErrorPage from "@/components/ErrorPage";
import LoadingPage from "@/components/LoadingPage";
import UpdateClient from "@/components/form/UpdateForm/UpdateClient";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatPhoneNumber } from "@/lib/utils";

type FetchAllVehiculesOfClient = {
  vehicules: {
    id: string;
    brand: string;
    model: string;
    year: number;
    licensePlate: string;
  }[];
  client: {
    id: number;
    typeClient: TypeClient;
    phone: string;
    email: string;
    name: string | null;
    firstName: string | null;
    companyName: string | null;
    contactFirstName: string | null;
    contactName: string | null;
    address: string | null;
    city: string | null;
    postalCode: string | null;
    vehicules: {
      brand: string;
      model: string;
      interventions: {
        id: string;
        date: Date;
        description: string;
      }[];
    }[];
  };
};

function useVehicules({ clientId }: { clientId: number }) {
  return useQuery({
    queryKey: ["vehicules", clientId],
    queryFn: async (): Promise<FetchAllVehiculesOfClient> => {
      const response = await fetch(`/api/clients/${clientId}`);
      return await response.json();
    },
  });
}

export default function ClientVehiculePage() {
  const params = useParams();
  const id = params?.clientId;

  const router = useRouter();

  const { data, isLoading, isError, refetch } = useVehicules({
    clientId: Number(id),
  });

  const [searchQuery, setSearchQuery] = useState("");

  // Flatten all interventions from all vehicles
  const allInterventions = useMemo(() => {
    if (!data?.client.vehicules) return [];

    return data.client.vehicules
      .flatMap((vehicule) =>
        vehicule.interventions.map((intervention) => ({
          ...intervention,
          vehicule,
        })),
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [data]);

  // Filter vehicles based on search query
  const filteredVehicles =
    data &&
    data.vehicules.filter((vehicule) => {
      const query = searchQuery.toLowerCase();
      return (
        vehicule.brand.toLowerCase().includes(query) ||
        vehicule.model.toLowerCase().includes(query) ||
        vehicule.licensePlate.toLowerCase().includes(query) ||
        vehicule.year.toString().includes(query)
      );
    });

  return (
    <>
      {isLoading ? (
        <LoadingPage />
      ) : isError ? (
        <ErrorPage />
      ) : (
        data && (
          <div className="bg-background flex min-h-screen flex-col gap-4 pt-10">
            {/* Header */}
            <header className="bg-card">
              <div className="container mx-auto flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                  <Link href={`/client-handle`}>
                    <Button variant="ghost" size="icon">
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                  </Link>
                  <h1 className="text-foreground text-2xl font-bold">
                    Choisir le véhicule
                  </h1>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="mx-auto flex w-full max-w-350 gap-6 px-6 pb-10">
              {/* Left Section - Client Info and Vehicles */}
              <div className="flex flex-1 flex-col gap-6">
                <Card
                  className={`${data.client.typeClient === "individual" ? "individual-card" : "company-card"} w-full p-6`}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex w-full justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`${data.client.typeClient === "individual" ? "bg-sky-100" : "bg-amber-100"} flex h-10 w-10 items-center justify-center rounded-lg`}
                        >
                          <User
                            className={`${data.client.typeClient === "individual" ? "text-sky-600" : "text-amber-600"} size-6`}
                          />
                        </div>
                        <h2
                          className={`${data.client.typeClient === "individual" ? "text-sky-800" : "text-amber-800"} text-xl font-bold`}
                        >
                          Informations client
                        </h2>
                      </div>
                      <UpdateClient
                        typeClient={data.client.typeClient}
                        client={data.client}
                        refetch={refetch}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                      <div>
                        <p className="text-muted-foreground text-sm">
                          {data.client.typeClient === "individual"
                            ? "Nom"
                            : "Entreprise - Contact"}
                        </p>
                        <p className="text-foreground text-base font-medium">
                          {data.client.typeClient === "individual"
                            ? `${data.client.name} ${data.client.firstName}`
                            : `${data.client.companyName} - ${data.client.contactName} ${data.client.contactFirstName}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">
                          Téléphone
                        </p>
                        <p className="text-foreground text-base font-medium">
                          {formatPhoneNumber(data.client.phone)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">Email</p>
                        <p className="text-foreground text-base font-medium">
                          {data.client.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">Adresse</p>
                        <p
                          className={`${
                            data.client.address &&
                            data.client.postalCode &&
                            data.client.city
                              ? "text-foreground"
                              : "text-red-500"
                          } text-base font-medium`}
                        >
                          {data.client.address &&
                          data.client.postalCode &&
                          data.client.city
                            ? `${data.client.address}, ${data.client.postalCode} ${data.client.city}`
                            : "Non renseigné"}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
                <Separator />
                <div className="mx-auto w-full">
                  {/* Search and Add Button */}
                  <div className="mb-6 flex items-center gap-4">
                    <div className="relative flex-1 items-center">
                      <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                      <Input
                        type="text"
                        placeholder="Rechercher par marque, modèle, plaque..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <AddVehicule
                      typeClient={data ? data.client.typeClient : "individual"}
                      clientId={data ? data.client.id : 0}
                      refetch={refetch}
                    />
                  </div>

                  {/* Vehicle Grid */}
                  {filteredVehicles && filteredVehicles.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {filteredVehicles.map((vehicule) => (
                        <Card
                          key={vehicule.id}
                          className={`group trans flex cursor-pointer flex-row items-center px-5 py-4 hover:shadow-lg ${data && data.client.typeClient === "individual" ? "individual-card" : "company-card"}`}
                          onClick={() => {
                            router.push(`/client-handle/${id}/${vehicule.id}`);
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`${data && data.client.typeClient === "individual" ? "bg-sky-200/50" : "bg-amber-200/50"} trans flex h-16 w-16 shrink-0 items-center justify-center rounded-lg`}
                            >
                              <Car className="text-primary h-8 w-8" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="text-foreground mb-1 text-xl font-bold">
                                {vehicule.brand} {vehicule.model}
                              </h3>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                <div className="text-muted-foreground">
                                  <span
                                    className={`${GeistMono.className} text-foreground font-mono`}
                                  >
                                    {vehicule.licensePlate}
                                  </span>
                                </div>
                                <div className="text-muted-foreground">
                                  Année:{" "}
                                  <span className="text-foreground">
                                    {vehicule.year}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="py-16 text-center">
                      <div className="bg-muted mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full">
                        <Search className="text-muted-foreground h-10 w-10" />
                      </div>
                      <h3 className="text-foreground mb-2 text-xl font-semibold">
                        Aucun véhicule trouvé
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Aucun véhicule ne correspond à votre recherche
                      </p>
                      <Button
                        onClick={() => setSearchQuery("")}
                        variant="outline"
                      >
                        Réinitialiser la recherche
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Section - Intervention History */}
              <div className="w-96">
                <Card className="sticky top-4 p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                      <History className="size-6 text-purple-600" />
                    </div>
                    <h2 className="text-xl font-bold text-purple-800">
                      Historique des interventions
                    </h2>
                  </div>

                  <ScrollArea className="h-[calc(100vh-250px)]">
                    {allInterventions.length > 0 ? (
                      <div className="space-y-3 pr-4">
                        {allInterventions.map((intervention) => (
                          <Card
                            key={intervention.id}
                            className="border-purple-100 bg-purple-50/50"
                          >
                            <CardContent>
                              <p className="pb-2 text-sm font-semibold text-purple-900">
                                {new Date(intervention.date).toLocaleDateString(
                                  "fr-FR",
                                  {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  },
                                )}
                              </p>
                              <p className="text-sm text-gray-700">
                                {intervention.description}
                              </p>
                              <div className="flex items-center gap-1 text-xs text-purple-600">
                                <Car className="size-3" />
                                <span className="font-medium">
                                  {intervention.vehicule.brand}{" "}
                                  {intervention.vehicule.model}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                          <History className="h-8 w-8 text-purple-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-600">
                          Aucune intervention
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          L&apos;historique apparaîtra ici
                        </p>
                      </div>
                    )}
                  </ScrollArea>
                </Card>
              </div>
            </main>
          </div>
        )
      )}
    </>
  );
}
