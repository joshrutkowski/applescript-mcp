import { ScriptCategory } from "../../types/index.js";
import { readScriptFile, scriptFrom, getDirname } from "../../utils/fileUtils.js";
import path from "path";
import { fileURLToPath } from "url";

// Define the base path for scripts using ES modules approach
const SCRIPTS_DIR = path.join(getDirname(import.meta.url), "scripts");

/**
 * System-related scripts.
 * * volume: Set system volume
 * * get_frontmost_app: Get the name of the frontmost application
 * * launch_app: Launch an application
 * * quit_app: Quit an application
 * * toggle_dark_mode: Toggle system dark mode
 */
export const systemCategory: ScriptCategory = {
  name: "system",
  description: "System control and information",
  scripts: [
    {
      name: "volume",
      description: "Set system volume",
      schema: {
        type: "object",
        properties: {
          level: {
            type: "number",
            minimum: 0,
            maximum: 100,
          },
        },
        required: ["level"],
      },
      script: (args: any) => scriptFrom(path.join(SCRIPTS_DIR, "volume.applescript"))(args),
    },
    {
      name: "get_frontmost_app",
      description: "Get the name of the frontmost application",
      script: readScriptFile(path.join(SCRIPTS_DIR, "get_frontmost_app.applescript")),
    },
    {
      name: "launch_app",
      description: "Launch an application",
      schema: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Application name",
          },
        },
        required: ["name"],
      },
      script: (args: any) => scriptFrom(path.join(SCRIPTS_DIR, "launch_app.applescript"))(args),
    },
    {
      name: "quit_app",
      description: "Quit an application",
      schema: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Application name",
          },
          force: {
            type: "boolean",
            description: "Force quit if true",
            default: false,
          },
        },
        required: ["name"],
      },
      script: (args: any) => scriptFrom(path.join(SCRIPTS_DIR, "quit_app.applescript"))(args),
    },
    {
      name: "toggle_dark_mode",
      description: "Toggle system dark mode",
      script: readScriptFile(path.join(SCRIPTS_DIR, "toggle_dark_mode.applescript")),
    },
    {
      name: "get_battery_status",
      description: "Get battery level and charging status",
      script: readScriptFile(path.join(SCRIPTS_DIR, "get_battery_status.applescript")),
    },
  ],
};