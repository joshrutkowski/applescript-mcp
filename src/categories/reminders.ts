import { ScriptCategory } from "../types/index.js";

/**
 * Helper function to create AppleScript that preserves app state
 */
function withAppStatePreservation(script: string): string {
  // Remove any existing return statements and extract the main logic
  const scriptBody = script.replace(/\breturn\s+.+$/gm, '').trim();
  
  return `
set wasRunning to false
tell application "System Events"
  if exists (processes where name is "Reminders") then
    set wasRunning to true
  end if
end tell

set scriptResult to ""
try
  ${scriptBody}
  -- The result should be in 'output' variable from the original script
  try
    set scriptResult to output
  on error
    set scriptResult to "Script completed successfully"
  end try
on error errMsg
  set scriptResult to "Error: " & errMsg
end try

if not wasRunning then
  try
    tell application "Reminders" to quit
  on error
    -- Ignore any errors
  end try
end if

return scriptResult
  `.trim();
}

/**
 * Reminders-related scripts.
 * * create: Create a new reminder
 * * get: Get a specific reminder by name
 * * list: List all reminders
 * * search: Search reminders by text
 * * complete: Mark a reminder as complete
 * * delete: Delete a reminder
 * * list_lists: List all reminder lists
 */
export const remindersCategory: ScriptCategory = {
  name: "reminders",
  description: "Reminders operations",
  scripts: [
    {
      name: "create",
      description: "Create a new reminder",
      schema: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Reminder name/title",
          },
          notes: {
            type: "string",
            description: "Optional notes for the reminder",
          },
          list: {
            type: "string",
            description: "Reminder list name (optional, defaults to default list)",
          },
          dueDate: {
            type: "string",
            description: "Due date and time (YYYY-MM-DD HH:MM:SS format, optional)",
          },
          priority: {
            type: "number",
            description: "Priority level (0=none, 1=low, 5=medium, 9=high)",
            minimum: 0,
            maximum: 9,
          },
        },
        required: ["name"],
      },
      script: (args) => {
        let mainScript = `tell application "Reminders"\n`;
        
        if (args.list) {
          mainScript += `  set targetList to list "${args.list}"\n`;
        } else {
          mainScript += `  set targetList to default list\n`;
        }
        
        mainScript += `  tell targetList\n`;
        mainScript += `    set newReminder to make new reminder with properties {name:"${args.name}"}\n`;
        
        if (args.notes) {
          mainScript += `    set body of newReminder to "${args.notes}"\n`;
        }
        
        if (args.dueDate) {
          // Parse the date more carefully
          const [datePart, timePart] = args.dueDate.split(' ');
          const [year, month, day] = datePart.split('-');
          const [hour, minute, second] = timePart.split(':');
          
          mainScript += `    set dueDate to (current date)\n`;
          mainScript += `    set year of dueDate to ${year}\n`;
          mainScript += `    set month of dueDate to ${month}\n`;
          mainScript += `    set day of dueDate to ${day}\n`;
          mainScript += `    set hours of dueDate to ${hour}\n`;
          mainScript += `    set minutes of dueDate to ${minute}\n`;
          mainScript += `    set seconds of dueDate to ${second || '0'}\n`;
          mainScript += `    set due date of newReminder to dueDate\n`;
        }
        
        if (args.priority !== undefined) {
          mainScript += `    set priority of newReminder to ${args.priority}\n`;
        }
        
        mainScript += `    return "Created reminder: " & name of newReminder & " in list: " & name of targetList\n`;
        mainScript += `  end tell\n`;
        mainScript += `end tell`;
        
        return withAppStatePreservation(mainScript);
      },
    },
    {
      name: "get",
      description: "Get a specific reminder by name",
      schema: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Name of the reminder to find",
          },
          list: {
            type: "string",
            description: "Reminder list to search in (optional)",
          },
        },
        required: ["name"],
      },
      script: (args) => {
        let mainScript = `tell application "Reminders"\n`;
        
        if (args.list) {
          mainScript += `  set searchList to {list "${args.list}"}\n`;
        } else {
          mainScript += `  set searchList to lists\n`;
        }
        
        mainScript += `  repeat with aList in searchList\n`;
        mainScript += `    repeat with aReminder in reminders of aList\n`;
        mainScript += `      if name of aReminder contains "${args.name}" then\n`;
        mainScript += `        set output to "Reminder: " & name of aReminder & "\n"\n`;
        mainScript += `        set output to output & "List: " & name of aList & "\n"\n`;
        mainScript += `        set output to output & "Completed: " & completed of aReminder & "\n"\n`;
        mainScript += `        if body of aReminder is not missing value then\n`;
        mainScript += `          set output to output & "Notes: " & body of aReminder & "\n"\n`;
        mainScript += `        end if\n`;
        mainScript += `        if due date of aReminder is not missing value then\n`;
        mainScript += `          set output to output & "Due: " & due date of aReminder & "\n"\n`;
        mainScript += `        end if\n`;
        mainScript += `        if priority of aReminder > 0 then\n`;
        mainScript += `          set output to output & "Priority: " & priority of aReminder & "\n"\n`;
        mainScript += `        end if\n`;
        mainScript += `        return output\n`;
        mainScript += `      end if\n`;
        mainScript += `    end repeat\n`;
        mainScript += `  end repeat\n`;
        mainScript += `  return "No reminder found with name: ${args.name}"\n`;
        mainScript += `end tell`;
        
        return withAppStatePreservation(mainScript);
      },
    },
    {
      name: "list",
      description: "List all reminders",
      schema: {
        type: "object",
        properties: {
          list: {
            type: "string",
            description: "Reminder list to filter by (optional)",
          },
          completed: {
            type: "boolean",
            description: "Filter by completion status (optional)",
          },
          limit: {
            type: "number",
            description: "Maximum number of reminders to return (default: 20)",
            minimum: 1,
            maximum: 100,
          },
        },
      },
      script: (args) => {
        // Simple, fast version - just names and completion status
        let script = `tell application "Reminders"\n`;
        
        if (args.list) {
          script += `  set targetList to list "${args.list}"\n`;
          script += `  set output to "List: " & name of targetList & "\n"\n`;
          script += `  repeat with aReminder in reminders of targetList\n`;
          script += `    set output to output & "  • " & name of aReminder\n`;
          if (args.completed === false) {
            script += `    if not completed of aReminder then\n`;
            script += `      set output to output & "\n"\n`;
            script += `    end if\n`;
          } else if (args.completed === true) {
            script += `    if completed of aReminder then\n`;
            script += `      set output to output & " [COMPLETED]\n"\n`;
            script += `    end if\n`;
          } else {
            script += `    if completed of aReminder then\n`;
            script += `      set output to output & " [COMPLETED]"\n`;
            script += `    end if\n`;
            script += `    set output to output & "\n"\n`;
          }
          script += `  end repeat\n`;
        } else {
          script += `  set output to ""\n`;
          script += `  repeat with aList in lists\n`;
          script += `    set output to output & "List: " & name of aList & "\n"\n`;
          script += `    repeat with aReminder in reminders of aList\n`;
          script += `      set output to output & "  • " & name of aReminder\n`;
          script += `      if completed of aReminder then\n`;
          script += `        set output to output & " [COMPLETED]"\n`;
          script += `      end if\n`;
          script += `      set output to output & "\n"\n`;
          script += `    end repeat\n`;
          script += `    set output to output & "\n"\n`;
          script += `  end repeat\n`;
        }
        
        script += `  return output\n`;
        script += `end tell`;
        
        return withAppStatePreservation(script);
      },
    },
    {
      name: "search",
      description: "Search reminders by text",
      schema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Text to search for in reminder names and notes",
          },
          list: {
            type: "string",
            description: "Reminder list to search in (optional)",
          },
          limit: {
            type: "number",
            description: "Maximum number of results (default: 10)",
            minimum: 1,
            maximum: 50,
          },
        },
        required: ["query"],
      },
      script: (args) => {
        // Simplified fast search - just name matching for now
        let script = `tell application "Reminders"\n`;
        
        if (args.list) {
          script += `  set searchLists to {list "${args.list}"}\n`;
        } else {
          script += `  set searchLists to lists\n`;
        }
        
        script += `  set output to "Search results for: ${args.query}\n\n"\n`;
        script += `  set matchCount to 0\n`;
        
        script += `  repeat with aList in searchLists\n`;
        script += `    set listName to name of aList\n`;
        script += `    repeat with aReminder in reminders of aList\n`;
        script += `      if matchCount >= 5 then exit repeat -- Limit to first 5 matches for speed\n`;
        script += `      set reminderName to name of aReminder\n`;
        script += `      if reminderName contains "${args.query}" then\n`;
        script += `        set output to output & "List: " & listName & "\n"\n`;
        script += `        set output to output & "• " & reminderName & "\n\n"\n`;
        script += `        set matchCount to matchCount + 1\n`;
        script += `      end if\n`;
        script += `    end repeat\n`;
        script += `    if matchCount >= 5 then exit repeat\n`;
        script += `  end repeat\n`;
        script += `  if matchCount = 0 then\n`;
        script += `    set output to output & "No reminders found matching: ${args.query}"\n`;
        script += `  end if\n`;
        script += `  return output\n`;
        script += `end tell`;
        
        return withAppStatePreservation(script);
      },
    },
    {
      name: "complete",
      description: "Mark a reminder as complete",
      schema: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Name of the reminder to mark as complete",
          },
          list: {
            type: "string",
            description: "Reminder list to search in (optional)",
          },
        },
        required: ["name"],
      },
      script: (args) => {
        let script = `tell application "Reminders"\n`;
        
        if (args.list) {
          script += `  set searchLists to {list "${args.list}"}\n`;
        } else {
          script += `  set searchLists to lists\n`;
        }
        
        script += `  repeat with aList in searchLists\n`;
        script += `    repeat with aReminder in reminders of aList\n`;
        script += `      if name of aReminder contains "${args.name}" then\n`;
        script += `        set completed of aReminder to true\n`;
        script += `        return "Completed reminder: " & name of aReminder & " in list: " & name of aList\n`;
        script += `      end if\n`;
        script += `    end repeat\n`;
        script += `  end repeat\n`;
        script += `  return "No reminder found with name: ${args.name}"\n`;
        script += `end tell`;
        
        return withAppStatePreservation(script);
      },
    },
    {
      name: "delete",
      description: "Delete a reminder",
      schema: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Name of the reminder to delete",
          },
          list: {
            type: "string",
            description: "Reminder list to search in (optional)",
          },
        },
        required: ["name"],
      },
      script: (args) => {
        let script = `tell application "Reminders"\n`;
        
        if (args.list) {
          script += `  set searchLists to {list "${args.list}"}\n`;
        } else {
          script += `  set searchLists to lists\n`;
        }
        
        script += `  repeat with aList in searchLists\n`;
        script += `    set allReminders to reminders of aList\n`;
        script += `    set reminderCount to count of allReminders\n`;
        script += `    repeat with i from reminderCount to 1 by -1\n`;
        script += `      set aReminder to item i of allReminders\n`;
        script += `      if name of aReminder contains "${args.name}" then\n`;
        script += `        set reminderName to name of aReminder\n`;
        script += `        set listName to name of aList\n`;
        script += `        delete aReminder\n`;
        script += `        return "Deleted reminder: " & reminderName & " from list: " & listName\n`;
        script += `      end if\n`;
        script += `    end repeat\n`;
        script += `  end repeat\n`;
        script += `  return "No reminder found with name: ${args.name}"\n`;
        script += `end tell`;
        
        return withAppStatePreservation(script);
      },
    },
    {
      name: "list_lists",
      description: "List all reminder lists",
      script: withAppStatePreservation(`
        tell application "Reminders"
          set output to "Reminder Lists:\n\n"
          repeat with aList in lists
            set listName to name of aList
            set reminderCount to count of reminders of aList
            
            if reminderCount > 0 then
              set completedCount to count of (reminders of aList whose completed is true)
              set pendingCount to reminderCount - completedCount
              set output to output & "• " & listName & " (" & pendingCount & " pending, " & completedCount & " completed)\n"
            else
              set output to output & "• " & listName & " (empty)\n"
            end if
          end repeat
          return output
        end tell
      `),
    },
  ],
};