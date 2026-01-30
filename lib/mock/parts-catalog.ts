// Catalogue de pièces pré-enregistrées (mock data)
export type PartTemplate = {
  id: string;
  designation: string;
  description: string;
  unitPrice: number;
  quantity: number;
};

export const PARTS_CATALOG: PartTemplate[] = [
  // Embrayage
  {
    id: "1",
    designation: "Kit embrayage complet",
    description:
      "Kit embrayage incluant disque, mécanisme et butée de débrayage",
    unitPrice: 450.0,
    quantity: 1,
  },
  {
    id: "2",
    designation: "Disque embrayage",
    description: "Disque d'embrayage seul, diamètre standard",
    unitPrice: 180.0,
    quantity: 1,
  },
  {
    id: "3",
    designation: "Butée embrayage",
    description: "Butée de débrayage hydraulique",
    unitPrice: 85.0,
    quantity: 1,
  },
  // Freinage
  {
    id: "4",
    designation: "Plaquettes de frein avant",
    description: "Jeu de 4 plaquettes de frein pour essieu avant",
    unitPrice: 120.0,
    quantity: 1,
  },
  {
    id: "5",
    designation: "Plaquettes de frein arrière",
    description: "Jeu de 4 plaquettes de frein pour essieu arrière",
    unitPrice: 95.0,
    quantity: 1,
  },
  {
    id: "6",
    designation: "Disques de frein avant",
    description: "Paire de disques de frein ventilés pour essieu avant",
    unitPrice: 280.0,
    quantity: 2,
  },
  {
    id: "7",
    designation: "Disques de frein arrière",
    description: "Paire de disques de frein pleins pour essieu arrière",
    unitPrice: 220.0,
    quantity: 2,
  },
  {
    id: "8",
    designation: "Liquide de frein DOT4",
    description: "Bidon de 1L de liquide de frein DOT4",
    unitPrice: 25.0,
    quantity: 1,
  },
  // Filtres
  {
    id: "9",
    designation: "Filtre à huile",
    description: "Filtre à huile moteur standard",
    unitPrice: 18.0,
    quantity: 1,
  },
  {
    id: "10",
    designation: "Filtre à air",
    description: "Filtre à air moteur",
    unitPrice: 32.0,
    quantity: 1,
  },
  {
    id: "11",
    designation: "Filtre à carburant",
    description: "Filtre à carburant diesel/essence",
    unitPrice: 45.0,
    quantity: 1,
  },
  {
    id: "12",
    designation: "Filtre habitacle",
    description: "Filtre d'habitacle avec charbon actif",
    unitPrice: 28.0,
    quantity: 1,
  },
  // Huiles et fluides
  {
    id: "13",
    designation: "Huile moteur 5W30 - 5L",
    description: "Bidon de 5L d'huile moteur synthétique 5W30",
    unitPrice: 65.0,
    quantity: 1,
  },
  {
    id: "14",
    designation: "Huile moteur 10W40 - 5L",
    description: "Bidon de 5L d'huile moteur semi-synthétique 10W40",
    unitPrice: 55.0,
    quantity: 1,
  },
  {
    id: "15",
    designation: "Liquide de refroidissement",
    description: "Bidon de 5L de liquide de refroidissement antigel",
    unitPrice: 35.0,
    quantity: 1,
  },
  // Suspension
  {
    id: "16",
    designation: "Amortisseur avant",
    description: "Amortisseur avant, à l'unité",
    unitPrice: 180.0,
    quantity: 1,
  },
  {
    id: "17",
    designation: "Amortisseur arrière",
    description: "Amortisseur arrière, à l'unité",
    unitPrice: 150.0,
    quantity: 1,
  },
  {
    id: "18",
    designation: "Rotule de suspension",
    description: "Rotule de suspension inférieure",
    unitPrice: 75.0,
    quantity: 1,
  },
  {
    id: "19",
    designation: "Silent bloc",
    description: "Silent bloc de train avant",
    unitPrice: 45.0,
    quantity: 1,
  },
  // Échappement
  {
    id: "20",
    designation: "Pot d'échappement",
    description: "Silencieux arrière complet",
    unitPrice: 320.0,
    quantity: 1,
  },
  {
    id: "21",
    designation: "Catalyseur",
    description: "Pot catalytique",
    unitPrice: 580.0,
    quantity: 1,
  },
  {
    id: "22",
    designation: "Sonde lambda",
    description: "Sonde lambda d'échappement",
    unitPrice: 95.0,
    quantity: 1,
  },
  // Pneumatiques
  {
    id: "23",
    designation: "Pneu 205/55R16",
    description: "Pneu tourisme 205/55R16 91V",
    unitPrice: 125.0,
    quantity: 1,
  },
  {
    id: "24",
    designation: "Pneu 225/45R17",
    description: "Pneu tourisme 225/45R17 94V",
    unitPrice: 145.0,
    quantity: 1,
  },
  // Batterie et électrique
  {
    id: "25",
    designation: "Batterie 70Ah",
    description: "Batterie 12V 70Ah avec garantie 2 ans",
    unitPrice: 180.0,
    quantity: 1,
  },
  {
    id: "26",
    designation: "Alternateur",
    description: "Alternateur 12V, reconditionné",
    unitPrice: 380.0,
    quantity: 1,
  },
  {
    id: "27",
    designation: "Démarreur",
    description: "Démarreur 12V, reconditionné",
    unitPrice: 420.0,
    quantity: 1,
  },
  {
    id: "28",
    designation: "Bougie d'allumage",
    description: "Bougie d'allumage standard",
    unitPrice: 12.0,
    quantity: 4,
  },
  // Courroies
  {
    id: "29",
    designation: "Kit de distribution",
    description:
      "Kit de distribution complet avec courroie, galets et pompe à eau",
    unitPrice: 380.0,
    quantity: 1,
  },
  {
    id: "30",
    designation: "Courroie accessoires",
    description: "Courroie d'accessoires multi-striée",
    unitPrice: 45.0,
    quantity: 1,
  },
  // Carrosserie
  {
    id: "31",
    designation: "Pare-choc avant",
    description: "Pare-choc avant, à peindre",
    unitPrice: 320.0,
    quantity: 1,
  },
  {
    id: "32",
    designation: "Aile avant droite",
    description: "Aile avant droite, à peindre",
    unitPrice: 280.0,
    quantity: 1,
  },
  {
    id: "33",
    designation: "Rétroviseur",
    description: "Rétroviseur électrique avec rabattement",
    unitPrice: 185.0,
    quantity: 1,
  },
  {
    id: "34",
    designation: "Phare avant",
    description: "Optique de phare avant complet",
    unitPrice: 420.0,
    quantity: 1,
  },
  {
    id: "35",
    designation: "Feu arrière",
    description: "Feu arrière LED",
    unitPrice: 180.0,
    quantity: 1,
  },
  // Forfaits
  {
    id: "36",
    designation: "Forfait frein",
    description: "Remplacement Disque et plaquettes de frein AV et AR",
    unitPrice: 450.0,
    quantity: 1,
  },
  {
    id: "37",
    designation: "Forfait frein",
    description: "Remplacement Plaquettes de frein AV et AR",
    unitPrice: 250.0,
    quantity: 1,
  },
  {
    id: "38",
    designation: "Forfait pneus",
    description: "Remplacement, montage, équilibrage AV et AR",
    unitPrice: 200.0,
    quantity: 1,
  },
  {
    id: "39",
    designation: "Forfait service",
    description: "Vidange, flitre à huile, contrôle des niveaux",
    unitPrice: 150.0,
    quantity: 1,
  },
  {
    id: "40",
    designation: "Forfait climatisation",
    description: "Contrôle, mise à niveau",
    unitPrice: 100.0,
    quantity: 1,
  },
];
