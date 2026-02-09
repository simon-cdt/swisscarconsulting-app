// Catalogue de pièces pré-enregistrées (mock data)
export type PartTemplate = {
  id: string;
  designation: string;
  description: string;
  unitPrice: number;
  quantity: number;
};

export const PARTS_CATALOG: PartTemplate[] = [
  // Forfaits
  {
    id: "1",
    designation: "Forfait frein",
    description: "Remplacement Disque et plaquettes de frein AV et AR",
    unitPrice: 450.0,
    quantity: 1,
  },
  {
    id: "2",
    designation: "Forfait frein",
    description: "Remplacement Plaquettes de frein AV et AR",
    unitPrice: 250.0,
    quantity: 1,
  },
  {
    id: "3",
    designation: "Forfait pneus",
    description: "Remplacement, montage, équilibrage AV et AR",
    unitPrice: 200.0,
    quantity: 1,
  },
  {
    id: "4",
    designation: "Forfait service",
    description: "Vidange, filtre à huile, contrôle des niveaux",
    unitPrice: 150.0,
    quantity: 1,
  },
  {
    id: "5",
    designation: "Forfait climatisation",
    description: "Contrôle, mise à niveau",
    unitPrice: 100.0,
    quantity: 1,
  },
];
