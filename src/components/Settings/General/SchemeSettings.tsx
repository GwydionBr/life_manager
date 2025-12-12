"use client";

import { useEffect, useState } from "react";
import { useIntl } from "@/hooks/useIntl";

import {
  Group,
  Space,
  Stack,
  Text,
  useMantineColorScheme,
} from "@mantine/core";
import { DarkSchemeButton } from "@/components/Scheme/DarkScheme";
import { LightSchemeButton } from "@/components/Scheme/LightScheme";
import { SystemSchemeButton } from "@/components/Scheme/SystemScheme";

export default function SchemeToggle() {
  const { getLocalizedText } = useIntl();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { colorScheme: currentColorScheme, setColorScheme } =
    useMantineColorScheme();

  if (!mounted) {
    return null; // prevents server/client mismatch
  }

  return (
    <Group justify="center">
      <Stack>
        <Text>{getLocalizedText("Hell", "Light")}</Text>
        <LightSchemeButton
          onClick={() => setColorScheme("light")}
          active={currentColorScheme === "light"}
          navbarMode={false}
        />
      </Stack>
      <Stack>
        <Text>{getLocalizedText("Dunkel", "Dark")}</Text>
        <DarkSchemeButton
          onClick={() => setColorScheme("dark")}
          active={currentColorScheme === "dark"}
          navbarMode={false}
        />
      </Stack>
      <Space w="xl" />
      <Stack>
        <Text>{getLocalizedText("System", "System")}</Text>
        <SystemSchemeButton
          onClick={() => setColorScheme("auto")}
          active={currentColorScheme === "auto"}
          navbarMode={false}
        />
      </Stack>
    </Group>
  );
}
