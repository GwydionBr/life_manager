import { forwardRef } from "react";
import { useColorScheme } from "@mantine/hooks";

import { IconProps, IconSunMoon } from "@tabler/icons-react";
import { ActionIcon, HoverCard, Text, MantineColor } from "@mantine/core";

import classes from "./Scheme.module.css";

interface SystemSchemeActionIconProps {
  onClick?: () => void;
  active?: boolean;
  navbarMode?: boolean;
  color?: MantineColor;
}

export function SystemSchemeButton({
  onClick,
  active,
  navbarMode,
  color,
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
          color={color ?? "var(--mantine-color-primary)"}
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
>(({ onClick, active, navbarMode, color }, ref) => {
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
      <SystemSchemeIcon color={color} stroke={1.5} />
    </ActionIcon>
  );
});

export function SystemSchemeIcon(props: IconProps) {
  return <IconSunMoon {...props} />;
}
