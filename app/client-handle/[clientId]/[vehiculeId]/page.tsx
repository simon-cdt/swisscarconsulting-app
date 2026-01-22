"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GeistMono } from "geist/font/mono";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, User, Car, CheckCircle, History } from "lucide-react";
import Link from "next/link";
import { TypeClient } from "@/generated/prisma/enums";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Spinner } from "@/components/ui/spinner";
import { UpdateVehicule } from "@/components/form/UpdateForm/UpdateVehicule";
import { addIntervention } from "@/lib/actions/intervention";
import toast from "react-hot-toast";
import LoadingPage from "@/components/LoadingPage";
import ErrorPage from "@/components/ErrorPage";
import UploadFiles from "@/components/form/UploadFiles";
import { FILE_SERVER_URL } from "@/lib/config";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import UpdateClient from "@/components/form/UpdateForm/UpdateClient";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatPhoneNumber } from "@/lib/utils";

type FetchClientAndVehicule = {
  vehicule: {
    id: string;
    brand: string;
    model: string;
    year: number;
    licensePlate: string;
    chassisNumber: string | null;
    registrationNumber: string | null;
    lastExpertise: string | null;
    certificateImage: string | null;
    insurance: {
      id: string;
      name: string;
    } | null;
    interventions: {
      id: string;
      date: Date;
      description: string;
    }[];
  };
  client: {
    id: number;
    typeClient: TypeClient;
    companyName: null;
    name: string | null;
    firstName: string | null;
    phone: string;
    email: string;
    address: string | null;
    city: string | null;
    postalCode: string | null;
    contactFirstName: null;
    contactName: null;
  };
};

function useClientAndVehicule({
  clientId,
  vehiculeId,
}: {
  clientId: string;
  vehiculeId: string;
}) {
  return useQuery({
    queryKey: ["client_vehicule", clientId, vehiculeId],
    queryFn: async (): Promise<FetchClientAndVehicule> => {
      const response = await fetch(`/api/clients/${clientId}/${vehiculeId}`);
      return await response.json();
    },
  });
}

