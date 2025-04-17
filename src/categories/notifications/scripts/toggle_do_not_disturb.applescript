try
  tell application "System Events"
    keystroke "z" using {control down, option down, command down}
  end tell
  return "Toggled Do Not Disturb mode"
on error errMsg
  return "Failed to toggle Do Not Disturb: " & errMsg
end try