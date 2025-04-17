set mailboxName to "${args.mailbox || 'Inbox'}"
set accountName to "${args.account || 'iCloud'}"
set messageCount to ${args.count || 10}
set showUnreadOnly to ${args.unreadOnly ? 'true' : 'false'}
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
      
      -- If mailbox not found in specified account, try to get inbox
      if not foundMailbox then
        try
          set inboxMailbox to inbox of targetAccount
          set targetMailbox to inboxMailbox
          set foundMailbox to true
          
          if showUnreadOnly then
            set emailMessages to (messages of targetMailbox whose read status is false)
          else
            set emailMessages to (messages of targetMailbox)
          end if
        end try
      end if
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
    
    -- If not found directly, try to find it in each account (prioritize iCloud)
    if not foundMailbox and iCloudAccount is not missing value then
      try
        set acctMailboxes to every mailbox of iCloudAccount
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
    end if
    
    -- If still not found in iCloud, check other accounts
    if not foundMailbox then
      repeat with acct in allAccounts
        if acct is not iCloudAccount then
          try
            set acctMailboxes to every mailbox of acct
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
            
            if foundMailbox then exit repeat
          end try
        end if
      end repeat
    end if
  end if
  
  -- If still not found, get messages from all inboxes
  if not foundMailbox then
    set emailMessages to {}
    set allAccounts to every account
    set accountsChecked to 0
    
    -- First check iCloud if available
    repeat with acct in allAccounts
      if name of acct is "iCloud" then
        try
          -- Try to get the inbox for iCloud
          set inboxMailbox to inbox of acct
          
          -- Add messages from this inbox
          if showUnreadOnly then
            set acctMessages to (messages of inboxMailbox whose read status is false)
          else
            set acctMessages to (messages of inboxMailbox)
          end if
          
          set emailMessages to emailMessages & acctMessages
          set accountsChecked to accountsChecked + 1
        end try
        exit repeat
      end if
    end repeat
    
    -- Then check other accounts if needed
    if accountsChecked is 0 then
      repeat with acct in allAccounts
        try
          -- Try to get the inbox for this account
          set inboxMailbox to inbox of acct
          
          -- Add messages from this inbox
          if showUnreadOnly then
            set acctMessages to (messages of inboxMailbox whose read status is false)
          else
            set acctMessages to (messages of inboxMailbox)
          end if
          
          set emailMessages to emailMessages & acctMessages
        end try
      end repeat
    end if
    
    -- Sort combined messages by date (newest first)
    set emailMessages to my sortMessagesByDate(emailMessages)
    set mailboxName to "All Inboxes"
  end if
  
  -- Limit the number of messages
  if (count of emailMessages) > messageCount then
    set emailMessages to items 1 thru messageCount of emailMessages
  end if
  
  -- Format the results
  set accountInfo to ""
  if not searchAllAccounts and targetAccount is not missing value then
    set accountInfo to " (" & accountName & ")"
  end if
  
  set emailList to "Recent emails in " & mailboxName & accountInfo & ":" & return & return
  
  if (count of emailMessages) is 0 then
    set emailList to emailList & "No messages found."
  else
    repeat with theMessage in emailMessages
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
        set emailList to emailList & "Read: " & msgRead & return & return
      on error errMsg
        set emailList to emailList & "Error processing message: " & errMsg & return & return
      end try
    end repeat
  end if
  
  return emailList
end tell

-- Helper function to sort messages by date
on sortMessagesByDate(messageList)
  tell application "Mail"
    set sortedMessages to {}
    
    -- Simple bubble sort by date received (newest first)
    repeat with i from 1 to count of messageList
      set currentMsg to item i of messageList
      set currentDate to date received of currentMsg
      set inserted to false
      
      if (count of sortedMessages) is 0 then
        set sortedMessages to {currentMsg}
      else
        repeat with j from 1 to count of sortedMessages
          set compareMsg to item j of sortedMessages
          set compareDate to date received of compareMsg
          
          if currentDate > compareDate then
            if j is 1 then
              set sortedMessages to {currentMsg} & sortedMessages
            else
              set sortedMessages to (items 1 thru (j - 1) of sortedMessages) & currentMsg & (items j thru (count of sortedMessages) of sortedMessages)
            end if
            set inserted to true
            exit repeat
          end if
        end repeat
        
        if not inserted then
          set sortedMessages to sortedMessages & {currentMsg}
        end if
      end if
    end repeat
    
    return sortedMessages
  end tell
end sortMessagesByDate