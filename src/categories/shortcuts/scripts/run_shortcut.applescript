try
  tell application "Shortcuts Events"
    ${args.input ? 
      `run shortcut "${args.name}" with input "${args.input}"` :
      `run shortcut "${args.name}"`
    }
  end tell
  return "Shortcut '${args.name}' executed successfully"
on error errMsg
  return "Failed to run shortcut: " & errMsg
end try