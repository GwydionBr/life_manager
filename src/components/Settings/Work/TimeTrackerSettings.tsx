import { useIntl } from "@/hooks/useIntl";
import { settingsCollection } from "@/db/collections/settings/settings-collection";
import { useSettings } from "@/db/collections/settings/use-settings-query";

import { Stack, Switch } from "@mantine/core";

export default function TimeTrackerSettings() {
  const { data: settings } = useSettings();
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
          settingsCollection.update(settings.id, (draft) => {
            draft.automaticly_stop_other_timer = event.currentTarget.checked;
          })
        }
      />
    </Stack>
  );
}
