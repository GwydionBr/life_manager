import { useSettingsStore } from "@/stores/settingsStore";

import { DatePickerInput, DatePickerInputProps } from "@mantine/dates";

export default function LocaleDatePickerInput({
  label,
  value,
  onChange,
  error,
  allowSingleDateInRange,
  ...props
}: DatePickerInputProps) {
  const { locale } = useSettingsStore();

  return (
    <DatePickerInput
      valueFormat={locale === "de-DE" ? "DD. MMMM YYYY" : "MMM DD, YYYY"}
      label={label}
      value={value}
      onChange={onChange}
      error={error}
      allowSingleDateInRange={allowSingleDateInRange}
      highlightToday
      {...props}
    />
  );
}
