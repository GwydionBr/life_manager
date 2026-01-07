import { useEffect, useState } from "react";
import { settingsCollection } from "@/db/collections/settings/settings-collection";
import { useSettings } from "@/db/collections/settings/use-settings-query";
import { useIntl } from "@/hooks/useIntl";

import { Box, DEFAULT_THEME, Group, Popover, Text } from "@mantine/core";

import classes from "./GroupSettings.module.css";
import DefaultColorPicker from "@/components/UI/DefaultColorPicker";

export default function GroupDefaultSettings() {
  const { getLocalizedText } = useIntl();
  const { data: settings } = useSettings();
  const [color, setColor] = useState<string | null>(null);

  useEffect(() => {
    setColor(settings?.default_group_color ?? null);
  }, [settings?.default_group_color]);

  function handleColorChange() {
    if (!settings) return;
    settingsCollection.update(settings.id, (draft) => {
      draft.default_group_color = color;
    });
  }

  if (!settings) return null;

  return (
    <Group>
      <Text size="sm" fw={500}>
        {getLocalizedText("Standard Gruppenfarbe", "Default Group Color")}
      </Text>
      <Popover onClose={handleColorChange} position="top">
        <Popover.Target>
          <Box
            className={classes.colorPoint}
            bg={
              color ||
              "light-dark(var(--mantine-color-gray-8), var(--mantine-color-dark-2))"
            }
          />
        </Popover.Target>
        <Popover.Dropdown>
          <DefaultColorPicker
            color={color || DEFAULT_THEME.colors.lime[6]}
            setColor={setColor}
          />
        </Popover.Dropdown>
      </Popover>
    </Group>
  );
}
