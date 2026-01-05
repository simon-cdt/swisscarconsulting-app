import { Card } from "./ui/card";
import { CalendarIcon, CarIcon, UserIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "./ui/button";
import Link from "next/link";
import { TypeClient } from "@/generated/prisma/enums";
import { GeistMono } from "geist/font/mono";
import InformationsDialog from "./InformationsDialog";

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
      className={`${isIndividual ? "individual-card" : "company-card"} hover:border-primary/50 w-100 p-6 transition-colors`}
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
          <InformationsDialog estimate={estimate} />
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
