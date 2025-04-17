# applescript-mcp MCP Server

A Model Context Protocol server that enables LLM applications to interact with macOS through AppleScript.
This server provides a standardized interface for AI applications to control system functions, manage files, handle notifications, and more.

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

### Planned Features

- 🧭 Safari (open in Safari, save page content, get selected page/tab)
- ✅ Reminders (create, get)
- 🗒️ Notes (create, get, list)

## Prerequisites

- macOS 10.15 or later
- Node.js 18 or later

## Available Categories

### Calendar

| Command | Description           | Parameters                      |
| ------- | --------------------- | ------------------------------- |
| `add`   | Create calendar event | `title`, `startDate`, `endDate` |
| `list`  | List today's events   | None                            |

### Clipboard

| Command           | Description            | Parameters |
| ----------------- | ---------------------- | ---------- |
| `set_clipboard`   | Copy to clipboard      | `content`  |
| `get_clipboard`   | Get clipboard contents | None       |
| `clear_clipboard` | Clear clipboard        | None       |

### Finder

| Command              | Description        | Parameters                     |
| -------------------- | ------------------ | ------------------------------ |
| `get_selected_files` | Get selected files | None                           |
| `search_files`       | Search for files   | `query`, `location` (optional) |
| `quick_look`         | Preview file       | `path`                         |

### Notifications

| Command                 | Description       | Parameters                             |
| ----------------------- | ----------------- | -------------------------------------- |
| `send_notification`     | Show notification | `title`, `message`, `sound` (optional) |
| `toggle_do_not_disturb` | Toggle DND mode   | None                                   |

### System

| Command             | Description       | Parameters                 |
| ------------------- | ----------------- | -------------------------- |
| `volume`            | Set system volume | `level` (0-100)            |
| `get_frontmost_app` | Get active app    | None                       |
| `launch_app`        | Open application  | `name`                     |
| `quit_app`          | Close application | `name`, `force` (optional) |
| `toggle_dark_mode`  | Toggle dark mode  | None                       |

### iTerm

| Command           | Description     | Parameters                        |
| ----------------- | --------------- | --------------------------------- |
| `paste_clipboard` | Paste to iTerm  | None                              |
| `run`             | Execute command | `command`, `newWindow` (optional) |

### Shortcuts

| Command        | Description    | Parameters                 |
| -------------- | -------------- | -------------------------- |
| `run_shortcut` | Run a shortcut | `name`, `input` (optional) |

### Mail

| Command       | Description                      | Parameters                                                |
| ------------- | -------------------------------- | --------------------------------------------------------- |
| `create_email`| Create a new email in Mail.app   | `recipient`, `subject`, `body`                            |
| `list_emails` | List emails from a mailbox       | `mailbox` (optional), `count` (optional), `unreadOnly` (optional) |
| `get_email`   | Get a specific email by search   | `subject` (optional), `sender` (optional), `dateReceived` (optional), `mailbox` (optional), `account` (optional), `unreadOnly` (optional), `includeBody` (optional) |

### Messages

| Command           | Description                                  | Parameters                                                |
| ----------------- | -------------------------------------------- | --------------------------------------------------------- |
| `list_chats`      | List available iMessage and SMS chats        | `includeParticipantDetails` (optional)                    |
| `get_messages`    | Get messages from the Messages app           | `limit` (optional, default: 100)                          |
| `search_messages` | Search for messages containing specific text | `searchText`, `sender` (optional), `chatId` (optional), `limit` (optional, default: 50), `daysBack` (optional, default: 30) |
| `compose_message` | Open Messages app with pre-filled message or auto-send   | `recipient` (required), `body` (optional), `auto` (optional, default: false) |

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

- **Permission Errors**: Check System Preferences > Security & Privacy
- **Script Failures**: Test scripts directly in Script Editor.app
- **Communication Issues**: Check stdio streams aren't being redirected

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
