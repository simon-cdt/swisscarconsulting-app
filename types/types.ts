import {
  EstimateStatus,
  ItemType,
  TypeClient,
  TypeEstimate,
} from "@/generated/prisma/enums";

export const Roles = [
  {
    label: "Admin",
    value: "ADMIN",
  },
  {
    label: "Vendeur",
    value: "SELLER",
  },
  {
    label: "Mécanicien",
    value: "MECHANIC",
  },
  {
    label: "Les deux",
    value: "BOTH",
  },
];

export type ItemEstimate = {
  id: string;
  type: ItemType;
  designation: string;
  description: string | null;
  unitPrice: number;
  quantity: number | null;
  discount: number | null;
  calculateByTime?: boolean | null;
  position: number;
}[];

export type FetchAllEstimates = Estimate[];

export type Estimate = {
  id: string;
  claimNumber: string | null;
  type: TypeEstimate;
  status: EstimateStatus;
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
};

export type FetchAllInvoices = Invoice[];

export type Invoice = {
  id: string;
  status: string;
  typeEstimate: TypeEstimate;
  claimNumber: string | null;
  interventionDate: Date;
  description: string | null;
  medias: string | null;
  brand: string;
  model: string;
  licensePlate: string;
  name: string;
  firstName: string;
  companyName: string | null;
  typeClient: TypeClient;
  phone: string;
  pdfUrl: string;
};
