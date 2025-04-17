// This file is automatically loaded by Jest before tests run
// It's used to set up the test environment

// Make sure Jest globals are available
if (typeof jest === 'undefined') {
  global.jest = {
    fn: () => {
      const mockFn = (...args) => {
        mockFn.mock.calls.push(args);
        return mockFn.mockImplementation ? mockFn.mockImplementation(...args) : undefined;
      };
      mockFn.mock = { calls: [] };
      mockFn.mockImplementation = (fn) => {
        mockFn.implementation = fn;
        return mockFn;
      };
      mockFn.mockReturnValue = (val) => {
        mockFn.mockImplementation = () => val;
        return mockFn;
      };
      mockFn.mockResolvedValue = (val) => {
        mockFn.mockImplementation = () => Promise.resolve(val);
        return mockFn;
      };
      return mockFn;
    },
    mock: (moduleName, factory) => {
      // In ESM context, we can't directly modify require.cache
      // This is a simplified mock that won't actually work in ESM
      // but will prevent errors during test setup
    },
    doMock: (moduleName, factory) => {
      // Simplified mock for ESM
    },
    clearAllMocks: () => {
      // Implementation would clear all mocks
    },
    spyOn: (obj, method) => {
      const original = obj[method];
      const mockFn = jest.fn();
      obj[method] = mockFn;
      return {
        mockImplementation: (fn) => {
          mockFn.mockImplementation = fn;
          return mockFn;
        },
        mockReturnValue: (val) => {
          mockFn.mockImplementation = () => val;
          return mockFn;
        },
      };
    },
  };
}

// Make sure expect is defined
if (typeof expect === 'undefined') {
  global.expect = (actual) => ({
    toBe: (expected) => {
      if (actual !== expected) {
        throw new Error(`Expected ${expected} but got ${actual}`);
      }
    },
    toEqual: (expected) => {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${expected} but got ${actual}`);
      }
    },
    // Add other matchers as needed
  });
}