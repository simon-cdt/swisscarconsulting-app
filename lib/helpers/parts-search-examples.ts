/**
 * EXEMPLE D'INTÉGRATION DE L'AUTOCOMPLÉTION
 *
 * Ce fichier montre comment le système d'autocomplétion fonctionne
 * et comment l'intégrer dans d'autres composants si nécessaire.
 */

import { PARTS_CATALOG } from "@/lib/mock/parts-catalog";

// ============================================
// EXEMPLE 1: Recherche simple
// ============================================
export function searchParts(query: string) {
  if (query.length < 2) return [];

  return PARTS_CATALOG.filter((part) =>
    part.designation.toLowerCase().includes(query.toLowerCase()),
  );
}

// Usage:
// const results = searchParts("embrayage");
// console.log(results); // Retourne toutes les pièces contenant "embrayage"

// ============================================
// EXEMPLE 2: Recherche avancée (description incluse)
// ============================================
export function searchPartsAdvanced(query: string) {
  if (query.length < 2) return [];

  const lowerQuery = query.toLowerCase();

  return PARTS_CATALOG.filter(
    (part) =>
      part.designation.toLowerCase().includes(lowerQuery) ||
      part.description.toLowerCase().includes(lowerQuery),
  );
}

// Usage:
// const results = searchPartsAdvanced("hydraulique");
// Trouvera la "Butée embrayage" car sa description contient "hydraulique"

// ============================================
// EXEMPLE 3: Recherche par prix
// ============================================
export function searchPartsByPrice(minPrice: number, maxPrice: number) {
  return PARTS_CATALOG.filter(
    (part) => part.unitPrice >= minPrice && part.unitPrice <= maxPrice,
  );
}

// Usage:
// const affordableParts = searchPartsByPrice(0, 50);
// Retourne toutes les pièces entre 0 et 50 CHF

// ============================================
// EXEMPLE 4: Statistiques du catalogue
// ============================================
export function getCatalogStats() {
  const totalParts = PARTS_CATALOG.length;
  const totalValue = PARTS_CATALOG.reduce(
    (sum, part) => sum + part.unitPrice,
    0,
  );
  const averagePrice = totalValue / totalParts;
  const mostExpensive = PARTS_CATALOG.reduce((max, part) =>
    part.unitPrice > max.unitPrice ? part : max,
  );
  const cheapest = PARTS_CATALOG.reduce((min, part) =>
    part.unitPrice < min.unitPrice ? part : min,
  );

  return {
    totalParts,
    totalValue: totalValue.toFixed(2),
    averagePrice: averagePrice.toFixed(2),
    mostExpensive: {
      name: mostExpensive.designation,
      price: mostExpensive.unitPrice,
    },
    cheapest: {
      name: cheapest.designation,
      price: cheapest.unitPrice,
    },
  };
}

// Usage:
// const stats = getCatalogStats();
// console.log(`Catalogue: ${stats.totalParts} pièces`);
// console.log(`Prix moyen: CHF ${stats.averagePrice}`);

// ============================================
// EXEMPLE 5: Grouper par catégorie (basé sur le prix)
// ============================================
export function groupPartsByPriceRange() {
  const ranges = {
    economic: [] as typeof PARTS_CATALOG, // 0-50 CHF
    standard: [] as typeof PARTS_CATALOG, // 51-200 CHF
    premium: [] as typeof PARTS_CATALOG, // 201-400 CHF
    luxury: [] as typeof PARTS_CATALOG, // 401+ CHF
  };

  PARTS_CATALOG.forEach((part) => {
    if (part.unitPrice <= 50) ranges.economic.push(part);
    else if (part.unitPrice <= 200) ranges.standard.push(part);
    else if (part.unitPrice <= 400) ranges.premium.push(part);
    else ranges.luxury.push(part);
  });

  return ranges;
}

// Usage:
// const grouped = groupPartsByPriceRange();
// console.log(`Pièces économiques: ${grouped.economic.length}`);

// ============================================
// EXEMPLE 6: Suggestions intelligentes
// ============================================
export function getSmartSuggestions(currentPart: string) {
  const lowerPart = currentPart.toLowerCase();

  // Si on recherche des plaquettes, suggérer aussi les disques
  if (lowerPart.includes("plaquette")) {
    return PARTS_CATALOG.filter((part) =>
      part.designation.toLowerCase().includes("disque"),
    );
  }

  // Si on recherche un filtre, suggérer tous les filtres
  if (lowerPart.includes("filtre")) {
    return PARTS_CATALOG.filter((part) =>
      part.designation.toLowerCase().includes("filtre"),
    );
  }

  return [];
}

// Usage:
// const suggestions = getSmartSuggestions("Plaquettes de frein avant");
// Retournera automatiquement les disques de frein

// ============================================
// EXEMPLE 7: Export pour utilisation dans d'autres composants
// ============================================
export type { PartTemplate } from "@/lib/mock/parts-catalog";
export { PARTS_CATALOG } from "@/lib/mock/parts-catalog";

/**
 * COMMENT UTILISER DANS UN AUTRE COMPOSANT
 *
 * import { searchParts, PARTS_CATALOG } from "@/lib/helpers/parts-search-examples";
 *
 * function MyComponent() {
 *   const [query, setQuery] = useState("");
 *   const results = searchParts(query);
 *
 *   return (
 *     <div>
 *       <input onChange={(e) => setQuery(e.target.value)} />
 *       {results.map(part => (
 *         <div key={part.id}>{part.designation}</div>
 *       ))}
 *     </div>
 *   );
 * }
 */
