"use client";

import CustomTabs from "@/components/form/addClient/CustomTabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { Building, Phone, Search, User2, UserPlus } from "lucide-react";
import { ReactNode, useState } from "react";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { GeistMono } from "geist/font/mono";
import Link from "next/link";
import { TypeClient } from "@/generated/prisma/enums";

type FetchAllClients = {
  id: string;
  name: string;
  companyName: string | null;
  phone: string;
  email: string;
  typeClient: TypeClient;
  nbVehicule: number;
}[];

function useClients() {
  return useQuery({
    queryKey: ["clients"],
    queryFn: async (): Promise<FetchAllClients> => {
      const response = await fetch(`/api/clients`);
      return await response.json();
    },
  });
}

export default function ClientHandlePage() {
  const { data: clients, isLoading, isError } = useClients();

  const [search, setSearch] = useState("");
  const searchClients =
    clients &&
    clients.filter(
      (customer) =>
        customer.name.toLowerCase().includes(search.toLowerCase()) ||
        customer.phone.toLowerCase().includes(search.toLowerCase()) ||
        customer.companyName?.toLowerCase().includes(search.toLowerCase()) ||
        customer.email?.toLowerCase().includes(search.toLowerCase()),
    );
  return (
    <main className="flex h-[calc(100vh-64px)] w-screen items-center justify-center gap-10">
      <Card className="h-[45%] w-2/5">
        <div className="flex h-full flex-col items-center justify-center gap-5 p-5">
          <div className="rounded-full bg-emerald-50">
            <UserPlus className="size-16 p-4 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold">Nouveau client</h1>
          <p className="w-[70%] text-center">
            Créer une nouvelle fiche client et commencer un dossier de
            réparation
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                Créer un nouveau client
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Créer un client</DialogTitle>
              </DialogHeader>
              <CustomTabs />
            </DialogContent>
          </Dialog>
        </div>
      </Card>
      <Card className="h-fit min-h-[45%] w-2/5">
        <div className="flex h-full flex-col items-center justify-center gap-5 p-5">
          <div className="rounded-full bg-indigo-50">
            <Search className="size-16 p-4 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold">Recherche client</h1>
          <p className="w-[60%] text-center">
            Rechercher un client existant dans la base de données
          </p>
          <Input
            className="border-indigo-400 focus-visible:ring-indigo-200"
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex max-h-[250px] w-full flex-col gap-3 overflow-y-auto">
            {search !== "" &&
              (isLoading ? null : isError ? null : searchClients &&
                searchClients.length === 0 ? (
                <p className="text-center font-bold text-red-500">
                  Aucun client trouvé
                </p>
              ) : (
                searchClients &&
                searchClients.map((customer) => (
                  <Link
                    href={`/client-handle/${customer.id}`}
                    key={customer.id}
                    className={`${customer.typeClient === "individual" ? "border-cyan-100 bg-cyan-50" : "border-amber-100 bg-amber-50"} group grid w-full grid-flow-col grid-rows-2 rounded-xl border-2 p-5 text-left transition-all`}
                  >
                    <ItemClient
                      name={
                        (customer.typeClient === "individual"
                          ? customer.name
                          : customer.companyName) || customer.name
                      }
                      icon={
                        customer.typeClient === "individual" ? (
                          <User2 />
                        ) : (
                          <Building />
                        )
                      }
                      bold
                    />
                    <ItemClient
                      name={
                        parsePhoneNumberFromString(
                          customer.phone,
                        )?.formatInternational() || customer.phone
                      }
                      icon={<Phone />}
                    />
                    <p>
                      <span className={`${GeistMono.className}`}>
                        {customer.nbVehicule}
                      </span>{" "}
                      véhicule(s)
                    </p>
                    <p
                      className={`${customer.typeClient === "individual" ? "text-cyan-600" : "text-amber-600"}`}
                    >
                      {customer.typeClient === "individual"
                        ? "Particulier"
                        : "Entreprise"}
                    </p>
                  </Link>
                ))
              ))}
          </div>
        </div>
      </Card>
    </main>
  );
}

const ItemClient = ({
  name,
  icon,
  bold,
}: {
  name: string;
  icon: ReactNode;
  bold?: boolean;
}) => {
  return (
    <div className="flex items-center gap-2 [&_svg]:size-4 [&_svg]:shrink-0">
      {icon}
      <p className={bold ? "font-semibold" : ""}>{name}</p>
    </div>
  );
};
