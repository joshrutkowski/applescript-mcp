/**
 * @jest-environment node
 */
import { systemCategory } from '../../src/categories/system/index.js';

describe('Category Structure Tests', () => {
  test('Category should have required properties', () => {
    const category = systemCategory;
    
    expect(category).toHaveProperty('name');
    expect(category).toHaveProperty('description');
    expect(category).toHaveProperty('scripts');
    expect(Array.isArray(category.scripts)).toBe(true);
  });

  test('Category name should be a non-empty string', () => {
    const category = systemCategory;
    
    expect(typeof category.name).toBe('string');
    expect(category.name.length).toBeGreaterThan(0);
  });

  test('Category description should be a non-empty string', () => {
    const category = systemCategory;
    
    expect(typeof category.description).toBe('string');
    expect(category.description.length).toBeGreaterThan(0);
  });

  test('Category should have at least one script', () => {
    const category = systemCategory;
    
    expect(category.scripts.length).toBeGreaterThan(0);
  });

  test('Each script should have required properties', () => {
    const category = systemCategory;
    
    category.scripts.forEach(script => {
      expect(script).toHaveProperty('name');
      expect(script).toHaveProperty('description');
      expect(script).toHaveProperty('script');
      
      expect(typeof script.name).toBe('string');
      expect(script.name.length).toBeGreaterThan(0);
      
      expect(typeof script.description).toBe('string');
      expect(script.description.length).toBeGreaterThan(0);
      
      // Script can be either a string or a function
      expect(['string', 'function']).toContain(typeof script.script);
    });
  });

  test('Scripts with schema should have valid schema structure', () => {
    const category = systemCategory;
    
    category.scripts.forEach(script => {
      if (script.schema) {
        expect(script.schema).toHaveProperty('type');
        expect(script.schema.type).toBe('object');
        expect(script.schema).toHaveProperty('properties');
        expect(typeof script.schema.properties).toBe('object');
      }
    });
  });
});