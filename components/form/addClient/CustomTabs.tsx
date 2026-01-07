"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddClient from "./AddClient";
import AddCompany from "./AddCompany";
import { Building, User2 } from "lucide-react";
import { useState } from "react";

export type SharedFormData = {
  firstName: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  postalCode: number | undefined;
  city: string;
};

export default function CustomTabs() {
  const [sharedData, setSharedData] = useState<SharedFormData>({
    firstName: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    postalCode: undefined,
    city: "",
  });

  return (
    <Tabs defaultValue="individual">
      <TabsList className="before:bg-border relative mb-4 h-auto w-full gap-0.5 bg-transparent p-0 before:absolute before:inset-x-0 before:bottom-0 before:h-px">
        <TabsTrigger
          value="individual"
          className="trans overflow-hidden rounded-b-none border-x border-t bg-sky-100 py-2 data-[state=active]:z-10 data-[state=active]:shadow-none"
        >
          <div className="flex items-center gap-1">
            <User2 className="size-4 text-sky-700" />
            <span className="text-sky-500">Particulier</span>
          </div>
        </TabsTrigger>
        <TabsTrigger
          value="company"
          className="trans overflow-hidden rounded-b-none border-x border-t bg-amber-100 py-2 data-[state=active]:z-10 data-[state=active]:shadow-none"
        >
          <div className="flex items-center gap-1">
            <Building className="size-4 text-amber-700" />
            <span className="text-amber-500">Entreprise</span>
          </div>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="individual">
        <AddClient sharedData={sharedData} setSharedData={setSharedData} />
      </TabsContent>
      <TabsContent value="company">
        <AddCompany sharedData={sharedData} setSharedData={setSharedData} />
      </TabsContent>
    </Tabs>
  );
}
