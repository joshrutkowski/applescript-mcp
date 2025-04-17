try
  set powerSource to do shell script "pmset -g batt"
  return powerSource
on error errMsg
  return "Failed to get battery status: " & errMsg
end try