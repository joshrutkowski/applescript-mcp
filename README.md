[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/joshrutkowski-applescript-mcp-badge.png)](https://mseep.ai/app/joshrutkowski-applescript-mcp)

# applescript-mcp MCP Server

A Model Context Protocol server that enables LLM applications to interact with macOS through AppleScript.
This server provides a standardized interface for AI applications to control system functions, manage files, handle notifications, and more.

[![Node.js CI](https://github.com/joshrutkowski/applescript-mcp/actions/workflows/node.js.yml/badge.svg)](https://github.com/joshrutkowski/applescript-mcp/actions/workflows/node.js.yml)

<a href="https://glama.ai/mcp/servers/0t5gydjcqw"><img width="380" height="200" src="https://glama.ai/mcp/servers/0t5gydjcqw/badge" alt="applescript-mcp MCP server" /></a>

## Features

- 🗓️ Calendar management (events, reminders)
- 📋 Clipboard operations
- 🔍 Finder integration
- 🔔 System notifications
- ⚙️ System controls (volume, dark mode, apps)
- 📟 iTerm terminal integration
- 📬 Mail (create new email, list emails, get email)
- 🔄 Shortcuts automation
- 💬 Messages (list chats, get messages, search messages, send a message)
- 🗒️ Notes (create formatted notes, list notes, search notes)
- 📄 Pages (create documents)

### Planned Features

- 🧭 Safari (open in Safari, save page content, get selected page/tab)
- ✅ Reminders (create, get)

## Prerequisites

- macOS 10.15 or later
- Node.js 18 or later

## Available Categories

### Calendar

| Command | Description           | Parameters                                          |
| ------- | --------------------- | --------------------------------------------------- |
| `add`   | Create calendar event | `title`, `startDate`, `endDate`, `calendar` (optional) |
| `list`  | List today's events   | None                                                |

#### Examples

```
// Create a new calendar event
Create a calendar event titled "Team Meeting" starting tomorrow at 2pm for 1 hour

// List today's events
What events do I have scheduled for today?
```

### Clipboard

| Command           | Description            | Parameters |
| ----------------- | ---------------------- | ---------- |
| `set_clipboard`   | Copy to clipboard      | `content`  |
| `get_clipboard`   | Get clipboard contents | None       |
| `clear_clipboard` | Clear clipboard        | None       |

#### Examples

```
// Copy text to clipboard
Copy "Remember to buy groceries" to my clipboard

// Get clipboard contents
What's currently in my clipboard?

// Clear clipboard
Clear my clipboard
```

### Finder

| Command              | Description        | Parameters                     |
| -------------------- | ------------------ | ------------------------------ |
| `get_selected_files` | Get selected files | None                           |
| `search_files`       | Search for files   | `query`, `location` (optional) |
| `quick_look`         | Preview file       | `path`                         |

#### Examples

```
// Get selected files in Finder
What files do I currently have selected in Finder?

// Search for files
Find all PDF files in my Documents folder

// Preview a file
Show me a preview of ~/Documents/report.pdf
```

### Notifications

> Note: Sending notification requires that you enable notifications in System Settings > Notifications > Script Editor.

| Command                 | Description       | Parameters                             |
| ----------------------- | ----------------- | -------------------------------------- |
| `send_notification`     | Show notification | `title`, `message`, `sound` (optional) |
| `toggle_do_not_disturb` | Toggle DND mode   | None                                   |

#### Examples

```
// Send a notification
Send me a notification with the title "Reminder" and message "Time to take a break"

// Toggle Do Not Disturb
Turn on Do Not Disturb mode
```

### System

| Command             | Description       | Parameters                 |
| ------------------- | ----------------- | -------------------------- |
| `volume`            | Set system volume | `level` (0-100)            |
| `get_frontmost_app` | Get active app    | None                       |
| `launch_app`        | Open application  | `name`                     |
| `quit_app`          | Close application | `name`, `force` (optional) |
| `toggle_dark_mode`  | Toggle dark mode  | None                       |

#### Examples

```
// Set system volume
Set my Mac's volume to 50%

// Get active application
What app am I currently using?

// Launch an application
Open Safari

// Quit an application
Close Spotify

// Toggle dark mode
Switch to dark mode
```

### iTerm

| Command           | Description     | Parameters                        |
| ----------------- | --------------- | --------------------------------- |
| `paste_clipboard` | Paste to iTerm  | None                              |
| `run`             | Execute command | `command`, `newWindow` (optional) |

#### Examples

```
// Paste clipboard to iTerm
Paste my clipboard contents into iTerm

// Run a command in iTerm
Run "ls -la" in iTerm

// Run a command in a new iTerm window
Run "top" in a new iTerm window
```

### Shortcuts

| Command          | Description                                | Parameters                                           |
| ---------------- | ------------------------------------------ | ---------------------------------------------------- |
| `run_shortcut`   | Run a shortcut                             | `name`, `input` (optional)                           |
| `list_shortcuts` | List all available shortcuts               | `limit` (optional)                                   |

#### Examples

```
// List available shortcuts
List all my available shortcuts

// List with limit
Show me my top 5 shortcuts

// Run a shortcut
Run my "Daily Note in Bear" shortcut

// Run a shortcut with input
Run my "Add to-do" shortcut with input "Buy groceries"
```

### Mail

| Command       | Description                      | Parameters                                                |
| ------------- | -------------------------------- | --------------------------------------------------------- |
| `create_email`| Create a new email in Mail.app   | `recipient`, `subject`, `body`                            |
| `list_emails` | List emails from a mailbox       | `mailbox` (optional), `count` (optional), `unreadOnly` (optional) |
| `get_email`   | Get a specific email by search   | `subject` (optional), `sender` (optional), `dateReceived` (optional), `mailbox` (optional), `account` (optional), `unreadOnly` (optional), `includeBody` (optional) |

#### Examples

```
// Create a new email
Compose an email to john@example.com with subject "Meeting Tomorrow" and body "Hi John, Can we meet tomorrow at 2pm?"

// List emails
Show me my 10 most recent unread emails

// Get a specific email
Find the email from sarah@example.com about "Project Update"
```

### Messages

| Command           | Description                                  | Parameters                                                |
| ----------------- | -------------------------------------------- | --------------------------------------------------------- |
| `list_chats`      | List available iMessage and SMS chats        | `includeParticipantDetails` (optional, default: false)    |
| `get_messages`    | Get messages from the Messages app           | `limit` (optional, default: 100)                          |
| `search_messages` | Search for messages containing specific text | `searchText`, `sender` (optional), `chatId` (optional), `limit` (optional, default: 50), `daysBack` (optional, default: 30) |
| `compose_message` | Open Messages app with pre-filled message or auto-send   | `recipient` (required), `body` (optional), `auto` (optional, default: false) |

#### Examples

```
// List available chats
Show me my recent message conversations

// Get recent messages
Show me my last 20 messages

// Search messages
Find messages containing "dinner plans" from John in the last week

// Compose a message
Send a message to 555-123-4567 saying "I'll be there in 10 minutes"
```

### Notes

| Command           | Description                                  | Parameters                                                |
| ----------------- | -------------------------------------------- | --------------------------------------------------------- |
| `create`          | Create a note with markdown-like formatting  | `title`, `content`, `format` (optional with formatting options) |
| `createRawHtml`   | Create a note with direct HTML content       | `title`, `html`                                           |
| `list`            | List notes, optionally from a specific folder| `folder` (optional)                                       |
| `get`             | Get a specific note by title                 | `title`, `folder` (optional)                              |
| `search`          | Search for notes containing specific text    | `query`, `folder` (optional), `limit` (optional, default: 5), `includeBody` (optional, default: true) |

#### Examples

```
// Create a new note with markdown formatting
Create a note titled "Meeting Minutes" with content "# Discussion Points\n- Project timeline\n- Budget review\n- Next steps" and format headings and lists

// Create a note with HTML
Create a note titled "Formatted Report" with HTML content "<h1>Quarterly Report</h1><p>Sales increased by <strong>15%</strong></p>"

// List notes
Show me all my notes in the "Work" folder

// Get a specific note
Show me my note titled "Shopping List"

// Search notes
Find notes containing "recipe" in my "Cooking" folder
```

### Pages

| Command            | Description                                  | Parameters                                                |
| ----------------- | -------------------------------------------- | --------------------------------------------------------- |
| `create_document` | Create a new Pages document with plain text  | `content`                                                 |

#### Examples

```
// Create a new Pages document
Create a Pages document with the content "Project Proposal\n\nThis document outlines the scope and timeline for the upcoming project."
```

## Architecture

The applescript-mcp server is built using TypeScript and follows a modular architecture:

### Core Components

1. **AppleScriptFramework** (`framework.ts`): The main server class that:
   - Manages MCP protocol communication
   - Handles tool registration and execution
   - Provides logging functionality
   - Executes AppleScript commands

2. **Categories** (`src/categories/*.ts`): Modular script collections organized by functionality:
   - Each category contains related scripts (e.g., calendar, system, notes)
   - Categories are registered with the framework in `index.ts`

3. **Types** (`src/types/index.ts`): TypeScript interfaces defining:
   - `ScriptDefinition`: Structure for individual scripts
   - `ScriptCategory`: Collection of related scripts
   - `LogLevel`: Standard logging levels
   - `FrameworkOptions`: Configuration options

### Execution Flow

1. Client sends a tool request via MCP protocol
2. Server identifies the appropriate category and script
3. Script content is generated (static or dynamically via function)
4. AppleScript is executed via macOS `osascript` command
5. Results are returned to the client

### Logging System

The framework includes a comprehensive logging system that:
- Logs to both stderr and MCP logging protocol
- Supports multiple severity levels (debug, info, warning, error, etc.)
- Provides detailed execution information for troubleshooting

## Development

### Setup

```bash
# Install dependencies
npm install

# Build the server
npm run build

# Launch MCP Inspector
# See: https://modelcontextprotocol.io/docs/tools/inspector
npx @modelcontextprotocol/inspector node path/to/server/index.js args...
```

### Adding New Functionality

#### 1. Create Category File

Create `src/categories/newcategory.ts`:

```typescript
import { ScriptCategory } from "../types/index.js";

export const newCategory: ScriptCategory = {
  name: "category_name",
  description: "Category description",
  scripts: [
    // Scripts will go here
  ],
};
```

#### 2. Add Scripts

```typescript
{
  name: "script_name",
  description: "What the script does",
  schema: {
    type: "object",
    properties: {
      paramName: {
        type: "string",
        description: "Parameter description"
      }
    },
    required: ["paramName"]
  },
  script: (args) => `
    tell application "App"
      // AppleScript code using ${args.paramName}
    end tell
  `
}
```

#### 3. Register Category

Update `src/index.ts`:

```typescript
import { newCategory } from "./categories/newcategory.js";
// ...
server.addCategory(newCategory);
```

### Advanced Script Development

For more complex scripts, you can:

1. **Use dynamic script generation**:
   ```typescript
   script: (args) => {
     // Process arguments and build script dynamically
     let scriptContent = `tell application "App"\n`;
     
     if (args.condition) {
       scriptContent += `  // Conditional logic\n`;
     }
     
     scriptContent += `end tell`;
     return scriptContent;
   }
   ```

2. **Process complex data**:
   ```typescript
   // Example from Notes category
   function generateNoteHtml(args: any): string {
     // Process markdown-like syntax into HTML
     let processedContent = content;
     
     if (format.headings) {
       processedContent = processedContent.replace(/^# (.+)$/gm, '<h1>$1</h1>');
       // ...
     }
     
     return processedContent;
   }
   ```

## Debugging

### Using MCP Inspector

The MCP Inspector provides a web interface for testing and debugging your server:

```bash
npm run inspector
```

### Logging

Enable debug logging by setting the environment variable:

```bash
DEBUG=applescript-mcp* npm start
```

### Example configuration
After running `npm run build` add the following to your `mcp.json` file:

```json
{
  "mcpServers": {
    "applescript-mcp-server": {
      "command": "node",
      "args": ["/path/to/applescript-mcp/dist/index.js"]
    }
  }
}
```

### Common Issues

- **Permission Errors**: Check System Preferences > Security & Privacy > Privacy > Automation
- **Script Failures**: Test scripts directly in Script Editor.app before integration
- **Communication Issues**: Check stdio streams aren't being redirected
- **Database Access**: Some features (like Messages) require Full Disk Access permission

## Resources

- [AppleScript Language Guide](https://developer.apple.com/library/archive/documentation/AppleScript/Conceptual/AppleScriptLangGuide/introduction/ASLR_intro.html)
- [MCP Protocol Documentation](https://modelcontextprotocol.io)
- [Issue Tracker](https://github.com/joshrutkowski/applescript-mcp/issues)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details
