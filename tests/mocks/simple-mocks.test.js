/**
 * @jest-environment node
 */

describe('Simple Mocks Tests', () => {
  // Define a simple mock object for testing
  const mockScripts = {
    'test1.applescript': 'tell application "Test" to do something',
    'test2.applescript': 'tell application "Test" to do something else'
  };

  // Define a simple function to get a mock script
  function getMockScript(name) {
    return mockScripts[name] || 'default script';
  }

  test('mockScripts should have test1.applescript', () => {
    expect(Object.keys(mockScripts)).toContain('test1.applescript');
  });

  test('mockScripts should have test2.applescript', () => {
    expect(Object.keys(mockScripts)).toContain('test2.applescript');
  });

  test('getMockScript should return the correct script', () => {
    expect(getMockScript('test1.applescript')).toBe('tell application "Test" to do something');
  });

  test('getMockScript should return default for unknown scripts', () => {
    expect(getMockScript('unknown.applescript')).toBe('default script');
  });
});