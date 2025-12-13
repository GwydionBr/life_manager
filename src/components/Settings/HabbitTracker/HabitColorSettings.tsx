import { useIntl } from "@/hooks/useIntl";
import useSettingsStore from "@/stores/settingsStore";
import ModuleColorPicker from "../ModuleColorPicker";

export default function HabitColorSettings() {
  const { getLocalizedText } = useIntl();
  const { habitColor, setHabitColor } = useSettingsStore();

  return (
    <ModuleColorPicker
      label={getLocalizedText(
        "Habit Tracker Modulfarbe",
        "Habit Tracker Module Color"
      )}
      placeholder={getLocalizedText(
        "Habit Tracker Farbe auswählen",
        "Select Habit Tracker Color"
      )}
      value={habitColor}
      onChange={setHabitColor}
    />
  );
}