export default function VisitPage() {
  const params = useParams();
  const clientId = params?.clientId;
  const vehiculeId = params.vehiculeId;

  const router = useRouter();

  const { data, isLoading, isError, refetch } = useClientAndVehicule({
    clientId: clientId as string,
    vehiculeId: vehiculeId as string,
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleDescriptionKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;

      // Insérer un retour à la ligne avec un tiret
      const newValue =
        value.substring(0, start) + "\n- " + value.substring(end);

      setValue("description", newValue);

      // Repositionner le curseur après le tiret
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 3;
      }, 0);
    }
  };

  const zodFormSchema = z.object({
    description: z.string().nonempty("La description est requise."),
    images: z.array(z.instanceof(File)).optional(),
  });
  type FormSchema = z.infer<typeof zodFormSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormSchema>({
    resolver: zodResolver(zodFormSchema),
  });

  const handleSubmitForm = async (data: FormSchema) => {
    try {
      let uploadedUrls: string[] = [];

      if (data.images && data.images.length > 0) {
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
      }

      const response = await addIntervention({
        data: {
          vehiculeId: vehiculeId as string,
          description: data.description,
          medias: uploadedUrls.join(","),
        },
      });

      if (response.success) {
        toast.success("Fichiers envoyés et rendez-vous créé !");
        setIsSubmitted(true);
        setTimeout(() => router.push(`/client-handle`), 3000);
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      console.log(err);
      console.error(err);
      toast.error("Une erreur est survenue lors de l'envoi du formulaire.");
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <h2 className="text-foreground mb-2 text-3xl font-bold">
            Intervention enregistrée
          </h2>
          <p className="text-muted-foreground">
            Redirection automatique vers l&apos;accueil...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isLoading ? (
        <LoadingPage />
      ) : isError ? (
        <ErrorPage />
      ) : (
        data && (
          <div className="flex min-h-screen w-screen flex-col items-center pt-10">
            {/* Header */}
            <header className="bg-card w-250 border-b">
              <div className="container mx-auto flex items-center justify-between px-6 pb-4">
                <div className="flex items-center gap-4">
                  <Link href={`/client-handle/${clientId}`}>
                    <Button variant="ghost" size="icon">
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                  </Link>
                  <h1 className="text-foreground text-2xl font-bold">
                    Nouvelle intervention
                  </h1>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex w-full max-w-400 flex-col gap-6 px-6 py-8">
              {/* Top Section - Client, Vehicule, History */}
              <div className="grid grid-cols-3 gap-6">
                <Card
                  className={`${data.client.typeClient === "individual" ? "individual-card" : "company-card"} h-fit p-6`}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex w-full justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`${data.client.typeClient === "individual" ? "bg-sky-100" : "bg-amber-100"} flex h-10 w-10 items-center justify-center rounded-lg`}
                        >
                          <User
                            className={`${data.client.typeClient === "individual" ? "text-sky-600" : "text-amber-600"} size-6`}
                          />
                        </div>
                        <h2
                          className={`${data.client.typeClient === "individual" ? "text-sky-800" : "text-amber-800"} text-xl font-bold`}
                        >
                          Informations client
                        </h2>
                      </div>
                      <UpdateClient
                        typeClient={data.client.typeClient}
                        client={data.client}
                        refetch={refetch}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                      <Item
                        label={
                          data.client.typeClient === "individual"
                            ? "Nom"
                            : "Entreprise - Contact"
                        }
                        value={
                          data.client.typeClient === "individual"
                            ? `${data.client.name} ${data.client.firstName}`
                            : `${data.client.companyName} - ${data.client.contactName} ${data.client.contactFirstName}`
                        }
                        oneLine
                      />
                      <Item label="E-mail" value={data.client.email} />{" "}
                      <Item
                        label="Téléphone"
                        value={formatPhoneNumber(data.client.phone)}
                      />
                      <Item
                        label="Adresse"
                        value={
                          data.client.address &&
                          data.client.postalCode &&
                          data.client.city
                            ? `${data.client.address}, ${data.client.postalCode} ${data.client.city}`
                            : null
                        }
                        oneLine
                      />
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex flex-col gap-3">
                    <div className="flex w-full justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg">
                          <Car className="h-6 w-6" />
                        </div>
                        <h2 className="text-foreground text-xl font-bold">
                          Véhicule concerné
                        </h2>
                      </div>
                      <UpdateVehicule
                        vehicule={data.vehicule}
                        refetch={refetch}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                      <Item label="Marque" value={data.vehicule.brand} />
                      <Item label="Modèle" value={data.vehicule.model} />
                      <Item
                        label="Année"
                        value={data.vehicule.year.toString()}
                      />
                      <Item
                        label="Immatriculation"
                        value={data.vehicule.licensePlate}
                        fontMono
                      />
                      <Item
                        label="Assurance"
                        value={data.vehicule.insurance?.name || null}
                      />
                      <Item
                        label="Dernière expertise"
                        value={
                          data.vehicule.lastExpertise
                            ? format(data.vehicule.lastExpertise, "P", {
                                locale: fr,
                              })
                            : null
                        }
                      />
                      <Item
                        label="Numéro de chassis"
                        value={data.vehicule.chassisNumber || null}
                      />
                      <Item
                        label="Numéro de matricule"
                        value={data.vehicule.registrationNumber || null}
                      />
                      <div className="col-span-2 mt-2 flex w-full justify-end">
                        {data.vehicule.certificateImage ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant={"outline"}>
                                Voir la carte grise
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-150">
                              <DialogTitle />
                              {/* eslint-disable-next-line */}
                              <img
                                src={`${FILE_SERVER_URL}/uploads/${data.vehicule.certificateImage}`}
                                alt="Carte grise du véhicule"
                                className="w-full"
                              />
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <div className="hover:cursor-not-allowed">
                            <Button
                              className="border-input bg-background border text-black/70"
                              disabled
                            >
                              Carte grise non enregistrée
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Intervention History */}
                <Card className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                      <History className="size-6 text-purple-600" />
                    </div>
                    <h2 className="text-xl font-bold text-purple-800">
                      Historique
                    </h2>
                  </div>

                  <ScrollArea className="h-fit max-h-96">
                    {data.vehicule.interventions.length > 0 ? (
                      <div className="space-y-3 pr-4">
                        {data.vehicule.interventions.map((intervention) => (
                          <Card
                            key={intervention.id}
                            className="border-purple-100 bg-purple-50/50"
                          >
                            <CardContent>
                              <p className="pb-2 text-sm font-semibold text-purple-900">
                                {new Date(intervention.date).toLocaleDateString(
                                  "fr-FR",
                                  {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  },
                                )}
                              </p>
                              <p className="text-sm text-gray-700">
                                {intervention.description}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                          <History className="h-8 w-8 text-purple-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-600">
                          Aucune intervention
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          L&apos;historique apparaîtra ici
                        </p>
                      </div>
                    )}
                  </ScrollArea>
                </Card>
              </div>

              {/* Bottom Section - Description and Buttons */}
              <div className="flex w-full gap-4">
                <form
                  className="flex-1"
                  onSubmit={handleSubmit(handleSubmitForm)}
                >
                  <Card className="p-6">
                    <textarea
                      placeholder="Description du problème"
                      {...register("description")}
                      onKeyDown={handleDescriptionKeyDown}
                      className="min-h-40 w-full rounded border p-2 text-sm"
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500">
                        {errors.description.message}
                      </p>
                    )}
                    <UploadFiles
                      errorsForm={errors.images?.message}
                      setValue={setValue}
                      color
                    />
                  </Card>
                </form>
                <div className="flex w-64 flex-col gap-4">
                  <Link
                    href={`/client-handle/${data.client.id}`}
                    className="w-full"
                  >
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-14 w-full bg-transparent text-lg"
                    >
                      Retour
                    </Button>
                  </Link>
                  <Button
                    size="lg"
                    className={`${data.client.typeClient === "individual" ? "individual-btn" : "company-btn"} h-14 w-full text-lg`}
                    onClick={handleSubmit(handleSubmitForm)}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <Spinner /> : "Valider l'intervention"}
                  </Button>
                </div>
              </div>
            </main>
          </div>
        )
      )}
    </>
  );
}

const Item = ({
  label,
  value,
  oneLine,
  fontMono,
}: {
  label: string;
  value: string | null;
  oneLine?: boolean;
  fontMono?: boolean;
}) => {
  return (
    <div className={`${oneLine && "col-span-2"}`}>
      <p className="text-muted-foreground text-sm">{label}</p>
      <p
        className={`${fontMono && `${GeistMono.className}`} ${value ? "text-foreground" : "text-red-500"} text-base font-medium`}
      >
        {value ? value : "Non renseigné"}
      </p>
    </div>
  );
};
