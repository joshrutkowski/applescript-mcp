import { ScriptCategory } from "../../types/index.js";
import { readScriptFile, scriptFrom, getDirname } from "../../utils/fileUtils.js";
import path from "path";

// Define the base path for scripts using ES modules approach
const SCRIPTS_DIR = path.join(getDirname(import.meta.url), "scripts");

/**
 * Calendar-related scripts.
 * * add: adds a new event to Calendar
 * * list: List events for today
 */
export const calendarCategory: ScriptCategory = {
  name: "calendar",
  description: "Calendar operations",
  scripts: [
    {
      name: "add",
      description: "Add a new event to Calendar",
      schema: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Event title",
          },
          startDate: {
            type: "string",
            description: "Start date and time (YYYY-MM-DD HH:MM:SS)",
          },
          endDate: {
            type: "string",
            description: "End date and time (YYYY-MM-DD HH:MM:SS)",
          },
          calendar: {
            type: "string",
            description: "Calendar name (optional)",
            default: "Calendar",
          },
        },
        required: ["title", "startDate", "endDate"],
      },
      script: (args: any) => scriptFrom(path.join(SCRIPTS_DIR, "add.applescript"))(args),
    },
    {
      name: "list",
      description: "List all events for today",
      script: readScriptFile(path.join(SCRIPTS_DIR, "list.applescript")),
    },
  ],
};