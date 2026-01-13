import { useCallback, useRef, useEffect } from "react";
import { useProfile } from "@/db/collections/profile/use-profile-query";
import { useWorkTimeEntries } from "@/db/collections/work/work-time-entry/use-work-time-entry-query";

import {
  showActionSuccessNotification,
  showActionErrorNotification,
  showOverlapNotification,
  showCompleteOverlapNotification,
} from "@/lib/notificationFunctions";
import { useIntl } from "@/hooks/useIntl";
import {
  addWorkTimeEntry,
  updateWorkTimeEntry,
  deleteWorkTimeEntry,
} from "./work-time-entry-mutations";
import {
  InsertWorkTimeEntry,
  UpdateWorkTimeEntry,
  WorkTimeEntry,
} from "@/types/work.types";
import { TimerRoundingSettings } from "@/types/timeTracker.types";
import { getTimeFragmentSession } from "@/lib/helper/getTimeFragmentSession";
import { resolveTimeEntryOverlaps } from "@/lib/helper/resolveTimeEntryOverlaps";

import { createTransaction } from "@tanstack/react-db";
import { PowerSyncTransactor } from "@tanstack/powersync-db-collection";
import { db } from "@/db/powersync/db";

/**
 * Hook for Work Time Entry operations with automatic notifications.
 *
 * This hook provides a user-friendly API for CRUD operations
 * on Work Time Entries with integrated error handling and notifications.
 *
 * @returns Object with mutation functions
 */
