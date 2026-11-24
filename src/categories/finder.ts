// src/categories/finder.ts
import { ScriptCategory } from "../types/index.js";
import { escapeAppleScriptString as esc } from "../utils/escape.js";

/**
 * Finder-related scripts.
 * * get_selected_files: Get currently selected files in Finder
 * * search_files: Search for files by name
 * * quick_look_file: Preview a file using Quick Look
 *
 */
export const finderCategory: ScriptCategory = {
  name: "finder",
  description: "Finder and file operations",
  scripts: [
    {
      name: "get_selected_files",
      description: "Get currently selected files in Finder",
      script: `
        tell application "Finder"
          try
            set selectedItems to selection
            if selectedItems is {} then
              return "No items selected"
            end if

            set itemPaths to ""
            repeat with theItem in selectedItems
              set itemPaths to itemPaths & (POSIX path of (theItem as alias)) & linefeed
            end repeat

            return itemPaths
          on error errMsg
            return "Failed to get selected files: " & errMsg
          end try
        end tell
      `,
    },
    {
      name: "search_files",
      description: "Search for files by name",
      schema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search term",
          },
          location: {
            type: "string",
            description: "Search location (default: home folder)",
            default: "~",
          },
        },
        required: ["query"],
      },
      script: (args) => `
        set searchPath to "/Users/joshrutkowski/Downloads"
        tell application "Finder"
          try
            set theFolder to POSIX file searchPath as alias
            set theFiles to every file of folder theFolder whose name contains "${esc(args.query)}"
            set resultList to ""
            repeat with aFile in theFiles
              set resultList to resultList & (POSIX path of (aFile as alias)) & return
            end repeat
            if resultList is "" then
              return "No files found matching '${esc(args.query)}'"
            end if
            return resultList
          on error errMsg
            return "Failed to search files: " & errMsg
          end try
        end tell
      `,
    },
    {
      name: "quick_look_file",
      description: "Preview a file using Quick Look",
      schema: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "File path to preview",
          },
        },
        required: ["path"],
      },
      script: (args) => `
        try
          set filePath to POSIX file "${esc(args.path)}"
          tell application "Finder"
            activate
            select filePath
            tell application "System Events"
              -- Press Space to trigger Quick Look
              delay 0.5 -- Small delay to ensure Finder is ready
              key code 49 -- Space key
            end tell
          end tell
          return "Quick Look preview opened for ${esc(args.path)}"
        on error errMsg
          return "Failed to open Quick Look: " & errMsg
        end try
      `,
    },
  ],
};
