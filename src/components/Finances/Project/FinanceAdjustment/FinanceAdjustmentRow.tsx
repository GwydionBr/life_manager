import { useHover } from "@mantine/hooks";
import { useIntl } from "@/hooks/useIntl";
import { useContacts } from "@/db/collections/finance/contacts/use-contact-query";

import { Group, Text, ThemeIcon, Card, Transition } from "@mantine/core";
import {
  IconArrowRight,
  IconMinus,
  IconPlus,
  IconArrowLeft,
  IconCheck,
} from "@tabler/icons-react";

import { Currency } from "@/types/settings.types";
import { Tables } from "@/types/db.types";
import PayoutActionIcon from "@/components/UI/ActionIcons/PayoutActionIcon";
import ContactBadge from "@/components/Finances/Contact/ContactBadge";
import { FinanceProject } from "@/types/finance.types";

interface FinanceAdjustmentRowProps {
  adultContactId: string | null;
  financeProject?: FinanceProject;
  adjustment?: Tables<"finance_project_adjustment">;
  currency: Currency;
  handlePayout: ({
    adjustmentId,
    isStartValue,
  }: {
    adjustmentId?: string;
    isStartValue?: boolean;
  }) => void;
}

export default function FinanceAdjustmentRow({
  adultContactId,
  financeProject,
  adjustment,
  currency,
  handlePayout,
}: FinanceAdjustmentRowProps) {
  const { getLocalizedText, formatMoney, formatDate } = useIntl();
  const { data: contacts } = useContacts();

  const { hovered, ref } = useHover();

  if (!adjustment && !financeProject) return null;

  let isIncome = false;
  let contact: Tables<"contact"> | null = null;
  let amount = 0;
  let description: string | null = null;
  let createdAt = new Date();
  let isStartValue = true;
  let id: string | undefined = undefined;
  let isPaid = false;

  if (adjustment) {
    isIncome = adjustment.amount > 0;
    amount = adjustment.amount;
    contact =
      contacts.find(
        (contact) =>
          contact.id === adjustment.contact_id || contact.id === adultContactId
      ) || null;
    description = adjustment.description;
    createdAt = new Date(adjustment.created_at);
    isStartValue = false;
    id = adjustment.id;
    isPaid = !!adjustment.single_cashflow_id;
  } else if (financeProject) {
    amount = financeProject.start_amount;
    isIncome = financeProject.start_amount > 0;
    contact =
      contacts.find((contact) => contact.id === financeProject.contact_id) ||
      null;
    description = getLocalizedText("Startbetrag", "Start amount");
    createdAt = new Date(financeProject.created_at);
    isPaid = !!financeProject.single_cashflow_id;
  }

  return (
    <Card
      p="sm"
      withBorder
      bg={
        isPaid
          ? "light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-8))"
          : "light-dark(var(--mantine-color-white), var(--mantine-color-dark-6))"
      }
      shadow="sm"
      radius="md"
      ref={ref}
      style={{
        border:
          hovered && !isPaid
            ? "1px solid light-dark(var(--mantine-color-gray-6), var(--mantine-color-dark-2))"
            : financeProject
              ? "1px solid light-dark(var(--mantine-color-gray-5), var(--mantine-color-dark-3))"
              : "",
      }}
    >
      <Group
        justify="space-between"
        w="100%"
        style={{ opacity: isPaid ? 0.5 : 1 }}
      >
        <Group gap="xs" align="center">
          <ThemeIcon
            size="sm"
            color={isIncome ? "green" : "red"}
            variant="transparent"
          >
            {isIncome ? (
              <IconArrowRight size={14} />
            ) : (
              <IconArrowLeft size={14} />
            )}
          </ThemeIcon>
          <ThemeIcon
            size="sm"
            color={isIncome ? "green" : "red"}
            variant="light"
          >
            {isIncome ? <IconPlus size={14} /> : <IconMinus size={14} />}
          </ThemeIcon>
          <Group gap="xs">
            <Text size="sm" fw={500} c={isIncome ? "green" : "red"}>
              {formatMoney(Math.abs(amount), currency)}
            </Text>

            {description && (
              <Text size="sm" c="dimmed">
                {description}
              </Text>
            )}
            {isPaid && (
              <Group wrap="nowrap" gap={5}>
                <ThemeIcon size="sm" color="green" variant="transparent">
                  <IconCheck size={14} />
                </ThemeIcon>
                <Text size="xs" c="green">
                  Paid
                </Text>
              </Group>
            )}
          </Group>
          <Transition
            mounted={hovered && !isPaid}
            transition="fade-left"
            duration={200}
          >
            {(styles) => (
              <PayoutActionIcon
                ml={10}
                size="sm"
                onClick={() => handlePayout({ adjustmentId: id, isStartValue })}
                tooltipLabel={getLocalizedText("Auszahlung", "Payout")}
                style={styles}
              />
            )}
          </Transition>
        </Group>

        <Group gap="xs" align="center">
          {contact && <ContactBadge contact={contact} />}

          <Text size="xs" c="dimmed">
            {formatDate(createdAt)}
          </Text>
        </Group>
      </Group>
    </Card>
  );
}
