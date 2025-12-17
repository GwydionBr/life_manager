import {
  useSettings,
  settingsCollection,
} from "@/db/collections/settings/settings-collection";
import { useIntl } from "@/hooks/useIntl";

import { Group, Switch } from "@mantine/core";

export default function CalendarTimeSettings() {
  const { data: settings } = useSettings();
  const { getLocalizedText } = useIntl();

  if (!settings) return null;

  const { show_calendar_time } = settings;

  return (
    <Group>
      {" "}
      <Switch
        label={getLocalizedText(
          "Zeit unter der Maushover in Kalender anzeigen",
          "Show hovered time under mouse in calendar"
        )}
        checked={show_calendar_time}
        onChange={(event) =>
          settingsCollection.update(settings.id, (draft) => {
            draft.show_calendar_time = event.currentTarget.checked;
          })
        }
      />
    </Group>
  );
}
