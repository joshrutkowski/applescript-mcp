import { ScriptCategory } from "../types/index.js";

// Helper functions for AppleScript generation
const appleScriptHelpers = {
  // Parse date string to AppleScript date components
  parseDate: (dateString: string) => {
    const year = dateString.slice(0, 4);
    const month = dateString.slice(5, 7);
    const day = dateString.slice(8, 10);
    const hours = dateString.slice(11, 13);
    const minutes = dateString.slice(14, 16);
    const seconds = dateString.slice(17, 19);

    return { year, month, day, hours, minutes, seconds };
  },

  // Generate AppleScript to set date properties
  setDateProperties: (dateVar: string, dateString: string) => {
    const { year, month, day, hours, minutes, seconds } = appleScriptHelpers.parseDate(dateString);
    return `
      set ${dateVar} to current date
      set year of ${dateVar} to ${year}
      set month of ${dateVar} to ${month}
      set day of ${dateVar} to ${day}
      set hours of ${dateVar} to ${hours}
      set minutes of ${dateVar} to ${minutes}
      set seconds of ${dateVar} to ${seconds}
    `;
  },

  // Generate date range parsing logic
  parseDateRange: (startDate?: string, endDate?: string) => {
    const startDateLogic = startDate ?
      appleScriptHelpers.setDateProperties('searchStartDate', startDate) + 'set time of searchStartDate to 0' :
      'set searchStartDate to (current date) - 30 * days';

    const endDateLogic = endDate ?
      appleScriptHelpers.setDateProperties('searchEndDate', endDate) + 'set time of searchEndDate to 23 * hours + 59 * minutes + 59' :
      'set searchEndDate to (current date) + 365 * days';

    return { startDateLogic, endDateLogic };
  },

  // Generate search matching logic
  generateSearchLogic: (searchTerm: string, exact: boolean) => {
    if (exact) {
      return `if eventTitle contains "${searchTerm}" then`;
    }

    return `
      -- Natural/fuzzy matching: check if any word from search term appears in title
      set searchWords to words of "${searchTerm}"
      set titleWords to words of eventTitle
      set matchFound to false
      
      repeat with searchWord in searchWords
        repeat with titleWord in titleWords
          if titleWord contains searchWord or searchWord contains titleWord then
            set matchFound to true
            exit repeat
          end if
        end repeat
        if matchFound then
          exit repeat
        end if
      end repeat
      
      if matchFound then
    `;
  },

  // Generate event formatting logic
  formatEventDisplay: () => `
    -- Format the date for display
    set startYear to year of eventStart
    set startMonth to month of eventStart
    set startDay to day of eventStart
    set startHours to hours of eventStart
    set startMinutes to minutes of eventStart
    
    set endHours to hours of eventEnd
    set endMinutes to minutes of eventEnd
    
    set formattedStart to startMonth & "/" & startDay & "/" & startYear & " " & startHours & ":" & text -2 thru -1 of ("0" & startMinutes)
    set formattedEnd to endHours & ":" & text -2 thru -1 of ("0" & endMinutes)
    
    set searchResults to searchResults & "Event: " & eventTitle & "\n"
    set searchResults to searchResults & "ID: " & id of anEvent & "\n"
    set searchResults to searchResults & "Date: " & formattedStart & " - " & formattedEnd & "\n"
    set searchResults to searchResults & "-------------------\n"
  `,

  // Generate single calendar search logic
  generateSingleCalendarSearch: (calendar: string, searchTerm: string, exact: boolean, limit: number) => {
    const searchLogic = appleScriptHelpers.generateSearchLogic(searchTerm, exact);
    const formatLogic = appleScriptHelpers.formatEventDisplay();

    return `
      tell calendar "${calendar}"
        set allEvents to (every event whose start date is greater than or equal to searchStartDate and start date is less than or equal to searchEndDate)
        
        repeat with anEvent in allEvents
          if resultCount ≥ ${limit} then
            exit repeat
          end if
          
          set eventTitle to summary of anEvent
          set eventStart to start date of anEvent
          set eventEnd to end date of anEvent
          
          -- Check if search term matches the title
          ${searchLogic}
            set resultCount to resultCount + 1
            ${formatLogic}
          end if
        end repeat
      end tell
    `;
  },

  // Generate multi-calendar search logic
  generateMultiCalendarSearch: (searchTerm: string, exact: boolean, limit: number) => {
    const searchLogic = appleScriptHelpers.generateSearchLogic(searchTerm, exact);
    const formatLogic = appleScriptHelpers.formatEventDisplay();

    return `
      -- Search across all calendars
      repeat with calendarAccount in calendars
        if resultCount ≥ ${limit} then
          exit repeat
        end if
        
        set allEvents to (every event of calendarAccount whose start date is greater than or equal to searchStartDate and start date is less than or equal to searchEndDate)
        
        repeat with anEvent in allEvents
          if resultCount ≥ ${limit} then
            exit repeat
          end if
          
          set eventTitle to summary of anEvent
          set eventStart to start date of anEvent
          set eventEnd to end date of anEvent
          
          -- Check if search term matches the title
          ${searchLogic}
            set resultCount to resultCount + 1
            ${formatLogic}
          end if
        end repeat
      end repeat
    `;
  }
};

