tell application "Calendar"
  set theStartDate to current date
  set hours of theStartDate to ${args.startDate.slice(11, 13)}
  set minutes of theStartDate to ${args.startDate.slice(14, 16)}
  set seconds of theStartDate to ${args.startDate.slice(17, 19)}

  set theEndDate to theStartDate + (1 * hours)
  set hours of theEndDate to ${args.endDate.slice(11, 13)}
  set minutes of theEndDate to ${args.endDate.slice(14, 16)}
  set seconds of theEndDate to ${args.endDate.slice(17, 19)}

  tell calendar "${args.calendar || "Calendar"}"
    make new event with properties {summary:"${args.title}", start date:theStartDate, end date:theEndDate}
  end tell
end tell