import { useIntl } from "@/hooks/useIntl";
import TimeTrackerRow from "@/components/TimeTracker/TimeTrackerRow/TimeTrackerRow";
import { TextInput, ThemeIcon } from "@mantine/core";
import { IconNotes } from "@tabler/icons-react";

interface TimeTrackerMemoRowProps {
  value: string;
  setMemo: (value: string) => void;
}

export default function TimeTrackerMemoRow({
  value,
  setMemo,
}: TimeTrackerMemoRowProps) {
  const { getLocalizedText } = useIntl();

  return (
    <TimeTrackerRow
      style={{
        border:
          "2px solid light-dark(var(--mantine-color-gray-5), var(--mantine-color-dark-3))",
      }}
      icon={
        <ThemeIcon
          variant="transparent"
          color="var(--mantine-color-orange-6)"
          w="100%"
        >
          <IconNotes size={22} />
        </ThemeIcon>
      }
      children={
        <TextInput
          w="100%"
          value={value}
          onChange={(event) => setMemo(event.target.value)}
          styles={{
            input: {
              border: "none",
              background: "transparent",
              padding: 0,
              fontSize: "var(--mantine-font-size-xs)",
              fontWeight: 400,
              textAlign: "center",
              color: "inherit",
              "&:focus": {
                border: "none",
                background: "transparent",
                outline: "none",
              },
              "&::placeholder": {
                color: "var(--mantine-color-dimmed)",
              },
            },
          }}
          placeholder={getLocalizedText("Memo hinzufügen...", "Add memo...")}
        />
      }
    />
  );
}
