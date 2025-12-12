import { useIntl } from "@/hooks/useIntl";
import { useSettings } from "@/queries/settings/use-settings";
import { useUpdateSettings } from "@/queries/settings/use-update-settings";

import { Stack, Switch } from "@mantine/core";

export default function TimeTrackerSettings() {
  const { data: settings } = useSettings();
  const { mutate: updateSettings } = useUpdateSettings();
  const { getLocalizedText } = useIntl();

  if (!settings) return null;

  const { automaticly_stop_other_timer } = settings;

  return (
    <Stack>
      <Switch
        label={getLocalizedText(
          "Andere Timer automatisch stoppen, wenn ein neuer gestartet wird",
          "Automaticly stop other timers when starting a new one"
        )}
        checked={automaticly_stop_other_timer}
        onChange={(event) =>
          updateSettings({
            automaticly_stop_other_timer: event.currentTarget.checked,
          })
        }
      />
    </Stack>
  );
}
