import { useForm } from "@mantine/form";

import { useEffect, useState, useMemo } from "react";
import { useDisclosure, useClickOutside } from "@mantine/hooks";
import { useTags } from "@/db/collections/finance/tags/use-tags-query";
import { useWorkProjectMutations } from "@/db/collections/work/work-project/use-work-project-mutations";
import { useSettings } from "@/db/collections/settings/use-settings-query";
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
import { Currency, RoundingDirection } from "@/types/settings.types";
import CancelButton from "@/components/UI/Buttons/CancelButton";
import {
  InsertWorkProject,
  UpdateWorkProject,
  WorkProject,
} from "@/types/work.types";
import CustomNumberInput from "@/components/UI/CustomNumberInput";
import { Constants } from "@/types/db.types";

interface ProjectFormProps {
  project?: WorkProject;
  onSuccess?: (project: WorkProject) => void;
  onCancel?: () => void;
  tagIds: string[];
  setTagIds: (tagIds: string[]) => void;
  setActiveProjectId?: boolean;
  onOpenTagForm?: () => void;
}

export default function ProjectForm({
  project,
  onSuccess,
  tagIds,
  setTagIds,
  onOpenTagForm,
  onCancel,
}: ProjectFormProps) {
  const { data: settings } = useSettings();
  const { getLocalizedText, locale } = useIntl();
  const { data: tags } = useTags();
  const { addWorkProject, updateWorkProject } = useWorkProjectMutations();
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

  const schema = z.object({
    color: z.string().nullable().optional(),
    title: z.string().min(1, {
      message: getLocalizedText("Titel ist erforderlich", "Title is required"),
    }),
    description: z.string().optional(),
    salary: z.number().min(0, {
      message: getLocalizedText(
        "Gehalt muss positiv sein",
        "Salary must be positive"
      ),
    }),
    hourly_payment: z.boolean(),
    currency: z.enum(Constants.public.Enums.currency),
    tag_ids: z.array(z.string()),
    rounding_interval: z.number(),
    rounding_direction: z.enum(Constants.public.Enums.roundingDirection),
    round_in_time_fragments: z.boolean(),
    time_fragment_interval: z.number(),
  });

  const form = useForm<z.infer<typeof schema>>({
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
      tag_ids: tagIds || [],
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

  // sync tagIds with form
  useEffect(() => {
    if (tagIds) {
      form.setFieldValue("tag_ids", tagIds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagIds]);

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
  const handleWorkFieldChange = (
    field: string,
    value: string | number | boolean
  ) => {
    form.setFieldValue(field, value);
    if (!isHobby) {
      setPreviousWorkValues((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSubmit = async (values: z.infer<typeof schema>) => {
    const { tag_ids: _tagIds, ...cleanValues } = values;

    if (project) {
      // Update existing project
      const updates: UpdateWorkProject = {
        ...cleanValues,
        currency: values.currency as Currency,
        rounding_direction: values.rounding_direction as RoundingDirection,
        tags: tags.filter((tag) => tagIds.includes(tag.id)),
      };

      if (isDefaultRounding) {
        updates.rounding_interval = null;
        updates.rounding_direction = null;
        updates.round_in_time_fragments = null;
        updates.time_fragment_interval = null;
      }

      // Use the mutation hook
      const result = await updateWorkProject(project.id, updates, true);
      if (result) {
        onSuccess?.({
          ...project,
          ...updates,
          tags: tags.filter((tag) => tagIds.includes(tag.id)),
        });
      }
    } else {
      // Create new project
      const projectData: InsertWorkProject = {
        ...cleanValues,
        description: cleanValues.description || null,
        currency: values.currency as Currency,
        color: cleanValues.color || null,
        rounding_interval: isDefaultRounding
          ? null
          : cleanValues.rounding_interval,
        rounding_direction: isDefaultRounding
          ? null
          : (values.rounding_direction as RoundingDirection),
        round_in_time_fragments: isDefaultRounding
          ? null
          : cleanValues.round_in_time_fragments,
        time_fragment_interval: isDefaultRounding
          ? null
          : cleanValues.time_fragment_interval,
        tags: tags.filter((tag) => tagIds.includes(tag.id)),
      };

      // Use the mutation hook
      const newProject = await addWorkProject(projectData, true);

      // Return the complete WorkProject to onSuccess
      if (newProject) {
        onSuccess?.(newProject);
      }
    }
  };

  const tagOptions = useMemo(() => {
    return tags.map((tag) => ({
      value: tag.id,
      label: tag.title,
    }));
  }, [tags]);

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
                label={getLocalizedText("Tag", "Tag")}
                placeholder={getLocalizedText(
                  "Tag auswählen (optional)",
                  "Select tag (optional)"
                )}
                data={tagOptions}
                clearable
                searchable
                nothingFoundMessage={getLocalizedText(
                  "Keine Tags gefunden",
                  "No tags found"
                )}
                value={tagIds}
                onChange={(value) => setTagIds(value)}
                error={form.errors.tag_ids}
              />
              <Button
                mt={25}
                w={120}
                p={0}
                onClick={onOpenTagForm}
                fw={500}
                variant="subtle"
                leftSection={<IconPlus size={20} />}
              >
                <Text fz="xs" c="dimmed">
                  {getLocalizedText("Tag", "Tag")}
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
