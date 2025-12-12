"use client";

import { useEffect, useState } from "react";
import { useUpdateSettings } from "@/queries/settings/use-update-settings";
import { useSettings } from "@/queries/settings/use-settings";
import { useIntl } from "@/hooks/useIntl";

import { Box, DEFAULT_THEME, Group, Popover, Text } from "@mantine/core";

import classes from "./GroupSettings.module.css";
import DefaultColorPicker from "@/components/UI/DefaultColorPicker";

export default function GroupDefaultSettings() {
  const { getLocalizedText } = useIntl();
  const { data: settings } = useSettings();
  const { mutate: updateSettings } = useUpdateSettings();
  const [color, setColor] = useState<string | null>(null);

  if (!settings) return null;

  const { default_group_color } = settings;

  useEffect(() => {
    setColor(default_group_color);
  }, [default_group_color]);

  function handleColorChange() {
    updateSettings({ default_group_color: color });
  }

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
