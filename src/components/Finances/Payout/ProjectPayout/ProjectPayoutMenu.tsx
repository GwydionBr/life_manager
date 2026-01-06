import { useIntl } from "@/hooks/useIntl";

import {
  Button,
  Text,
  Stack,
  Divider,
  Alert,
  NumberInput,
  Switch,
} from "@mantine/core";
import { IconBrandCashapp, IconAlertCircle } from "@tabler/icons-react";

import type { Tables } from "@/types/db.types";

interface ProjectPayoutMenuProps {
  project: Tables<"work_project">;
  availablePayout: number;
  useCustomAmount: boolean;
  payoutAmount: number;
  openModal: () => void;
  setUseCustomAmount: (value: boolean) => void;
  setPayoutAmount: (value: number) => void;
}

export default function ProjectPayoutMenu({
  project,
  availablePayout,
  useCustomAmount,
  payoutAmount,
  openModal,
  setUseCustomAmount,
  setPayoutAmount,
}: ProjectPayoutMenuProps) {
  const { getLocalizedText, formatMoney, getCurrencySymbol } = useIntl();

  const handleProjectSalaryPayout = async () => {
    openModal();
  };
  return (
    <Stack p="md" gap="md">
      <Text size="sm" fw={500}>
        {getLocalizedText("Projektgehalt auszahlen", "Project Salary Payout")}
      </Text>

      <Stack gap="xs">
        <Text size="sm" c="dimmed">
          {getLocalizedText("Gesamtgehalt", "Total Salary")}:{" "}
          {formatMoney(project.salary, project.currency)}
        </Text>
        <Text size="sm" c="dimmed">
          {getLocalizedText("Bereits ausgezahlt", "Already Paid")}:{" "}
          {formatMoney(project.total_payout || 0, project.currency)}
        </Text>
        <Text size="sm" fw={500} c="teal">
          {getLocalizedText("Verfügbar", "Available")}:{" "}
          {formatMoney(availablePayout, project.currency)}
        </Text>
      </Stack>

      {availablePayout > 0 ? (
        <>
          <Divider />

          <Switch
            label={getLocalizedText(
              "Benutzerdefinierter Betrag",
              "Custom Amount"
            )}
            checked={useCustomAmount}
            onChange={(event) =>
              setUseCustomAmount(event.currentTarget.checked)
            }
          />

          {useCustomAmount ? (
            <NumberInput
              allowLeadingZeros={false}
              label={getLocalizedText("Auszahlungsbetrag", "Payout Amount")}
              placeholder={getLocalizedText("Betrag eingeben", "Enter amount")}
              min={0}
              max={availablePayout}
              step={0.01}
              value={payoutAmount}
              onChange={(value) =>
                setPayoutAmount(typeof value === "number" ? value : 0)
              }
              rightSection={
                <Text size="xs" c="dimmed">
                  {getCurrencySymbol(project.currency)}
                </Text>
              }
            />
          ) : (
            <Text size="sm" c="dimmed">
              {getLocalizedText(
                "Wird den vollen verfügbaren Betrag auszahlen:",
                "Will payout full available amount:"
              )}{" "}
              {formatMoney(availablePayout, project.currency)}
            </Text>
          )}

          <Button
            onClick={handleProjectSalaryPayout}
            disabled={
              useCustomAmount
                ? payoutAmount <= 0 || payoutAmount > availablePayout
                : false
            }
            fullWidth
            color="teal"
            leftSection={<IconBrandCashapp size={16} />}
          >
            {`Payout ${useCustomAmount ? formatMoney(payoutAmount, project.currency) : formatMoney(availablePayout, project.currency)}`}
          </Button>
        </>
      ) : (
        <Alert icon={<IconAlertCircle size={16} />} color="blue">
          {getLocalizedText(
            "Kein Auszahlungsbetrag verfügbar - Projektgehalt bereits vollständig ausgezahlt",
            "No payout available - project salary already fully paid"
          )}
        </Alert>
      )}
    </Stack>
  );
}
