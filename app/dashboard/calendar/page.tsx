"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Car,
  FileText,
  User,
  Phone,
} from "lucide-react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  parseISO,
} from "date-fns";
import { fr } from "date-fns/locale";
import CreateAppointmentDialog from "@/components/form/CreateAppointmentDialog";
import { useQuery } from "@tanstack/react-query";
import { AppointmentType } from "@/generated/prisma/enums";

// Types pour les rendez-vous
interface Appointment {
  id: string;
  type: AppointmentType;
  time: string;
  date: Date;
  clientName: string;
  clientPhone: string;
  vehicleBrand: string;
  vehicleModel: string;
  licensePlate: string;
  estimateId?: string;
  notes?: string;
}

type FetchAppointment = {
  id: string;
  type: AppointmentType;
  date: Date;
  time: string;
  notes: string | null;
  client: {
    id: number;
    name: string | null;
    firstName: string | null;
    companyName: string | null;
    phone: string;
    typeClient: string;
  };
  vehicule: {
    id: string;
    brand: string;
    model: string;
    licensePlate: string;
  };
  estimate: {
    id: string;
    claimNumber: string | null;
  } | null;
};

function useAppointments() {
  return useQuery({
    queryKey: ["appointments"],
    queryFn: async (): Promise<FetchAppointment[]> => {
      const response = await fetch("/api/calendar");
      if (!response.ok) {
        throw new Error("Failed to fetch appointments");
      }
      return await response.json();
    },
  });
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: fetchedAppointments, isLoading, refetch } = useAppointments();

  // Transformer les données de l'API au format attendu
  const appointments: Appointment[] = fetchedAppointments
    ? fetchedAppointments.map((apt) => {
        const clientName =
          apt.client.typeClient === "individual"
            ? `${apt.client.firstName || ""} ${apt.client.name || ""}`.trim()
            : apt.client.companyName || "";

        return {
          id: apt.id,
          type: apt.type,
          time: apt.time,
          date: typeof apt.date === "string" ? parseISO(apt.date) : apt.date,
          clientName,
          clientPhone: apt.client.phone,
          vehicleBrand: apt.vehicule.brand,
          vehicleModel: apt.vehicule.model,
          licensePlate: apt.vehicule.licensePlate,
          estimateId: apt.estimate?.id,
          notes: apt.notes || undefined,
        };
      })
    : [];

  // Générer les jours du calendrier
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  // Obtenir les rendez-vous pour un jour donné, triés par heure
  const getAppointmentsForDay = (day: Date) => {
    return appointments
      .filter((apt) => isSameDay(apt.date, day))
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  // Navigation du calendrier
  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Calendrier du garage
          </h1>
          <p className="text-muted-foreground">
            Gestion des rendez-vous d&apos;apport et de récupération
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1 px-3 py-1.5">
            <div className="h-2 w-2 rounded-full bg-amber-500" />
            Apport
          </Badge>
          <Badge variant="outline" className="gap-1 px-3 py-1.5">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            Récupération
          </Badge>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="flex h-150 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
              <p className="text-muted-foreground">
                Chargement des rendez-vous...
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Calendrier */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <CalendarIcon className="h-6 w-6" />
                    {format(currentDate, "MMMM yyyy", { locale: fr })}
                  </CardTitle>
                  <CardDescription>
                    {
                      appointments.filter((apt) =>
                        isSameMonth(apt.date, currentDate),
                      ).length
                    }{" "}
                    rendez-vous ce mois
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={goToToday}>
                      Aujourd&apos;hui
                    </Button>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={goToPreviousMonth}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={goToNextMonth}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => setCreateDialogOpen(true)}
                  >
                    Créer un rendez-vous
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Jours de la semaine */}
              <div className="mb-2 grid grid-cols-7 gap-2 text-center">
                {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(
                  (day) => (
                    <div
                      key={day}
                      className="text-muted-foreground py-2 text-sm font-semibold"
                    >
                      {day}
                    </div>
                  ),
                )}
              </div>

              {/* Grille du calendrier */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day) => {
                  const dayAppointments = getAppointmentsForDay(day);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isCurrentDay = isToday(day);

                  return (
                    <div
                      key={day.toString()}
                      className={`h-26 overflow-y-auto rounded-lg border p-2 transition-colors ${
                        isCurrentMonth
                          ? "border-border bg-card"
                          : "border-border/50 bg-muted/30"
                      } ${isCurrentDay && "border-2 border-gray-300 bg-gray-200"}`}
                    >
                      <div
                        className={`mb-1 text-sm font-medium ${
                          isCurrentMonth
                            ? "text-foreground"
                            : "text-muted-foreground"
                        } ${isCurrentDay ? "text-primary" : ""}`}
                      >
                        {format(day, "d")}
                      </div>
                      <div className="space-y-1">
                        {dayAppointments.map((apt) => (
                          <button
                            key={apt.id}
                            onClick={() => setSelectedAppointment(apt)}
                            className={`w-full rounded px-1.5 py-1 text-left text-xs transition-colors hover:opacity-80 ${
                              apt.type === AppointmentType.DROPOFF
                                ? "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100"
                                : "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-100"
                            }`}
                          >
                            <div className="font-medium">{apt.time}</div>
                            <div className="truncate text-[10px]">
                              {apt.clientName}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Dialog de détails du rendez-vous */}
          <Dialog
            open={!!selectedAppointment}
            onOpenChange={(open) => !open && setSelectedAppointment(null)}
          >
            <DialogContent className="sm:max-w-125">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedAppointment?.type === AppointmentType.DROPOFF ? (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                      <Car className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                      <Car className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  )}
                  {selectedAppointment?.type === AppointmentType.DROPOFF
                    ? "Rendez-vous d'apport"
                    : "Rendez-vous de récupération"}
                </DialogTitle>
                <DialogDescription>
                  {selectedAppointment &&
                    format(selectedAppointment.date, "EEEE d MMMM yyyy", {
                      locale: fr,
                    })}{" "}
                  à {selectedAppointment?.time}
                </DialogDescription>
              </DialogHeader>

              {selectedAppointment && (
                <div className="space-y-4">
                  {/* Information client */}
                  <div className="border-border rounded-lg border p-4">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                      <User className="h-4 w-4" />
                      Client
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <div className="text-muted-foreground text-xs">Nom</div>
                        <div className="font-medium">
                          {selectedAppointment.clientName}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs">
                          Téléphone
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="text-muted-foreground h-3 w-3" />
                          <span className="font-medium">
                            {selectedAppointment.clientPhone}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Information véhicule */}
                  <div className="border-border rounded-lg border p-4">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                      <Car className="h-4 w-4" />
                      Véhicule
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <div className="text-muted-foreground text-xs">
                          Modèle
                        </div>
                        <div className="font-medium">
                          {selectedAppointment.vehicleBrand}{" "}
                          {selectedAppointment.vehicleModel}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs">
                          Plaque d&apos;immatriculation
                        </div>
                        <div className="font-mono font-medium">
                          {selectedAppointment.licensePlate}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Devis lié */}
                  {selectedAppointment.estimateId && (
                    <div className="border-border rounded-lg border p-4">
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                        <FileText className="h-4 w-4" />
                        Devis
                      </h3>
                      <div>
                        <Badge variant="secondary">
                          {selectedAppointment.estimateId}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {selectedAppointment.notes && (
                    <div className="border-border rounded-lg border p-4">
                      <h3 className="mb-2 text-sm font-semibold">Notes</h3>
                      <p className="text-muted-foreground text-sm">
                        {selectedAppointment.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}

      {/* Dialog de création de rendez-vous */}
      <CreateAppointmentDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          refetch();
        }}
      />
    </div>
  );
}
