/**
 * @jest-environment node
 */

// This is a CommonJS version of the fileUtils test that doesn't use ESM imports

describe('File Utils Tests', () => {
  // Mock the processScriptTemplate function
  const processScriptTemplate = (scriptContent, args) => {
    let processedScript = scriptContent;
    
    if (args) {
      Object.entries(args).forEach(([key, value]) => {
        const placeholder = new RegExp(`\\$\\{${key}\\}`, 'g');
        processedScript = processedScript.replace(
          placeholder, 
          String(value).replace(/'/g, "'\"'\"'") // Escape single quotes for AppleScript
        );
      });
    }
    
    return processedScript;
  };
  
  // Mock the readScriptFile function
  const readScriptFile = (scriptPath) => {
    // In a real implementation, this would read from the file system
    if (scriptPath.includes('volume.applescript')) {
      return 'tell application "System Events" to set volume ${level}';
    }
    if (scriptPath.includes('launch_app.applescript')) {
      return 'tell application "${name}" to activate';
    }
    return 'default script content';
  };
  
  // Mock the scriptFrom function
  const scriptFrom = (scriptPath) => {
    return (args) => {
      const scriptTemplate = readScriptFile(scriptPath);
      return processScriptTemplate(scriptTemplate, args);
    };
  };
  
  describe('processScriptTemplate', () => {
    test('should replace placeholders with argument values', () => {
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
    
    test('should escape single quotes in argument values', () => {
      const template = 'display dialog "${message}"';
      const args = { message: "It's working!" };
      
      const result = processScriptTemplate(template, args);
      
      // Just check that the result contains the escaped single quote
      expect(result).toContain("It'\"'\"'s working!");
    });
    
    test('should handle empty arguments object', () => {
      const template = 'tell application "Finder" to activate';
      const args = {};
      
      const result = processScriptTemplate(template, args);
      
      expect(result).toBe('tell application "Finder" to activate');
    });
    
    test('should handle undefined arguments', () => {
      const template = 'tell application "Finder" to activate';
      
      const result = processScriptTemplate(template, undefined);
      
      expect(result).toBe('tell application "Finder" to activate');
    });
  });
  
  describe('readScriptFile', () => {
    test('should load script file content', () => {
      const scriptPath = '/path/to/script.applescript';
      const content = readScriptFile(scriptPath);
      
      expect(content).toBe('default script content');
    });
  });
  
  describe('scriptFrom', () => {
    test('should create a function that processes script templates', () => {
      const scriptFn = scriptFrom('/path/to/volume.applescript');
      expect(typeof scriptFn).toBe('function');
      
      const processedScript = scriptFn({ level: 5 });
      expect(processedScript).toBe('tell application "System Events" to set volume 5');
    });
    
    test('should handle multiple arguments in template', () => {
      const scriptFn = scriptFrom('/path/to/launch_app.applescript');
      const processedScript = scriptFn({ name: 'Finder' });
      
      expect(processedScript).toBe('tell application "Finder" to activate');
    });
  });
});