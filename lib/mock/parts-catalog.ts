// Catalogue de pièces pré-enregistrées (mock data)
export type PartTemplate = {
  id: string;
  designation: string;
  description: string;
  quantity: number;
};

export const PARTS_CATALOG: PartTemplate[] = [
  // Forfaits
  {
    id: "1",
    designation: "Forfait - disque plaquette AV et AR",
    description: "Remplacement Disque et plaquettes de frein AV et AR",
    quantity: 1,
  },
  {
    id: "2",
    designation: "Forfait - plaquette AV et AR",
    description: "Remplacement Plaquettes de frein AV et AR",
    quantity: 1,
  },
  {
    id: "3",
    designation: "Forfait pneus",
    description: "Remplacement, montage, équilibrage AV et AR",
    quantity: 1,
  },
  {
    id: "4",
    designation: "Forfait service",
    description: "Vidange, filtre à huile, contrôle des niveaux",
    quantity: 1,
  },
  {
    id: "5",
    designation: "Forfait climatisation",
    description: "Contrôle, mise à niveau",
    quantity: 1,
  },
];
