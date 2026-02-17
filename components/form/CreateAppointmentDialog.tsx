"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import SelectField from "./SelectField";
import SelectSearch from "./SelectSearch";
import { DatePicker } from "./DatePicker";
import { Clock } from "lucide-react";
import { createAppointment } from "@/lib/actions/calendar";
import toast from "react-hot-toast";
import { Spinner } from "../ui/spinner";

// Schéma de validation
const appointmentSchema = z.object({
  type: z.number(),
  clientId: z.string().min(1, "Veuillez sélectionner un client"),
  vehiculeId: z.string().min(1, "Veuillez sélectionner un véhicule"),
  date: z.string().min(1, "La date est requise"),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format: HH:MM"),
  estimateId: z.string().optional(),
  notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface CreateAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  defaultType?: number;
  defaultClientId?: string;
  defaultVehiculeId?: string;
  defaultEstimateId?: string;
  disableType?: boolean;
  disableClient?: boolean;
  disableVehicule?: boolean;
  disableEstimate?: boolean;
}

// Données fictives pour les selects
const appointmentTypes = [
  { label: "Apport du véhicule", value: "0" }, // DROPOFF
  { label: "Récupération du véhicule", value: "1" }, // PICKUP
];

export default function CreateAppointmentDialog({
  open,
  onOpenChange,
  onSuccess,
  defaultType,
  defaultClientId,
  defaultVehiculeId,
  defaultEstimateId,
  disableType = false,
  disableClient = false,
  disableVehicule = false,
  disableEstimate = false,
}: CreateAppointmentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [clients, setClients] = useState<{ label: string; value: string }[]>(
    [],
  );
  const [allVehicules, setAllVehicules] = useState<
    { label: string; value: string; clientId: number }[]
  >([]);
  const [allEstimates, setAllEstimates] = useState<
    { label: string; value: string; clientId: number }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
  });

  // Charger les données au montage du composant
  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  // Initialiser selectedClientId après le chargement des données (pour filtrer les véhicules/devis)
  useEffect(() => {
    if (open && !isLoading && defaultClientId && !selectedClientId) {
      setSelectedClientId(defaultClientId);
    }
  }, [open, isLoading, defaultClientId, selectedClientId]);

  // Filtrer les véhicules et devis selon le client sélectionné avec useMemo pour éviter les recalculs inutiles
  const filteredVehicules = useMemo(
    () =>
      selectedClientId
        ? allVehicules.filter((v) => v.clientId === parseInt(selectedClientId))
        : [],
    [selectedClientId, allVehicules],
  );

  const filteredEstimates = useMemo(
    () =>
      selectedClientId
        ? allEstimates.filter((e) => e.clientId === parseInt(selectedClientId))
        : [],
    [selectedClientId, allEstimates],
  );

  // Gérer le changement de client
  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    // Réinitialiser les champs véhicule et devis seulement s'ils ne sont pas désactivés
    if (!disableVehicule) {
      setValue("vehiculeId", "");
    }
    if (!disableEstimate) {
      setValue("estimateId", "");
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Charger les clients
      const clientsResponse = await fetch("/api/calendar/clients");
      if (clientsResponse.ok) {
        const clientsData = await clientsResponse.json();
        setClients(clientsData);
      }

      // Charger les véhicules
      const vehiculesResponse = await fetch("/api/calendar/vehicules");
      if (vehiculesResponse.ok) {
        const vehiculesData = await vehiculesResponse.json();
        setAllVehicules(vehiculesData);
      }

      // Charger les devis
      const estimatesResponse = await fetch("/api/calendar/estimates");
      if (estimatesResponse.ok) {
        const estimatesData = await estimatesResponse.json();
        setAllEstimates(estimatesData);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: AppointmentFormData) => {
    setIsSubmitting(true);
    try {
      const appointmentDate = new Date(data.date).setHours(0, 0, 0, 0);

      const response = await createAppointment({
        data: {
          type: data.type === 0 ? "DROPOFF" : "PICKUP",
          clientId: data.clientId,
          vehiculeId: data.vehiculeId,
          estimateId: data.estimateId,
          date: new Date(appointmentDate),
          time: data.time,
          notes: data.notes,
        },
      });

      if (response.success) {
        toast.success(response.message);
        reset();
        setSelectedClientId("");
        onOpenChange(false);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error(response.message);
        return;
      }
    } catch (error) {
      console.error("Erreur lors de la création du rendez-vous:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedClientId("");
    onOpenChange(false);
  };

  // Générer les créneaux horaires (de 08:00 à 18:00 par pas de 30 minutes)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        slots.push(time);
      }
    }
    return slots;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-150">
        <DialogHeader>
          <DialogTitle>Créer un rendez-vous</DialogTitle>
          <DialogDescription>
            Planifiez un rendez-vous pour l&apos;apport ou la récupération
            d&apos;un véhicule.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Type de rendez-vous */}
          <SelectField
            setValue={setValue}
            items={appointmentTypes}
            placeHolder="Sélectionnez le type"
            name="type"
            label="Type de rendez-vous"
            nonempty
            error={errors.type}
            disabled={disableType}
            defaultValue={
              !isLoading && defaultType !== undefined
                ? defaultType.toString()
                : undefined
            }
          />

          {/* Client */}
          <SelectSearch
            label="Client"
            placeholder="Rechercher un client"
            content={clients}
            setValue={setValue}
            name="clientId"
            research="Rechercher..."
            noFound={isLoading ? "Chargement..." : "Aucun client trouvé"}
            error={errors.clientId}
            onValueChange={handleClientChange}
            disabled={disableClient}
            defaultValue={!isLoading ? defaultClientId : undefined}
            nonempty
          />

          {/* Véhicule */}
          <SelectSearch
            label="Véhicule"
            placeholder={
              selectedClientId
                ? "Sélectionnez un véhicule"
                : "Sélectionnez d'abord un client"
            }
            content={filteredVehicules}
            setValue={setValue}
            name="vehiculeId"
            research="Rechercher un véhicule..."
            noFound={
              isLoading
                ? "Chargement..."
                : selectedClientId
                  ? "Aucun véhicule trouvé pour ce client"
                  : "Sélectionnez d'abord un client"
            }
            error={errors.vehiculeId}
            disabled={disableVehicule || !selectedClientId}
            defaultValue={!isLoading ? defaultVehiculeId : undefined}
            nonempty
          />

          {/* Date et Heure */}
          <div className="grid grid-cols-2 gap-4">
            {/* Date */}
            <DatePicker
              label="Date"
              name="date"
              setValue={setValue}
              placeholder="Sélectionnez une date"
              error={errors.date}
              disablePast
              required
            />

            {/* Heure */}
            <div className="space-y-2">
              <Label htmlFor="time">
                Heure<span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="time"
                  type="time"
                  {...register("time")}
                  step="1800"
                  min="08:00"
                  max="18:00"
                  className="pl-10"
                  list="time-slots"
                />
                <Clock className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <datalist id="time-slots">
                  {generateTimeSlots().map((slot) => (
                    <option key={slot} value={slot} />
                  ))}
                </datalist>
              </div>
              {errors.time && (
                <p className="text-sm text-red-500">{errors.time.message}</p>
              )}
            </div>
          </div>

          {/* Devis (optionnel) */}
          <SelectSearch
            label="Devis"
            placeholder={
              selectedClientId
                ? "Sélectionnez un devis"
                : "Sélectionnez d'abord un client"
            }
            content={filteredEstimates}
            setValue={setValue}
            name="estimateId"
            research="Rechercher un devis..."
            noFound={
              isLoading
                ? "Chargement..."
                : selectedClientId
                  ? "Aucun devis trouvé pour ce client"
                  : "Sélectionnez d'abord un client"
            }
            disabled={disableEstimate || !selectedClientId}
            defaultValue={!isLoading ? defaultEstimateId : undefined}
          />

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Ajoutez des notes ou instructions particulières..."
              {...register("notes")}
              rows={3}
              className="resize-none"
            />
            {errors.notes && (
              <p className="text-sm text-red-500">{errors.notes.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Spinner /> : "Créer le rendez-vous"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
