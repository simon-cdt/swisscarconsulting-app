"use client";

import { Label } from "@/components/ui/label";
import { DateField, DateInput } from "@/components/ui/datefield-rac";
import { DateValue } from "react-aria-components";
import { CalendarDate } from "@internationalized/date";
import { FieldError } from "react-hook-form";
import { useEffect, useState } from "react";

export default function DateInputField({
  label,
  error,
  setValue,
  name,
  defaultValue,
}: {
  label: string;
  error?: FieldError;
  // eslint-disable-next-line
  setValue: any;
  name: string;
  defaultValue?: Date;
}) {
  const [date, setDate] = useState<DateValue | null | undefined>(() => {
    if (defaultValue) {
      const d = new Date(defaultValue);
      return new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
    }
    return null;
  });

  useEffect(() => {
    if (date) {
      const dateFormat = new Date(date.year, date.month - 1, date.day).setHours(
        0,
        0,
        0,
        0,
      );
      setValue(name, new Date(dateFormat));
    }
  }, [date, setValue, name]);

  return (
    <DateField
      className="flex flex-col gap-2"
      value={date}
      onChange={(newValue: DateValue | null) => {
        if (newValue) {
          setDate(newValue);
        }
      }}
    >
      <Label>{label}</Label>
      <DateInput />
      {error && <p className="text-sm text-red-500">{error.message}</p>}
    </DateField>
  );
}
