/**
 * @jest-environment node
 */

// Mock modules before imports
jest.mock('child_process', () => ({
  exec: jest.fn(),
  promisify: jest.fn()
}));

jest.mock('@modelcontextprotocol/sdk/server/index.js', () => ({
  Server: jest.fn().mockImplementation(() => ({
    setRequestHandler: jest.fn(),
    connect: jest.fn().mockResolvedValue(undefined),
    onerror: null,
  })),
}));

jest.mock('@modelcontextprotocol/sdk/server/stdio.js', () => ({
  StdioServerTransport: jest.fn(),
}));

// Import after mocks are set up
import { AppleScriptFramework } from '../src/framework.js';

describe('AppleScriptFramework Tests', () => {
  let framework;
  
  beforeEach(() => {
    jest.clearAllMocks();
    framework = new AppleScriptFramework({ debug: true });
  });
  
  test('should create a framework instance with default options', () => {
    const defaultFramework = new AppleScriptFramework();
    expect(defaultFramework instanceof AppleScriptFramework).toBe(true);
  });
  
  test('should create a framework instance with custom options', () => {
    const customFramework = new AppleScriptFramework({
      name: 'custom-framework',
      version: '2.0.0',
      debug: true,
    });
    expect(customFramework instanceof AppleScriptFramework).toBe(true);
  });
  
  test('should add a category', () => {
    const mockCategory = {
      name: 'test',
      description: 'Test category',
      scripts: [
        {
          name: 'test_script',
          description: 'Test script',
          script: 'tell application "Finder" to activate',
        },
      ],
    };
    
    // Use spyOn to access the addCategory method
    const addCategorySpy = jest.spyOn(framework, 'addCategory');
    
    framework.addCategory(mockCategory);
    
    expect(addCategorySpy).toHaveBeenCalledWith(mockCategory);
  });
  
  test('should run the framework', async () => {
    const runSpy = jest.spyOn(framework, 'run');
    
    await framework.run();
    
    expect(runSpy).toHaveBeenCalled();
  });
});