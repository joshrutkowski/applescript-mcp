try
  tell application "${args.name}"
    activate
  end tell
  return "Application ${args.name} launched successfully"
on error errMsg
  return "Failed to launch application: " & errMsg
end try