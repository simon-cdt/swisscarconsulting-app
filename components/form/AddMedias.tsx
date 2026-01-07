"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FILE_SERVER_URL } from "@/lib/config";
import toast from "react-hot-toast";
import UploadFiles from "./UploadFiles";
import { Spinner } from "../ui/spinner";
import { addMediasIntervention } from "@/lib/actions/intervention";
import { useState } from "react";

export default function AddMedias({
  refetch,
  interventionId,
}: {
  refetch: () => void;
  interventionId: string;
}) {
  const [open, setOpen] = useState(false);

  const zodFormSchema = z.object({
    images: z
      .array(z.instanceof(File))
      .min(1, "Au moins une photo ou vidéo est obligatoire"),
  });
  type FormSchema = z.infer<typeof zodFormSchema>;

  const {
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormSchema>({
    resolver: zodResolver(zodFormSchema),
  });

  const handleSubmitForm = async (data: FormSchema) => {
    try {
      let uploadedUrls: string[] = [];

      const formData = new FormData();
      data.images.forEach((file) => {
        formData.append("files", file);
      });

      console.log(process.env.FILE_SERVER_URL);

      const res = await fetch(`${FILE_SERVER_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Erreur lors de l'envoi des fichiers");

      const json = await res.json();
      uploadedUrls = json.files.map((url: string) => `${url}`);

      const response = await addMediasIntervention({
        data: {
          interventionId: interventionId,
          medias: uploadedUrls.join(","),
        },
      });

      if (response.success) {
        toast.success("Fichiers envoyés et rendez-vous créé !");
        refetch();
        setOpen(false);
      } else {
        toast.error(response.message);
        setOpen(false);
      }
    } catch (err) {
      console.log(err);
      console.error(err);
      toast.error("Une erreur est survenue lors de l'envoi du formulaire.");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form onSubmit={handleSubmit(handleSubmitForm)}>
        <DialogTrigger asChild>
          <Button>{"Ajouter des médias"}</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter des médias</DialogTitle>
            <DialogDescription>
              Ajoutez des photos ou vidéos pour documenter l&apos;état du
              véhicule ou les interventions réalisées.
            </DialogDescription>
          </DialogHeader>
          <div>
            <UploadFiles
              errorsForm={errors.images?.message}
              setValue={setValue}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button
              type="submit"
              onClick={handleSubmit(handleSubmitForm)}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Spinner /> : "Ajouter les nouvelles photos"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
