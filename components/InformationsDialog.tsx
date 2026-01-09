import { FILE_SERVER_URL } from "@/lib/config";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { EyeIcon, ImageIcon, Download, Trash } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteMediasIntervention } from "@/lib/actions/intervention";
import toast from "react-hot-toast";

export default function InformationsDialog({
  estimate,
  onlyMedias,
  refetch,
}: {
  estimate: {
    intervention: { id: string; description?: string; medias: string | null };
  };
  onlyMedias?: boolean;
  refetch: () => void;
}) {
  // Fonction pour télécharger un média
  const handleDownload = async ({ fileName }: { fileName: string }) => {
    try {
      const url = `${FILE_SERVER_URL}/uploads/${fileName}`;
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
    }
  };

  const handleDelete = async ({ fileName }: { fileName: string }) => {
    try {
      const response = await fetch(`${FILE_SERVER_URL}/files/${fileName}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const deleteMedia = await deleteMediasIntervention({
          data: {
            interventionId: estimate.intervention.id,
            mediasToDelete: fileName,
          },
        });
        if (deleteMedia.success) {
          toast.success(deleteMedia.message);
          refetch();
        } else {
          toast.error(deleteMedia.message);
        }
      } else {
        toast.error("Erreur lors de la suppression du fichier");
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression du fichier");
      console.error("Erreur lors de la suppression:", error);
    }
  };

  // Séparer et trier les médias : images d'abord, puis vidéos
  const sortedMedias =
    estimate.intervention.medias
      ?.split(",")
      .map((file) => file.trim())
      .sort((a, b) => {
        const aIsVideo = /\.(mp4|webm|ogg|mov|avi|mkv)$/i.test(a);
        const bIsVideo = /\.(mp4|webm|ogg|mov|avi|mkv)$/i.test(b);

        // Si a est une vidéo et b est une image, b vient en premier
        if (aIsVideo && !bIsVideo) return 1;
        // Si a est une image et b est une vidéo, a vient en premier
        if (!aIsVideo && bIsVideo) return -1;
        // Sinon, garder l'ordre original
        return 0;
      }) || [];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="col-span-2 w-full gap-2"
          disabled={
            (onlyMedias &&
              (!estimate.intervention.medias ||
                estimate.intervention.medias === "")) ||
            (!onlyMedias &&
              (!estimate.intervention.medias ||
                estimate.intervention.medias === "") &&
              (!estimate.intervention.description ||
                estimate.intervention.description === ""))
          }
        >
          {onlyMedias ? (
            <>
              <ImageIcon className="mr-2 h-4 w-4" />
              {"Voir les médias"}
            </>
          ) : (
            <>
              <EyeIcon className="size-4" />
              {"Informations"}
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] w-fit! max-w-[90vw]! overflow-y-auto">
        <DialogHeader className="pt-3">
          <DialogTitle>Photos et vidéos</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-5">
          {!onlyMedias &&
            estimate.intervention.description &&
            estimate.intervention.description !== "" && (
              <div className="bg-muted/30 max-h-64 overflow-y-auto rounded-md border p-4">
                <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                  {estimate.intervention.description}
                </p>
              </div>
            )}
          <div className="flex flex-wrap gap-2">
            {sortedMedias.map((fileName, index) => {
              const isVideo = /\.(mp4|webm|ogg|mov|avi|mkv)$/i.test(fileName);
              const isImage = /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(
                fileName,
              );

              if (isVideo) {
                return (
                  <div
                    key={index}
                    className="bg-muted relative col-span-full aspect-video overflow-hidden rounded-lg"
                  >
                    <video
                      controls
                      className="h-full w-full object-contain"
                      src={`${FILE_SERVER_URL}/uploads/${fileName}`}
                    >
                      Votre navigateur ne supporte pas la lecture de vidéos.
                    </video>
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() => handleDownload({ fileName })}
                        className="cursor-pointer rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                        title="Télécharger"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        className="cursor-pointer rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                        title="Supprimer"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              }

              if (isImage) {
                return (
                  <div
                    key={index}
                    className="bg-muted relative flex h-75 max-w-[45%] min-w-75 flex-1 items-center justify-center overflow-hidden rounded-lg"
                  >
                    {/* eslint-disable-next-line */}
                    <img
                      src={`${FILE_SERVER_URL}/uploads/${fileName}`}
                      alt={`Image ${index + 1}`}
                      className="h-full w-full object-contain"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        onClick={() => handleDownload({ fileName })}
                        className="trans cursor-pointer rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                        title="Télécharger"
                      >
                        <Download className="h-4 w-4" />
                      </button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            className="trans cursor-pointer rounded-full bg-red-200 p-2 transition-colors hover:bg-red-300"
                            title="Supprimer"
                          >
                            <Trash className="h-4 w-4 text-red-600" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Êtes-vous sûr de vouloir supprimer ce média ?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action est irréversible. Le média sera
                              définitivement supprimé et ne pourra pas être
                              récupéré.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-500 hover:bg-red-600"
                              onClick={() => handleDelete({ fileName })}
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                );
              }

              return null;
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
