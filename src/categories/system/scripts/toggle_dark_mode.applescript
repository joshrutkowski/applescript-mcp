tell application "System Events"
  tell appearance preferences
    set dark mode to not dark mode
    return "Dark mode is now " & (dark mode as text)
  end tell
end tell