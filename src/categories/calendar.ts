import { ScriptCategory } from "../types/index.js";
import { escapeAppleScriptString as esc, toBoundedInt } from "../utils/escape.js";

/** Read the 2-digit HH, MM or SS field of "YYYY-MM-DD HH:MM:SS" as a bounded integer. */
function timeField(value: unknown, start: number, max: number): number {
  return toBoundedInt(String(value ?? "").slice(start, start + 2), 0, 0, max);
}

/**
 * Calendar-related scripts.
 * * add: adds a new event to Calendar
 * * list: List events for today
 */
export const calendarCategory: ScriptCategory = {
  name: "calendar",
  description: "Calendar operations",
  scripts: [
    {
      name: "add",
      description: "Add a new event to Calendar",
      schema: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Event title",
          },
          startDate: {
            type: "string",
            description: "Start date and time (YYYY-MM-DD HH:MM:SS)",
          },
          endDate: {
            type: "string",
            description: "End date and time (YYYY-MM-DD HH:MM:SS)",
          },
          calendar: {
            type: "string",
            description: "Calendar name (optional)",
            default: "Calendar",
          },
        },
        required: ["title", "startDate", "endDate"],
      },
      script: (args) => `
        tell application "Calendar"
          set theStartDate to current date
          set hours of theStartDate to ${timeField(args.startDate, 11, 23)}
          set minutes of theStartDate to ${timeField(args.startDate, 14, 59)}
          set seconds of theStartDate to ${timeField(args.startDate, 17, 59)}

          set theEndDate to theStartDate + (1 * hours)
          set hours of theEndDate to ${timeField(args.endDate, 11, 23)}
          set minutes of theEndDate to ${timeField(args.endDate, 14, 59)}
          set seconds of theEndDate to ${timeField(args.endDate, 17, 59)}

          tell calendar "${esc(args.calendar || "Calendar")}"
            make new event with properties {summary:"${esc(args.title)}", start date:theStartDate, end date:theEndDate}
          end tell
        end tell
      `,
    },
    {
      name: "list",
      description: "List all events for today",
      script: `
      tell application "Calendar"
          set todayStart to (current date)
          set time of todayStart to 0
          set todayEnd to todayStart + 1 * days
          set eventList to {}
          repeat with calendarAccount in calendars
              set eventList to eventList & (every event of calendarAccount whose start date is greater than or equal to todayStart and start date is less than todayEnd)
          end repeat
          set output to ""
          repeat with anEvent in eventList
              set eventStartDate to start date of anEvent
              set eventEndDate to end date of anEvent

              -- Format the time parts
              set startHours to hours of eventStartDate
              set startMinutes to minutes of eventStartDate
              set endHours to hours of eventEndDate
              set endMinutes to minutes of eventEndDate

              set output to output & "Event: " & summary of anEvent & "\n"
              set output to output & "Start: " & startHours & ":" & text -2 thru -1 of ("0" & startMinutes) & "\n"
              set output to output & "End: " & endHours & ":" & text -2 thru -1 of ("0" & endMinutes) & "\n"
              set output to output & "-------------------\n"
          end repeat
          return output
      end tell
      `,
    },
  ],
};
