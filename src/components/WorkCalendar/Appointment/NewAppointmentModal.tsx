import { useState, useEffect } from "react";
import { useIntl } from "@/hooks/useIntl";

import { Modal, useModalsStack } from "@mantine/core";
import AppointmentForm from "./AppointmentForm";
import ProjectForm from "@/components/Work/Project/ProjectForm";
import {
  IconCalendarPlus,
  IconClipboardPlus,
  IconTagPlus,
} from "@tabler/icons-react";
import FinanceTagForm from "@/components/Finances/Tag/TagForm";
import { WorkProject } from "@/types/work.types";
import { useAppointmentMutations } from "@/db/collections/work/appointment/use-appointment-mutations";
import { InsertAppointment } from "@/types/work.types";
import ModalTitle from "@/components/UI/Modal/ModalTitle";

interface NewAppointmentModalProps {
  opened: boolean;
  onClose: () => void;
  initialStartDate?: Date;
  initialEndDate?: Date;
  project?: WorkProject;
}

export default function NewAppointmentModal({
  opened,
  onClose,
  initialStartDate,
  initialEndDate,
  project,
}: NewAppointmentModalProps) {
  const { getLocalizedText } = useIntl();
  const stack = useModalsStack([
    "appointment-form",
    "project-form",
    "tag-form",
  ]);
  const { addAppointment } = useAppointmentMutations();

  const [currentProject, setCurrentProject] = useState<WorkProject | undefined>(
    project
  );
  const [tagIds, setTagIds] = useState<string[]>([]);

  useEffect(() => {
    setCurrentProject(project);
  }, [project]);

  useEffect(() => {
    if (opened) {
      stack.open("appointment-form");
    } else {
      stack.closeAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  const handleClose = () => {
    onClose();
    setCurrentProject(project);
    setTagIds([]);
  };

  async function handleAppointmentSubmit(values: InsertAppointment) {
    // Convert empty strings to null for database compatibility
    const cleanedValues = {
      ...values,
      description:
        values.description && values.description.trim() !== ""
          ? values.description
          : null,
    };
    await addAppointment(cleanedValues);
    onClose();
  }

  // Prepare initial values for new appointment
  const getInitialValues = (): InsertAppointment => {
    const startDate = initialStartDate || new Date();
    const endDate =
      initialEndDate || new Date(startDate.getTime() + 60 * 60 * 1000); // +1 hour

    return {
      title: "",
      description: "",
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      type: "work",
      status: "upcoming",
      is_all_day: false,
      work_project_id: project?.id || null,
      reminder: null,
    };
  };

  return (
    <Modal.Stack>
      <Modal
        size="lg"
        {...stack.register("appointment-form")}
        onClose={handleClose}
        title={
          <ModalTitle
            icon={<IconCalendarPlus />}
            title={getLocalizedText("Termin hinzufügen", "Add Appointment")}
          />
        }
        transitionProps={{ transition: "fade-right", duration: 400 }}
      >
        <AppointmentForm
          initialValues={getInitialValues()}
          newAppointment={true}
          onSubmit={handleAppointmentSubmit}
          onProjectChange={setCurrentProject}
          onOpenProjectForm={() => stack.open("project-form")}
          onCancel={handleClose}
          project={currentProject}
        />
      </Modal>

      <Modal
        size="lg"
        {...stack.register("project-form")}
        title={
          <ModalTitle
            icon={<IconClipboardPlus />}
            title={getLocalizedText("Projekt hinzufügen", "Add Project")}
          />
        }
        transitionProps={{ transition: "fade-right", duration: 400 }}
      >
        <ProjectForm
          onCancel={() => stack.close("project-form")}
          tagIds={tagIds}
          setTagIds={setTagIds}
          onOpenTagForm={() => stack.open("tag-form")}
          onSuccess={(project: WorkProject) => {
            setCurrentProject(project);
            stack.close("project-form");
          }}
        />
      </Modal>
      <Modal
        size="lg"
        {...stack.register("tag-form")}
        onClose={() => stack.close("tag-form")}
        title={
          <ModalTitle
            icon={<IconTagPlus />}
            title={getLocalizedText("Tag hinzufügen", "Add Tag")}
          />
        }
      >
        <FinanceTagForm
          onClose={() => stack.close("tag-form")}
          onSuccess={(tag) => setTagIds([...tagIds, tag.id])}
        />
      </Modal>
    </Modal.Stack>
  );
}
