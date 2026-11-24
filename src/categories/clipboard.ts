// src/categories/clipboard.ts
import { ScriptCategory } from "../types/index.js";
import { escapeAppleScriptString as esc } from "../utils/escape.js";

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
      script: (args) => {
        if (args?.type === "file_paths") {
          return `
            tell application "System Events"
              try
                set theClipboard to the clipboard
                if theClipboard starts with "file://" then
                  set AppleScript's text item delimiters to linefeed
                  set filePaths to {}
                  repeat with aPath in paragraphs of (the clipboard as string)
                    if aPath starts with "file://" then
                      set end of filePaths to (POSIX path of (aPath as alias))
                    end if
                  end repeat
                  return filePaths as string
                else
                  return "No file paths in clipboard"
                end if
              on error errMsg
                return "Failed to get clipboard: " & errMsg
              end try
            end tell
          `;
        } else {
          return `
            tell application "System Events"
              try
                return (the clipboard as text)
              on error errMsg
                return "Failed to get clipboard: " & errMsg
              end try
            end tell
          `;
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
      script: (args) => `
        try
          set the clipboard to "${esc(args.content)}"
          return "Clipboard content set successfully"
        on error errMsg
          return "Failed to set clipboard: " & errMsg
        end try
      `,
    },
    {
      name: "clear_clipboard",
      description: "Clear clipboard content",
      script: `
        try
          set the clipboard to ""
          return "Clipboard cleared successfully"
        on error errMsg
          return "Failed to clear clipboard: " & errMsg
        end try
      `,
    },
  ],
};
