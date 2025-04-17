import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Gets the directory name for the current ES module
 * @param importMetaUrl - The import.meta.url of the calling module
 * @returns The directory path of the calling module
 */
export function getDirname(importMetaUrl: string): string {
  const __filename = fileURLToPath(importMetaUrl);
  return path.dirname(__filename);
}

/**
 * Reads an AppleScript file and returns its contents as a string
 * @param scriptPath - Path to the AppleScript file
 * @returns The contents of the AppleScript file as a string
 */
export function readScriptFile(scriptPath: string): string {
  try {
    return fs.readFileSync(path.resolve(scriptPath), 'utf-8').trim();
  } catch (error) {
    console.error(`Error reading script file: ${scriptPath}`, error);
    throw new Error(`Failed to read script file: ${scriptPath}`);
  }
}

/**
 * Creates a function that processes an AppleScript template with arguments
 * @param scriptContent - The AppleScript template content
 * @param args - Arguments to replace in the template
 * @returns The processed script with arguments inserted
 */
export function processScriptTemplate(scriptContent: string, args: Record<string, any>): string {
  let processedScript = scriptContent;
  
  if (args) {
    Object.entries(args).forEach(([key, value]) => {
      // Create a regex that matches ${key} in the script
      const placeholder = new RegExp(`\\$\\{${key}\\}`, 'g');
      
      // Replace all occurrences with the string value
      processedScript = processedScript.replace(
        placeholder, 
        String(value).replace(/'/g, "'\"'\"'") // Escape single quotes for AppleScript
      );
    });
  }
  
  return processedScript;
}

/**
 * Creates a function that reads an AppleScript file and processes it with arguments
 * @param scriptPath - Path to the AppleScript file
 * @returns A function that takes arguments and returns the processed script
 */
export function scriptFrom(scriptPath: string): (args: Record<string, any>) => string {
  return (args: Record<string, any>) => {
    const scriptTemplate = readScriptFile(scriptPath);
    return processScriptTemplate(scriptTemplate, args);
  };
}