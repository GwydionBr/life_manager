import { useCallback, useMemo, useState, useEffect } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useSettingsStore } from "@/stores/settingsStore";
import { useFinanceProjects } from "@/db/collections/finance/finance-project/use-finance-project-query";
import { useFinanceProjectMutations } from "@/db/collections/finance/finance-project/use-finance-project-mutations";
import { useTags } from "@/db/collections/finance/tags/tags-collection";
import { useContacts } from "@/db/collections/finance/contacts/contact-collection";
import { useIntl } from "@/hooks/useIntl";

import {
  ActionIcon,
  Box,
  Collapse,
  Group,
  Stack,
  Text,
  Divider,
  Button,
  Badge,
  ThemeIcon,
  Card,
  Skeleton,
} from "@mantine/core";
import DelayedTooltip from "@/components/UI/DelayedTooltip";
import FinanceProjectFormModal from "./FinanceProjectModal";
import FinanceProjectCard from "./FinanceProjectCard";
import {
  IconMoneybagPlus,
  IconCurrencyDollar,
  IconList,
  IconCalendarEvent,
  IconSquareRoundedCheck,
} from "@tabler/icons-react";
import SelectActionIcon from "@/components/UI/ActionIcons/SelectActionIcon";
import DeleteActionIcon from "@/components/UI/ActionIcons/DeleteActionIcon";
import PayoutActionIcon from "@/components/UI/ActionIcons/PayoutActionIcon";
import { isToday } from "date-fns";
import {
  FinanceNavbarItems,
  FinanceProject,
  FinanceProjectNavbarTab,
} from "@/types/finance.types";
import { showDeleteConfirmationModal } from "@/lib/notificationFunctions";
import EditFinanceProjectDrawer from "./EditFinanceProjectDrawer";
import FinancesNavbar from "@/components/Finances/FinancesNavbar/FinancesNavbar";
import { SettingsTab } from "@/stores/settingsStore";
import AdjustmentActionIcon from "@/components/UI/ActionIcons/AdjustmentActionIcon";
import FinancesNavbarNavList from "@/components/Finances/FinancesNavbar/FinancesNavbarNavList";
import FinancesNavbarDefaultCard from "@/components/Finances/FinancesNavbar/FinancesNavbarDefaultCard";
import FinancesNavbarToolbar from "@/components/Finances/FinancesNavbar/FinancesNavbarToolbar";

