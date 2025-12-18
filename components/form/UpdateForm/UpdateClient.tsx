"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TypeClient } from "@/generated/prisma/enums";
import { Edit } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UpdateClientCompany } from "./UpdateClientCompany";
import { UpdateClientIndividual } from "./UpdateClientIndividual";

export default function UpdateClient({
  typeClient,
  client,
  refetch,
}: {
  typeClient: TypeClient;
  client: {
    id: string;

    name: string | null;
    firstName: string | null;

    companyName: string | null;
    contactFirstName: string | null;
    contactName: string | null;

    email: string;
    phone: string;
    address: string | null;
    postalCode: string | null;
    city: string | null;
  };
  refetch: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [clientType, setClientType] = useState<TypeClient>(typeClient);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className={`${typeClient === "company" ? "company-btn" : "individual-btn"} flex items-center gap-3`}
        >
          <span>Modifier</span>
          <Edit className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-150">
        <DialogHeader>
          <DialogTitle>Modifier le client</DialogTitle>
          <DialogDescription>
            Apportez des modifications au client ici. Cliquez sur enregistrer
            lorsque vous avez terminé.
          </DialogDescription>
        </DialogHeader>
        <Select
          defaultValue={typeClient}
          value={clientType}
          onValueChange={(value) => setClientType(value as TypeClient)}
        >
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Type de client" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="individual">Particulier</SelectItem>
            <SelectItem value="company">Entreprise</SelectItem>
          </SelectContent>
        </Select>
        {clientType === "company" ? (
          <UpdateClientCompany
            client={client}
            refetch={refetch}
            setIsOpen={setIsOpen}
          />
        ) : (
          <UpdateClientIndividual
            client={client}
            refetch={refetch}
            setIsOpen={setIsOpen}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
