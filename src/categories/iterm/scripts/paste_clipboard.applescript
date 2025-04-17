tell application "System Events" to keystroke "c" using {command down}
        delay 0.1
        tell application "iTerm"
          set w to current window
          tell w's current session to write text (the clipboard)
          activate
        end tell
      `,
    },
    {
      name: "run",
      description: "Run a command in iTerm",
      schema: {
        type: "object",
        properties: {
          command: {
            type: "string",
            description: "Command to run in iTerm",
          },
          newWindow: {
            type: "boolean",
            description: "Whether to open in a new window (default: false)",
            default: false,
          },
        },
        required: ["command"],
      },
      script: (args) => `
        tell application "iTerm"
          ${
            args.newWindow
              ? `
            set newWindow to (create window with default profile)
            tell current session of newWindow
          `
              : `
            set w to current window
            tell w's current session
          `
          }
            write text "${args.command}"
            activate
          end tell
        end tell