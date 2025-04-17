try
  set the clipboard to "${args.content}"
  return "Clipboard content set successfully"
on error errMsg
  return "Failed to set clipboard: " & errMsg
end try