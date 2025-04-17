import { ScriptCategory } from "../../types/index.js";
import { readScriptFile, scriptFrom, getDirname } from "../../utils/fileUtils.js";
import path from "path";

// Define the base path for scripts using ES modules approach
const SCRIPTS_DIR = path.join(getDirname(import.meta.url), "scripts");

/**
 * iTerm-related scripts.
 * * paste_clipboard: Pastes the clipboard to an iTerm window
 * * run: Run a command in iTerm
 */
export const itermCategory: ScriptCategory = {
  name: "iterm",
  description: "iTerm terminal operations",
  scripts: [
    {
      name: "paste_clipboard",
      description: "Paste clipboard content into iTerm",
      script: readScriptFile(path.join(SCRIPTS_DIR, "paste_clipboard.applescript")),
    },
    {
      name: "run",
      description: "Run a command in iTerm",
      schema: {
        type: "object",
        properties: {
          command: {
            type: "string",
            description: "Command to run in iTerm",
          },
          newWindow: {
            type: "boolean",
            description: "Whether to open in a new window (default: false)",
            default: false,
          },
        },
        required: ["command"],
      },
      script: (args: any) => {
        const scriptContent = readScriptFile(path.join(SCRIPTS_DIR, "run.applescript"));
        // Replace placeholders in the script with actual values from args
        let processedScript = scriptContent;
        
        if (args) {
          Object.entries(args).forEach(([key, value]) => {
            // Create a regex that matches ${key} in the script
            const placeholder = new RegExp(`\\$\\{${key}\\}`, 'g');
            
            // Replace all occurrences with the string value
            processedScript = processedScript.replace(
              placeholder, 
              String(value).replace(/'/g, "'\"'\"'") // Escape single quotes for AppleScript
            );
          });
        }
        
        return processedScript;
      },
    },
  ],
};