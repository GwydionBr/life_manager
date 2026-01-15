import { useEffect, useState } from "react";

import { Modal, useModalsStack } from "@mantine/core";
import FinanceProjectForm from "./FinanceProjectForm";
import { useIntl } from "@/hooks/useIntl";
import ContactsForm from "@/components/Finances/Contact/ContactForm";
import FinanceTagForm from "@/components/Finances/Tag/TagForm";
import {
  IconMoneybagPlus,
  IconTagPlus,
  IconUserPlus,
} from "@tabler/icons-react";
import { Tables } from "@/types/db.types";
import ModalTitle from "@/components/UI/Modal/ModalTitle";

interface FinanceProjectFormModalProps {
  opened: boolean;
  onClose: () => void;
}

export default function FinanceProjectFormModal({
  opened,
  onClose,
}: FinanceProjectFormModalProps) {
  const { getLocalizedText } = useIntl();
  const [contact, setContact] = useState<Tables<"contact"> | null>(null);
  const [tags, setTags] = useState<Tables<"tag">[]>([]);
  const stack = useModalsStack(["project-form", "contact-form", "tag-form"]);

  useEffect(() => {
    if (opened) {
      stack.open("project-form");
    } else {
      stack.closeAll();
      setContact(null);
      setTags([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  return (
    <Modal.Stack>
      <Modal
        {...stack.register("project-form")}
        onClose={onClose}
        title={
          <ModalTitle
            icon={<IconMoneybagPlus />}
            title={getLocalizedText(
              "Finanz Projekt hinzufügen",
              "Add Finance Project"
            )}
          />
        }
        size="lg"
        padding="md"
      >
        <FinanceProjectForm
          onClose={onClose}
          contact={contact}
          tags={tags}
          onOpenContactForm={() => stack.open("contact-form")}
          onOpenTagForm={() => stack.open("tag-form")}
          onContactChange={setContact}
          onTagChange={setTags}
        />
      </Modal>
      <Modal
        {...stack.register("contact-form")}
        onClose={() => stack.close("contact-form")}
        title={
          <ModalTitle
            icon={<IconUserPlus />}
            title={getLocalizedText("Kontakt hinzufügen", "Add Contact")}
          />
        }
        size="lg"
        padding="md"
      >
        <ContactsForm
          onClose={() => stack.close("contact-form")}
          onSuccess={(contact) => setContact(contact)}
        />
      </Modal>
      <Modal
        {...stack.register("tag-form")}
        onClose={() => stack.close("tag-form")}
        title={
          <ModalTitle
            icon={<IconTagPlus />}
            title={getLocalizedText("Tag hinzufügen", "Add Tag")}
          />
        }
        size="lg"
        padding="md"
      >
        <FinanceTagForm
          onClose={() => stack.close("tag-form")}
          onSuccess={(tag) => setTags((prev) => [...prev, tag])}
        />
      </Modal>
    </Modal.Stack>
  );
}
