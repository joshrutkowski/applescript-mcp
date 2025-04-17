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