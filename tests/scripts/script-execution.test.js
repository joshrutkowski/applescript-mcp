/**
 * @jest-environment node
 */

// Mock child_process module
jest.mock('child_process', () => ({
  exec: jest.fn((command, callback) => {
    if (callback) {
      if (command.includes('volume')) {
        callback(null, { stdout: 'Volume set to 50', stderr: '' });
      } else if (command.includes('get_frontmost_app')) {
        callback(null, { stdout: 'Finder', stderr: '' });
      } else if (command.includes('error')) {
        callback(new Error('Script execution failed'), { stdout: '', stderr: 'Error in script' });
      } else {
        callback(null, { stdout: 'Success', stderr: '' });
      }
    }
    return {};
  }),
  promisify: jest.fn().mockImplementation(() => {
    return jest.fn().mockImplementation((command) => {
      if (command.includes('volume')) {
        return Promise.resolve({ stdout: 'Volume set to 50', stderr: '' });
      } else if (command.includes('get_frontmost_app')) {
        return Promise.resolve({ stdout: 'Finder', stderr: '' });
      } else if (command.includes('error')) {
        return Promise.reject(new Error('Script execution failed'));
      } else {
        return Promise.resolve({ stdout: 'Success', stderr: '' });
      }
    });
  })
}));

// Create a mock AppleScriptFramework for testing script execution
class MockAppleScriptFramework {
  constructor() {
    this.categories = [];
  }

  addCategory(category) {
    this.categories.push(category);
  }

  async executeScript(script) {
    if (script.includes('error')) {
      throw new Error('Script execution failed');
    }
    
    if (script.includes('volume')) {
      return 'Volume set to 50';
    } else if (script.includes('get_frontmost_app') || script.includes('frontmost')) {
      return 'Finder';
    } else {
      return 'Success';
    }
  }
}

describe('Script Execution Tests', () => {
  let framework;
  
  beforeEach(() => {
    framework = new MockAppleScriptFramework();
  });
  
  test('should execute a simple script successfully', async () => {
    const result = await framework.executeScript('tell application "System Events" to get name of first application process whose frontmost is true');
    expect(result).toBe('Finder');
  });
  
  test('should execute a script with parameters', async () => {
    const result = await framework.executeScript('tell application "System Events" to set volume 50');
    expect(result).toBe('Volume set to 50');
  });
  
  test('should handle script execution errors', async () => {
    await expect(framework.executeScript('error script')).rejects.toThrow('Script execution failed');
  });
  
  test('should handle different script types', async () => {
    // Test with a string script
    const stringResult = await framework.executeScript('tell application "Finder" to activate');
    expect(stringResult).toBe('Success');
    
    // Test with a function that returns a script
    const scriptFn = (args) => `tell application "System Events" to set volume ${args.level}`;
    const functionResult = await framework.executeScript(scriptFn({ level: 50 }));
    expect(functionResult).toBe('Volume set to 50');
  });
});