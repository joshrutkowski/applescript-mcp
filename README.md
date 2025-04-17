# AppleScript MCP Framework

A framework for executing AppleScript commands through the Model Context Protocol.

## Installation

```bash
npm install
```

## Building

```bash
npm run build
```

## Running

```bash
npm start
```

## Development

```bash
npm run dev
```

## Testing

Run all tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## Testing Structure

The testing suite is organized as follows:

### Unit Tests

- **Categories**: Tests for category structure and validation (`tests/categories/`)
- **Scripts**: Tests for script loading and execution (`tests/scripts/`)
- **Utils**: Tests for utility functions (`tests/utils/`)
- **Framework**: Tests for the main framework functionality (`tests/framework-commonjs.test.js`)
- **Mocks**: Tests for mock AppleScript files (`tests/mocks/`)

### Integration Tests

- Tests that verify the integration between categories, scripts, and the framework (`tests/integration/`)
- Error handling tests that verify the framework handles errors correctly

### Simple Tests

- Basic tests that verify functionality without complex mocking (`tests/simple.test.js`)

## Adding New Tests

### Testing Categories

To test a new category:

1. Create a test file in `tests/categories/`
2. Verify the category structure and properties
3. Ensure all scripts in the category have the required properties

Example:

```javascript
describe('My New Category Tests', () => {
  const myNewCategory = {
    name: 'myNew',
    description: 'My new category',
    scripts: [
      // scripts here
    ]
  };

  test('Category should have required properties', () => {
    expect(myNewCategory).toHaveProperty('name');
    expect(myNewCategory).toHaveProperty('description');
    expect(myNewCategory).toHaveProperty('scripts');
  });
  
  // Additional tests...
});
```

### Testing Scripts

To test a new script:

1. Create a test file in `tests/scripts/` or add to an existing test file
2. Test script loading, parameter processing, and execution

Example:

```javascript
test('should process my new script with arguments', () => {
  const template = 'tell application "${appName}" to ${action}';
  const args = { appName: 'Finder', action: 'activate' };
  
  const result = processScriptTemplate(template, args);
  
  expect(result).toBe('tell application "Finder" to activate');
});
```

### Testing Error Handling

To test error handling:

1. Create a test file in `tests/integration/` or add to an existing test file
2. Test how the framework handles various error conditions

Example:

```javascript
test('should handle missing required parameters', async () => {
  await expect(framework.handleToolCall('test', 'param_script', {}))
    .rejects
    .toThrow('Missing required parameter: required_param');
});
```

## License

MIT