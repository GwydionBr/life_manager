import { Stack, Text, List, Group } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle } from "@tabler/icons-react";
import { formatTimeSpan } from "@/utils/intl";
import { Tables, TablesInsert } from "@/types/db.types";
import { Locale } from "@/types/settings.types";

interface SessionNotificationProps {
  completeOverlap: boolean;
  originalSession?: TablesInsert<"work_time_entry">;
  createdSessions: Tables<"work_time_entry">[] | null;
  overlappingSessions: Tables<"work_time_entry">[] | null;
  onCompleteOverlap?: () => void;
  onCreatedSessions?: () => void;
  onError?: () => void;
  locale: Locale;
  format24h: boolean;
}

export default function SessionNotification({
  completeOverlap,
  originalSession,
  createdSessions,
  overlappingSessions,
  onCompleteOverlap,
  onCreatedSessions,
  onError,
  locale,
  format24h,
}: SessionNotificationProps) {
  const isSingleOverlap =
    overlappingSessions && overlappingSessions.length === 1;
  const isSingleCreatedSession =
    createdSessions && createdSessions.length === 1;
  if (completeOverlap) {
    notifications.show({
      title:
        locale === "de-DE" ? "Komplette Überschneidung" : "Complete overlap",
      message:
        locale === "de-DE"
          ? "Timer Sitzung überschneided sich komplett mit bereits bestehenden Sitzungen und wurde daher nicht gespeichert."
          : "Timer session completely overlaps with another session and was not saved.",
      color: "red",
      icon: <IconAlertCircle />,
      autoClose: false,
      withBorder: true,
    });
    onCompleteOverlap?.();
  } else if (createdSessions) {
    if (overlappingSessions) {
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
                ? "Timer Sitzung hat Überschneidungen und wurde angepasst."
                : "Timer session has overlaps and was adjusted."}
            </Text>
            {originalSession && (
              <Group>
                <Text>
                  {locale === "de-DE"
                    ? "Ursprüngliche Sitzung: "
                    : "Original session: "}
                </Text>
                <List>
                  <List.Item key={originalSession.id}>
                    {formatTimeSpan(
                      new Date(originalSession.start_time),
                      new Date(originalSession.end_time),
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
                {overlappingSessions.map((fragment) => (
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
                {isSingleCreatedSession
                  ? locale === "de-DE"
                    ? "Sitzung: "
                    : "Session: "
                  : locale === "de-DE"
                    ? "Sitzungen: "
                    : "Sessions: "}
              </Text>
              <List>
                {createdSessions.map((session) => (
                  <List.Item key={session.id}>
                    {formatTimeSpan(
                      new Date(session.start_time),
                      new Date(session.end_time),
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
    onCreatedSessions?.();
  } else {
    notifications.show({
      title: locale === "de-DE" ? "Fehler" : "Error",
      message:
        locale === "de-DE"
          ? "Fehler beim Speichern der Sitzung. Bitte versuche es erneut."
          : "Error saving session. Please try again.",
      color: "red",
      autoClose: 6000,
      withBorder: true,
    });
    onError?.();
  }
}
