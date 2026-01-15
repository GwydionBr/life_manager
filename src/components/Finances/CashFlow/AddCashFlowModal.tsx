import { useEffect, useState } from "react";
import { useIntl } from "@/hooks/useIntl";

import { Modal, useModalsStack } from "@mantine/core";
import CashflowForm from "@/components/Finances/CashFlow/CashflowForm";
import FinanceTagForm from "@/components/Finances/Tag/TagForm";
import { IconCashPlus, IconCategoryPlus } from "@tabler/icons-react";
import { Tables } from "@/types/db.types";
import ModalTitle from "@/components/UI/Modal/ModalTitle";

interface CashFlowModalProps {
  opened: boolean;
  onClose: () => void;
  isSingle?: boolean;
}

export default function CashFlowModal({
  opened,
  onClose,
  isSingle = true,
}: CashFlowModalProps) {
  const modalStack = useModalsStack(["cash-flow", "category-form"]);
  const [categories, setCategories] = useState<Tables<"tag">[]>([]);
  const { getLocalizedText } = useIntl();
  useEffect(() => {
    if (opened) {
      modalStack.open("cash-flow");
    } else {
      modalStack.closeAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  const handleClose = () => {
    onClose();
    setCategories([]);
  };

  return (
    <Modal.Stack>
      <Modal
        {...modalStack.register("cash-flow")}
        onClose={handleClose}
        title={
          <ModalTitle
            icon={<IconCashPlus />}
            title={getLocalizedText("Zahlung hinzufügen", "Add Cash Flow")}
          />
        }
      >
        <CashflowForm
          onClose={handleClose}
          onOpenTagForm={() => modalStack.open("category-form")}
          tags={categories}
          setTags={setCategories}
          isSingle={isSingle}
        />
      </Modal>
      <Modal
        {...modalStack.register("category-form")}
        onClose={() => modalStack.close("category-form")}
        title={
          <ModalTitle
            icon={<IconCategoryPlus />}
            title={getLocalizedText("Kategorie hinzufügen", "Add Category")}
          />
        }
      >
        <FinanceTagForm
          onClose={() => modalStack.close("category-form")}
          onSuccess={(category) => setCategories((prev) => [...prev, category])}
        />
      </Modal>
    </Modal.Stack>
  );
}
