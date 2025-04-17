on run
  -- Get the recipient and message body
  set recipient to "${args.recipient}"
  set messageBody to "${args.body || ''}"
  set autoSend to ${args.auto === true ? "true" : "false"}
  
  if autoSend then
    -- Automatically send the message using AppleScript
    tell application "Messages"
      -- Get the service (iMessage or SMS)
      set targetService to 1st service whose service type = iMessage
      
      -- Send the message
      set targetBuddy to buddy "${args.recipient}" of targetService
      send "${args.body || ''}" to targetBuddy
      
      return "Message sent to " & "${args.recipient}"
    end tell
  else
    -- Just open Messages app with pre-filled content
    -- Create the SMS URL with proper URL encoding
    set smsURL to "sms:" & recipient
    
    if messageBody is not equal to "" then
      -- Use percent encoding for spaces instead of plus signs
      set encodedBody to ""
      repeat with i from 1 to count of characters of messageBody
        set c to character i of messageBody
        if c is space then
          set encodedBody to encodedBody & "%20"
        else
          set encodedBody to encodedBody & c
        end if
      end repeat
      
      set smsURL to smsURL & "&body=" & encodedBody
    end if
    
    -- Open the URL with the default handler (Messages app)
    do shell script "open " & quoted form of smsURL
    
    return "Opening Messages app with recipient: " & recipient
  end if
end run