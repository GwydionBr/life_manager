"use client";

import { useState } from "react";
import { useDisclosure, useClickOutside } from "@mantine/hooks";
import { workProjectsCollection } from "@/db/collections/work/work-project/work-project-collection";

import { Popover, Button, Box } from "@mantine/core";
import ProjectColorPicker from "@/components/UI/ProjectColorPicker";

import { WorkProject } from "@/types/work.types";

interface CalendarLegendButtonProps {
  p: WorkProject;
}

export default function CalendarLegendButton({ p }: CalendarLegendButtonProps) {
  const [selectedColor, setSelectedColor] = useState<string>(
    p.color ?? "var(--mantine-color-teal-6)"
  );
  const [isOpen, { open, close }] = useDisclosure(false);

  const ref = useClickOutside(() => {
    close();
  });

  return (
    <Popover
      opened={isOpen}
      onOpen={() => {
        setSelectedColor(p.color ?? "var(--mantine-color-teal-6)");
      }}
      onClose={() => {
        close();
        workProjectsCollection.update(p.id, (draft) => {
          draft.color = selectedColor;
        });
      }}
    >
      <Popover.Target>
        <Button
          c="light-dark(var(--mantine-color-black), var(--mantine-color-white))"
          variant="subtle"
          size="xs"
          onClick={() => {
            open();
          }}
          leftSection={
            <Box
              style={{
                width: 10,
                height: 10,
                borderRadius: 10,
                background: p.color ?? "var(--mantine-color-teal-6)",
                boxShadow: `0 0 0 1px ${p.color ?? "var(--mantine-color-teal-6)"}`,
              }}
            />
          }
        >
          {p.title}
        </Button>
      </Popover.Target>
      <Popover.Dropdown ref={ref}>
        <ProjectColorPicker
          value={selectedColor}
          onChange={setSelectedColor}
          onClose={() => {
            workProjectsCollection.update(p.id, (draft) => {
              draft.color = selectedColor;
            });
            close();
          }}
        />
      </Popover.Dropdown>
    </Popover>
  );
}
