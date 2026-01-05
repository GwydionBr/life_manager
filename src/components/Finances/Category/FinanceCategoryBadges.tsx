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
import FinanceCategorySingleBadge from "./FinanceCategorySingleBadge";
import FinanceCategoryForm from "./FinanceCategoryForm";
import { useTags } from "@/db/collections/finance/tags/tags-collection";

interface FinanceCategoryBadgesProps {
  initialCategories: Tables<"finance_category">[];
  showAddCategory?: boolean;
  onPopoverOpen: () => void;
  onPopoverClose: (categories: Tables<"finance_category">[] | null) => void;
}

export default function FinanceCategoryBadges({
  initialCategories,
  showAddCategory = true,
  onPopoverOpen,
  onPopoverClose,
}: FinanceCategoryBadgesProps) {
  const { getLocalizedText } = useIntl();
  const {
    data: financeCategories = [],
    isLoading: isFinanceCategoriesLoading,
  } = useTags();

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategories.map((c) => c.id)
  );

  useEffect(() => {
    setSelectedCategories(initialCategories.map((c) => c.id));
  }, [initialCategories]);

  const [
    isCategoryFormOpen,
    { open: openCategoryForm, close: closeCategoryForm },
  ] = useDisclosure(false);
  const [
    isCategoryPopoverOpen,
    { open: openCategoryPopover, close: closeCategoryPopover },
  ] = useDisclosure(false);

  const currentCategorySelection = useMemo(() => {
    return financeCategories.filter((category) =>
      selectedCategories.includes(category.id)
    );
  }, [financeCategories, selectedCategories]);

  if (isFinanceCategoriesLoading) return <Skeleton height={30} width={100} />;

  const handlePopoverOpen = () => {
    onPopoverOpen();
    openCategoryPopover();
  };

  const handlePopoverClose = () => {
    onPopoverClose(
      currentCategorySelection !== initialCategories
        ? currentCategorySelection
        : null
    );
    closeCategoryForm();
    closeCategoryPopover();
  };

  return (
    <Box>
      <Popover
        trapFocus
        onDismiss={handlePopoverClose}
        opened={isCategoryPopoverOpen}
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
            {currentCategorySelection.length > 0 ? (
              currentCategorySelection.map((category) => (
                <FinanceCategorySingleBadge
                  key={category.id}
                  category={category}
                />
              ))
            ) : (
              <Transition
                mounted={showAddCategory || isCategoryPopoverOpen}
                transition="fade-left"
                duration={200}
              >
                {(styles) => <FinanceCategorySingleBadge style={styles} />}
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
                data={financeCategories.map((c) => ({
                  label: c.title,
                  value: c.id,
                }))}
                value={selectedCategories}
                onChange={(value) => {
                  setSelectedCategories(value);
                }}
                data-autofocus
              />
              <Button
                onClick={openCategoryForm}
                size="compact-sm"
                variant="subtle"
                leftSection={<IconPlus size={16} />}
              >
                {getLocalizedText("Kategorie", "Category")}
              </Button>
            </Group>
            <Collapse in={isCategoryFormOpen}>
              <Fieldset
                legend={getLocalizedText("Neue Kategorie", "New Category")}
                mt="lg"
                maw={400}
                miw={300}
              >
                <FinanceCategoryForm
                  onClose={closeCategoryForm}
                  onSuccess={(category) => {
                    setSelectedCategories((prev) => {
                      const newCategories = [...prev, category.id];
                      return newCategories;
                    });
                    closeCategoryForm();
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
