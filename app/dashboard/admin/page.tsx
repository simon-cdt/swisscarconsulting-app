"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Trash2 } from "lucide-react";
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
import { Role } from "@/generated/prisma/enums";
import { useQuery } from "@tanstack/react-query";
import LoadingPage from "@/components/LoadingPage";
import ErrorPage from "@/components/ErrorPage";
import { deleteUser } from "@/lib/actions/admin/user";
import toast from "react-hot-toast";
import { UpdateUser } from "@/components/form/admin/UpdateUser";
import UpdatePassword from "@/components/form/admin/UpdatePassword";
import { CreateUser } from "@/components/form/admin/CreateUser";

type FetchUsers = {
  id: string;
  username: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date | null;
}[];

function useUsers() {
  return useQuery({
    queryKey: ["users_admin"],
    queryFn: async (): Promise<FetchUsers> => {
      const response = await fetch(`/api/admin/users`);
      return await response.json();
    },
  });
}

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: users, isLoading, isError, refetch } = useUsers();

  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  // Filtrer les utilisateurs selon la recherche
  const filteredUsers =
    users &&
    users.filter((user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()),
    );

  const getRoleBadge = (role: string) => {
    if (role === "ADMIN") {
      return (
        <Badge className="border-red-500 bg-red-50 text-red-500">Admin</Badge>
      );
    } else if (role === "MECHANIC") {
      return (
        <Badge className="border-orange-500 bg-orange-50 text-orange-500">
          Mécanicien
        </Badge>
      );
    } else if (role === "SELLER") {
      return (
        <Badge className="border-blue-500 bg-blue-50 text-blue-500">
          Vendeur
        </Badge>
      );
    } else {
      return (
        <Badge className="border-violet-500 bg-violet-50 text-violet-500">
          Les deux
        </Badge>
      );
    }
  };

  if (isLoading || !filteredUsers) {
    return <LoadingPage />;
  } else if (isError) {
    return <ErrorPage />;
  } else
    return (
      <div className="bg-background flex min-h-screen w-full justify-center p-4 md:p-8">
        <div className="w-2/3">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-foreground mb-2 text-3xl font-bold">
              Gestion des utilisateurs
            </h1>
            <p className="text-muted-foreground">
              Gérez tous les utilisateurs du garage
            </p>
          </div>

          {/* Barre de recherche */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex w-md items-center gap-2">
              <div className="relative max-w-md flex-1">
                <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder="Rechercher par le username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Badge variant="secondary" className="px-3 py-2">
                {filteredUsers.length} utilisateur
                {filteredUsers.length > 1 ? "s" : ""}
              </Badge>
            </div>
            <CreateUser refetch={refetch} />
          </div>

          {/* Table des utilisateurs */}
          <div className="bg-card rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead>Dernière modification</TableHead>
                  <TableHead>Mot de passe</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-muted-foreground py-8 text-center"
                    >
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <span className="font-medium">{user.username}</span>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.updatedAt
                          ? new Date(user.updatedAt).toLocaleDateString("fr-FR")
                          : "Aucune modification encore faite."}
                      </TableCell>
                      <TableCell>
                        <UpdatePassword id={user.id} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <UpdateUser refetch={refetch} user={user} />
                          <button
                            className="hover:bg-destructive/10 hover:text-destructive trans pointer rounded-md p-1.5"
                            onClick={() => setDeleteUserId(user.id)}
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Dialog de confirmation de suppression */}
        <AlertDialog
          open={deleteUserId !== null}
          onOpenChange={() => setDeleteUserId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la désactivation</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir désactiver cet utilisateur ?
                L&apos;utilisateur ne sera pas supprimé de la base de données.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-white"
                onClick={async () => {
                  const response = await deleteUser({
                    userId: deleteUserId || "",
                  });
                  if (response.success) {
                    toast.success(response.message);
                    refetch();
                    setDeleteUserId(null);
                  } else {
                    toast.error(response.message);
                    setDeleteUserId(null);
                  }
                }}
              >
                Désactiver
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
}
