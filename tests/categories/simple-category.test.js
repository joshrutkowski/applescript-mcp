/**
 * @jest-environment node
 */

// A simple test for categories
describe('Simple Category Test', () => {
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

  test('Category should have required properties', () => {
    expect(mockCategory).toHaveProperty('name');
    expect(mockCategory).toHaveProperty('description');
    expect(mockCategory).toHaveProperty('scripts');
    expect(Array.isArray(mockCategory.scripts)).toBe(true);
  });

  test('Category name should be a non-empty string', () => {
    expect(typeof mockCategory.name).toBe('string');
    expect(mockCategory.name.length).toBeGreaterThan(0);
  });
});