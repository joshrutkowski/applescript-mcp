try
  set the clipboard to ""
  return "Clipboard cleared successfully"
on error errMsg
  return "Failed to clear clipboard: " & errMsg
end try