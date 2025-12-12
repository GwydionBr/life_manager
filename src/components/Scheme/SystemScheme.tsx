import { forwardRef } from "react";
import { useColorScheme } from "@mantine/hooks";

import { IconProps, IconSunMoon } from "@tabler/icons-react";
import { ActionIcon, HoverCard, Text } from "@mantine/core";

import classes from "./Scheme.module.css";

interface SystemSchemeActionIconProps {
  onClick?: () => void;
  active?: boolean;
  navbarMode?: boolean;
}

export function SystemSchemeButton({
  onClick,
  active,
  navbarMode,
}: SystemSchemeActionIconProps) {
  return (
    <HoverCard
      width={80}
      position={navbarMode ? "right" : "top"}
      withArrow
      shadow="md"
      openDelay={500}
    >
      <HoverCard.Target>
        <SystemSchemeActionIcon
          onClick={onClick}
          active={active}
          navbarMode={navbarMode}
        />
      </HoverCard.Target>
      <HoverCard.Dropdown>
        <Text size="xs">System Scheme</Text>
      </HoverCard.Dropdown>
    </HoverCard>
  );
}

export const SystemSchemeActionIcon = forwardRef<
  HTMLButtonElement,
  SystemSchemeActionIconProps
>(({ onClick, active, navbarMode }, ref) => {
  const colorScheme = useColorScheme();
  return (
    <ActionIcon
      ref={ref}
      onClick={onClick}
      variant={navbarMode ? "subtle" : "default"}
      size="xl"
      aria-label="Select system scheme"
      bg={
        navbarMode
          ? ""
          : colorScheme === "light"
            ? "var(--mantine-color-gray-0)"
            : "var(--mantine-color-dark-6)"
      }
      className={active ? classes.activeButton : ""}
    >
      <SystemSchemeIcon
        color={
          colorScheme === "light"
            ? "var(--mantine-color-teal-7)"
            : "var(--mantine-color-teal-4)"
        }
        stroke={1.5}
      />
    </ActionIcon>
  );
});

export function SystemSchemeIcon(props: IconProps) {
  return <IconSunMoon {...props} />;
}
