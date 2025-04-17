import { ScriptCategory } from "../../types/index.js";
import { readScriptFile, scriptFrom, getDirname } from "../../utils/fileUtils.js";
import path from "path";

// Define the base path for scripts using ES modules approach
const SCRIPTS_DIR = path.join(getDirname(import.meta.url), "scripts");

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
      script: readScriptFile(path.join(SCRIPTS_DIR, "toggle_do_not_disturb.applescript")),
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
      script: (args: any) => scriptFrom(path.join(SCRIPTS_DIR, "send_notification.applescript"))(args),
    },
  ],
};