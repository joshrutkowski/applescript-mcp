import { ScriptCategory } from "../../types/index.js";
import { readScriptFile, scriptFrom, getDirname } from "../../utils/fileUtils.js";
import path from "path";

// Define the base path for scripts using ES modules approach
const SCRIPTS_DIR = path.join(getDirname(import.meta.url), "scripts");

/**
 * Pages-related scripts.
 * * create_document: Create a new Pages document with plain text content
 */
export const pagesCategory: ScriptCategory = {
  name: "pages",
  description: "Pages document operations",
  scripts: [
    {
      name: "create_document",
      description: "Create a new Pages document with plain text content (no formatting)",
      schema: {
        type: "object",
        properties: {
          content: {
            type: "string",
            description: "The plain text content to add to the document (no formatting)"
          }
        },
        required: ["content"]
      },
      script: (args: any) => scriptFrom(path.join(SCRIPTS_DIR, "create_document.applescript"))(args),
    }
  ]
};