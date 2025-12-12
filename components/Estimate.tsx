import React from "react";
import { Card } from "./ui/card";
import { CalendarIcon, CarIcon, EyeIcon, UserIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { FILE_SERVER_URL } from "@/lib/config";
import Link from "next/link";
import { TypeClient } from "@prisma/client";
import { GeistMono } from "geist/font/mono";

export default function Estimate({
  estimate,
  isIndividual,
}: {
  estimate: {
    id: string;
    intervention: {
      id: string;
      date: Date;
      description: string;
      medias: string | null;
      user: {
        username: string;
      };
      vehicule: {
        brand: string;
        model: string;
        licensePlate: string;
        client: {
          name: string | null;
          firstName: string | null;
          companyName: string | null;
          typeClient: TypeClient;
        };
      };
    };
  };
  isIndividual: boolean;
}) {
  const truncateText = (text: string, maxLength = 27) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + "...";
  };

  const getClientDisplayName = (client: {
    name: string | null;
    firstName: string | null;
    companyName: string | null;
  }) => {
    if (client.companyName) {
      return client.companyName;
    }
    return `${client.firstName || ""} ${client.name || ""}`.trim();
  };
  return (
    <Card
      key={estimate.id}
      className={`${isIndividual ? "individual-card" : "company-card"} hover:border-primary/50 w-[400px] p-6 transition-colors`}
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        {/* Informations principales */}
        <div className="flex h-full flex-col justify-between gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-muted-foreground flex items-center gap-2">
              <CalendarIcon className="size-4" />
              <span className="text-sm font-medium">
                {format(estimate.intervention.date, "PP", {
                  locale: fr,
                })}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-foreground text-lg font-semibold">
              {getClientDisplayName(estimate.intervention.vehicule.client)}
            </h3>

            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <CarIcon className="size-4" />
              <span>
                {estimate.intervention.vehicule.brand}{" "}
                {estimate.intervention.vehicule.model} /{" "}
                <span className={`${GeistMono.className}`}>
                  {estimate.intervention.vehicule.licensePlate}
                </span>
              </span>
            </div>

            <p className="text-muted-foreground text-sm">
              {truncateText(estimate.intervention.description)}
            </p>

            <div className="text-muted-foreground flex items-center gap-2">
              <UserIcon className="size-4" />
              <span className="text-sm">
                Pris en charge par:{" "}
                <span className="text-foreground font-mono font-medium">
                  {estimate.intervention.user.username}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex h-full flex-col justify-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="col-span-2 gap-2 bg-transparent"
              >
                <EyeIcon className="size-4" />
                Informations
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] w-fit max-w-[30vw] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Photos et vidéos</DialogTitle>
              </DialogHeader>
              <div className="flex flex-wrap gap-5">
                <div className="bg-muted/30 max-h-64 overflow-y-auto rounded-md border p-4">
                  <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                    {estimate.intervention.description}
                  </p>
                </div>
                {estimate.intervention.medias?.split(",").map((file, index) => {
                  const fileName = file.trim();
                  const isVideo = /\.(mp4|webm|ogg|mov|avi|mkv)$/i.test(
                    fileName,
                  );
                  const isImage = /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(
                    fileName,
                  );

                  if (isVideo) {
                    return (
                      <div
                        key={index}
                        className="bg-muted relative aspect-video overflow-hidden rounded-lg"
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
                        className="bg-muted relative aspect-video overflow-hidden rounded-lg border border-black/20"
                      >
                        {/* eslint-disable-next-line */}
                        <img
                          src={`${FILE_SERVER_URL}/uploads/${fileName}`}
                          alt={`Image ${index + 1}`}
                          className="object-contain"
                        />
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            </DialogContent>
          </Dialog>
          <Link href={`/dashboard/estimates/${estimate.id}`} className="w-full">
            <Button
              className={`${estimate.intervention.vehicule.client.typeClient === "individual" ? "individual-btn" : "company-btn"} w-full`}
            >
              Faire le devis
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
