import { ScriptCategory } from "../types/index.js";
import {
  escapeAppleScriptString as esc,
  escapeSqlString,
  toBoundedInt,
} from "../utils/escape.js";

/**
 * iMessage related scripts
 */
export const messagesCategory: ScriptCategory = {
  name: "messages",
  description: "iMessage operations",
  scripts: [
    {
      name: "list_chats",
      description: "List available iMessage and SMS chats",
      schema: {
        type: "object",
        properties: {
          includeParticipantDetails: {
            type: "boolean",
            description: "Include detailed participant information",
            default: false
          }
        }
      },
      script: (args) => `
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
      `
    },
    {
      name: "get_messages",
      description: "Get messages from the Messages app",
      schema: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "Maximum number of messages to retrieve",
            default: 100
          }
        }
      },
      script: (args) => `
 on run
	-- Path to the Messages database
	set dbPath to (do shell script "echo ~/Library/Messages/chat.db")

	set sqlQuery to "SELECT
    datetime(message.date/1000000000 + strftime('%s', '2001-01-01'), 'unixepoch', 'localtime') as message_date,
    handle.id as sender,
    message.text as message_text,
    chat.display_name as chat_name
FROM
    message
    LEFT JOIN handle ON message.handle_id = handle.ROWID
    LEFT JOIN chat_message_join ON message.ROWID = chat_message_join.message_id
    LEFT JOIN chat ON chat_message_join.chat_id = chat.ROWID
ORDER BY
    message.date DESC
LIMIT ${toBoundedInt(args.limit, 100, 1, 10000)};"

	-- Execute the query; quoted form keeps the SQL a single shell argument
	set queryResult to do shell script "sqlite3 " & quoted form of dbPath & " " & quoted form of sqlQuery

	-- Process and display results
	set resultList to paragraphs of queryResult
	set messageData to {}
	
	repeat with messageLine in resultList
		set messageData to messageData & messageLine
	end repeat
	
	return messageData
end run
      `
    },
    {
      name: "search_messages",
      description: "Search for messages containing specific text or from a specific sender",
      schema: {
        type: "object",
        properties: {
          searchText: {
            type: "string",
            description: "Text to search for in messages",
            default: ""
          },
          sender: {
            type: "string",
            description: "Search for messages from a specific sender (phone number or email)",
            default: ""
          },
          chatId: {
            type: "string",
            description: "Limit search to a specific chat ID",
            default: ""
          },
          limit: {
            type: "number",
            description: "Maximum number of messages to retrieve",
            default: 50
          },
          daysBack: {
            type: "number",
            description: "Limit search to messages from the last N days",
            default: 30
          }
        },
        required: ["searchText"]
      },
      script: (args) => `
on run
	-- Path to the Messages database
	set dbPath to (do shell script "echo ~/Library/Messages/chat.db")

	-- Build WHERE clause based on provided parameters
	set whereClause to ""

	${args.searchText ? `
	-- Add search text condition if provided
	set whereClause to whereClause & "message.text LIKE '%${esc(escapeSqlString(args.searchText))}%' "
	` : ''}

	${args.sender ? `
	-- Add sender condition if provided
	if length of whereClause > 0 then
		set whereClause to whereClause & "AND "
	end if
	set whereClause to whereClause & "handle.id LIKE '%${esc(escapeSqlString(args.sender))}%' "
	` : ''}

	${args.chatId ? `
	-- Add chat ID condition if provided
	if length of whereClause > 0 then
		set whereClause to whereClause & "AND "
	end if
	set whereClause to whereClause & "chat.chat_identifier = '${esc(escapeSqlString(args.chatId))}' "
	` : ''}

	${args.daysBack ? `
	-- Add date range condition
	if length of whereClause > 0 then
		set whereClause to whereClause & "AND "
	end if
	set whereClause to whereClause & "message.date > (strftime('%s', 'now', '-${toBoundedInt(args.daysBack, 30, 1, 36500)} days') - strftime('%s', '2001-01-01')) * 1000000000 "
	` : ''}

	-- If no search parameters were provided, add a default condition to avoid returning all messages
	if length of whereClause = 0 then
		set whereClause to "1=1 "
	end if

	set sqlQuery to "SELECT
    datetime(message.date/1000000000 + strftime('%s', '2001-01-01'), 'unixepoch', 'localtime') as message_date,
    handle.id as sender,
    message.text as message_text,
    chat.display_name as chat_name,
    chat.chat_identifier as chat_id
FROM
    message
    LEFT JOIN handle ON message.handle_id = handle.ROWID
    LEFT JOIN chat_message_join ON message.ROWID = chat_message_join.message_id
    LEFT JOIN chat ON chat_message_join.chat_id = chat.ROWID
WHERE
    " & whereClause & "
ORDER BY
    message.date DESC
LIMIT ${toBoundedInt(args.limit, 50, 1, 10000)};"

	-- Execute the query; quoted form keeps the SQL a single shell argument
	set queryResult to do shell script "sqlite3 " & quoted form of dbPath & " " & quoted form of sqlQuery
	
	-- Process and display results
	set resultList to paragraphs of queryResult
	set messageData to {}
	
	repeat with messageLine in resultList
		set messageData to messageData & messageLine
	end repeat
	
	return messageData
end run
      `
    },
    {
      name: "compose_message",
      description: "Open Messages app with a pre-filled message to a recipient or automatically send a message",
      schema: {
        type: "object",
        properties: {
          recipient: {
            type: "string",
            description: "Phone number or email of the recipient"
          },
          body: {
            type: "string",
            description: "Message body text",
            default: ""
          },
          auto: {
            type: "boolean",
            description: "Automatically send the message without user confirmation",
            default: false
          }
        },
        required: ["recipient"]
      },
      script: (args) => `
on run
  -- Get the recipient and message body
  set recipient to "${esc(args.recipient)}"
  set messageBody to "${esc(args.body || '')}"
  set autoSend to ${args.auto === true ? "true" : "false"}
  
  if autoSend then
    -- Automatically send the message using AppleScript
    tell application "Messages"
      -- Get the service (iMessage or SMS)
      set targetService to 1st service whose service type = iMessage
      
      -- Send the message
      set targetBuddy to buddy "${esc(args.recipient)}" of targetService
      send "${esc(args.body || '')}" to targetBuddy
      
      return "Message sent to " & "${esc(args.recipient)}"
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
      `
    }
  ]
};
