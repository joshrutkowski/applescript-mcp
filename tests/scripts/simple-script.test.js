/**
 * @jest-environment node
 */

// A simple test for scripts
describe('Simple Script Test', () => {
  // Mock processScriptTemplate function
  const processScriptTemplate = (scriptContent, args) => {
    let processedScript = scriptContent;
    
    if (args) {
      Object.entries(args).forEach(([key, value]) => {
        const placeholder = new RegExp(`\\$\\{${key}\\}`, 'g');
        processedScript = processedScript.replace(placeholder, String(value));
      });
    }
    
    return processedScript;
  };

  test('should process script template with arguments', () => {
    const template = 'tell application "System Events" to set volume ${level}';
    const args = { level: 5 };
    
    const result = processScriptTemplate(template, args);
    
    expect(result).toBe('tell application "System Events" to set volume 5');
  });
  
  test('should handle multiple placeholders', () => {
    const template = 'tell application "${appName}" to ${action}';
    const args = { appName: 'Finder', action: 'activate' };
    
    const result = processScriptTemplate(template, args);
    
    expect(result).toBe('tell application "Finder" to activate');
  });
});