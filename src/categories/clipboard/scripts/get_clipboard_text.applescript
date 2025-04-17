tell application "System Events"
  try
    return (the clipboard as text)
  on error errMsg
    return "Failed to get clipboard: " & errMsg
  end try
end tell