try
  set filePath to POSIX file "${args.path}"
  tell application "Finder"
    activate
    select filePath
    tell application "System Events"
      -- Press Space to trigger Quick Look
      delay 0.5 -- Small delay to ensure Finder is ready
      key code 49 -- Space key
    end tell
  end tell
  return "Quick Look preview opened for ${args.path}"
on error errMsg
  return "Failed to open Quick Look: " & errMsg
end try