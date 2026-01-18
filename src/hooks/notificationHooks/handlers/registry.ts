import { type NotificationHandler } from "./types";
import { type Notification as NotificationData } from "@/types/system.types";

/**
 * Registry for notification handlers.
 * Handlers can be registered for specific resource types or as fallbacks.
 */
class NotificationHandlerRegistry {
  private handlers: Map<string, NotificationHandler> = new Map();
  private defaultHandler: NotificationHandler | null = null;

  /**
   * Register a notification handler
   *
   * @param handler - The handler to register
   */
  register(handler: NotificationHandler): void {
    if (handler.resourceType === null) {
      // This is a default/fallback handler
      if (this.defaultHandler) {
        console.warn(
          `Default handler already exists. Replacing with ${handler.id}`
        );
      }
      this.defaultHandler = handler;
    } else {
      // This is a specific resource type handler
      if (this.handlers.has(handler.resourceType)) {
        console.warn(
          `Handler for resource type "${handler.resourceType}" already exists. Replacing with ${handler.id}`
        );
      }
      this.handlers.set(handler.resourceType, handler);
    }
  }

  /**
   * Unregister a notification handler
   *
   * @param handlerId - The ID of the handler to unregister
   */
  unregister(handlerId: string): void {
    // Check if it's the default handler
    if (this.defaultHandler?.id === handlerId) {
      this.defaultHandler = null;
      return;
    }

    // Check resource type handlers
    for (const [resourceType, handler] of this.handlers.entries()) {
      if (handler.id === handlerId) {
        this.handlers.delete(resourceType);
        return;
      }
    }
  }

  /**
   * Get the appropriate handler for a notification
   *
   * @param notification - The notification to get a handler for
   * @returns The handler or null if none found
   */
  getHandler(notification: NotificationData): NotificationHandler | null {
    // First, try to find a handler for the specific resource type
    if (notification.resource_type) {
      const handler = this.handlers.get(notification.resource_type);
      if (handler) {
        return handler;
      }
    }

    // Fall back to default handler
    return this.defaultHandler;
  }

  /**
   * Get all registered handlers
   *
   * @returns Array of all handlers (including default)
   */
  getAllHandlers(): NotificationHandler[] {
    const handlers = Array.from(this.handlers.values());
    if (this.defaultHandler) {
      handlers.push(this.defaultHandler);
    }
    return handlers;
  }

  /**
   * Clear all handlers
   */
  clear(): void {
    this.handlers.clear();
    this.defaultHandler = null;
  }
}

// Export singleton instance
export const notificationHandlerRegistry = new NotificationHandlerRegistry();
