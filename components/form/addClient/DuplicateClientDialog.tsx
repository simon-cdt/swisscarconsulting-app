"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function DuplicateClientDialog({
  open,
  conflicts,
  onOpenChange,
  onConfirm,
  isSubmitting,
}: {
  open: boolean;
  conflicts: string[];
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Informations déjà utilisées</AlertDialogTitle>
          <AlertDialogDescription>
            Un autre client possède déjà les informations suivantes :
          </AlertDialogDescription>
        </AlertDialogHeader>
        <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
          {conflicts.map((conflict) => (
            <li key={conflict}>{conflict}</li>
          ))}
        </ul>
        <AlertDialogDescription>
          Voulez-vous quand même créer ce client ?
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isSubmitting}>
            Créer quand même
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
