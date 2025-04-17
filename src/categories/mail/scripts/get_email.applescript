set mailboxName to "${args.mailbox || 'Inbox'}"
set accountName to "${args.account || 'iCloud'}"
set searchSubject to "${args.subject || ''}"
set searchSender to "${args.sender || ''}"
set searchDate to "${args.dateReceived || ''}"
set showUnreadOnly to ${args.unreadOnly ? 'true' : 'false'}
set includeBody to ${args.includeBody ? 'true' : 'false'}
set searchAllAccounts to ${!args.account ? 'true' : 'false'}

tell application "Mail"
  -- Get all messages if no specific mailbox is found
  set foundMailbox to false
  set emailMessages to {}
  set targetAccount to missing value
  
  -- First try to find the specified account
  if not searchAllAccounts then
    try
      set allAccounts to every account
      repeat with acct in allAccounts
        if name of acct is accountName then
          set targetAccount to acct
          exit repeat
        end if
      end repeat
    end try
    
    -- If account not found, set to search all accounts
    if targetAccount is missing value then
      set searchAllAccounts to true
    end if
  end if
  
  -- If specific account is found, search in that account
  if not searchAllAccounts and targetAccount is not missing value then
    try
      set acctMailboxes to every mailbox of targetAccount
      repeat with m in acctMailboxes
        if name of m is mailboxName then
          set targetMailbox to m
          set foundMailbox to true
          
          -- Get messages from the found mailbox
          if showUnreadOnly then
            set emailMessages to (messages of targetMailbox whose read status is false)
          else
            set emailMessages to (messages of targetMailbox)
          end if
          
          exit repeat
        end if
      end repeat
    end try
  else
    -- Search all accounts, with preference for iCloud
    set iCloudAccount to missing value
    set allAccounts to every account
    
    -- First look for iCloud account
    repeat with acct in allAccounts
      if name of acct is "iCloud" then
        set iCloudAccount to acct
        exit repeat
      end if
    end repeat
    
    -- Try to find the mailbox directly
    try
      set allMailboxes to every mailbox
      repeat with m in allMailboxes
        if name of m is mailboxName then
          set targetMailbox to m
          set foundMailbox to true
          
          -- Get messages from the found mailbox
          if showUnreadOnly then
            set emailMessages to (messages of targetMailbox whose read status is false)
          else
            set emailMessages to (messages of targetMailbox)
          end if
          
          exit repeat
        end if
      end repeat
    end try
  end if
  
  -- Filter messages based on search criteria
  set filteredMessages to {}
  
  repeat with theMessage in emailMessages
    try
      set matchesSubject to true
      set matchesSender to true
      set matchesDate to true
      
      -- Check subject if specified
      if searchSubject is not "" then
        set msgSubject to subject of theMessage
        if msgSubject does not contain searchSubject then
          set matchesSubject to false
        end if
      end if
      
      -- Check sender if specified
      if searchSender is not "" then
        set msgSender to sender of theMessage
        if msgSender does not contain searchSender then
          set matchesSender to false
        end if
      end if
      
      -- Check date if specified
      if searchDate is not "" then
        set msgDate to date received of theMessage
        set msgDateString to (year of msgDate as string) & "-" & my padNumber(month of msgDate as integer) & "-" & my padNumber(day of msgDate as integer)
        if msgDateString is not searchDate then
          set matchesDate to false
        end if
      end if
      
      -- Add to filtered list if all criteria match
      if matchesSubject and matchesSender and matchesDate then
        set end of filteredMessages to theMessage
      end if
    end try
  end repeat
  
  -- Format the results
  set emailList to "Search results:" & return & return
  
  if (count of filteredMessages) is 0 then
    set emailList to emailList & "No matching emails found."
  else
    repeat with theMessage in filteredMessages
      try
        set msgSubject to subject of theMessage
        set msgSender to sender of theMessage
        set msgDate to date received of theMessage
        set msgRead to read status of theMessage
        
        -- Try to get account name for this message
        set msgAccount to ""
        try
          set msgMailbox to mailbox of theMessage
          set msgAcct to account of msgMailbox
          set msgAccount to " [" & name of msgAcct & "]"
        end try
        
        set emailList to emailList & "From: " & msgSender & return
        set emailList to emailList & "Subject: " & msgSubject & return
        set emailList to emailList & "Date: " & msgDate & msgAccount & return
        set emailList to emailList & "Read: " & msgRead & return
        
        -- Include body if requested
        if includeBody then
          set msgContent to content of theMessage
          set emailList to emailList & "Content: " & return & msgContent & return
        end if
        
        set emailList to emailList & return
      on error errMsg
        set emailList to emailList & "Error processing message: " & errMsg & return & return
      end try
    end repeat
  end if
  
  return emailList
end tell

-- Helper function to pad numbers with leading zero if needed
on padNumber(num)
  if num < 10 then
    return "0" & num
  else
    return num as string
  end if
end padNumber