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