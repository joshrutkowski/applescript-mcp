/**
 * @jest-environment node
 */

// Mock modules before imports
jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  existsSync: jest.fn(),
}));

// Import after mocks are set up
import { processScriptTemplate, readScriptFile, scriptFrom } from '../../src/utils/fileUtils.js';
import fs from 'fs';
import path from 'path';

describe('File Utils Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock readFileSync to return test script content
    fs.readFileSync.mockImplementation((path) => {
      if (path.includes('volume.applescript')) {
        return 'tell application "System Events" to set volume ${level}';
      }
      if (path.includes('launch_app.applescript')) {
        return 'tell application "${name}" to activate';
      }
      return 'default script content';
    });
    
    // Mock existsSync to return true
    fs.existsSync.mockReturnValue(true);
  });
  
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
      
      // In AppleScript, single quotes are escaped as '\"'\"'
      expect(result).toBe('display dialog "It\'"\'"\'"\'s working!"');
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
    test('should read script file content', () => {
      const scriptPath = '/path/to/script.applescript';
      const content = readScriptFile(scriptPath);
      
      expect(fs.readFileSync).toHaveBeenCalledWith(expect.stringContaining(scriptPath), 'utf-8');
      expect(content).toBe('default script content');
    });
    
    test('should throw error when script file cannot be read', () => {
      fs.readFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });
      
      expect(() => readScriptFile('/nonexistent/script.applescript')).toThrow();
    });
  });
  
  describe('scriptFrom', () => {
    test('should create a function that processes script templates', () => {
      const scriptFn = scriptFrom('/path/to/volume.applescript');
      expect(typeof scriptFn).toBe('function');
      
      const processedScript = scriptFn({ level: 5 });
      expect(processedScript).toBe('tell application "System Events" to set volume 5');
    });
  });
});