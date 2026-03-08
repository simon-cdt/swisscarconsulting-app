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
// const affordableParts = searchPartsByPrice(0, 50);
// Retourne toutes les pièces entre 0 et 50 CHF

// ============================================
// EXEMPLE 4: Statistiques du catalogue
// ============================================

// Usage:
// const stats = getCatalogStats();
// console.log(`Catalogue: ${stats.totalParts} pièces`);
// console.log(`Prix moyen: CHF ${stats.averagePrice}`);

// ============================================
// EXEMPLE 5: Grouper par catégorie (basé sur le prix)

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
