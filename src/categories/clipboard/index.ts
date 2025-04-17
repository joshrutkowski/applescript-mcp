import { ScriptCategory } from "../../types/index.js";
import { readScriptFile, scriptFrom, getDirname } from "../../utils/fileUtils.js";
import path from "path";

// Define the base path for scripts using ES modules approach
const SCRIPTS_DIR = path.join(getDirname(import.meta.url), "scripts");

/**
 * Clipboard-related scripts.
 * * get_clipboard: Returns the current clipboard content
 * * set_clipboard: Sets the clipboard to a specified value
 * * clear_clipboard: Resets the clipboard content
 */
export const clipboardCategory: ScriptCategory = {
  name: "clipboard",
  description: "Clipboard management operations",
  scripts: [
    {
      name: "get_clipboard",
      description: "Get current clipboard content",
      schema: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["text", "file_paths"],
            description: "Type of clipboard content to get",
            default: "text",
          },
        },
      },
      script: (args: any) => {
        if (args?.type === "file_paths") {
          return readScriptFile(path.join(SCRIPTS_DIR, "get_clipboard_file_paths.applescript"));
        } else {
          return readScriptFile(path.join(SCRIPTS_DIR, "get_clipboard_text.applescript"));
        }
      },
    },
    {
      name: "set_clipboard",
      description: "Set clipboard content",
      schema: {
        type: "object",
        properties: {
          content: {
            type: "string",
            description: "Content to copy to clipboard",
          },
        },
        required: ["content"],
      },
      script: (args: any) => scriptFrom(path.join(SCRIPTS_DIR, "set_clipboard.applescript"))(args),
    },
    {
      name: "clear_clipboard",
      description: "Clear clipboard content",
      script: readScriptFile(path.join(SCRIPTS_DIR, "clear_clipboard.applescript")),
    },
  ],
};