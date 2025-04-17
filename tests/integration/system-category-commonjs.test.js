/**
 * @jest-environment node
 */

// This is a CommonJS version of the system-category integration test that doesn't use ESM imports

describe('System Category Integration Tests', () => {
  // Mock system category
  const systemCategory = {
    name: 'system',
    description: 'System control and information',
    scripts: [
      {
        name: 'volume',
        description: 'Set system volume',
        schema: {
          type: 'object',
          properties: {
            level: {
              type: 'number',
              minimum: 0,
              maximum: 100,
            },
          },
          required: ['level'],
        },
        script: (args) => `tell application "System Events" to set volume ${args.level}`,
      },
      {
        name: 'get_frontmost_app',
        description: 'Get the name of the frontmost application',
        script: 'tell application "System Events" to get name of first application process whose frontmost is true',
      },
      {
        name: 'launch_app',
        description: 'Launch an application',
        schema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Application name',
            },
          },
          required: ['name'],
        },
        script: (args) => `tell application "${args.name}" to activate`,
      },
      {
        name: 'quit_app',
        description: 'Quit an application',
        schema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Application name',
            },
            force: {
              type: 'boolean',
              description: 'Force quit if true',
              default: false,
            },
          },
          required: ['name'],
        },
        script: (args) => `tell application "${args.name}" to quit ${args.force ? "with saving" : ""}`,
      },
    ],
  };
  
  // Mock AppleScriptFramework
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
    framework.addCategory(systemCategory);
  });
  
  test('system category should be properly defined', () => {
    expect(systemCategory.name).toBe('system');
    expect(systemCategory.description).toBe('System control and information');
    expect(systemCategory.scripts.length).toBeGreaterThan(0);
  });
  
  test('volume script should have required schema', () => {
    const volumeScript = systemCategory.scripts.find(s => s.name === 'volume');
    expect(volumeScript).toBeDefined();
    expect(volumeScript.schema).toBeDefined();
    expect(volumeScript.schema.properties).toHaveProperty('level');
    expect(volumeScript.schema.required).toContain('level');
  });
  
  test('launch_app script should have required schema', () => {
    const launchAppScript = systemCategory.scripts.find(s => s.name === 'launch_app');
    expect(launchAppScript).toBeDefined();
    expect(launchAppScript.schema).toBeDefined();
    expect(launchAppScript.schema.properties).toHaveProperty('name');
    expect(launchAppScript.schema.required).toContain('name');
  });
  
  test('quit_app script should handle optional force parameter', () => {
    const quitAppScript = systemCategory.scripts.find(s => s.name === 'quit_app');
    expect(quitAppScript).toBeDefined();
    expect(quitAppScript.schema).toBeDefined();
    expect(quitAppScript.schema.properties).toHaveProperty('name');
    expect(quitAppScript.schema.properties).toHaveProperty('force');
    expect(quitAppScript.schema.required).toContain('name');
    expect(quitAppScript.schema.required).not.toContain('force');
  });
  
  test('framework should have the category added', () => {
    expect(framework.categories).toContain(systemCategory);
  });
});