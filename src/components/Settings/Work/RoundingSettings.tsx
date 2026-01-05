import { useEffect, useState } from "react";
import {
  useSettings,
  settingsCollection,
} from "@/db/collections/settings/settings-collection";
import { useIntl } from "@/hooks/useIntl";

import {
  getRoundingInTimeFragments,
  getRoundingModes,
} from "@/constants/settings";

import {
  Group,
  Select,
  NumberInput,
  Button,
  Stack,
  Switch,
  Collapse,
  Transition,
} from "@mantine/core";

import { RoundingDirection } from "@/types/settings.types";

export default function RoundingSettings() {
  const { getLocalizedText, locale } = useIntl();
  const { data: settings } = useSettings();

  const [roundingIntervalState, setRoundingIntervalState] = useState(0);

  useEffect(() => {
    setRoundingIntervalState(settings?.rounding_interval || 0);
  }, [settings?.rounding_interval]);

  function handleCustomSubmit() {
    if (!settings) return;
    settingsCollection.update(settings.id, (draft) => {
      draft.rounding_interval = roundingIntervalState;
    });
  }

  const roundingInTimeSections = getRoundingInTimeFragments(locale);
  const roundingModes = getRoundingModes(locale);

  if (!settings) return null;

  return (
    <Stack>
      <Switch
        label={getLocalizedText(
          "Runden in Zeitabschnitten",
          "Round in time fragments"
        )}
        checked={settings.round_in_time_sections}
        onChange={(event) =>
          settingsCollection.update(settings.id, (draft) => {
            draft.round_in_time_sections = event.currentTarget.checked;
          })
        }
      />
      <Collapse in={!settings.round_in_time_sections}>
        <Group>
          <NumberInput
            label={getLocalizedText("Rundungsintervall", "Rounding interval")}
            suffix={getLocalizedText(" Minuten", " minutes")}
            allowNegative={false}
            allowDecimal={false}
            allowLeadingZeros={false}
            value={roundingIntervalState}
            onChange={(value) => setRoundingIntervalState(Number(value))}
          />
          <Select
            w={125}
            label={getLocalizedText("Rundungsmodus", "Rounding mode")}
            data={roundingModes}
            value={settings.rounding_direction}
            onChange={(value) =>
              settingsCollection.update(settings.id, (draft) => {
                draft.rounding_direction = value as RoundingDirection;
              })
            }
          />
          <Transition
            mounted={roundingIntervalState !== settings.rounding_interval}
            transition="fade-right"
          >
            {(styles) => (
              <Button onClick={handleCustomSubmit} style={{ ...styles }}>
                {getLocalizedText("Speichern", "Save")}
              </Button>
            )}
          </Transition>
        </Group>
      </Collapse>
      <Collapse in={settings.round_in_time_sections}>
        <Group>
          <Select
            w={200}
            data={roundingInTimeSections}
            label={getLocalizedText(
              "Zeitabschnittsintervall",
              "Time Fragment Interval"
            )}
            placeholder={getLocalizedText(
              "Intervall auswählen",
              "Select Default Rounding Amount"
            )}
            value={settings.time_section_interval.toString()}
            onChange={(value) =>
              settingsCollection.update(settings.id, (draft) => {
                draft.time_section_interval = Number(value);
              })
            }
          />
        </Group>
      </Collapse>
    </Stack>
  );
}
