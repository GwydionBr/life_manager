import { forwardRef } from "react";
import { IconSunHighFilled, IconProps } from "@tabler/icons-react";
import { ActionIcon, HoverCard, Text } from "@mantine/core";

import classes from "./Scheme.module.css";

interface LightSchemeActionIconProps {
  onClick?: () => void;
  active?: boolean;
  navbarMode?: boolean;
}

export function LightSchemeButton({
  onClick,
  active,
  navbarMode,
}: LightSchemeActionIconProps) {
  return (
    <HoverCard
      width={60}
      position={navbarMode ? "right" : "top"}
      withArrow
      shadow="md"
      openDelay={500}
    >
      <HoverCard.Target>
        <LightSchemeActionIcon
          onClick={onClick}
          active={active}
          navbarMode={navbarMode}
        />
      </HoverCard.Target>
      <HoverCard.Dropdown>
        <Text size="xs">{navbarMode ? "Dark Mode" : "Light Mode"}</Text>
      </HoverCard.Dropdown>
    </HoverCard>
  );
}

export const LightSchemeActionIcon = forwardRef<
  HTMLButtonElement,
  LightSchemeActionIconProps
>(({ onClick, active, navbarMode }, ref) => {
  return (
    <ActionIcon
      ref={ref}
      onClick={onClick}
      variant={navbarMode ? "subtle" : "default"}
      size="xl"
      aria-label="Select light scheme"
      bg={
        navbarMode
          ? ""
          : "light-dark(var(--mantine-color-white), var(--mantine-color-white))"
      }
      className={active ? classes.activeButton : ""}
    >
      <LightSchemeIcon stroke={1.5} />
    </ActionIcon>
  );
});

export function LightSchemeIcon(props: IconProps) {
  return <IconSunHighFilled {...props} />;
}
