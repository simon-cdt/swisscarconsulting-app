import { FILE_SERVER_URL } from "@/lib/config";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { EyeIcon } from "lucide-react";

export default function InformationsDialog({
  estimate,
}: {
  estimate: { intervention: { description: string; medias: string | null } };
}) {
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
        <Button variant="outline" size="sm" className="col-span-2 gap-2">
          <EyeIcon className="size-4" />
          Informations
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] w-fit! max-w-[90vw]! overflow-y-auto">
        <DialogHeader className="pt-3">
          <DialogTitle>Photos et vidéos</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-5">
          <div className="bg-muted/30 max-h-64 overflow-y-auto rounded-md border p-4">
            <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
              {estimate.intervention.description}
            </p>
          </div>
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
