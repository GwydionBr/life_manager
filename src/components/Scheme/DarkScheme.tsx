import { forwardRef } from "react";
import { IconMoonStars, IconProps } from "@tabler/icons-react";
import { ActionIcon, HoverCard, Text } from "@mantine/core";

import classes from "./Scheme.module.css";

interface DarkSchemeActionIconProps {
  onClick?: () => void;
  active?: boolean;
  navbarMode?: boolean;
}

export function DarkSchemeButton({
  onClick,
  active,
  navbarMode,
}: DarkSchemeActionIconProps) {
  return (
    <HoverCard
      width={60}
      position={navbarMode ? "right" : "top"}
      withArrow
      shadow="md"
      openDelay={500}
    >
      <HoverCard.Target>
        <DarkSchemeActionIcon
          onClick={onClick}
          active={active}
          navbarMode={navbarMode}
        />
      </HoverCard.Target>
      <HoverCard.Dropdown>
        <Text size="xs">{navbarMode ? "Light Mode" : "Dark Mode"}</Text>
      </HoverCard.Dropdown>
    </HoverCard>
  );
}

export const DarkSchemeActionIcon = forwardRef<
  HTMLButtonElement,
  DarkSchemeActionIconProps
>(({ onClick, active, navbarMode }, ref) => {
  return (
    <ActionIcon
      ref={ref}
      onClick={onClick}
      variant={navbarMode ? "subtle" : "default"}
      size="xl"
      aria-label="Select dark scheme"
      bg={navbarMode ? "" : "var(--mantine-color-dark-6)"}
      className={active ? classes.activeButton : ""}
    >
      <DarkSchemeIcon stroke={1.5} />
    </ActionIcon>
  );
});

export function DarkSchemeIcon(props: IconProps) {
  return <IconMoonStars {...props} />;
}
