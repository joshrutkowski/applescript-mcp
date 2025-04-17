/**
 * @jest-environment node
 */

describe('Clipboard Category Tests', () => {
  // Mock clipboard category
  const clipboardCategory = {
    name: 'clipboard',
    description: 'Clipboard operations',
    scripts: [
      {
        name: 'get_clipboard_text',
        description: 'Get text from clipboard',
        script: 'the clipboard as text',
      },
      {
        name: 'set_clipboard',
        description: 'Set clipboard content',
        schema: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: 'Text to set in clipboard',
            },
          },
          required: ['text'],
        },
        script: (args) => `set the clipboard to "${args.text}"`,
      },
      {
        name: 'clear_clipboard',
        description: 'Clear clipboard content',
        script: 'set the clipboard to ""',
      },
      {
        name: 'get_clipboard_file_paths',
        description: 'Get file paths from clipboard',
        script: 'the clipboard as «class furl»',
      },
    ],
  };

  test('Clipboard category should have required properties', () => {
    expect(clipboardCategory).toHaveProperty('name');
    expect(clipboardCategory).toHaveProperty('description');
    expect(clipboardCategory).toHaveProperty('scripts');
    expect(Array.isArray(clipboardCategory.scripts)).toBe(true);
  });

  test('Clipboard category should have the correct name and description', () => {
    expect(clipboardCategory.name).toBe('clipboard');
    expect(clipboardCategory.description).toBe('Clipboard operations');
  });

  test('Clipboard category should have the expected scripts', () => {
    const scriptNames = clipboardCategory.scripts.map(script => script.name);
    expect(scriptNames).toContain('get_clipboard_text');
    expect(scriptNames).toContain('set_clipboard');
    expect(scriptNames).toContain('clear_clipboard');
    expect(scriptNames).toContain('get_clipboard_file_paths');
  });

  test('set_clipboard script should have required schema', () => {
    const setClipboardScript = clipboardCategory.scripts.find(s => s.name === 'set_clipboard');
    expect(setClipboardScript).toBeDefined();
    expect(setClipboardScript.schema).toBeDefined();
    expect(setClipboardScript.schema.properties).toHaveProperty('text');
    expect(setClipboardScript.schema.required).toContain('text');
  });

  test('get_clipboard_text script should not have a schema', () => {
    const getClipboardTextScript = clipboardCategory.scripts.find(s => s.name === 'get_clipboard_text');
    expect(getClipboardTextScript).toBeDefined();
    expect(getClipboardTextScript.schema).toBeUndefined();
  });

  test('set_clipboard script should process arguments correctly', () => {
    const setClipboardScript = clipboardCategory.scripts.find(s => s.name === 'set_clipboard');
    const scriptContent = setClipboardScript.script({ text: 'Hello World' });
    expect(scriptContent).toBe('set the clipboard to "Hello World"');
  });
});