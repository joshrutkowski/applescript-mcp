import { ScriptCategory } from "../../types/index.js";
import { readScriptFile, scriptFrom, getDirname } from "../../utils/fileUtils.js";
import path from "path";

// Define the base path for scripts using ES modules approach
const SCRIPTS_DIR = path.join(getDirname(import.meta.url), "scripts");

/**
 * iMessage related scripts
 */
export const messagesCategory: ScriptCategory = {
  name: "messages",
  description: "iMessage operations",
  scripts: [
    {
      name: "list_chats",
      description: "List available iMessage and SMS chats",
      schema: {
        type: "object",
        properties: {
          includeParticipantDetails: {
            type: "boolean",
            description: "Include detailed participant information",
            default: false
          }
        }
      },
      script: (args: any) => scriptFrom(path.join(SCRIPTS_DIR, "list_chats.applescript"))(args),
    },
    {
      name: "get_messages",
      description: "Get messages from the Messages app",
      schema: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "Maximum number of messages to retrieve",
            default: 100
          }
        }
      },
      script: (args: any) => scriptFrom(path.join(SCRIPTS_DIR, "get_messages.applescript"))(args),
    },
    {
      name: "search_messages",
      description: "Search for messages containing specific text or from a specific sender",
      schema: {
        type: "object",
        properties: {
          searchText: {
            type: "string",
            description: "Text to search for in messages",
            default: ""
          },
          sender: {
            type: "string",
            description: "Search for messages from a specific sender (phone number or email)",
            default: ""
          },
          chatId: {
            type: "string",
            description: "Limit search to a specific chat ID",
            default: ""
          },
          limit: {
            type: "number",
            description: "Maximum number of messages to retrieve",
            default: 50
          },
          daysBack: {
            type: "number",
            description: "Limit search to messages from the last N days",
            default: 30
          }
        },
        required: ["searchText"]
      },
      script: (args: any) => scriptFrom(path.join(SCRIPTS_DIR, "search_messages.applescript"))(args),
    },
    {
      name: "compose_message",
      description: "Open Messages app with a pre-filled message to a recipient or automatically send a message",
      schema: {
        type: "object",
        properties: {
          recipient: {
            type: "string",
            description: "Phone number or email of the recipient"
          },
          body: {
            type: "string",
            description: "Message body text",
            default: ""
          },
          auto: {
            type: "boolean",
            description: "Automatically send the message without user confirmation",
            default: false
          }
        },
        required: ["recipient"]
      },
      script: (args: any) => scriptFrom(path.join(SCRIPTS_DIR, "compose_message.applescript"))(args),
    }
  ]
};