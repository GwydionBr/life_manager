import { useDisclosure, useHover } from "@mantine/hooks";

import { Badge, Popover } from "@mantine/core";
import { IconUser } from "@tabler/icons-react";
import ContactCard from "@/components/Finances/Contact/ContactCard";

import { Tables } from "@/types/db.types";

interface ContactBadgeProps {
  contact: Tables<"contact">;
}

export default function ContactBadge({ contact }: ContactBadgeProps) {
  const [
    isContactPopoverOpen,
    { open: openContactPopover, close: closeContactPopover },
  ] = useDisclosure(false);
  const { hovered, ref } = useHover();

  return (
    <Popover
      onDismiss={closeContactPopover}
      opened={isContactPopoverOpen}
      onClose={closeContactPopover}
    >
      <Popover.Target>
        <Badge
          ref={ref}
          onClick={(e) => {
            e.stopPropagation();
            openContactPopover();
          }}
          color="blue"
          variant="light"
          leftSection={<IconUser size={12} />}
          style={{
            cursor: "pointer",
            border: hovered
              ? "1px solid var(--mantine-color-blue-5)"
              : "1px solid transparent",
          }}
        >
          {contact.name}
        </Badge>
      </Popover.Target>
      <Popover.Dropdown>
        <ContactCard contact={contact} />
      </Popover.Dropdown>
    </Popover>
  );
}