/**
 * Calendar-related scripts.
 * * add: adds a new event to Calendar
 * * edit: edit an existing event in Calendar
 * * list: List events for today
 * * search: Search for events with flexible criteria
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
      script: (args) => {
        const startDateLogic = appleScriptHelpers.setDateProperties('theStartDate', args.startDate);
        const endDateLogic = appleScriptHelpers.setDateProperties('theEndDate', args.endDate);

        return `
          tell application "Calendar"
            ${startDateLogic}
            ${endDateLogic}
            
            tell calendar "${args.calendar || "Calendar"}"
              make new event with properties {summary:"${args.title}", start date:theStartDate, end date:theEndDate}
            end tell
          end tell
        `;
      },
    },
    {
      name: "edit",
      description: "Edit an existing event in Calendar. Use the search function first to find the event ID.",
      schema: {
        type: "object",
        properties: {
          eventId: {
            type: "string",
            description: "Event ID (use search function to find this)",
          },
          newTitle: {
            type: "string",
            description: "New event title (optional)",
          },
          newStartDate: {
            type: "string",
            description: "New start date and time (YYYY-MM-DD HH:MM:SS) (optional)",
          },
          newEndDate: {
            type: "string",
            description: "New end date and time (YYYY-MM-DD HH:MM:SS) (optional)",
          },
          calendar: {
            type: "string",
            description: "Calendar name (optional)",
            default: "Calendar",
          },
        },
        required: ["eventId"],
      },
      script: (args) => {
        const newStartDateLogic = args.newStartDate ?
          appleScriptHelpers.setDateProperties('newStartDate', args.newStartDate) + 'set start date of targetEvent to newStartDate' : '';

        const newEndDateLogic = args.newEndDate ?
          appleScriptHelpers.setDateProperties('newEndDate', args.newEndDate) + 'set end date of targetEvent to newEndDate' : '';

        return `
          tell application "Calendar"
            set targetEvent to null
            
            -- Search for the event by ID across all calendars
            repeat with calendarAccount in calendars
              try
                set targetEvent to event id "${args.eventId}" of calendarAccount
                exit repeat
              on error
                -- Event not found in this calendar, continue to next
              end try
            end repeat
            
            if targetEvent is not null then
              ${args.newTitle ? `set summary of targetEvent to "${args.newTitle}"` : ''}
              ${newStartDateLogic}
              ${newEndDateLogic}
              
              return "Event updated successfully"
            else
              return "Event with ID '${args.eventId}' not found"
            end if
          end tell
        `;
      },
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
    {
      name: "search",
      description: "Search for calendar events with flexible criteria. Supports exact matching or natural/fuzzy matching for spelling variations and word order. Returns event IDs that can be used with the edit function.",
      schema: {
        type: "object",
        properties: {
          searchTerm: {
            type: "string",
            description: "Text to search for in event titles (partial matches supported)",
          },
          startDate: {
            type: "string",
            description: "Start date for search range (YYYY-MM-DD) (optional)",
          },
          endDate: {
            type: "string",
            description: "End date for search range (YYYY-MM-DD) (optional)",
          },
          calendar: {
            type: "string",
            description: "Calendar name to search in (optional - if not provided, searches all calendars)",
          },
          limit: {
            type: "number",
            description: "Maximum number of results to return (optional)",
            default: 20,
          },
          exact: {
            type: "boolean",
            description: "Whether to use exact matching (true) or natural/fuzzy matching (false) (optional)",
            default: false,
          },
        },
        required: ["searchTerm"],
      },
      script: (args) => {
        const { startDateLogic, endDateLogic } = appleScriptHelpers.parseDateRange(args.startDate, args.endDate);
        const limit = args.limit || 20;

        const searchLogic = args.calendar ?
          appleScriptHelpers.generateSingleCalendarSearch(args.calendar, args.searchTerm, args.exact, limit) :
          appleScriptHelpers.generateMultiCalendarSearch(args.searchTerm, args.exact, limit);

        return `
          tell application "Calendar"
            set searchResults to {}
            set resultCount to 0
            
            -- Parse date range if provided
            ${startDateLogic}
            ${endDateLogic}
            
            ${searchLogic}
            
            if resultCount = 0 then
              return "No events found matching '${args.searchTerm}'"
            else
              return "Found " & resultCount & " event(s):\n\n" & searchResults
            end if
          end tell
        `;
      },
    },
  ],
};
