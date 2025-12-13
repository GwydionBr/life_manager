import { useIntl } from "@/hooks/useIntl";
import useSettingsStore from "@/stores/settingsStore";
import ModuleColorPicker from "../ModuleColorPicker";

export default function WorkColorSettings() {
  const { getLocalizedText } = useIntl();
  const { workColor, setWorkColor } = useSettingsStore();

  return (
    <ModuleColorPicker
      label={getLocalizedText("Work Modulfarbe", "Work Module Color")}
      placeholder={getLocalizedText(
        "Work Farbe auswählen",
        "Select Work Color"
      )}
      value={workColor}
      onChange={setWorkColor}
    />
  );
}
