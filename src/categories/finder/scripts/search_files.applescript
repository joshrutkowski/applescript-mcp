set searchPath to "/Users/joshrutkowski/Downloads"
tell application "Finder"
  try
    set theFolder to POSIX file searchPath as alias
    set theFiles to every file of folder theFolder whose name contains "${args.query}"
    set resultList to ""
    repeat with aFile in theFiles
      set resultList to resultList & (POSIX path of (aFile as alias)) & return
    end repeat
    if resultList is "" then
      return "No files found matching '${args.query}'"
    end if
    return resultList
  on error errMsg
    return "Failed to search files: " & errMsg
  end try
end tell