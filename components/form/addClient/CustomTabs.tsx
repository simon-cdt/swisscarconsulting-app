"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddClient from "./AddClient";
import AddCompany from "./AddCompany";
import { Building, User2 } from "lucide-react";
import { useState, useRef } from "react";

export type SharedFormData = {
  firstName: string;
  name: string;
  email: string;
  phonePrefix: string;
  phoneNumber: string;
  phone2Prefix: string;
  phone2Number: string;
  address: string;
  postalCode: number | undefined;
  city: string;
};

export default function CustomTabs() {
  const [sharedData, setSharedData] = useState<SharedFormData>({
    firstName: "",
    name: "",
    email: "",
    phonePrefix: "",
    phoneNumber: "",
    phone2Prefix: "",
    phone2Number: "",
    address: "",
    postalCode: undefined,
    city: "",
  });
  const [activeTab, setActiveTab] = useState("individual");
  const addClientRef = useRef<{ getSyncData: () => SharedFormData } | null>(
    null,
  );
  const addCompanyRef = useRef<{ getSyncData: () => SharedFormData } | null>(
    null,
  );

  const handleTabChange = (tabValue: string) => {
    // Synchroniser les données du tab actuel avant de changer
    if (activeTab === "individual" && addClientRef.current) {
      const data = addClientRef.current.getSyncData();
      setSharedData(data);
    } else if (activeTab === "company" && addCompanyRef.current) {
      const data = addCompanyRef.current.getSyncData();
      setSharedData(data);
    }
    setActiveTab(tabValue);
  };

  return (
    <Tabs defaultValue="individual" onValueChange={handleTabChange}>
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
        <AddClient
          ref={addClientRef}
          sharedData={sharedData}
          setSharedData={setSharedData}
        />
      </TabsContent>
      <TabsContent value="company">
        <AddCompany
          ref={addCompanyRef}
          sharedData={sharedData}
          setSharedData={setSharedData}
        />
      </TabsContent>
    </Tabs>
  );
}
