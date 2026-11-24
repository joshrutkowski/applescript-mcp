import { ScriptCategory } from "../types/index.js";
import { escapeAppleScriptString as esc, toBoundedInt } from "../utils/escape.js";

/**
 * Shortcuts-related scripts.
 * * run_shortcut: Run a shortcut with optional input
 * * list_shortcuts: List available shortcuts
 */
export const shortcutsCategory: ScriptCategory = {
  name: "shortcuts",
  description: "Shortcuts operations",
  scripts: [
    {
      name: "run_shortcut",
      description: "Run a shortcut with optional input. Uses Shortcuts Events to run in background without opening the app.",
      schema: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Name of the shortcut to run",
          },
          input: {
            type: "string",
            description: "Optional input to provide to the shortcut",
          },
        },
        required: ["name"],
      },
      script: (args) => `
        try
          tell application "Shortcuts Events"
            ${args.input ? 
              `run shortcut "${esc(args.name)}" with input "${esc(args.input)}"` :
              `run shortcut "${esc(args.name)}"`
            }
          end tell
          return "Shortcut '${esc(args.name)}' executed successfully"
        on error errMsg
          return "Failed to run shortcut: " & errMsg
        end try
      `,
    },
    {
      name: "list_shortcuts",
      description: "List all available shortcuts with optional limit",
      schema: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "Optional limit on the number of shortcuts to return",
          },
        },
      },
      script: (args) => `
        try
          tell application "Shortcuts"
            set shortcutNames to name of every shortcut
            
            ${args.limit ? `
            -- Apply limit if specified
            if (count of shortcutNames) > ${toBoundedInt(args.limit, 1, 1, 10000)} then
              set shortcutNames to items 1 through ${toBoundedInt(args.limit, 1, 1, 10000)} of shortcutNames
            end if
            ` : ``}
          end tell
          
          -- Convert to JSON string manually
          set jsonOutput to "{"
          set jsonOutput to jsonOutput & "\\"status\\": \\"success\\","
          set jsonOutput to jsonOutput & "\\"shortcuts\\": ["
          
          repeat with i from 1 to count of shortcutNames
            set currentName to item i of shortcutNames
            set jsonOutput to jsonOutput & "{\\"name\\": \\"" & currentName & "\\"}"
            if i < count of shortcutNames then
              set jsonOutput to jsonOutput & ", "
            end if
          end repeat
          
          set jsonOutput to jsonOutput & "]}"
          return jsonOutput
          
        on error errMsg
          return "{\\"status\\": \\"error\\", \\"message\\": \\"" & errMsg & "\\"}"
        end try
      `,
    },
  ],
};
