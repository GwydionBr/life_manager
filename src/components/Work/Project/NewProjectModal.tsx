import { useEffect, useState } from "react";
import { useIntl } from "@/hooks/useIntl";
import { useRouter } from "@tanstack/react-router";

import { Modal, useModalsStack } from "@mantine/core";
import ProjectForm from "./ProjectForm";
import FinanceTagForm from "@/components/Finances/Tag/TagForm";

import { WorkProject } from "@/types/work.types";

interface NewProjectModalProps {
  opened: boolean;
  onClose: () => void;
}

export default function NewProjectModal({
  opened,
  onClose,
}: NewProjectModalProps) {
  const { getLocalizedText } = useIntl();
  const stack = useModalsStack(["project-form", "tag-form"]);
  const [tagIds, setTagIds] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (opened) {
      stack.open("project-form");
    } else {
      stack.closeAll();
    }
  }, [opened]);

  const handleSuccess = (project: WorkProject) => {
    router.navigate({
      to: "/work",
      search: { projectId: project.id },
    });
    onClose();
    setTagIds([]);
  };

  return (
    <Modal.Stack>
      <Modal
        {...stack.register("project-form")}
        size="lg"
        onClose={onClose}
        title={getLocalizedText("Neues Projekt", "New Project")}
      >
        <ProjectForm
          onCancel={onClose}
          onSuccess={handleSuccess}
          tagIds={tagIds}
          setTagIds={setTagIds}
          setActiveProjectId={true}
          onOpenTagForm={() => stack.open("tag-form")}
        />
      </Modal>
      <Modal
        {...stack.register("tag-form")}
        onClose={() => stack.close("tag-form")}
        title={getLocalizedText("Neues Tag", "New Tag")}
      >
        <FinanceTagForm
          onClose={() => stack.close("tag-form")}
          onSuccess={(tag) => setTagIds([...tagIds, tag.id])}
        />
      </Modal>
    </Modal.Stack>
  );
}
