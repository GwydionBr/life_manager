import { type Notification as NotificationData } from "@/types/system.types";
import { type ReactNode } from "react";
import { type NotificationData as MantineNotificationData } from "@mantine/notifications";
import { Appointment, WorkProject } from "@/types/work.types";

/**
 * Configuration for displaying a notification toast
 * Extends Mantine's NotificationData to ensure compatibility
 */
export interface NotificationToastConfig extends Partial<MantineNotificationData> {
  /** Unique identifier for the toast */
  id: string;
  /** Toast title (can be a React node for custom rendering) */
  title: ReactNode;
  /** Toast message/body (can be a React node for custom rendering) */
  message: ReactNode;
  /** Color theme of the toast */
  color: string;
  /** Icon to display in the toast */
  icon: ReactNode;
  /** Auto-close timeout in ms, or false to prevent auto-close */
  autoClose: number | false;
  /** Whether to show a border around the toast */
  withBorder?: boolean;
  /** Whether to show a close button */
  withCloseButton?: boolean;
  /** Position of the toast on screen */
  position?:
    | "top-left"
    | "top-center"
    | "top-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right";
  /** Click handler for the toast */
  onClick?: () => void;
}

/**
 * Configuration for displaying a browser notification
 */
export interface BrowserNotificationConfig {
  /** Notification title */
  title: string;
  /** Notification body text */
  body?: string;
  /** Icon URL */
  icon?: string;
  /** Unique tag to prevent duplicates */
  tag?: string;
  /** Whether the notification requires user interaction to dismiss */
  requireInteraction?: boolean;
  /** Click handler for the browser notification */
  onClick?: () => void;
}

/**
 * Context provided to notification handlers with useful utilities and data
 */
export interface NotificationHandlerContext {
  /** Function to mark a notification as read */
  markAsRead: (notificationId: string) => void;
  /** Function to navigate to a route */
  navigate: (options: { to: string }) => void;
  /** Function to hide a toast notification */
  hideToast: (notificationId: string) => void;
  /** Function to get localized text */
  getLocalizedText: (de: string, en: string) => string;
  /** All current appointments (if available) */
  appointments?: Appointment[];
  /** All current projects (if available) */
  projects?: WorkProject[];
}

/**
 * Interface for a notification handler.
 * Each handler is responsible for a specific resource type or notification type.
 */
export interface NotificationHandler {
  /**
   * Unique identifier for this handler
   */
  id: string;

  /**
   * Resource type this handler is responsible for (e.g., "appointment", "task")
   * If null, this is a default/fallback handler
   */
  resourceType: string | null;

  /**
   * Generate the toast configuration for displaying an in-app notification
   *
   * @param notification - The notification data
   * @param context - Handler context with utilities and data
   * @returns Toast configuration or null if this handler doesn't handle toasts
   */
  getToastConfig: (
    notification: NotificationData,
    context: NotificationHandlerContext
  ) => NotificationToastConfig | null;

  /**
   * Generate the browser notification configuration
   *
   * @param notification - The notification data
   * @param context - Handler context with utilities and data
   * @returns Browser notification configuration or null if browser notifications shouldn't be shown
   */
  getBrowserNotificationConfig: (
    notification: NotificationData,
    context: NotificationHandlerContext
  ) => BrowserNotificationConfig | null;

  /**
   * Handle click on a notification (either toast or browser notification)
   *
   * @param notification - The notification data
   * @param context - Handler context with utilities and data
   */
  handleClick: (
    notification: NotificationData,
    context: NotificationHandlerContext
  ) => void;

  /**
   * Optional: Priority for this handler (higher = more specific, lower = more generic)
   * Used when multiple handlers could handle the same notification
   */
  priority?: number;
}
