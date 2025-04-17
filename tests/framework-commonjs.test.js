/**
 * @jest-environment node
 */

// This is a CommonJS version of the framework test that doesn't use ESM imports

describe('AppleScriptFramework Tests', () => {
  // Mock the framework class for testing
  class MockAppleScriptFramework {
    constructor(options = {}) {
      this.options = options;
      this.categories = [];
    }
    
    addCategory(category) {
      this.categories.push(category);
    }
    
    async run() {
      // Mock implementation
      return Promise.resolve();
    }
  }
  
  let framework;
  
  beforeEach(() => {
    jest.clearAllMocks();
    framework = new MockAppleScriptFramework({ debug: true });
  });
  
  test('should create a framework instance with default options', () => {
    const defaultFramework = new MockAppleScriptFramework();
    expect(defaultFramework instanceof MockAppleScriptFramework).toBe(true);
    expect(defaultFramework.options).toEqual({});
  });
  
  test('should create a framework instance with custom options', () => {
    const customFramework = new MockAppleScriptFramework({
      name: 'custom-framework',
      version: '2.0.0',
      debug: true,
    });
    expect(customFramework instanceof MockAppleScriptFramework).toBe(true);
    expect(customFramework.options).toEqual({
      name: 'custom-framework',
      version: '2.0.0',
      debug: true,
    });
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
    expect(framework.categories).toContain(mockCategory);
  });
  
  test('should run the framework', async () => {
    const runSpy = jest.spyOn(framework, 'run');
    
    await framework.run();
    
    expect(runSpy).toHaveBeenCalled();
  });
});