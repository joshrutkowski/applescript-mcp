import { ScriptCategory } from "../types/index.js";
import { escapeAppleScriptString as esc, toBoundedInt } from "../utils/escape.js";

/**
 * Mail-related scripts.
 * * create_email: Create a new email in Mail.app with specified recipient, subject, and body
 * * list_emails: List emails from a specified mailbox in Mail.app
 * * get_email: Get a specific email by ID or search criteria from Mail.app
 */
export const mailCategory: ScriptCategory = {
  name: "mail",
  description: "Mail operations",
  scripts: [
    {
      name: "create_email",
      description: "Create a new email in Mail.app",
      schema: {
        type: "object",
        properties: {
          recipient: {
            type: "string",
            description: "Email recipient",
          },
          subject: {
            type: "string",
            description: "Email subject",
          },
          body: {
            type: "string",
            description: "Email body",
          },
        },
        required: ["recipient", "subject", "body"],
      },
      script: (args) => `
        set recipient to "${esc(args.recipient)}"
        set subject to "${esc(args.subject)}"
        set body to "${esc(args.body)}"

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
      `,
    },
    {
      name: "list_emails",
      description: "List emails from a specified mailbox in Mail.app",
      schema: {
        type: "object",
        properties: {
          mailbox: {
            type: "string",
            description: "Name of the mailbox to list emails from (e.g., 'Inbox', 'Sent')",
            default: "Inbox"
          },
          account: {
            type: "string",
            description: "Name of the account to search in (e.g., 'iCloud', 'Gmail', 'Exchange'). If not specified, searches all accounts with preference for iCloud.",
            default: "iCloud"
          },
          count: {
            type: "number",
            description: "Maximum number of emails to retrieve",
            default: 10
          },
          unreadOnly: {
            type: "boolean",
            description: "Only show unread emails if true"
          }
        }
      },
      script: (args) => `
        set mailboxName to "${esc(args.mailbox || 'Inbox')}"
        set accountName to "${esc(args.account || 'iCloud')}"
        set messageCount to ${toBoundedInt(args.count, 10, 1, 1000)}
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
      `,
    },
    {
      name: "get_email",
      description: "Get a specific email by search criteria from Mail.app",
      schema: {
        type: "object",
        properties: {
          mailbox: {
            type: "string",
            description: "Name of the mailbox to search in (e.g., 'Inbox', 'Sent')",
            default: "Inbox"
          },
          account: {
            type: "string",
            description: "Name of the account to search in (e.g., 'iCloud', 'Gmail', 'Exchange'). If not specified, searches all accounts with preference for iCloud.",
            default: "iCloud"
          },
          subject: {
            type: "string",
            description: "Subject text to search for (partial match)"
          },
          sender: {
            type: "string",
            description: "Sender email or name to search for (partial match)"
          },
          dateReceived: {
            type: "string",
            description: "Date received to search for (format: YYYY-MM-DD)"
          },
          unreadOnly: {
            type: "boolean",
            description: "Only search unread emails if true"
          },
          includeBody: {
            type: "boolean",
            description: "Include email body in the result if true",
            default: false
          }
        },
        required: []
      },
      script: (args) => `
        set mailboxName to "${esc(args.mailbox || 'Inbox')}"
        set accountName to "${esc(args.account || 'iCloud')}"
        set searchSubject to "${esc(args.subject || '')}"
        set searchSender to "${esc(args.sender || '')}"
        set searchDate to "${esc(args.dateReceived || '')}"
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
      `,
    },
  ],
};
