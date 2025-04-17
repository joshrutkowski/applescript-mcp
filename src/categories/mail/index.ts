import { ScriptCategory } from "../../types/index.js";
import { readScriptFile, scriptFrom, getDirname } from "../../utils/fileUtils.js";
import path from "path";

// Define the base path for scripts using ES modules approach
const SCRIPTS_DIR = path.join(getDirname(import.meta.url), "scripts");

/**
 * Mail-related scripts.
 * * create_email: Create a new email in Mail.app with specified recipient, subject, and body
 * * list_emails: List emails from a specified mailbox in Mail.app
 * * get_email: Get a specific email by ID or search criteria from Mail.app
 */
export const mailCategory: ScriptCategory = {
  name: "mail",
  description: "Mail operations",
  scripts: [
    {
      name: "create_email",
      description: "Create a new email in Mail.app",
      schema: {
        type: "object",
        properties: {
          recipient: {
            type: "string",
            description: "Email recipient",
          },
          subject: {
            type: "string",
            description: "Email subject",
          },
          body: {
            type: "string",
            description: "Email body",
          },
        },
        required: ["recipient", "subject", "body"],
      },
      script: (args: any) => scriptFrom(path.join(SCRIPTS_DIR, "create_email.applescript"))(args),
    },
    {
      name: "list_emails",
      description: "List emails from a specified mailbox in Mail.app",
      schema: {
        type: "object",
        properties: {
          mailbox: {
            type: "string",
            description: "Name of the mailbox to list emails from (e.g., 'Inbox', 'Sent')",
            default: "Inbox"
          },
          account: {
            type: "string",
            description: "Name of the account to search in (e.g., 'iCloud', 'Gmail', 'Exchange'). If not specified, searches all accounts with preference for iCloud.",
            default: "iCloud"
          },
          count: {
            type: "number",
            description: "Maximum number of emails to retrieve",
            default: 10
          },
          unreadOnly: {
            type: "boolean",
            description: "Only show unread emails if true"
          }
        }
      },
      script: (args: any) => scriptFrom(path.join(SCRIPTS_DIR, "list_emails.applescript"))(args),
    },
    {
      name: "get_email",
      description: "Get a specific email by search criteria from Mail.app",
      schema: {
        type: "object",
        properties: {
          mailbox: {
            type: "string",
            description: "Name of the mailbox to search in (e.g., 'Inbox', 'Sent')",
            default: "Inbox"
          },
          account: {
            type: "string",
            description: "Name of the account to search in (e.g., 'iCloud', 'Gmail', 'Exchange'). If not specified, searches all accounts with preference for iCloud.",
            default: "iCloud"
          },
          subject: {
            type: "string",
            description: "Subject text to search for (partial match)"
          },
          sender: {
            type: "string",
            description: "Sender email or name to search for (partial match)"
          },
          dateReceived: {
            type: "string",
            description: "Date received to search for (format: YYYY-MM-DD)"
          },
          unreadOnly: {
            type: "boolean",
            description: "Only search unread emails if true"
          },
          includeBody: {
            type: "boolean",
            description: "Include email body in the result if true",
            default: false
          }
        },
        required: []
      },
      script: (args: any) => scriptFrom(path.join(SCRIPTS_DIR, "get_email.applescript"))(args),
    },
  ],
};