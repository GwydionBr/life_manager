# Notification Handler System

This directory contains the notification handler system, which provides a scalable and extensible architecture for handling different types of notifications in the application.

## Architecture Overview

The notification system uses a **handler registry pattern** where:

- Each resource type (e.g., appointments, tasks) can have its own handler
- Handlers are responsible for configuring how notifications are displayed and how interactions are handled
- A default/fallback handler is used for notifications without a specific handler
- The central `useNotificationHandler` hook orchestrates everything

## Key Concepts

### Handler

A handler is a class that implements the `NotificationHandler` interface. It is responsible for:

1. **Toast Configuration**: Defining how in-app toast notifications look and behave
2. **Browser Notification Configuration**: Defining how browser/system notifications appear
3. **Click Handling**: Defining what happens when a user clicks on a notification

### Handler Context

Each handler receives a `NotificationHandlerContext` object that provides:

- Access to common utilities (navigation, marking as read, etc.)
- Access to relevant data (appointments, projects, etc.)
- Localization functions

### Registry

The `notificationHandlerRegistry` is a singleton that manages all handlers:

- Handlers are registered by resource type
- The registry automatically selects the appropriate handler based on the notification's `resource_type`
- Falls back to the default handler if no specific handler is found

## File Structure

```
handlers/
├── types.ts                          # TypeScript interfaces and types
├── registry.ts                       # Handler registry singleton
├── appointmentNotificationHandler.tsx # Handler for appointment notifications
├── defaultNotificationHandler.tsx    # Fallback handler
├── index.ts                          # Barrel exports
└── README.md                         # This file
```

## Creating a New Handler

### Step 1: Create the Handler Class

Create a new file `[resourceType]NotificationHandler.tsx`:

```typescript
import {
  type NotificationHandler,
  type NotificationHandlerContext,
  type NotificationToastConfig,
  type BrowserNotificationConfig,
} from "./types";
import { type Notification as NotificationData } from "@/types/system.types";
import {
  getNotificationColor,
  getNotificationIcon,
} from "@/lib/notificationHelper";

export class TaskNotificationHandler implements NotificationHandler {
  id = "task-handler";
  resourceType = "task"; // Must match the resource_type in the database

  getToastConfig(
    notification: NotificationData,
    context: NotificationHandlerContext
  ): NotificationToastConfig | null {
    // Define how the in-app toast should look
    return {
      id: notification.id,
      title: notification.title || "Task Notification",
      message: notification.body || null,
      color: getNotificationColor(notification.type),
      icon: getNotificationIcon(notification.type),
      autoClose: notification.priority === "high" ? false : 3000,
      withBorder: true,
      withCloseButton: true,
      position: "top-center",
      onClick: () => this.handleClick(notification, context),
    };
  }

  getBrowserNotificationConfig(
    notification: NotificationData,
    context: NotificationHandlerContext
  ): BrowserNotificationConfig | null {
    // Return null if you don't want browser notifications for this type
    if (notification.priority === "low") {
      return null;
    }

    return {
      title: notification.title || "Task Notification",
      body: notification.body || undefined,
      icon: "/favicon-96x96.png",
      tag: notification.id,
      requireInteraction: notification.priority === "high",
    };
  }

  handleClick(
    notification: NotificationData,
    context: NotificationHandlerContext
  ): void {
    // Mark as read
    context.markAsRead(notification.id);

    // Navigate to the appropriate page
    context.navigate({ to: "/tasks" });

    // Hide the toast
    context.hideToast(notification.id);
  }
}

export const createTaskNotificationHandler = (): TaskNotificationHandler => {
  return new TaskNotificationHandler();
};
```

### Step 2: Export the Handler

Add your handler to `index.ts`:

```typescript
export * from "./taskNotificationHandler";
```

### Step 3: Register the Handler

In `useNotificationHandler.tsx`, register your handler in the initialization effect:

```typescript
useEffect(() => {
  if (handlersInitialized.current) return;

  // ... existing handlers ...

  // Register task handler
  notificationHandlerRegistry.register(createTaskNotificationHandler());

  handlersInitialized.current = true;
}, []);
```

### Step 4: Add Icons and Colors (Optional)

If your notification type needs custom icons/colors, update `notificationHelper.tsx`:

```typescript
export const getNotificationIcon = (type: NotificationData["type"]) => {
  switch (type) {
    // ... existing cases ...
    case "task.reminder":
      return <IconCheckbox size={20} />;
    case "task.due":
      return <IconAlertTriangle size={20} />;
    default:
      return <IconBell size={20} />;
  }
};

export const getNotificationColor = (type: NotificationData["type"]) => {
  switch (type) {
    // ... existing cases ...
    case "task.reminder":
      return "green";
    case "task.due":
      return "red";
    default:
      return "blue";
  }
};
```

## Advanced Features

### Custom Actions in Toasts

You can add custom buttons or actions to toasts by including them in the `message` field:

```typescript
message: (
  <>
    <Text size="sm" c="dimmed">{notification.body}</Text>
    <Button
      size="xs"
      onClick={(e) => {
        e.stopPropagation(); // Prevent toast click handler
        handleCustomAction();
      }}
    >
      Custom Action
    </Button>
  </>
)
```

### Dynamic Handler Behavior

Handlers can access data through the context and make decisions based on it:

```typescript
getToastConfig(notification, context) {
  const task = context.tasks?.find(t => t.id === notification.resource_id);

  // Show different UI based on task state
  if (task?.completed) {
    return null; // Don't show notification for completed tasks
  }

  // ... rest of config
}
```

### Dependency Injection

If your handler needs access to specific functions (like `handleStartTimer` in the appointment handler), you can inject them through the constructor:

```typescript
class MyHandler implements NotificationHandler {
  constructor(
    private onCustomAction: (notification: NotificationData) => void
  ) {}

  // ... use this.onCustomAction in your methods
}
```

## Best Practices

1. **Keep handlers focused**: Each handler should only handle one resource type
2. **Use the context**: Don't import stores or hooks directly in handlers - use the context
3. **Null returns are valid**: If a handler decides not to show a notification, returning `null` is fine
4. **Consistent UX**: Try to maintain consistent notification behavior across handlers
5. **Error handling**: Always handle edge cases (missing data, null values, etc.)
6. **Localization**: Use `context.getLocalizedText()` for all user-facing strings

## Testing

When testing notifications:

1. Check that the correct handler is selected for each resource type
2. Verify toast appearance and behavior
3. Test browser notifications (requires permission)
4. Test click handlers and navigation
5. Test with different priority levels

## Migration Guide

If you have existing notification code that doesn't use handlers:

1. Identify the resource type
2. Create a handler for that resource type
3. Move the display logic to `getToastConfig()`
4. Move the browser notification logic to `getBrowserNotificationConfig()`
5. Move the click handling to `handleClick()`
6. Register the handler in `useNotificationHandler`
7. Test thoroughly

## Questions?

If you're unsure about how to implement something, look at `appointmentNotificationHandler.tsx` as a reference - it includes advanced features like custom buttons and external dependencies.
