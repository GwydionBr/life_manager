import { useIntl } from "@/hooks/useIntl";
import useSettingsStore from "@/stores/settingsStore";
import ModuleColorPicker from "@/components/Settings/ModuleColorPicker";

export default function FinanceColorSettings() {
  const { getLocalizedText } = useIntl();
  const { financeColor, setFinanceColor } = useSettingsStore();

  return (
    <ModuleColorPicker
      label={getLocalizedText("Finance Modulfarbe", "Finance Module Color")}
      placeholder={getLocalizedText(
        "Finance Farbe auswählen",
        "Select Finance Color"
      )}
      value={financeColor}
      onChange={setFinanceColor}
    />
  );
}
