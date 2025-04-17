/**
 * @jest-environment node
 */

describe('AppleScript Mocks Tests', () => {
  // Mock scripts for testing
  const mockScripts = {
    // System category scripts
    'volume.applescript': 'tell application "System Events" to set volume ${level}',
    'get_frontmost_app.applescript': 'tell application "System Events" to get name of first application process whose frontmost is true',
    'launch_app.applescript': 'tell application "${name}" to activate',
    'quit_app.applescript': 'tell application "${name}" to quit ${force ? "with saving" : ""}',
    'toggle_dark_mode.applescript': 'tell application "System Events" to tell appearance preferences to set dark mode to not dark mode',
    'get_battery_status.applescript': `
      set batteryLevel to do shell script "pmset -g batt | grep -o '[0-9]*%' | tr -d '%'"
      set isCharging to do shell script "pmset -g batt | grep -o 'AC Power'"
      
      set json to "{\\"level\\":" & batteryLevel & ", \\"charging\\":" & (isCharging is not "") & "}"
      return json
    `,
    
    // Clipboard category scripts
    'get_clipboard_text.applescript': 'the clipboard as text',
    'set_clipboard.applescript': 'set the clipboard to "${text}"',
    
    // Finder category scripts
    'get_selected_files.applescript': `
      tell application "Finder"
        set selectedItems to selection
        set itemPaths to {}
        
        repeat with i from 1 to count of selectedItems
          set itemPath to POSIX path of (selectedItems's item i as alias)
          set end of itemPaths to itemPath
        end repeat
        
        return itemPaths
      end tell
    `,
    
    // Default mock for any other script
    'default.applescript': 'return "Mock script executed successfully"'
  };

  /**
   * Get a mock script by name, or return the default mock if not found
   * @param scriptName - Name of the script to get
   * @returns The mock script content
   */
  function getMockScript(scriptName) {
    return mockScripts[scriptName] || mockScripts['default.applescript'];
  }

  test('mockScripts should contain system category scripts', () => {
    expect(Object.keys(mockScripts)).toContain('volume.applescript');
    expect(Object.keys(mockScripts)).toContain('get_frontmost_app.applescript');
    expect(Object.keys(mockScripts)).toContain('launch_app.applescript');
    expect(Object.keys(mockScripts)).toContain('quit_app.applescript');
    expect(Object.keys(mockScripts)).toContain('toggle_dark_mode.applescript');
    expect(Object.keys(mockScripts)).toContain('get_battery_status.applescript');
  });

  test('mockScripts should contain clipboard category scripts', () => {
    expect(Object.keys(mockScripts)).toContain('get_clipboard_text.applescript');
    expect(Object.keys(mockScripts)).toContain('set_clipboard.applescript');
  });

  test('mockScripts should contain finder category scripts', () => {
    expect(Object.keys(mockScripts)).toContain('get_selected_files.applescript');
  });

  test('getMockScript should return the correct script content', () => {
    const volumeScript = getMockScript('volume.applescript');
    expect(volumeScript).toBe('tell application "System Events" to set volume ${level}');
  });

  test('getMockScript should return default script for unknown script names', () => {
    const unknownScript = getMockScript('nonexistent.applescript');
    expect(unknownScript).toBe('return "Mock script executed successfully"');
  });
});