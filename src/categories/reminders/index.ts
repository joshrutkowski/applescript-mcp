import { ScriptCategory } from '../../types/index.js';
import { formatReminderProperties, buildSearchCriteria } from './utils.js';

export const remindersCategory: ScriptCategory = {
  name: 'reminders',
  description: 'Manage macOS Reminders',
  scripts: [
    {
      name: 'create',
      description: 'Create a new reminder with advanced properties',
      schema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Title of the reminder' },
          notes: { type: 'string', description: 'Additional notes' },
          dueDate: { type: 'string', description: 'Due date (YYYY-MM-DD)' },
          list: { type: 'string', description: 'List name' },
          priority: { type: 'integer', minimum: 0, maximum: 9 },
          url: { type: 'string', description: 'Associated URL' },
          tags: { type: 'array', items: { type: 'string' } },
          location: { type: 'string', description: 'Location reminder' },
          remindDate: { type: 'string', description: 'Reminder date (YYYY-MM-DD)' }
        },
        required: ['title']
      },
      script: (args) => `
        tell application "Reminders"
          tell list "${args.list || 'Reminders'}"
            make new reminder with properties {
              ${formatReminderProperties(args)}
            }
          end tell
        end tell
      `
    },
    {
      name: 'create_list',
      description: 'Create a new reminders list',
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'List name' },
          color: { type: 'string', description: 'List color (e.g., "red", "blue")' }
        },
        required: ['name']
      },
      script: (args) => `
        tell application "Reminders"
          make new list with properties {
            name: "${args.name}"${args.color ? `,\ncolor: ${args.color}` : ''}
          }
        end tell
      `
    },
    {
      name: 'search',
      description: 'Search reminders with advanced filters',
      schema: {
        type: 'object',
        properties: {
          list: { type: 'string', description: 'List name' },
          includeCompleted: { type: 'boolean' },
          dueBefore: { type: 'string', description: 'Due before date' },
          dueAfter: { type: 'string', description: 'Due after date' },
          hasAttachments: { type: 'boolean' },
          hasDueDate: { type: 'boolean' },
          hasReminder: { type: 'boolean' },
          isOverdue: { type: 'boolean' }
        }
      },
      script: (args) => {
        const criteria = buildSearchCriteria(args);
        return `
          tell application "Reminders"
            set theList to list "${args.list || 'Reminders'}"
            set theReminders to (every reminder in theList ${criteria ? `whose ${criteria}` : ''})
            set output to ""
            repeat with r in theReminders
              set output to output & "Title: " & name of r & return
              if body of r is not missing value then
                set output to output & "Notes: " & body of r & return
              end if
              if due date of r is not missing value then
                set output to output & "Due: " & due date of r & return
              end if
              if remind me date of r is not missing value then
                set output to output & "Reminder: " & remind me date of r & return
              end if
              if priority of r > 0 then
                set output to output & "Priority: " & priority of r & return
              end if
              set output to output & "---" & return
            end repeat
            return output
          end tell
        `;
      }
    },
    {
      name: 'update',
      description: 'Update an existing reminder',
      schema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Current title to find reminder' },
          list: { type: 'string', description: 'List name' },
          newTitle: { type: 'string' },
          notes: { type: 'string' },
          dueDate: { type: 'string' },
          priority: { type: 'integer', minimum: 0, maximum: 9 },
          url: { type: 'string' },
          remindDate: { type: 'string' }
        },
        required: ['title']
      },
      script: (args) => {
        const { title, list, ...updates } = args;
        const properties = formatReminderProperties({ title: updates.newTitle || title, ...updates });
        return `
          tell application "Reminders"
            tell list "${list || 'Reminders'}"
              set theReminder to (first reminder whose name is "${title}")
              set properties of theReminder to { ${properties} }
            end tell
          end tell
        `;
      }
    },
    {
      name: 'set_tags',
      description: 'Set tags for a reminder',
      schema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Reminder title' },
          list: { type: 'string', description: 'List name' },
          tags: { type: 'array', items: { type: 'string' } }
        },
        required: ['title', 'tags']
      },
      script: (args) => `
        tell application "Reminders"
          tell list "${args.list || 'Reminders'}"
            set theReminder to (first reminder whose name is "${args.title}")
            set tagNames to ${JSON.stringify(args.tags)}
            repeat with tagName in tagNames
              make new tag at end of tags of theReminder with properties {name:tagName}
            end repeat
          end tell
        end tell
      `
    },
    {
      name: 'get_lists',
      description: 'Get all reminder lists',
      script: () => `
        tell application "Reminders"
          set output to ""
          repeat with theList in every list
            set output to output & name of theList & return
          end repeat
          return output
        end tell
      `
    },
    {
      name: 'delete_list',
      description: 'Delete a reminders list',
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'List name' }
        },
        required: ['name']
      },
      script: (args) => `
        tell application "Reminders"
          delete list "${args.name}"
        end tell
      `
    },
    {
      name: 'mark_completed',
      description: 'Mark a reminder as completed',
      schema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Reminder title' },
          list: { type: 'string', description: 'List name' }
        },
        required: ['title']
      },
      script: (args) => `
        tell application "Reminders"
          tell list "${args.list || 'Reminders'}"
            set theReminder to (first reminder whose name is "${args.title}")
            set completed of theReminder to true
          end tell
        end tell
      `
    },
    {
      name: 'delete',
      description: 'Delete a reminder',
      schema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Reminder title' },
          list: { type: 'string', description: 'List name' }
        },
        required: ['title']
      },
      script: (args) => `
        tell application "Reminders"
          tell list "${args.list || 'Reminders'}"
            delete (first reminder whose name is "${args.title}")
          end tell
        end tell
      `
    }
  ]
};
