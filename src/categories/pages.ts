import { ScriptCategory } from "../types/index.js";
import { escapeAppleScriptString as esc } from "../utils/escape.js";

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
      script: (args) => `
        try
          tell application "Pages"
            -- Create new document
            set newDoc to make new document
            
            set the body text of newDoc to "${esc(args.content)}"
            activate
            return "Document created successfully with plain text content"
          end tell
        on error errMsg
          return "Failed to create document: " & errMsg
        end try
      `
    }
  ]
};
