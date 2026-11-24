// src/categories/notifications.ts
import { ScriptCategory } from "../types/index.js";
import { escapeAppleScriptString as esc } from "../utils/escape.js";

/**
 * Notification-related scripts.
 * * toggle_do_not_disturb: Toggle Do Not Disturb mode. NOTE: Requires keyboard shortcut to be set up in System Preferences.
 * * send_notification: Send a system notification
 */
export const notificationsCategory: ScriptCategory = {
  name: "notifications",
  description: "Notification management",
  scripts: [
    {
      name: "toggle_do_not_disturb",
      description: "Toggle Do Not Disturb mode using keyboard shortcut",
      script: `
        try
          tell application "System Events"
            keystroke "z" using {control down, option down, command down}
          end tell
          return "Toggled Do Not Disturb mode"
        on error errMsg
          return "Failed to toggle Do Not Disturb: " & errMsg
        end try
      `,
    },
    {
      name: "send_notification",
      description: "Send a system notification",
      schema: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Notification title",
          },
          message: {
            type: "string",
            description: "Notification message",
          },
          sound: {
            type: "boolean",
            description: "Play sound with notification",
            default: true,
          },
        },
        required: ["title", "message"],
      },
      script: (args) => `
        display notification "${esc(args.message)}" with title "${esc(args.title)}" ${args.sound ? 'sound name "default"' : ""}
      `,
    },
  ],
};
