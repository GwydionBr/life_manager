import { useIntl } from "@/hooks/useIntl";
import useSettingsStore from "@/stores/settingsStore";
import ModuleColorPicker from "../ModuleColorPicker";

export default function CalendarColorSettings() {
  const { getLocalizedText } = useIntl();
  const { calendarColor, setCalendarColor } = useSettingsStore();

  return (
    <ModuleColorPicker
      label={getLocalizedText("Calendar Modulfarbe", "Calendar Module Color")}
      placeholder={getLocalizedText(
        "Calendar Farbe auswählen",
        "Select Calendar Color"
      )}
      value={calendarColor}
      onChange={setCalendarColor}
    />
  );
}
