"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GeistMono } from "geist/font/mono";
import { Card } from "@/components/ui/card";
import { ArrowLeft, User, Car, CheckCircle } from "lucide-react";
import Link from "next/link";
import { TypeClient } from "@/generated/prisma/enums";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Spinner } from "@/components/ui/spinner";
import parsePhoneNumberFromString from "libphonenumber-js";
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
            <main className="w-250 py-8">
              <div className="flex w-full flex-col items-center space-y-6">
                <div className="grid w-full grid-cols-2 gap-x-6">
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
                          value={
                            parsePhoneNumberFromString(
                              data.client.phone,
                            )?.formatInternational() || data.client.phone
                          }
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
                </div>
                <form
                  className="grid w-full gap-4"
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
                    />
                  </Card>
                  <div className="flex gap-4">
                    <Link
                      href={`/client-handle/${data.client.id}`}
                      className="flex-1"
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
                      className={`${data.client.typeClient === "individual" ? "individual-btn" : "company-btn"} h-14 flex-1 text-lg`}
                      onClick={handleSubmit(handleSubmitForm)}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? <Spinner /> : "Valider l'intervention"}
                    </Button>
                  </div>
                </form>
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
