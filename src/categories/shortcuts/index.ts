import { ScriptCategory } from "../../types/index.js";
import { readScriptFile, scriptFrom, getDirname } from "../../utils/fileUtils.js";
import path from "path";

// Define the base path for scripts using ES modules approach
const SCRIPTS_DIR = path.join(getDirname(import.meta.url), "scripts");

/**
 * Shortcuts-related scripts.
 * * run_shortcut: Run a shortcut with optional input
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
      script: (args: any) => scriptFrom(path.join(SCRIPTS_DIR, "run_shortcut.applescript"))(args),
    },
  ],
};