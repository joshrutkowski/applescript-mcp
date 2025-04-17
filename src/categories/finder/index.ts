import { ScriptCategory } from "../../types/index.js";
import { readScriptFile, scriptFrom, getDirname } from "../../utils/fileUtils.js";
import path from "path";

// Define the base path for scripts using ES modules approach
const SCRIPTS_DIR = path.join(getDirname(import.meta.url), "scripts");

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
      script: readScriptFile(path.join(SCRIPTS_DIR, "get_selected_files.applescript")),
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
      script: (args: any) => scriptFrom(path.join(SCRIPTS_DIR, "search_files.applescript"))(args),
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
      script: (args: any) => scriptFrom(path.join(SCRIPTS_DIR, "quick_look_file.applescript"))(args),
    },
  ],
};