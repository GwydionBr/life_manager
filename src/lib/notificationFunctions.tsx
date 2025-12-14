"use client";

import { useSettingsStore } from "@/stores/settingsStore";

import { Group, List, Stack, Text } from "@mantine/core";
import {
  IconAlertTriangleFilled,
  IconCheck,
  IconAlertCircle,
  IconTrash,
  IconX,
} from "@tabler/icons-react";

import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import {
  getLocalizedText as getLocalizedTextUtil,
  formatTimeSpan as formatTimeSpanUtil,
} from "@/utils/intl";

import { InsertWorkTimeEntry, WorkTimeEntry } from "@/types/work.types";
import { Locale } from "@/types/settings.types";

// Helper function to get current locale from store (can be used outside React components)
const getCurrentLocale = (): Locale => {
  return useSettingsStore.getState().locale;
};

// Helper function to get format24h from store (can be used outside React components)
const getFormat24h = (): boolean => {
  return useSettingsStore.getState().format_24h;
};

// Helper function to get localized text (automatically reads locale from store)
const getLocalizedText = (de: string, en: string): string => {
  const locale = getCurrentLocale();
  return getLocalizedTextUtil(de, en, locale);
};

// Helper function to format time span (automatically reads format24h from store)
const formatTimeSpan = (start: Date, end: Date): string => {
  const format24h = getFormat24h();
  const locale = getCurrentLocale();
  return formatTimeSpanUtil(start, end, locale, format24h);
};

export const showDeleteConfirmationModal = (
  title: string,
  message: React.ReactNode,
  onConfirm: () => void,
  loading?: boolean
) => {
  modals.openConfirmModal({
    title: (
      <Group>
        <IconAlertTriangleFilled size={25} color="red" />
        <Text>{title}</Text>
      </Group>
    ),
    children: message,
    confirmProps: {
      color: "red",
      leftSection: <IconTrash size={24} />,
      loading,
    },
    cancelProps: { variant: "outline", leftSection: <IconX size={24} /> },
    labels: {
      confirm: getLocalizedText("Löschen", "Delete"),
      cancel: getLocalizedText("Abbrechen", "Cancel"),
    },
    onConfirm,
  });
};

export const showActionSuccessNotification = (message: string) => {
  notifications.show({
    title: getLocalizedText("Erfolg", "Success"),
    message,
    color: "green",
    autoClose: 3000,
    withBorder: true,
    // position: "top-center",
    icon: <IconCheck />,
  });
};

export const showActionErrorNotification = (message: string) => {
  notifications.show({
    title: getLocalizedText("Fehler", "Error"),
    message,
    color: "red",
    autoClose: 3000,
    withBorder: true,
    // position: "top-center",
    icon: <IconX />,
  });
};

export const showCompleteOverlapNotification = () => {
  notifications.show({
    title: getLocalizedText("Komplette Überschneidung", "Complete overlap"),
    message: getLocalizedText(
      "Timer Sitzung überschneided sich komplett mit bereits bestehenden Sitzungen und wurde daher nicht gespeichert.",
      "Timer session completely overlaps with another session and was not saved."
    ),
    color: "red",
    icon: <IconAlertCircle />,
    autoClose: false,
    withBorder: true,
  });
};

export const showOverlapNotification = (
  originalSession: InsertWorkTimeEntry,
  overlappingSessions: WorkTimeEntry[],
  createdSessions: WorkTimeEntry[]
) => {
  const isSingleOverlap =
    overlappingSessions && overlappingSessions.length === 1;
  const isSingleCreatedSession =
    createdSessions && createdSessions.length === 1;
  notifications.show({
    style: {
      maxHeight: "600px",
    },
    title: getLocalizedText("Überschneidung Erkannnt", "Overlap detected"),
    message: (
      <Stack>
        <Text>
          {getLocalizedText(
            "Timer Sitzung hat Überschneidungen und wurde angepasst.",
            "Timer session has overlaps and was adjusted."
          )}
        </Text>
        {originalSession && (
          <Group>
            <Text>
              {getLocalizedText(
                "Ursprüngliche Sitzung: ",
                "Original session: "
              )}
            </Text>
            <List>
              <List.Item key={originalSession.id}>
                {formatTimeSpan(
                  new Date(originalSession.start_time),
                  new Date(originalSession.end_time)
                )}
              </List.Item>
            </List>
          </Group>
        )}
        <Group>
          <Text>
            {isSingleOverlap
              ? getLocalizedText("Überschneidung: ", "Overlap: ")
              : getLocalizedText("Überschneidungen: ", "Overlaps: ")}
          </Text>
          <List>
            {overlappingSessions.map((fragment) => (
              <List.Item key={fragment.id}>
                {formatTimeSpan(
                  new Date(fragment.start_time),
                  new Date(fragment.end_time)
                )}
              </List.Item>
            ))}
          </List>
        </Group>
        <Group>
          <Text>
            {isSingleCreatedSession
              ? getLocalizedText("Erstellte Sitzung: ", "Created session: ")
              : getLocalizedText("Erstellte Sitzungen: ", "Created sessions: ")}
          </Text>
          <List>
            {createdSessions.map((session) => (
              <List.Item key={session.id}>
                {formatTimeSpan(
                  new Date(session.start_time),
                  new Date(session.end_time)
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
};
