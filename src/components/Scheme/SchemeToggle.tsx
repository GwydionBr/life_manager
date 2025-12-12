import { useEffect, useState } from "react";
import { useIntl } from "@/hooks/useIntl";

import { useMantineColorScheme, Menu, Group, Text } from "@mantine/core";
import { LightSchemeActionIcon, LightSchemeIcon } from "./LightScheme";
import { DarkSchemeActionIcon, DarkSchemeIcon } from "./DarkScheme";
import { SystemSchemeActionIcon, SystemSchemeIcon } from "./SystemScheme";

export default function SchemeToggleButton() {
  const { getLocalizedText } = useIntl();
  const { setColorScheme, colorScheme } = useMantineColorScheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return null;
  }

  return (
    <Menu
      shadow="md"
      width={180}
      position="bottom"
      transitionProps={{ transition: "fade-down", duration: 200 }}
    >
      <Menu.Target>
        {colorScheme === "dark" ? (
          <DarkSchemeActionIcon navbarMode={true} />
        ) : colorScheme === "light" ? (
          <LightSchemeActionIcon navbarMode={true} />
        ) : colorScheme === "auto" ? (
          <SystemSchemeActionIcon navbarMode={true} />
        ) : (
          <DarkSchemeActionIcon navbarMode={true} />
        )}
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>{getLocalizedText("Darstellung", "Appearance")}</Menu.Label>
        <Menu.Item
          onClick={() => setColorScheme("dark")}
          leftSection={<DarkSchemeIcon />}
        >
          {getLocalizedText("Dunkles Design", "Dark Mode")}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          onClick={() => setColorScheme("light")}
          leftSection={<LightSchemeIcon />}
        >
          {getLocalizedText("Helles Design", "Light Mode")}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          onClick={() => setColorScheme("auto")}
          leftSection={<SystemSchemeIcon />}
        >
          {getLocalizedText("System Design", "System Scheme")}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
