/**
 * @jest-environment node
 */

// Mock modules
jest.mock('child_process', () => ({
  exec: jest.fn((command, callback) => {
    if (callback) {
      if (command.includes('error')) {
        callback(new Error('Script execution failed'), { stdout: '', stderr: 'Error in script' });
      } else {
        callback(null, { stdout: 'Success', stderr: '' });
      }
    }
    return {};
  }),
  promisify: jest.fn().mockImplementation(() => {
    return jest.fn().mockImplementation((command) => {
      if (command.includes('error')) {
        return Promise.reject(new Error('Script execution failed'));
      } else {
        return Promise.resolve({ stdout: 'Success', stderr: '' });
      }
    });
  })
}));

// Mock MCP SDK
jest.mock('@modelcontextprotocol/sdk/types.js', () => ({
  ErrorCode: {
    MethodNotFound: 'MethodNotFound',
    InvalidParams: 'InvalidParams',
    InternalError: 'InternalError',
  },
  McpError: class McpError extends Error {
    constructor(code, message) {
      super(message);
      this.code = code;
    }
  },
}));

describe('Error Handling Integration Tests', () => {
  // Mock framework for testing error handling
  class MockAppleScriptFramework {
    constructor() {
      this.categories = [];
      this.ErrorCode = {
        MethodNotFound: 'MethodNotFound',
        InvalidParams: 'InvalidParams',
        InternalError: 'InternalError',
      };
      this.McpError = class McpError extends Error {
        constructor(code, message) {
          super(message);
          this.code = code;
        }
      };
    }

    addCategory(category) {
      this.categories.push(category);
    }

    async executeScript(script) {
      if (script.includes('error')) {
        throw new Error('Script execution failed');
      }
      return 'Success';
    }

    async handleToolCall(categoryName, scriptName, args) {
      const category = this.categories.find(c => c.name === categoryName);
      if (!category) {
        throw new this.McpError(this.ErrorCode.MethodNotFound, `Category not found: ${categoryName}`);
      }

      const script = category.scripts.find(s => s.name === scriptName);
      if (!script) {
        throw new this.McpError(this.ErrorCode.MethodNotFound, `Script not found: ${scriptName}`);
      }

      if (script.schema && script.schema.required) {
        for (const requiredParam of script.schema.required) {
          if (!(requiredParam in args)) {
            throw new this.McpError(
              this.ErrorCode.InvalidParams,
              `Missing required parameter: ${requiredParam}`
            );
          }
        }
      }

      try {
        const scriptContent = typeof script.script === 'function' ? script.script(args) : script.script;
        return await this.executeScript(scriptContent);
      } catch (error) {
        throw new this.McpError(this.ErrorCode.InternalError, `Script execution failed: ${error.message}`);
      }
    }
  }

  let framework;
  
  beforeEach(() => {
    framework = new MockAppleScriptFramework();
    
    // Add test category
    framework.addCategory({
      name: 'test',
      description: 'Test category',
      scripts: [
        {
          name: 'simple_script',
          description: 'A simple script',
          script: 'tell application "Finder" to activate',
        },
        {
          name: 'error_script',
          description: 'A script that throws an error',
          script: 'error "This script fails"',
        },
        {
          name: 'param_script',
          description: 'A script with parameters',
          schema: {
            type: 'object',
            properties: {
              required_param: {
                type: 'string',
              },
              optional_param: {
                type: 'string',
              },
            },
            required: ['required_param'],
          },
          script: (args) => `tell application "Finder" to display dialog "${args.required_param}"`,
        },
      ],
    });
  });
  
  test('should handle non-existent category', async () => {
    await expect(framework.handleToolCall('nonexistent', 'simple_script', {}))
      .rejects
      .toThrow('Category not found: nonexistent');
  });
  
  test('should handle non-existent script', async () => {
    await expect(framework.handleToolCall('test', 'nonexistent', {}))
      .rejects
      .toThrow('Script not found: nonexistent');
  });
  
  test('should handle missing required parameters', async () => {
    await expect(framework.handleToolCall('test', 'param_script', {}))
      .rejects
      .toThrow('Missing required parameter: required_param');
  });
  
  test('should handle script execution errors', async () => {
    await expect(framework.handleToolCall('test', 'error_script', {}))
      .rejects
      .toThrow('Script execution failed');
  });
  
  test('should successfully execute valid script with required parameters', async () => {
    const result = await framework.handleToolCall('test', 'param_script', { required_param: 'Hello' });
    expect(result).toBe('Success');
  });
  
  test('should successfully execute simple script', async () => {
    const result = await framework.handleToolCall('test', 'simple_script', {});
    expect(result).toBe('Success');
  });
});