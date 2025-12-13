import { useIntl } from "@/hooks/useIntl";
import useSettingsStore from "@/stores/settingsStore";
import ModuleColorPicker from "@/components/Settings/ModuleColorPicker";

export default function ThemeSettings() {
  const { getLocalizedText } = useIntl();
  const { primaryColor, setPrimaryColor } = useSettingsStore();

  return (
    <ModuleColorPicker
      label={getLocalizedText("Primärfarbe", "Primary Color")}
      placeholder={getLocalizedText(
        "Primärfarbe auswählen",
        "Select Primary Color"
      )}
      value={primaryColor}
      onChange={setPrimaryColor}
    />
  );
}
