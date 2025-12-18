import { useForm } from "@mantine/form";

import { useEffect, useState, useMemo } from "react";
import { useDisclosure, useClickOutside } from "@mantine/hooks";
import { useFinanceCategories } from "@/db/collections/finance/finance-category/finance-category-collection";
import { workProjectsCollection } from "@/db/collections/work/work-project/work-project-collection";
import { useSettings } from "@/db/collections/settings/settings-collection";
import { useProfileStore } from "@/stores/profileStore";
import { useIntl } from "@/hooks/useIntl";

import {
  NumberInput,
  Stack,
  Textarea,
  TextInput,
  Select,
  Group,
  Switch,
  Collapse,
  Popover,
  Button,
  Fieldset,
  Text,
  SegmentedControl,
  MultiSelect,
} from "@mantine/core";
import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";
import {
  currencies,
  getRoundingInTimeFragments,
  getRoundingModes,
} from "@/constants/settings";
import DelayedTooltip from "@/components/UI/DelayedTooltip";
import UpdateButton from "@/components/UI/Buttons/UpdateButton";
import CreateButton from "@/components/UI/Buttons/CreateButton";
import ProjectColorPicker from "@/components/UI/ProjectColorPicker";
import {
  IconBriefcase,
  IconHammer,
  IconPalette,
  IconPlus,
} from "@tabler/icons-react";
import { Tables } from "@/types/db.types";
import { Currency, RoundingDirection } from "@/types/settings.types";
import CancelButton from "@/components/UI/Buttons/CancelButton";
import {
  WorkProject,
  UpdateWorkProject,
  InsertWorkProject,
} from "@/types/work.types";
import CustomNumberInput from "@/components/UI/CustomNumberInput";

interface ProjectFormProps {
  project?: WorkProject;
  onSuccess?: (project: Tables<"timer_project">) => void;
  onCancel?: () => void;
  categoryIds: string[];
  setCategoryIds: (categoryIds: string[]) => void;
  setActiveProjectId?: boolean;
  onOpenCategoryForm?: () => void;
}

const schema = z.object({
  color: z.string().nullable().optional(),
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional(),
  salary: z.number().min(0, { message: "Salary must be positive" }),
  hourly_payment: z.boolean(),
  currency: z.string().min(1, { message: "Currency is required" }),
  cash_flow_category_ids: z.array(z.string()),
  rounding_interval: z.number(),
  rounding_direction: z.string(),
  round_in_time_fragments: z.boolean(),
  time_fragment_interval: z.number(),
});

type ProjectFormValues = z.infer<typeof schema>;

