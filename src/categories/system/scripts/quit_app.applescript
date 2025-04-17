try
  tell application "${args.name}"
    ${args.force ? "quit saving no" : "quit"}
  end tell
  return "Application ${args.name} quit successfully"
on error errMsg
  return "Failed to quit application: " & errMsg
end try