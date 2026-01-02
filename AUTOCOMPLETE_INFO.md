# Système d'Autocomplétion pour les Pièces

## Fonctionnalités

Le système d'autocomplétion permet de faciliter l'ajout de pièces en proposant des pièces pré-enregistrées depuis un catalogue.

### Comment ça fonctionne

1. **Tapez dans le champ "Désignation"** : Dès que vous tapez au moins 2 caractères, une liste de suggestions apparaît
2. **Suggestions filtrées** : Les suggestions sont filtrées en temps réel selon ce que vous tapez (ex: "embrayage", "filtre", "plaquette")
3. **Sélection automatique** : Cliquez sur une suggestion pour remplir automatiquement :
   - La désignation
   - La description
   - Le prix unitaire
   - La quantité

### Catalogue de pièces mockées

Le fichier `lib/mock/parts-catalog.ts` contient actuellement **35 pièces** réparties dans les catégories suivantes :

- **Embrayage** : Kit complet, disque, butée
- **Freinage** : Plaquettes, disques, liquide de frein
- **Filtres** : Huile, air, carburant, habitacle
- **Huiles et fluides** : Huiles moteur, liquide de refroidissement
- **Suspension** : Amortisseurs, rotules, silent blocs
- **Échappement** : Silencieux, catalyseur, sonde lambda
- **Pneumatiques** : Différentes tailles
- **Batterie et électrique** : Batterie, alternateur, démarreur, bougies
- **Courroies** : Distribution, accessoires
- **Carrosserie** : Pare-choc, aile, rétroviseur, phares

### Pour ajouter de nouvelles pièces

Éditez le fichier `lib/mock/parts-catalog.ts` et ajoutez des objets au tableau `PARTS_CATALOG` :

```typescript
{
  id: "36",
  designation: "Nom de la pièce",
  description: "Description détaillée",
  unitPrice: 99.99,
  quantity: 1,
}
```

### Interface utilisateur

- **Design moderne** : Les suggestions apparaissent dans un dropdown avec bordure et ombre
- **Hover effect** : Changement de couleur au survol
- **Informations complètes** : Chaque suggestion affiche le nom, la description, le prix et la quantité
- **Fermeture automatique** : Clic en dehors ou sélection = fermeture de la liste

### Prochaines étapes

Pour passer d'un système mocké à un système avec base de données :

1. Créer une table `parts_catalog` dans Prisma
2. Remplacer le tableau `PARTS_CATALOG` par un appel API
3. Ajouter une interface d'administration pour gérer le catalogue
4. Ajouter la recherche côté serveur pour de meilleures performances