export default function ProjectForm({
  project,
  onSuccess,
  categoryIds,
  setCategoryIds,
  onOpenCategoryForm,
  onCancel,
}: ProjectFormProps) {
  const { data: settings } = useSettings();
  const { getLocalizedText, locale } = useIntl();
  const { data: financeCategories } = useFinanceCategories();
  const { id: userId } = useProfileStore();
  const [isColorPickerOpen, { open, close }] = useDisclosure(false);
  const [
    isDefaultRounding,
    { open: openDefaultRounding, close: closeDefaultRounding },
  ] = useDisclosure(
    !project ||
      project?.rounding_interval === null ||
      project?.rounding_direction === null ||
      project?.round_in_time_fragments === null ||
      project?.time_fragment_interval === null
  );
  const ref = useClickOutside(() => {
    close();
  });

  // State to store previous work values
  const [previousWorkValues, setPreviousWorkValues] = useState({
    salary: project?.salary,
    hourly_payment: project?.hourly_payment,
  });

  const [isHobby, setIsHobby] = useState(
    project?.hourly_payment === false && project?.salary === 0 ? true : false
  );

  const form = useForm<ProjectFormValues>({
    initialValues: {
      color: project?.color || null,
      title: project?.title || "",
      description: project?.description || "",
      salary: project?.salary || settings?.default_salary_amount || 0,
      hourly_payment:
        project?.hourly_payment ||
        settings?.default_project_hourly_payment ||
        false,
      currency: project?.currency || settings?.default_currency || "USD",
      cash_flow_category_ids: categoryIds || [],
      round_in_time_fragments:
        project?.round_in_time_fragments === null ||
        project?.round_in_time_fragments === undefined
          ? settings?.round_in_time_sections || false
          : project?.round_in_time_fragments,
      time_fragment_interval:
        project?.time_fragment_interval ||
        settings?.time_section_interval ||
        10,
      rounding_interval:
        project?.rounding_interval || settings?.rounding_interval || 1,
      rounding_direction:
        project?.rounding_direction || settings?.rounding_direction || "up",
    },
    validate: zodResolver(schema),
  });

  useEffect(() => {
    if (categoryIds) {
      form.setFieldValue("cash_flow_category_ids", categoryIds);
    }
  }, [categoryIds]);

  // Handle hobby toggle
  const handleHobbyToggle = (checked: boolean) => {
    if (checked) {
      setIsHobby(true);
      form.setFieldValue("salary", 0);
      form.setFieldValue("hourly_payment", false);
    } else {
      setIsHobby(false);
      form.setFieldValue("salary", previousWorkValues.salary || 10);
      form.setFieldValue(
        "hourly_payment",
        previousWorkValues.hourly_payment || true
      );
    }
  };

  const handleCustomRoundingToggle = (checked: boolean) => {
    if (checked) {
      openDefaultRounding();
    } else {
      closeDefaultRounding();
      form.setFieldValue("rounding_interval", settings?.rounding_interval || 1);
      form.setFieldValue(
        "rounding_direction",
        settings?.rounding_direction || "up"
      );
      form.setFieldValue(
        "round_in_time_fragments",
        settings?.round_in_time_sections || false
      );
      form.setFieldValue(
        "time_fragment_interval",
        settings?.time_section_interval || 10
      );
    }
  };

  // Update previous work values when user changes work-related fields
  const handleWorkFieldChange = (field: string, value: any) => {
    form.setFieldValue(field, value);
    if (!isHobby) {
      setPreviousWorkValues((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSubmit = (values: z.infer<typeof schema>) => {
    const { cash_flow_category_ids, ...cleanValues } = values;
    if (project) {
      const updatedProject: UpdateWorkProject = {
        ...project,
        ...cleanValues,
        currency: values.currency as Currency,
        rounding_direction: values.rounding_direction as RoundingDirection,
        categories: financeCategories.filter((c) =>
          cash_flow_category_ids.includes(c.id)
        ),
      };
      if (isDefaultRounding) {
        updatedProject.rounding_interval = null;
        updatedProject.rounding_direction = null;
        updatedProject.round_in_time_fragments = null;
        updatedProject.time_fragment_interval = null;
      }
      workProjectsCollection.update(project.id, (draft) => {
        draft.title = updatedProject.title || "";
        draft.description = updatedProject.description || "";
        draft.salary = updatedProject.salary || 0;
        draft.hourly_payment = updatedProject.hourly_payment || false;
        draft.currency = updatedProject.currency || "USD";
        draft.cash_flow_category_id =
          updatedProject.cash_flow_category_id || null;
        draft.rounding_interval = updatedProject.rounding_interval || null;
        draft.rounding_direction = updatedProject.rounding_direction || null;
        draft.round_in_time_fragments =
          updatedProject.round_in_time_fragments || null;
      });
      onSuccess;
    } else {
      const newProject: InsertWorkProject = {
        ...cleanValues,
        currency: values.currency as Currency,
        rounding_direction: values.rounding_direction as RoundingDirection,
        categories: financeCategories.filter((c) =>
          cash_flow_category_ids.includes(c.id)
        ),
      };
      if (isDefaultRounding) {
        newProject.rounding_interval = null;
        newProject.rounding_direction = null;
        newProject.round_in_time_fragments = null;
        newProject.time_fragment_interval = null;
      }
      workProjectsCollection.insert({
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        user_id: userId,
        cash_flow_category_id: newProject.cash_flow_category_id || null,
        color: newProject.color || null,
        description: newProject.description || "",
        salary: newProject.salary || 0,
        hourly_payment: newProject.hourly_payment || false,
        currency: newProject.currency || "USD",
        title: newProject.title || "",
        rounding_interval: newProject.rounding_interval || null,
        rounding_direction: newProject.rounding_direction || null,
        round_in_time_fragments: newProject.round_in_time_fragments || null,
        time_fragment_interval: newProject.time_fragment_interval || null,
        total_payout: 0,
        order_index: 0,
        is_favorite: false,
        folder_id: null,
        finance_project_id: null,
      });
      onSuccess;
    }
  };

  const categoryOptions = useMemo(() => {
    return financeCategories.map((category) => ({
      value: category.id,
      label: category.title,
    }));
  }, [financeCategories]);

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <Fieldset
          legend={getLocalizedText("Projekt Details", "Project details")}
        >
          <TextInput
            withAsterisk
            data-autofocus
            aria-label={getLocalizedText(
              "Name des Projekts",
              "Name of the project"
            )}
            label={getLocalizedText("Name", "Name")}
            placeholder={getLocalizedText(
              "Project Name eingeben",
              "Enter project name"
            )}
            {...form.getInputProps("title")}
          />
          <Textarea
            aria-label={getLocalizedText(
              "Beschreibung des Projekts",
              "Description of the project"
            )}
            label={getLocalizedText("Beschreibung", "Description")}
            placeholder={getLocalizedText(
              "Projekt Beschreibung eingeben",
              "Enter project description"
            )}
            {...form.getInputProps("description")}
          />
        </Fieldset>

        <Fieldset
          legend={getLocalizedText("Finanz Einstellungen", "Finance settings")}
        >
          <Stack gap="xs" align="flex-start">
            <DelayedTooltip
              label={getLocalizedText(
                "Projekt Typ (Hobby/Arbeit)",
                "Project type (Hobby/Work)"
              )}
              openDelay={500}
            >
              <SegmentedControl
                color={isHobby ? "lime" : "cyan"}
                data={[
                  {
                    value: "hobby",
                    label: (
                      <Group gap="xs" align="center" wrap="nowrap">
                        <IconHammer size={20} />
                        <Text>{getLocalizedText("Hobby", "Hobby")}</Text>
                      </Group>
                    ),
                  },
                  {
                    value: "work",
                    label: (
                      <Group gap="xs" align="center" wrap="nowrap">
                        <IconBriefcase size={20} />
                        <Text>{getLocalizedText("Arbeit", "Work")}</Text>
                      </Group>
                    ),
                  },
                ]}
                value={isHobby ? "hobby" : "work"}
                onChange={(value) => handleHobbyToggle(value === "hobby")}
              />
            </DelayedTooltip>

            <Collapse in={!isHobby}>
              <Group align="flex-end">
                <CustomNumberInput
                  allowLeadingZeros={false}
                  allowNegative={false}
                  withAsterisk
                  label={getLocalizedText("Gehalt", "Salary")}
                  min={0}
                  step={0.01}
                  value={form.values.salary}
                  onChange={(value) =>
                    handleWorkFieldChange("salary", value || 0)
                  }
                  error={form.errors.salary}
                />
                {project === undefined && (
                  <DelayedTooltip
                    label={getLocalizedText(
                      "Zahlungsmethode",
                      "Payment method"
                    )}
                  >
                    <Switch
                      size="xl"
                      onLabel={getLocalizedText("Stündlich", "Hourly")}
                      offLabel={getLocalizedText("Projekt", "Project")}
                      checked={form.values.hourly_payment}
                      onChange={(event) =>
                        handleWorkFieldChange(
                          "hourly_payment",
                          event.currentTarget.checked
                        )
                      }
                    />
                  </DelayedTooltip>
                )}
              </Group>
            </Collapse>
            {/* Currency - only show for work projects */}
            <Collapse in={!isHobby}>
              <Select
                withAsterisk
                label={getLocalizedText("Währung", "Currency")}
                placeholder={getLocalizedText(
                  "Währung auswählen",
                  "Select currency"
                )}
                data={currencies}
                value={form.values.currency}
                onChange={(value) =>
                  handleWorkFieldChange("currency", value || "")
                }
                error={form.errors.currency}
              />
            </Collapse>
          </Stack>
        </Fieldset>

        <Fieldset legend={getLocalizedText("Konfiguration", "Configuration")}>
          <Stack>
            <Popover
              opened={isColorPickerOpen}
              onClose={close}
              onOpen={open}
              trapFocus
              returnFocus
            >
              <Popover.Target>
                <Button
                  mt="lg"
                  leftSection={<IconPalette />}
                  variant="light"
                  size="sm"
                  onClick={open}
                  color={form.values.color || "teal"}
                >
                  {getLocalizedText("Farbe", "Color")}
                </Button>
              </Popover.Target>
              <Popover.Dropdown ref={ref}>
                <ProjectColorPicker
                  value={form.values.color || ""}
                  onChange={(value) => form.setFieldValue("color", value)}
                  onClose={close}
                />
              </Popover.Dropdown>
            </Popover>
            <Group wrap="nowrap">
              <MultiSelect
                w="100%"
                label={getLocalizedText("Kategorie", "Category")}
                placeholder={getLocalizedText(
                  "Kategorie auswählen (optional)",
                  "Select category (optional)"
                )}
                data={categoryOptions}
                clearable
                searchable
                nothingFoundMessage={getLocalizedText(
                  "Keine Kategorien gefunden",
                  "No categories found"
                )}
                value={categoryIds}
                onChange={(value) => setCategoryIds(value)}
                error={form.errors.cash_flow_category_id}
              />
              <Button
                mt={25}
                w={120}
                p={0}
                onClick={onOpenCategoryForm}
                fw={500}
                variant="subtle"
                leftSection={<IconPlus size={20} />}
              >
                <Text fz="xs" c="dimmed">
                  {getLocalizedText("Kategorie", "Category")}
                </Text>
              </Button>
            </Group>
          </Stack>
        </Fieldset>
        <Fieldset legend={getLocalizedText("Zeit Rundung", "Time Rounding")}>
          <Stack>
            <Switch
              label={getLocalizedText(
                "Rundung aus Einstellungen verwenden",
                "Use rounding from settings"
              )}
              checked={isDefaultRounding}
              onChange={(event) =>
                handleCustomRoundingToggle(event.currentTarget.checked)
              }
            />
            <Stack>
              <Switch
                disabled={isDefaultRounding}
                label={getLocalizedText(
                  "Runden in Zeitabschnitten",
                  "Round in time fragments"
                )}
                checked={form.values.round_in_time_fragments || false}
                onChange={(event) =>
                  handleWorkFieldChange(
                    "round_in_time_fragments",
                    event.currentTarget.checked
                  )
                }
              />
              <Collapse in={!form.values.round_in_time_fragments || false}>
                <Group>
                  <NumberInput
                    disabled={isDefaultRounding}
                    label={getLocalizedText(
                      "Rundungsintervall",
                      "Rounding interval"
                    )}
                    suffix={getLocalizedText(" Minuten", " minutes")}
                    allowNegative={false}
                    allowDecimal={false}
                    allowLeadingZeros={false}
                    min={1}
                    max={1440}
                    value={form.values.rounding_interval}
                    onChange={(value) =>
                      handleWorkFieldChange("rounding_interval", value || 1)
                    }
                  />
                  <Select
                    w={125}
                    disabled={isDefaultRounding}
                    label={getLocalizedText("Rundungsmodus", "Rounding mode")}
                    data={getRoundingModes(locale)}
                    value={form.values.rounding_direction}
                    onChange={(value) =>
                      handleWorkFieldChange("rounding_direction", value || "")
                    }
                  />
                </Group>
              </Collapse>
              <Collapse in={form.values.round_in_time_fragments || false}>
                <Group>
                  <Select
                    w={200}
                    disabled={isDefaultRounding}
                    data={getRoundingInTimeFragments(locale)}
                    label={getLocalizedText(
                      "Zeitabschnittsintervall",
                      "Time fragment interval"
                    )}
                    placeholder={getLocalizedText(
                      "Intervall auswählen",
                      "Select interval"
                    )}
                    value={form.values.time_fragment_interval.toString()}
                    onChange={(value) =>
                      handleWorkFieldChange(
                        "time_fragment_interval",
                        Number(value) || 5
                      )
                    }
                  />
                </Group>
              </Collapse>
            </Stack>
          </Stack>
        </Fieldset>
        {project === undefined ? (
          <CreateButton
            onClick={form.onSubmit(handleSubmit)}
            type="submit"
            mt="md"
          />
        ) : (
          <UpdateButton
            onClick={form.onSubmit(handleSubmit)}
            type="submit"
            mt="md"
          />
        )}
        {onCancel && <CancelButton onClick={onCancel} />}
      </Stack>
    </form>
  );
}
