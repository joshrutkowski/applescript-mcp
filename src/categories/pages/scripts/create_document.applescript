try
  tell application "Pages"
    -- Create new document
    set newDoc to make new document
    
    set the body text of newDoc to "${args.content.replace(/"/g, '\\"')}"
    activate
    return "Document created successfully with plain text content"
  end tell
on error errMsg
  return "Failed to create document: " & errMsg
end try