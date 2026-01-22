"use client";

import {
  AlertCircleIcon,
  ImageIcon,
  UploadIcon,
  XIcon,
  VideoIcon,
} from "lucide-react";

import { useFileUpload } from "@/hooks/use-file-upload";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import toast from "react-hot-toast";

export default function UploadFiles({
  errorsForm,
  setValue,
  color,
}: {
  errorsForm: string | undefined;
  // eslint-disable-next-line
  setValue: any;
  color?: boolean;
}) {
  const maxSizeMB = 50;
  const maxSize = maxSizeMB * 1024 * 1024;
  const maxFiles = 6;

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
    },
  ] = useFileUpload({
    accept:
      "image/svg+xml,image/png,image/jpeg,image/jpg,image/gif,video/mp4,video/webm,video/ogg,video/quicktime",
    maxSize,
    multiple: true,
    maxFiles,
  });

  useEffect(() => {
    const mediaFiles = files
      .map((f) => f.file)
      .filter(
        (file) =>
          !!file &&
          (file.type?.startsWith("image/") ||
            file.type?.startsWith("video/") ||
            /\.(svg|png|jpe?g|gif|mp4|webm|ogg|mov)$/i.test(file.name ?? "")),
      );

    if (mediaFiles.length > 0) {
      setValue("images", mediaFiles);
    } else {
      setValue("images", []);
    }
  }, [files, setValue]);

  useEffect(() => {
    if (errors.length > 0) {
      const errorMessage = errors[0];
      if (errorMessage.includes("exceeds the maximum size")) {
        toast.error(
          `Le fichier est trop volumineux. Taille maximale : ${maxSizeMB}MB`,
        );
      } else {
        toast.error(errorMessage);
      }
    }
  }, [errors, maxSizeMB]);

  return (
    <div className="flex flex-col gap-2">
      {/* Drop area */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        data-dragging={isDragging || undefined}
        data-files={files.length > 0 || undefined}
        className="border-input has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 data-[dragging=true]:bg-accent/50 relative flex min-h-52 flex-col items-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors not-data-files:justify-center has-[input:focus]:ring-[3px]"
      >
        <input
          {...getInputProps()}
          className="sr-only"
          aria-label="Upload image file"
        />
        {files.length > 0 ? (
          <div className="flex w-full flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="truncate text-sm font-medium">
                Fichiers téléchargés ({files.length})
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openFileDialog}
                disabled={files.length >= maxFiles}
                className={`flex gap-2`}
              >
                <UploadIcon
                  className="-ms-0.5 size-3.5 opacity-60"
                  aria-hidden="true"
                />
                Ajouter
              </Button>
            </div>

            <div className="flex flex-wrap justify-between gap-3">
              {files.map((file) => {
                const isVideo = file.file.type?.startsWith("video/");
                return (
                  <div
                    key={file.id}
                    className="bg-accent relative aspect-square w-50 rounded-md"
                  >
                    {isVideo ? (
                      <video
                        src={file.preview}
                        className="size-full rounded-[inherit] object-cover"
                        controls
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={file.preview}
                        alt={file.file.name}
                        className="size-full rounded-[inherit] object-cover"
                      />
                    )}
                    <Button
                      type="button"
                      onClick={() => removeFile(file.id)}
                      size="icon"
                      className="border-background focus-visible:border-background absolute -top-2 -right-2 size-6 rounded-full border-2 shadow-none"
                      aria-label="Remove media"
                    >
                      <XIcon className="size-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
            <div
              className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
              aria-hidden="true"
            >
              <div className="flex gap-0.5">
                <ImageIcon className="size-4 opacity-60" />
                <VideoIcon className="size-4 opacity-60" />
              </div>
            </div>
            <p className="mb-1.5 text-sm font-medium">
              Ajoutez les images et vidéos ici
            </p>
            <p className="text-muted-foreground text-xs">
              Images : SVG, PNG, JPG • Vidéos : MP4, WebM, MOV
            </p>
            <Button
              type="button"
              variant="outline"
              className={`mt-4 flex gap-3 ${color ? "bg-rose-500 text-white" : ""}`}
              onClick={openFileDialog}
            >
              <UploadIcon
                className="-ms-1 size-4 opacity-60"
                aria-hidden="true"
              />
              <p>Sélectionner des fichiers</p>
            </Button>
          </div>
        )}
      </div>

      {errors.length > 0 ||
        (errorsForm && (
          <div
            className="text-destructive flex items-center gap-1 text-xs"
            role="alert"
          >
            <AlertCircleIcon className="size-3 shrink-0" />
            <span>{errors[0] || errorsForm}</span>
          </div>
        ))}
    </div>
  );
}
