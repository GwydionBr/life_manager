import { useMemo, useState, useEffect } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useIntl } from "@/hooks/useIntl";

import {
  Popover,
  MultiSelect,
  Group,
  Button,
  Box,
  Collapse,
  Fieldset,
  Stack,
  Transition,
  Skeleton,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";

import { Tables } from "@/types/db.types";
import FinanceTagSingleBadge from "./TagSingleBadge";
import FinanceTagForm from "./TagForm";
import { useTags } from "@/db/collections/finance/tags/use-tags-query";

interface FinanceTagBadgesProps {
  initialTags: Tables<"tag">[];
  showAddTag?: boolean;
  onPopoverOpen: () => void;
  onPopoverClose: (categories: Tables<"tag">[] | null) => void;
}

export default function FinanceTagBadges({
  initialTags,
  showAddTag = true,
  onPopoverOpen,
  onPopoverClose,
}: FinanceTagBadgesProps) {
  const { getLocalizedText } = useIntl();
  const { data: tags, isLoading: isFinanceTagsLoading } = useTags();

  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialTags.map((c) => c.id)
  );

  useEffect(() => {
    setSelectedTags(initialTags.map((c) => c.id));
  }, [initialTags]);

  const [isTagFormOpen, { open: openTagForm, close: closeTagForm }] =
    useDisclosure(false);
  const [isTagPopoverOpen, { open: openTagPopover, close: closeTagPopover }] =
    useDisclosure(false);

  const currentTagSelection = useMemo(() => {
    return tags.filter((tag) => selectedTags.includes(tag.id));
  }, [tags, selectedTags]);

  if (isFinanceTagsLoading) return <Skeleton height={30} width={100} />;

  const handlePopoverOpen = () => {
    onPopoverOpen();
    openTagPopover();
  };

  const handlePopoverClose = () => {
    onPopoverClose(
      currentTagSelection !== initialTags ? currentTagSelection : null
    );
    closeTagForm();
    closeTagPopover();
  };

  return (
    <Box>
      <Popover
        trapFocus
        onDismiss={handlePopoverClose}
        opened={isTagPopoverOpen}
        onClose={handlePopoverClose}
      >
        <Popover.Target>
          <Group
            onClick={(e) => {
              e.stopPropagation();
              handlePopoverOpen();
            }}
            style={{
              cursor: "pointer",
            }}
          >
            {currentTagSelection.length > 0 ? (
              currentTagSelection.map((tag) => (
                <FinanceTagSingleBadge key={tag.id} tag={tag} />
              ))
            ) : (
              <Transition
                mounted={showAddTag || isTagPopoverOpen}
                transition="fade-left"
                duration={200}
              >
                {(styles) => <FinanceTagSingleBadge style={styles} />}
              </Transition>
            )}
          </Group>
        </Popover.Target>
        <Popover.Dropdown
          style={{
            border:
              "1px solid light-dark(var(--mantine-color-gray-7), var(--mantine-color-dark-2))",
            shadow: "var(--mantine-shadow-md)",
          }}
        >
          <Stack align="center">
            <Group>
              <MultiSelect
                searchable
                clearable
                comboboxProps={{ withinPortal: false }}
                hidePickedOptions
                nothingFoundMessage={getLocalizedText(
                  "Keine Kategorien gefunden",
                  "No categories found"
                )}
                data={tags.map((c) => ({
                  label: c.title,
                  value: c.id,
                }))}
                value={selectedTags}
                onChange={(value) => {
                  setSelectedTags(value);
                }}
                data-autofocus
              />
              <Button
                onClick={openTagForm}
                size="compact-sm"
                variant="subtle"
                leftSection={<IconPlus size={16} />}
              >
                {getLocalizedText("Tag", "Tag")}
              </Button>
            </Group>
            <Collapse in={isTagFormOpen}>
              <Fieldset
                legend={getLocalizedText("Neues Tag", "New Tag")}
                mt="lg"
                maw={400}
                miw={300}
              >
                <FinanceTagForm
                  onClose={closeTagForm}
                  onSuccess={(tag) => {
                    setSelectedTags((prev) => {
                      const newCategories = [...prev, tag.id];
                      return newCategories;
                    });
                    closeTagForm();
                  }}
                />
              </Fieldset>
            </Collapse>
          </Stack>
        </Popover.Dropdown>
      </Popover>
    </Box>
  );
}
