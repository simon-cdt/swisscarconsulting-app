"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { FieldError, UseFormSetValue } from "react-hook-form";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  label: string;
  name: string;
  // eslint-disable-next-line
  setValue: UseFormSetValue<any>;
  placeholder?: string;
  error?: FieldError;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  required?: boolean;
  disablePast?: boolean;
}

export function DatePicker({
  label,
  name,
  setValue,
  placeholder = "Sélectionnez une date",
  error,
  disabled = false,
  minDate,
  maxDate,
  required = false,
  disablePast = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(undefined);

  // Fonction pour désactiver les dates passées
  const isDateDisabled = (date: Date) => {
    if (disablePast) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date < today;
    }
    return false;
  };

  // Définir la date minimale si fournie
  const effectiveMinDate = minDate;

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        <p>
          {label}&nbsp;
          {required && <span className="text-red-500">*</span>}
        </p>
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={name}
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground",
              error && "border-red-500",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP", { locale: fr }) : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            defaultMonth={date}
            captionLayout="dropdown"
            fromDate={effectiveMinDate}
            toDate={maxDate}
            disabled={disabled ? true : isDateDisabled}
            locale={fr}
            onSelect={(selectedDate) => {
              setDate(selectedDate);
              if (selectedDate) {
                setValue(name, format(selectedDate, "yyyy-MM-dd"));
              } else {
                setValue(name, "");
              }
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-red-500">{error.message}</p>}
    </div>
  );
}
