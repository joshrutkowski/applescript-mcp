/**
 * @jest-environment node
 */

// Mock modules before imports
jest.mock('child_process', () => {
  return {
    exec: jest.fn((cmd, cb) => {
      if (typeof cb === 'function') {
        if (cmd.includes('get_frontmost_app')) {
          cb(null, { stdout: 'Finder', stderr: '' });
        } else if (cmd.includes('volume')) {
          cb(null, { stdout: 'Volume set to 50', stderr: '' });
        } else if (cmd.includes('get_battery_status')) {
          cb(null, { stdout: '{"level": 80, "charging": true}', stderr: '' });
        } else {
          cb(null, { stdout: 'Success', stderr: '' });
        }
      }
      return {};
    }),
    promisify: jest.fn().mockImplementation(() => {
      return jest.fn().mockResolvedValue({ stdout: 'Success', stderr: '' });
    })
  };
});

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
import { systemCategory } from '../../src/categories/system/index.js';
import { AppleScriptFramework } from '../../src/framework.js';

describe('System Category Integration Tests', () => {
  let framework;
  
  beforeEach(() => {
    jest.clearAllMocks();
    framework = new AppleScriptFramework({ debug: true });
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
});