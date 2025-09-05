import { ScriptCategory } from "../types/index.js";

/**
 * System-related scripts.
 * * volume: Set system volume
 * * get_volume: Get current system volume
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
      script: (args) => `set volume ${Math.round((args.level / 100) * 7)}`,
    },
    {
      name: "get_volume",
      description: "Get current system volume level (0-100)",
      script: `
            try
              -- Get the current output volume from system settings (returns 0-100)
              set currentVolume to output volume of (get volume settings)
              return "Current volume level: " & currentVolume & "%"
            on error errMsg
              return "Failed to get volume: " & errMsg
            end try
          `,
    },
    {
      name: "get_frontmost_app",
      description: "Get the name of the frontmost application",
      script:
        'tell application "System Events" to get name of first process whose frontmost is true',
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
      script: (args) => `
            try
              tell application "${args.name}"
                activate
              end tell
              return "Application ${args.name} launched successfully"
            on error errMsg
              return "Failed to launch application: " & errMsg
            end try
          `,
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
      script: (args) => `
            try
              tell application "${args.name}"
                ${args.force ? "quit saving no" : "quit"}
              end tell
              return "Application ${args.name} quit successfully"
            on error errMsg
              return "Failed to quit application: " & errMsg
            end try
          `,
    },
    {
      name: "toggle_dark_mode",
      description: "Toggle system dark mode",
      script: `
            tell application "System Events"
              tell appearance preferences
                set dark mode to not dark mode
                return "Dark mode is now " & (dark mode as text)
              end tell
            end tell
          `,
    },
    {
      name: "get_battery_status",
      description: "Get battery level and charging status",
      script: `
            try
              set powerSource to do shell script "pmset -g batt"
              return powerSource
            on error errMsg
              return "Failed to get battery status: " & errMsg
            end try
          `,
    },
  ],
};
