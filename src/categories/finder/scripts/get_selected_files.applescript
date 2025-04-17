tell application "Finder"
  try
    set selectedItems to selection
    if selectedItems is {} then
      return "No items selected"
    end if

    set itemPaths to ""
    repeat with theItem in selectedItems
      set itemPaths to itemPaths & (POSIX path of (theItem as alias)) & linefeed
    end repeat

    return itemPaths
  on error errMsg
    return "Failed to get selected files: " & errMsg
  end try
end tell