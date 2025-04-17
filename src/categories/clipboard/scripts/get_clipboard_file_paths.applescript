tell application "System Events"
  try
    set theClipboard to the clipboard
    if theClipboard starts with "file://" then
      set AppleScript's text item delimiters to linefeed
      set filePaths to {}
      repeat with aPath in paragraphs of (the clipboard as string)
        if aPath starts with "file://" then
          set end of filePaths to (POSIX path of (aPath as alias))
        end if
      end repeat
      return filePaths as string
    else
      return "No file paths in clipboard"
    end if
  on error errMsg
    return "Failed to get clipboard: " & errMsg
  end try
end tell