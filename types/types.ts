import { ItemType } from "@/generated/prisma/enums";

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
  description: string;
  unitPrice: number;
  quantity: number | null;
  discount: number | null;
  position: number;
}[];