export default function FinanceProjectTab() {
  const { getLocalizedText, formatDate, formatMoney } = useIntl();
  const { data: contacts } = useContacts();
  const { data: financeProjects = [], isLoading: isLoadingFinanceProjects } =
    useFinanceProjects();
  const { data: tags } = useTags();
  const { deleteFinanceProject } = useFinanceProjectMutations();

  const { setIsModalOpen, setSelectedTab } = useSettingsStore();

  // Bulk selection
  const [
    selectedModeActive,
    { toggle: toggleSelectedMode, close: closeSelectedMode },
  ] = useDisclosure(false);
  const [selectedFinanceProjects, setSelectedFinanceProjects] = useState<
    string[]
  >([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(
    null
  );

  // Add project
  const [
    addProjectModalOpened,
    { close: closeAddProjectModal, toggle: toggleAddProjectModal },
  ] = useDisclosure(false);

  // Edit project
  const [
    editProjectModalOpened,
    { close: closeEditProjectModal, toggle: toggleEditProjectModal },
  ] = useDisclosure(false);
  const [editProject, setEditProject] = useState<FinanceProject | null>(null);

  // Tab
  const [tab, setTab] = useState<FinanceProjectNavbarTab>(
    FinanceProjectNavbarTab.All
  );

  const formattedFinanceProjects = useMemo(() => {
    return financeProjects.map((project) => {
      const { tags, ...rest } = project;
      return {
        ...rest,
        contact:
          contacts.find(
            (contact) => contact.id === project.contact_id
          ) || null,
        tags: tags.filter((tag) =>
          tags.map((c) => c.id).includes(tag.id)
        ),
      };
    });
  }, [financeProjects, contacts, tags]);

  useEffect(() => {
    if (formattedFinanceProjects.length === 0) {
      setTab(FinanceProjectNavbarTab.All);
      setSelectedFinanceProjects([]);
      closeSelectedMode();
    } else if (editProject === null) {
      setEditProject(formattedFinanceProjects[0]);
    }
  }, []);

  const navbarItems = useMemo<FinanceNavbarItems>(() => {
    const items: FinanceNavbarItems = {
      all: { totalAmount: 0, projectCount: 0 },
      upcoming: { totalAmount: 0, projectCount: 0 },
      overdue: { totalAmount: 0, projectCount: 0 },
      paid: { totalAmount: 0, projectCount: 0 },
    };

    // All
    const totalAmount = formattedFinanceProjects.reduce((acc, project) => {
      return (
        acc +
        project.adjustments.reduce((acc, adjustment) => {
          return acc + adjustment.amount;
        }, project.start_amount)
      );
    }, 0);
    items.all = { totalAmount, projectCount: formattedFinanceProjects.length };

    // Upcoming
    const upcomingFilteredProjects = formattedFinanceProjects.filter(
      (project) => {
        return (
          (project.due_date && project.due_date > new Date().toISOString()) ||
          !project.due_date ||
          isToday(new Date(project.due_date))
        );
      }
    );
    const upcomingTotalAmount = upcomingFilteredProjects.reduce(
      (acc, project) => {
        return (
          acc +
          project.adjustments.reduce((acc, adjustment) => {
            return acc + adjustment.amount;
          }, project.start_amount)
        );
      },
      0
    );
    items.upcoming = {
      totalAmount: upcomingTotalAmount,
      projectCount: upcomingFilteredProjects.length,
    };

    // Overdue
    const overdueFilteredProjects = formattedFinanceProjects.filter(
      (project) => {
        return (
          project.due_date &&
          project.due_date < new Date().toISOString() &&
          !isToday(new Date(project.due_date))
        );
      }
    );

    const overdueTotalAmount = overdueFilteredProjects.reduce(
      (acc, project) => {
        return (
          acc +
          project.adjustments.reduce((acc, adjustment) => {
            return acc + adjustment.amount;
          }, project.start_amount)
        );
      },
      0
    );
    items.overdue = {
      totalAmount: overdueTotalAmount,
      projectCount: overdueFilteredProjects.length,
    };

    // Paid
    const paidFilteredProjects = formattedFinanceProjects.filter((project) => {
      return project.single_cashflow_id;
    });

    const paidTotalAmount = paidFilteredProjects.reduce((acc, project) => {
      return (
        acc +
        project.adjustments.reduce((acc, adjustment) => {
          return acc + adjustment.amount;
        }, project.start_amount)
      );
    }, 0);
    items.paid = {
      totalAmount: paidTotalAmount,
      projectCount: paidFilteredProjects.length,
    };

    return items;
  }, [formattedFinanceProjects]);

  const sortedFinanceProjects = useMemo(() => {
    return [...formattedFinanceProjects].sort((a, b) => {
      const aHasDueDate = Boolean(a.due_date);
      const bHasDueDate = Boolean(b.due_date);
      const aIsOverdue =
        a.due_date &&
        a.due_date < new Date().toISOString() &&
        !isToday(new Date(a.due_date));
      const bIsOverdue =
        b.due_date &&
        b.due_date < new Date().toISOString() &&
        !isToday(new Date(b.due_date));

      if (aIsOverdue && !bIsOverdue) return -1;
      if (!aIsOverdue && bIsOverdue) return 1;

      if (!aHasDueDate && bHasDueDate) return -1; // nulls first
      if (aHasDueDate && !bHasDueDate) return 1; // dated after nulls
      if (!aHasDueDate && !bHasDueDate) return 0; // both null

      return (
        new Date(a.due_date as string).getTime() -
        new Date(b.due_date as string).getTime()
      );
    });
  }, [formattedFinanceProjects]);

  const filteredFinanceProjects = useMemo(() => {
    return sortedFinanceProjects.filter((project) => {
      if (tab === FinanceProjectNavbarTab.All) return true;
      if (tab === FinanceProjectNavbarTab.Upcoming)
        return (
          (project.due_date && project.due_date > new Date().toISOString()) ||
          !project.due_date ||
          isToday(new Date(project.due_date))
        );
      if (tab === FinanceProjectNavbarTab.Overdue)
        return (
          project.due_date &&
          project.due_date < new Date().toISOString() &&
          !isToday(new Date(project.due_date))
        );
      if (tab === FinanceProjectNavbarTab.Paid)
        return project.single_cashflow_id;
    });
  }, [sortedFinanceProjects, tab]);

  const handleToggleSelectedMode = () => {
    toggleSelectedMode();
    setSelectedFinanceProjects([]);
    setLastSelectedIndex(null);
  };

  const toggleProjectSelection = useCallback(
    (contactId: string, index: number, range: boolean) => {
      if (range && lastSelectedIndex !== null) {
        const start = Math.min(lastSelectedIndex, index);
        const end = Math.max(lastSelectedIndex, index);
        const rangeIds = filteredFinanceProjects
          .slice(start, end + 1)
          .map((p) => p.id);
        setSelectedFinanceProjects((prev) =>
          Array.from(new Set([...prev, ...rangeIds]))
        );
      } else {
        setSelectedFinanceProjects((prev) =>
          prev.includes(contactId)
            ? prev.filter((id) => id !== contactId)
            : [...prev, contactId]
        );
        setLastSelectedIndex(index);
      }
    },
    [filteredFinanceProjects, lastSelectedIndex]
  );

  const toggleAllProjects = useCallback(() => {
    if (selectedFinanceProjects.length > 0) {
      setSelectedFinanceProjects([]);
    } else {
      setSelectedFinanceProjects(filteredFinanceProjects.map((c) => c.id));
    }
  }, [filteredFinanceProjects, selectedFinanceProjects]);

  const onDelete = (ids: string[]) => {
    // TODO: ASk if related single cash flows should be deleted
    const isSingle = ids.length === 1;
    showDeleteConfirmationModal(
      isSingle
        ? getLocalizedText("Finanzprojekt löschen", "Delete Finance Project")
        : getLocalizedText("Finanzprojekte löschen", "Delete Finance Projects"),
      isSingle
        ? getLocalizedText(
            "Sind Sie sicher, dass Sie dieses Finanzprojekt löschen möchten?",
            "Are you sure you want to delete this finance project?"
          )
        : getLocalizedText(
            "Sind Sie sicher, dass Sie diese Finanzprojekte löschen möchten?",
            "Are you sure you want to delete these finance projects?"
          ),
      () => {
        deleteFinanceProject(ids);
      }
    );
  };

  const newNavbarItems = useMemo(() => {
    return [
      [
        {
          label: getLocalizedText("Alle", "All"),
          leftSection: (
            <ThemeIcon variant="transparent" color="gray">
              <IconList />
            </ThemeIcon>
          ),
          active: tab === FinanceProjectNavbarTab.All,
          description: (
            <Text size="sm">
              {formatMoney(navbarItems.all.totalAmount, "EUR")} (
              {navbarItems.all.projectCount})
            </Text>
          ),
          onClick: () => setTab(FinanceProjectNavbarTab.All),
          disabled: navbarItems.all.projectCount === 0,
        },
        {
          label: getLocalizedText("Bevorstehend", "Upcoming"),
          leftSection: (
            <ThemeIcon variant="transparent" color="blue">
              <IconCalendarEvent />
            </ThemeIcon>
          ),
          active: tab === FinanceProjectNavbarTab.Upcoming,
          description: (
            <Text size="sm">
              {formatMoney(navbarItems.upcoming.totalAmount, "EUR")} (
              {navbarItems.upcoming.projectCount})
            </Text>
          ),
          onClick: () => setTab(FinanceProjectNavbarTab.Upcoming),
          disabled: navbarItems.upcoming.projectCount === 0,
        },
        {
          label: getLocalizedText("Überfällig", "Overdue"),
          leftSection: (
            <ThemeIcon variant="transparent" color="red">
              <IconCalendarEvent />
            </ThemeIcon>
          ),
          active: tab === FinanceProjectNavbarTab.Overdue,
          description: (
            <Text size="sm">
              {formatMoney(navbarItems.overdue.totalAmount, "EUR")} (
              {navbarItems.overdue.projectCount})
            </Text>
          ),
          onClick: () => setTab(FinanceProjectNavbarTab.Overdue),
          disabled: navbarItems.overdue.projectCount === 0,
        },
      ],
      [
        {
          label: getLocalizedText("Bezahlt", "Paid"),
          leftSection: (
            <ThemeIcon variant="transparent" color="green">
              <IconSquareRoundedCheck />
            </ThemeIcon>
          ),
          active: tab === FinanceProjectNavbarTab.Paid,
          description: (
            <Text size="sm">
              {formatMoney(navbarItems.paid.totalAmount, "EUR")} (
              {navbarItems.paid.projectCount})
            </Text>
          ),
          onClick: () => setTab(FinanceProjectNavbarTab.Paid),
          disabled: navbarItems.paid.projectCount === 0,
        },
      ],
    ];
  }, [navbarItems, tab, formatMoney, getLocalizedText]);

  return (
    <Box w="100%">
      <FinancesNavbar
        items={[
          <FinancesNavbarToolbar
            key="finance-projects-toolbar"
            toolbarItems={[
              <AdjustmentActionIcon
                key="finance-projects-adjustment-action-icon"
                size="lg"
                variant="transparent"
                tooltipLabel={getLocalizedText(
                  "Finanzeinstellungen anpassen",
                  "Adjust finance settings"
                )}
                iconSize={20}
                onClick={() => {
                  setIsModalOpen(true);
                  setSelectedTab(SettingsTab.FINANCE);
                }}
              />,
              <DelayedTooltip
                key="finance-projects-add-project-tooltip"
                label={getLocalizedText(
                  "Finanzprojekt hinzufügen",
                  "Add Finance Project"
                )}
              >
                <ActionIcon
                  onClick={toggleAddProjectModal}
                  variant="transparent"
                  size="lg"
                >
                  <IconMoneybagPlus size={20} />
                </ActionIcon>
              </DelayedTooltip>,
              <SelectActionIcon
                key="finance-projects-select-action-icon"
                iconSize={20}
                disabled={
                  isLoadingFinanceProjects ||
                  filteredFinanceProjects.length === 0
                }
                tooltipLabel={
                  selectedModeActive
                    ? getLocalizedText(
                        "Deaktiviere Mehrfachauswahl",
                        "Deactivate bulk select"
                      )
                    : getLocalizedText(
                        "Aktiviere Mehrfachauswahl",
                        "Activate bulk select"
                      )
                }
                mainControl
                selected={selectedModeActive}
                onClick={handleToggleSelectedMode}
              />,
            ]}
          />,
          <FinancesNavbarNavList
            key="finance-projects-navbar-list"
            navbarItems={newNavbarItems}
          />,
          <FinancesNavbarDefaultCard key="finance-projects-default-card">
            <Stack>
              <Text size="sm" c="dimmed">
                {filteredFinanceProjects.length}{" "}
                {getLocalizedText("Projekte", "Projects")}
              </Text>
              <Group justify="space-between" align="center">
                <Text size="sm" c="dimmed">
                  {getLocalizedText("Gesamtbetrag", "Total Amount")}:{" "}
                  {formatMoney(navbarItems.all.totalAmount, "EUR")}
                </Text>
              </Group>
            </Stack>
          </FinancesNavbarDefaultCard>,
        ]}
      />
      <Stack w="100%" align="center" pl={250} pb="xl" pr="lg" pt="md">
        <Stack gap={0} w="100%">
          {/* Bulk Selection */}
          <Collapse
            in={selectedModeActive && filteredFinanceProjects.length > 0}
            w="100%"
          >
            <Card
              p="md"
              mb="md"
              withBorder
              shadow="sm"
              radius="md"
              style={{
                borderColor:
                  "light-dark(var(--mantine-color-blue-3), var(--mantine-color-blue-8))",
              }}
            >
              <Group justify="space-between" align="center">
                <Group
                  onClick={toggleAllProjects}
                  style={{ cursor: "pointer" }}
                >
                  <SelectActionIcon
                    onClick={() => {}}
                    selected={
                      selectedFinanceProjects.length ===
                      filteredFinanceProjects.length
                    }
                    partiallySelected={
                      selectedFinanceProjects.length > 0 &&
                      selectedFinanceProjects.length <
                        filteredFinanceProjects.length
                    }
                  />
                  <Text fz="sm" c="dimmed">
                    {getLocalizedText("Alle auswählen", "Select All")}
                  </Text>
                </Group>

                <Badge color="blue" variant="light">
                  {selectedFinanceProjects.length}{" "}
                  {getLocalizedText("ausgewählt", "selected")}
                </Badge>

                <Group gap="xs">
                  <PayoutActionIcon
                    disabled={selectedFinanceProjects.length === 0}
                    onClick={() => console.log(selectedFinanceProjects)}
                  />
                  <DeleteActionIcon
                    disabled={selectedFinanceProjects.length === 0}
                    onClick={() => onDelete(selectedFinanceProjects)}
                  />
                </Group>
              </Group>
            </Card>
          </Collapse>
          {/* Projects */}
          <Stack w="100%" align="center">
            {isLoadingFinanceProjects ? (
              Array.from({ length: 5 }, (_, i) => (
                <Skeleton height={65} w="100%" key={i} />
              ))
            ) : filteredFinanceProjects.length > 0 ? (
              filteredFinanceProjects.map((project, index) => {
                const isOverdue =
                  project.due_date &&
                  project.due_date < new Date().toISOString() &&
                  !isToday(new Date(project.due_date));
                const noDueDate = !project.due_date;
                return (
                  <Stack key={project.id} w="100%" gap={5}>
                    {filteredFinanceProjects[index - 1]?.due_date !==
                      project.due_date && (
                      <Divider
                        size="md"
                        label={
                          <Badge
                            variant="light"
                            color={
                              isOverdue ? "red" : noDueDate ? "yellow" : "teal"
                            }
                          >
                            {project.due_date
                              ? formatDate(new Date(project.due_date))
                              : getLocalizedText(
                                  "Kein Fälligkeitsdatum",
                                  "No due date"
                                )}
                          </Badge>
                        }
                        labelPosition="left"
                      />
                    )}
                    <Box ml="xl">
                      <FinanceProjectCard
                        project={project}
                        editProjectModalOpened={editProjectModalOpened}
                        selectedModeActive={selectedModeActive}
                        isSelected={selectedFinanceProjects.includes(
                          project.id
                        )}
                        onToggleSelected={(e) =>
                          toggleProjectSelection(project.id, index, e.shiftKey)
                        }
                        onDelete={() => onDelete([project.id])}
                        setEditProject={setEditProject}
                        onOpenEditProject={toggleEditProjectModal}
                      />
                    </Box>
                  </Stack>
                );
              })
            ) : (
              <Card p="xl" withBorder shadow="sm" radius="lg" ta="center">
                <Stack align="center" gap="md">
                  <ThemeIcon size="xl" color="gray" variant="light">
                    <IconCurrencyDollar size={32} />
                  </ThemeIcon>

                  <Box>
                    <Text size="lg" fw={600} c="dimmed" mb="xs">
                      {getLocalizedText(
                        "Keine Finanzprojekte gefunden",
                        "No finance projects found"
                      )}
                    </Text>
                    <Text size="sm" c="dimmed" maw={400}>
                      {getLocalizedText(
                        "Erstellen Sie Ihr erstes Finanzprojekt, um Ihre Einnahmen und Ausgaben zu verwalten.",
                        "Create your first finance project to manage your income and expenses."
                      )}
                    </Text>
                  </Box>

                  <Button
                    variant="filled"
                    size="lg"
                    leftSection={<IconMoneybagPlus size={18} />}
                    onClick={toggleAddProjectModal}
                  >
                    {getLocalizedText(
                      "Erstes Finanzprojekt hinzufügen",
                      "Add first finance project"
                    )}
                  </Button>
                </Stack>
              </Card>
            )}
          </Stack>
        </Stack>
        <FinanceProjectFormModal
          opened={addProjectModalOpened}
          onClose={closeAddProjectModal}
        />
      </Stack>
      {editProject && (
        <EditFinanceProjectDrawer
          opened={editProjectModalOpened}
          onClose={closeEditProjectModal}
          financeProject={editProject}
        />
      )}
    </Box>
  );
}
