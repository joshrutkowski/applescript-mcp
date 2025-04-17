tell application "Messages"
  set chatList to {}
  repeat with aChat in chats
    set chatName to name of aChat
    if chatName is missing value then
      set chatName to ""
      -- Try to get the contact name for individual chats
      try
        set theParticipants to participants of aChat
        if (count of theParticipants) is 1 then
          set theParticipant to item 1 of theParticipants
          set chatName to name of theParticipant
        end if
      end try
    end if
    
    set chatInfo to {id:id of aChat, name:chatName, isGroupChat:(id of aChat contains "+")}
    
    ${args.includeParticipantDetails ? `
    -- Add participant details if requested
    set participantList to {}
    repeat with aParticipant in participants of aChat
      set participantInfo to {id:id of aParticipant, handle:handle of aParticipant}
      try
        set participantInfo to participantInfo & {name:name of aParticipant}
      end try
      copy participantInfo to end of participantList
    end repeat
    set chatInfo to chatInfo & {participant:participantList}
    ` : ''}
    
    copy chatInfo to end of chatList
  end repeat
  return chatList
end tell