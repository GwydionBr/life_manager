"use client";

import { useState, useEffect } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import { useIntl } from "@/hooks/useIntl";
import { workTimeEntriesCollection } from "@/db/collections/work/work-time-entry/work-time-entry-collection";
import { useSettings } from "@/db/collections/settings/settings-collection";
import { useProfileStore } from "@/stores/profileStore";

import { Group, Modal, Text, useModalsStack } from "@mantine/core";
import SessionForm from "./SessionForm";
import { Tables, TablesInsert } from "@/types/db.types";
import { Currency } from "@/types/settings.types";
import ProjectForm from "../Project/ProjectForm";
import { IconClockPlus } from "@tabler/icons-react";
import { NewSession } from "@/types/timerSession.types";
import { TimerRoundingSettings } from "@/types/timeTracker.types";
import FinanceCategoryForm from "@/components/Finances/Category/FinanceCategoryForm";

interface NewSessionModalProps {
  opened: boolean;
  onClose: () => void;
  initialValues?: NewSession;
  project?: Tables<"timer_project">;
}

export default function NewSessionModal({
  opened,
  onClose,
  initialValues,
  project,
}: NewSessionModalProps) {
  const { getLocalizedText } = useIntl();
  const stack = useModalsStack([
    "session-form",
    "project-form",
    "category-form",
  ]);
  const { data: settings } = useSettings();
  const { id: userId } = useProfileStore();

  const [currentProject, setCurrentProject] = useState<
    Tables<"timer_project"> | undefined
  >(project);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);

  useEffect(() => {
    setCurrentProject(project);
  }, [project]);

  useEffect(() => {
    if (opened) {
      stack.open("session-form");
    } else {
      stack.closeAll();
    }
  }, [opened]);

  const handleClose = () => {
    onClose();
    setCurrentProject(undefined);
    setCategoryIds([]);
  };

  async function handleSessionSubmit(values: {
    start_time: string;
    end_time: string;
    active_seconds: number;
    currency: Currency;
    salary: number;
    memo?: string;
  }) {
    if (!currentProject) {
      return;
    }

    let newSession: TablesInsert<"timer_session"> = {
      ...values,
      start_time: new Date(values.start_time).toISOString(),
      end_time: new Date(values.end_time).toISOString(),
      true_end_time: new Date(values.end_time).toISOString(),
      paused_seconds: 0,
      memo: values.memo || null,
    };

    const roundingSettings: TimerRoundingSettings = {
      roundInTimeFragments:
        currentProject.round_in_time_fragments !== null
          ? currentProject.round_in_time_fragments
          : (settings?.round_in_time_sections ?? false),
      timeFragmentInterval:
        currentProject.time_fragment_interval ??
        settings?.time_section_interval ??
        10,
      roundingInterval:
        currentProject.rounding_interval ?? settings?.rounding_interval ?? 1,
      roundingDirection:
        currentProject.rounding_direction ??
        settings?.rounding_direction ??
        "up",
    };

    // createWorkTimeEntryMutation({
    //   newTimeEntry: newSession,
    //   roundingSettings,
    // });
    // TODO Handle Rounding ETC.
    workTimeEntriesCollection.insert({
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      user_id: userId,
      currency: newSession.currency as Currency,
      hourly_payment:
        currentProject?.hourly_payment ??
        settings?.default_project_hourly_payment ??
        false,
      salary: newSession.salary,
      memo: newSession.memo ?? null,
      start_time: new Date(newSession.start_time).toISOString(),
      end_time: new Date(newSession.end_time).toISOString(),
      real_start_time: new Date(newSession.start_time).toISOString(),
      true_end_time: new Date(newSession.end_time).toISOString(),
      active_seconds: newSession.active_seconds,
      paused_seconds: newSession.paused_seconds ?? 0,
      paid: false,
      payout_id: null,
      single_cash_flow_id: null,
      project_id: currentProject.id,
      time_fragments_interval:
        currentProject?.time_fragment_interval ??
        settings?.time_section_interval ??
        10,
    });
  }

  return (
    <Modal.Stack>
      <Modal
        size="lg"
        {...stack.register("session-form")}
        onClose={handleClose}
        title={
          <Group>
            <IconClockPlus />
            <Text>{getLocalizedText("Sitzung hinzufügen", "Add Session")}</Text>
          </Group>
        }
        transitionProps={{ transition: "fade-right", duration: 400 }}
      >
        <SessionForm
          initialValues={
            initialValues ?? {
              project_id: undefined,
              start_time: new Date(new Date().setSeconds(0, 0)).toISOString(),
              end_time: new Date(new Date().setSeconds(0, 0)).toISOString(),
              active_seconds: 0,
              paused_seconds: 0,
              currency:
                project?.currency ?? settings?.default_currency ?? "USD",
              salary: project?.salary ?? settings?.default_salary_amount ?? 0,
            }
          }
          newSession={true}
          onSubmit={handleSessionSubmit}
          onProjectChange={setCurrentProject}
          onOpenProjectForm={() => stack.open("project-form")}
          onCancel={handleClose}
          project={currentProject}
        />
      </Modal>

      <Modal
        size="lg"
        {...stack.register("project-form")}
        title={getLocalizedText("Projekt hinzufügen", "Add Project")}
        transitionProps={{ transition: "fade-right", duration: 400 }}
      >
        <ProjectForm
          onCancel={() => stack.close("project-form")}
          categoryIds={categoryIds}
          setCategoryIds={setCategoryIds}
          onOpenCategoryForm={() => stack.open("category-form")}
          onSuccess={(project) => {
            setCurrentProject(project);
            stack.close("project-form");
          }}
        />
      </Modal>
      <Modal
        size="lg"
        {...stack.register("category-form")}
        onClose={() => stack.close("category-form")}
        title={getLocalizedText("Kategorie hinzufügen", "Add Category")}
      >
        <FinanceCategoryForm
          onClose={() => stack.close("category-form")}
          onSuccess={(category) =>
            setCategoryIds([...categoryIds, category.id])
          }
        />
      </Modal>
    </Modal.Stack>
  );
}
