set recipient to "${args.recipient}"
set subject to "${args.subject}"
set body to "${args.body}"

-- URL encode subject and body
set encodedSubject to my urlEncode(subject)
set encodedBody to my urlEncode(body)

-- Construct the mailto URL
set mailtoURL to "mailto:" & recipient & "?subject=" & encodedSubject & "&body=" & encodedBody

-- Use Apple Mail's 'mailto' command to create the email
tell application "Mail"
  mailto mailtoURL
  activate
end tell

-- Handler to URL-encode text
on urlEncode(theText)
  set theEncodedText to ""
  set theChars to every character of theText
  repeat with aChar in theChars
    set charCode to ASCII number aChar
    if charCode = 32 then
      set theEncodedText to theEncodedText & "%20" -- Space
    else if (charCode ≥ 48 and charCode ≤ 57) or (charCode ≥ 65 and charCode ≤ 90) or (charCode ≥ 97 and charCode ≤ 122) or charCode = 45 or charCode = 46 or charCode = 95 or charCode = 126 then
      -- Allowed characters: A-Z, a-z, 0-9, -, ., _, ~
      set theEncodedText to theEncodedText & aChar
    else
      -- Convert to %HH format
      set hexCode to do shell script "printf '%02X' " & charCode
      set theEncodedText to theEncodedText & "%" & hexCode
    end if
  end repeat
  return theEncodedText
end urlEncode