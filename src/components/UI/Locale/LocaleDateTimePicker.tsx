"use client";

import { useSettingsStore } from "@/stores/settingsStore";

import { DateTimePicker, DateTimePickerProps } from "@mantine/dates";

export default function LocaleDateTimePicker({
  label,
  value,
  onChange,
  error,
  ...props
}: DateTimePickerProps) {
  const { locale, format24h } = useSettingsStore();

  return (
    <DateTimePicker
      valueFormat={
        locale === "de-DE"
          ? `DD. MMMM YYYY ${format24h ? "HH:mm" : "hh:mm A"}`
          : `MMM DD, YYYY ${format24h ? "HH:mm" : "hh:mm A"}`
      }
      timePickerProps={{
        format: format24h ? "24h" : "12h",
      }}
      highlightToday
      label={label}
      value={value}
      onChange={onChange}
      error={error}
      {...props}
    />
  );
}