export const useWorkTimeEntryMutations = () => {
  const { data: profile } = useProfile();
  const { data: workTimeEntries } = useWorkTimeEntries();
  const { getLocalizedText } = useIntl();

  // Create a transaction that won't auto-commit
  const customTransaction = () =>
    createTransaction({
      autoCommit: false,
      mutationFn: async ({ transaction }) => {
        // Use PowerSyncTransactor to apply the transaction to PowerSync
        await new PowerSyncTransactor({ database: db }).applyTransaction(
          transaction
        );
      },
    });

  // Use a ref to always have the latest workTimeEntries for overlap detection
  const workTimeEntriesRef = useRef(workTimeEntries);

  useEffect(() => {
    workTimeEntriesRef.current = workTimeEntries;
  }, [workTimeEntries]);

  /**
   * Adds a new Work Time Entry with automatic notification.
   */
  const handleAddWorkTimeEntry = useCallback(
    async (
      newWorkTimeEntry: InsertWorkTimeEntry,
      roundingSettings: TimerRoundingSettings,
      showNotification: boolean = false
    ) => {
      if (!profile?.id) {
        console.error("No profile found");
        if (showNotification) {
          showActionErrorNotification(
            getLocalizedText(
              "Kein Benutzerprofil gefunden",
              "No user profile found"
            )
          );
        }
        return;
      }

      try {
        const newTimeEntry: WorkTimeEntry = {
          ...newWorkTimeEntry,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          user_id: profile.id,
          currency: newWorkTimeEntry.currency ?? "USD",
          hourly_payment: newWorkTimeEntry.hourly_payment ?? false,
          memo: newWorkTimeEntry.memo ?? null,
          true_end_time: new Date(newWorkTimeEntry.end_time).toISOString(),
          start_time: new Date(newWorkTimeEntry.start_time).toISOString(),
          end_time: new Date(newWorkTimeEntry.end_time).toISOString(),
          paid: newWorkTimeEntry.paid ?? false,
          paused_seconds: newWorkTimeEntry.paused_seconds ?? 0,
          payout_id: newWorkTimeEntry.payout_id ?? null,
          work_project_id: newWorkTimeEntry.work_project_id ?? "",
          real_start_time: new Date(newWorkTimeEntry.start_time).toISOString(),
          single_cashflow_id: null,
          time_fragments_interval:
            newWorkTimeEntry.time_fragments_interval ?? null,
        };
        let updatedTimeEntry = newTimeEntry;
        if (roundingSettings.roundInTimeFragments) {
          updatedTimeEntry = getTimeFragmentSession(
            roundingSettings.timeFragmentInterval,
            newTimeEntry
          ) as WorkTimeEntry;
        }

        // Use the ref to get the latest data, even if the hook hasn't updated yet
        const currentTimeEntries = workTimeEntriesRef.current ?? [];
        const { adjustedTimeEntries, overlappingTimeEntries } =
          resolveTimeEntryOverlaps(
            currentTimeEntries.filter(
              (entry) =>
                entry.work_project_id === newWorkTimeEntry.work_project_id
            ),
            updatedTimeEntry
          );

        if (!adjustedTimeEntries) {
          showCompleteOverlapNotification();
          return;
        }

        const result = await addWorkTimeEntry(adjustedTimeEntries);

        if (!result) {
          if (showNotification) {
            showActionErrorNotification(
              getLocalizedText(
                "Fehler beim Erstellen der Arbeitszeit",
                "Error creating work time"
              )
            );
          }
          return;
        } else if (overlappingTimeEntries.length > 0) {
          showOverlapNotification(
            updatedTimeEntry,
            overlappingTimeEntries,
            adjustedTimeEntries
          );
        } else {
          if (showNotification) {
            showActionSuccessNotification(
              getLocalizedText(
                "Arbeitszeit erfolgreich erstellt",
                "Work time successfully created"
              )
            );
          }
        }

        return result;
      } catch (error) {
        console.error(error);
        if (showNotification) {
          showActionErrorNotification(
            getLocalizedText(
              `Fehler: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
              `Error: ${error instanceof Error ? error.message : "Unknown error"}`
            )
          );
        }
      }
    },
    [profile?.id, getLocalizedText]
  );

  /**
   * Updates a Work Time Entry with automatic notification.
   */
  const handleUpdateWorkTimeEntry = useCallback(
    async (
      id: string | string[],
      item: UpdateWorkTimeEntry,
      showNotification: boolean = false
    ) => {
      try {
        const transaction = customTransaction();

        const oldTimeEntry = workTimeEntriesRef.current?.find(
          (entry) => entry.id === id
        );

        if (!oldTimeEntry) {
          if (showNotification) {
            showActionErrorNotification(
              getLocalizedText(
                "Arbeitszeit nicht gefunden",
                "Work time not found"
              )
            );
          }
          return;
        }

        const updatedTimeEntry: WorkTimeEntry = {
          ...oldTimeEntry,
          ...item,
        };

        const currentTimeEntries = workTimeEntriesRef.current ?? [];
        const { adjustedTimeEntries, overlappingTimeEntries } =
          resolveTimeEntryOverlaps(
            currentTimeEntries.filter(
              (entry) =>
                entry.work_project_id === oldTimeEntry.work_project_id &&
                entry.id !== oldTimeEntry.id
            ),
            updatedTimeEntry
          );

        if (!adjustedTimeEntries) {
          showCompleteOverlapNotification();
          return;
        } else if (overlappingTimeEntries.length > 0) {
          if (adjustedTimeEntries.length > 1) {
            transaction.mutate(() => {
              deleteWorkTimeEntry(oldTimeEntry.id);
              addWorkTimeEntry(adjustedTimeEntries);
            });
          } else if (adjustedTimeEntries.length === 1) {
            transaction.mutate(() =>
              updateWorkTimeEntry(id, {
                ...adjustedTimeEntries[0],
                id: oldTimeEntry.id,
              })
            );
          } else {
            if (showNotification) {
              showActionErrorNotification(
                getLocalizedText(
                  "Fehler beim Aktualisieren der Arbeitszeit",
                  "Error updating work time"
                )
              );
            }
            return;
          }
          transaction.commit();
          showOverlapNotification(
            updatedTimeEntry,
            overlappingTimeEntries,
            adjustedTimeEntries
          );
        } else {
          updateWorkTimeEntry(id, item);
          if (showNotification) {
            showActionSuccessNotification(
              getLocalizedText(
                "Arbeitszeit erfolgreich erstellt",
                "Work time successfully created"
              )
            );
          }
        }

        const result = await transaction.isPersisted.promise;

        return result;
      } catch (error) {
        console.error(error);
        if (showNotification) {
          showActionErrorNotification(
            getLocalizedText(
              `Fehler: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
              `Error: ${error instanceof Error ? error.message : "Unknown error"}`
            )
          );
        }
      }
    },
    [getLocalizedText]
  );

  /**
   * Deletes a Work Time Entry with automatic notification.
   */
  const handleDeleteWorkTimeEntry = useCallback(
    async (id: string | string[], showNotification: boolean = false) => {
      try {
        const result = await deleteWorkTimeEntry(id);

        if (!result) {
          if (showNotification) {
            showActionErrorNotification(
              getLocalizedText(
                "Fehler beim Löschen der Arbeitszeit",
                "Error deleting work time"
              )
            );
          }
          return;
        }

        if (showNotification) {
          showActionSuccessNotification(
            getLocalizedText(
              "Arbeitszeit erfolgreich gelöscht",
              "Work time successfully deleted"
            )
          );
        }

        return result;
      } catch (error) {
        console.error(error);
        if (showNotification) {
          showActionErrorNotification(
            getLocalizedText(
              `Fehler: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
              `Error: ${error instanceof Error ? error.message : "Unknown error"}`
            )
          );
        }
      }
    },
    [getLocalizedText]
  );

  return {
    addWorkTimeEntry: handleAddWorkTimeEntry,
    updateWorkTimeEntry: handleUpdateWorkTimeEntry,
    deleteWorkTimeEntry: handleDeleteWorkTimeEntry,
  };
};
