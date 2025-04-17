on run
	-- Path to the Messages database
	set dbPath to (do shell script "echo ~/Library/Messages/chat.db")
	
	-- Create a temporary SQL file for our query
	set tempFile to (do shell script "mktemp /tmp/imessage_query.XXXXXX")
	
	-- Write SQL query to temp file
	do shell script "cat > " & quoted form of tempFile & " << 'EOF'
SELECT
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
LIMIT ${args.limit};
EOF"
	
	-- Execute the query
	set queryResult to do shell script "sqlite3 " & quoted form of dbPath & " < " & quoted form of tempFile
	
	-- Clean up temp file
	do shell script "rm " & quoted form of tempFile
	
	-- Process and display results
	set resultList to paragraphs of queryResult
	set messageData to {}
	
	repeat with messageLine in resultList
		set messageData to messageData & messageLine
	end repeat
	
	return messageData
end run