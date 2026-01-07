import { Stack, Text, List, Group } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle } from "@tabler/icons-react";
import { formatTimeSpan } from "@/utils/intl";
import { Tables, TablesInsert } from "@/types/db.types";
import { Locale } from "@/types/settings.types";

interface TimeEntryNotificationProps {
  completeOverlap: boolean;
  originalTimeEntry?: TablesInsert<"work_time_entry">;
  createdTimeEntries: Tables<"work_time_entry">[] | null;
  overlappingTimeEntries: Tables<"work_time_entry">[] | null;
  onCompleteOverlap?: () => void;
  onCreatedTimeEntries?: () => void;
  onError?: () => void;
  locale: Locale;
  format24h: boolean;
}

export default function TimeEntryNotification({
  completeOverlap,
  originalTimeEntry,
  createdTimeEntries,
  overlappingTimeEntries,
  onCompleteOverlap,
  onCreatedTimeEntries,
  onError,
  locale,
  format24h,
}: TimeEntryNotificationProps) {
  const isSingleOverlap =
    overlappingTimeEntries && overlappingTimeEntries.length === 1;
  const isSingleCreatedTimeEntry =
    createdTimeEntries && createdTimeEntries.length === 1;
  if (completeOverlap) {
    notifications.show({
      title:
        locale === "de-DE" ? "Komplette Überschneidung" : "Complete overlap",
      message:
        locale === "de-DE"
          ? "Timer Zeit-Eintrag überschneided sich komplett mit bereits bestehenden Zeit-Einträgen und wurde daher nicht gespeichert."
          : "Timer time entry completely overlaps with another time entry and was not saved.",
      color: "red",
      icon: <IconAlertCircle />,
      autoClose: false,
      withBorder: true,
    });
    onCompleteOverlap?.();
  } else if (createdTimeEntries) {
    if (overlappingTimeEntries) {
      notifications.show({
        style: {
          maxHeight: "600px",
        },
        title:
          locale === "de-DE" ? "Überschneidung Erkannnt" : "Overlap detected",
        message: (
          <Stack>
            <Text>
              {locale === "de-DE"
                ? "Timer Zeit-Eintrag hat Überschneidungen und wurde angepasst."
                : "Timer time entry has overlaps and was adjusted."}
            </Text>
            {originalTimeEntry && (
              <Group>
                <Text>
                  {locale === "de-DE"
                    ? "Ursprüngliche Zeit-Eintrag: "
                    : "Original time entry: "}
                </Text>
                <List>
                  <List.Item key={originalTimeEntry.id}>
                    {formatTimeSpan(
                      new Date(originalTimeEntry.start_time),
                      new Date(originalTimeEntry.end_time),
                      locale,
                      format24h
                    )}
                  </List.Item>
                </List>
              </Group>
            )}
            <Group>
              <Text>
                {isSingleOverlap
                  ? locale === "de-DE"
                    ? "Überschneidung: "
                    : "Overlap: "
                  : locale === "de-DE"
                    ? "Überschneidungen: "
                    : "Overlaps: "}
              </Text>
              <List>
                {overlappingTimeEntries.map((fragment) => (
                  <List.Item key={fragment.id}>
                    {formatTimeSpan(
                      new Date(fragment.start_time),
                      new Date(fragment.end_time),
                      locale,
                      format24h
                    )}
                  </List.Item>
                ))}
              </List>
            </Group>
            <Group>
              <Text>
                Erstellte{" "}
                {isSingleCreatedTimeEntry
                  ? locale === "de-DE"
                    ? "Zeit-Eintrag: "
                    : "Time entry: "
                  : locale === "de-DE"
                    ? "Zeit-Einträge: "
                    : "Time entries: "}
              </Text>
              <List>
                {createdTimeEntries.map((timeEntry) => (
                  <List.Item key={timeEntry.id}>
                    {formatTimeSpan(
                      new Date(timeEntry.start_time),
                      new Date(timeEntry.end_time),
                      locale,
                      format24h
                    )}
                  </List.Item>
                ))}
              </List>
            </Group>
          </Stack>
        ),
        color: "yellow",
        autoClose: false,
        withBorder: true,
      });
    }
    onCreatedTimeEntries?.();
  } else {
    notifications.show({
      title: locale === "de-DE" ? "Fehler" : "Error",
      message:
        locale === "de-DE"
          ? "Fehler beim Speichern des Zeit-Eintrags. Bitte versuche es erneut."
          : "Error saving time entry. Please try again.",
      color: "red",
      autoClose: 6000,
      withBorder: true,
    });
    onError?.();
  }
}
