import { ScriptCategory } from "../types/index.js";
import { escapeAppleScriptString as esc, toBoundedInt } from "../utils/escape.js";

/**
 * Generates HTML content for a note based on user input
 * @param args The arguments containing content specifications
 * @returns HTML string for the note
 */
function generateNoteHtml(args: any): string {
  const {
    title = "New Note",
    content = "",
    format = {
      headings: false,
      bold: false,
      italic: false,
      underline: false,
      links: false,
      lists: false
    }
  } = args;

  // Process content based on format options
  let processedContent = content;
  
  // If content contains markdown-like syntax and formatting is enabled, convert it
  if (format.headings) {
    // Convert # Heading to <h1>Heading</h1>, ## Heading to <h2>Heading</h2>, etc.
    processedContent = processedContent.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    processedContent = processedContent.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    processedContent = processedContent.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  }
  
  if (format.bold) {
    // Convert **text** or __text__ to <b>text</b>
    processedContent = processedContent.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
    processedContent = processedContent.replace(/__(.+?)__/g, '<b>$1</b>');
  }
  
  if (format.italic) {
    // Convert *text* or _text_ to <i>text</i>
    processedContent = processedContent.replace(/\*(.+?)\*/g, '<i>$1</i>');
    processedContent = processedContent.replace(/_(.+?)_/g, '<i>$1</i>');
  }
  
  if (format.underline) {
    // Convert ~text~ to <u>text</u>
    processedContent = processedContent.replace(/~(.+?)~/g, '<u>$1</u>');
  }
  
  if (format.links) {
    // Convert [text](url) to <a href="url">text</a>
    processedContent = processedContent.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
  }
  
  if (format.lists) {
    // Handle unordered lists
    // Look for lines starting with - or * and convert to <li> items
    const listItems = processedContent.match(/^[*-] (.+)$/gm);
    if (listItems) {
      let listHtml = '<ul>';
      for (const item of listItems) {
        const content = item.replace(/^[*-] /, '');
        listHtml += `<li>${content}</li>`;
      }
      listHtml += '</ul>';
      
      // Replace the original list items with the HTML list
      for (const item of listItems) {
        processedContent = processedContent.replace(item, '');
      }
      processedContent = processedContent.replace(/\n+/g, '\n') + listHtml;
    }
    
    // Handle ordered lists (1. Item)
    const orderedItems = processedContent.match(/^\d+\. (.+)$/gm);
    if (orderedItems) {
      let listHtml = '<ol>';
      for (const item of orderedItems) {
        const content = item.replace(/^\d+\. /, '');
        listHtml += `<li>${content}</li>`;
      }
      listHtml += '</ol>';
      
      // Replace the original list items with the HTML list
      for (const item of orderedItems) {
        processedContent = processedContent.replace(item, '');
      }
      processedContent = processedContent.replace(/\n+/g, '\n') + listHtml;
    }
  }
  
  // Wrap paragraphs in <p> tags if they aren't already wrapped in HTML tags
  const paragraphs = processedContent.split('\n\n');
  processedContent = paragraphs
    .map((p: string) => {
      if (p.trim() && !p.trim().startsWith('<')) {
        return `<p>${p}</p>`;
      }
      return p;
    })
    .join('\n');
  
  return processedContent;
}

export const notesCategory: ScriptCategory = {
  name: "notes",
  description: "Apple Notes operations",
  scripts: [
    {
      name: "create",
      description: "Create a new note with optional formatting",
      script: (args) => {
        const { title = "New Note", content = "", format = {} } = args;
        const htmlContent = generateNoteHtml(args);
        
        return `
          tell application "Notes"
            make new note with properties {body:"${esc(htmlContent)}", name:"${esc(title)}"}
          end tell
        `;
      },
      schema: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Title of the note"
          },
          content: {
            type: "string",
            description: "Content of the note, can include markdown-like syntax for formatting"
          },
          format: {
            type: "object",
            description: "Formatting options for the note content",
            properties: {
              headings: {
                type: "boolean",
                description: "Enable heading formatting (# Heading)"
              },
              bold: {
                type: "boolean",
                description: "Enable bold formatting (**text**)"
              },
              italic: {
                type: "boolean",
                description: "Enable italic formatting (*text*)"
              },
              underline: {
                type: "boolean",
                description: "Enable underline formatting (~text~)"
              },
              links: {
                type: "boolean",
                description: "Enable link formatting ([text](url))"
              },
              lists: {
                type: "boolean",
                description: "Enable list formatting (- item or 1. item)"
              }
            }
          }
        },
        required: ["title", "content"]
      }
    },
    {
      name: "createRawHtml",
      description: "Create a new note with direct HTML content",
      script: (args) => {
        const { title = "New Note", html = "" } = args;
        
        return `
          tell application "Notes"
            make new note with properties {body:"${esc(html)}", name:"${esc(title)}"}
          end tell
        `;
      },
      schema: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Title of the note"
          },
          html: {
            type: "string",
            description: "Raw HTML content for the note"
          }
        },
        required: ["title", "html"]
      }
    },
    {
      name: "list",
      description: "List all notes or notes in a specific folder",
      script: (args) => {
        const { folder = "" } = args;
        
        if (folder) {
          return `
            tell application "Notes"
              set folderList to folders whose name is "${esc(folder)}"
              if length of folderList > 0 then
                set targetFolder to item 1 of folderList
                set noteNames to name of notes of targetFolder
                return noteNames as string
              else
                return "Folder not found: ${esc(folder)}"
              end if
            end tell
          `;
        } else {
          return `
            tell application "Notes"
              set noteNames to name of notes
              return noteNames as string
            end tell
          `;
        }
      },
      schema: {
        type: "object",
        properties: {
          folder: {
            type: "string",
            description: "Optional folder name to list notes from"
          }
        }
      }
    },
    {
      name: "get",
      description: "Get a specific note by title",
      script: (args) => {
        const { title, folder = "" } = args;
        
        if (folder) {
          return `
            tell application "Notes"
              set folderList to folders whose name is "${esc(folder)}"
              if length of folderList > 0 then
                set targetFolder to item 1 of folderList
                set matchingNotes to notes of targetFolder whose name is "${esc(title)}"
                if length of matchingNotes > 0 then
                  set n to item 1 of matchingNotes
                  set noteTitle to name of n
                  set noteBody to body of n
                  set noteCreationDate to creation date of n
                  set noteModDate to modification date of n
                  
                  set jsonResult to "{\\"title\\": \\""
                  set jsonResult to jsonResult & noteTitle & "\\""
                  set jsonResult to jsonResult & ", \\"body\\": \\"" & noteBody & "\\""
                  set jsonResult to jsonResult & ", \\"creationDate\\": \\"" & noteCreationDate & "\\""
                  set jsonResult to jsonResult & ", \\"modificationDate\\": \\"" & noteModDate & "\\"}"
                  
                  return jsonResult
                else
                  return "Note not found: ${esc(title)}"
                end if
              else
                return "Folder not found: ${esc(folder)}"
              end if
            end tell
          `;
        } else {
          return `
            tell application "Notes"
              set matchingNotes to notes whose name is "${esc(title)}"
              if length of matchingNotes > 0 then
                set n to item 1 of matchingNotes
                set noteTitle to name of n
                set noteBody to body of n
                set noteCreationDate to creation date of n
                set noteModDate to modification date of n
                
                set jsonResult to "{\\"title\\": \\""
                set jsonResult to jsonResult & noteTitle & "\\""
                set jsonResult to jsonResult & ", \\"body\\": \\"" & noteBody & "\\""
                set jsonResult to jsonResult & ", \\"creationDate\\": \\"" & noteCreationDate & "\\""
                set jsonResult to jsonResult & ", \\"modificationDate\\": \\"" & noteModDate & "\\"}"
                
                return jsonResult
              else
                return "Note not found: ${esc(title)}"
              end if
            end tell
          `;
        }
      },
      schema: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Title of the note to retrieve"
          },
          folder: {
            type: "string",
            description: "Optional folder name to search in"
          }
        },
        required: ["title"]
      }
    },
    {
      name: "search",
      description: "Search for notes containing specific text",
      script: (args) => {
        const { query, folder = "", limit = 5, includeBody = true } = args;
        
        if (folder) {
          return `
            tell application "Notes"
              set folderList to folders whose name is "${esc(folder)}"
              if length of folderList > 0 then
                set targetFolder to item 1 of folderList
                set matchingNotes to {}
                set allNotes to notes of targetFolder
                repeat with n in allNotes
                  if name of n contains "${esc(query)}" or body of n contains "${esc(query)}" then
                    set end of matchingNotes to n
                  end if
                end repeat
                
                set resultCount to length of matchingNotes
                if resultCount > ${toBoundedInt(limit, 5, 1, 1000)} then set resultCount to ${toBoundedInt(limit, 5, 1, 1000)}
                
                set jsonResult to "["
                repeat with i from 1 to resultCount
                  set n to item i of matchingNotes
                  set noteTitle to name of n
                  set noteCreationDate to creation date of n
                  set noteModDate to modification date of n
                  ${includeBody ? 'set noteBody to body of n' : ''}
                  
                  set noteJson to "{\\"title\\": \\""
                  set noteJson to noteJson & noteTitle & "\\""
                  ${includeBody ? 'set noteJson to noteJson & ", \\"body\\": \\"" & noteBody & "\\""' : ''}
                  set noteJson to noteJson & ", \\"creationDate\\": \\"" & noteCreationDate & "\\""
                  set noteJson to noteJson & ", \\"modificationDate\\": \\"" & noteModDate & "\\"}"
                  
                  set jsonResult to jsonResult & noteJson
                  if i < resultCount then set jsonResult to jsonResult & ", "
                end repeat
                set jsonResult to jsonResult & "]"
                
                return jsonResult
              else
                return "Folder not found: ${esc(folder)}"
              end if
            end tell
          `;
        } else {
          return `
            tell application "Notes"
              set matchingNotes to {}
              set allNotes to notes
              repeat with n in allNotes
                if name of n contains "${esc(query)}" or body of n contains "${esc(query)}" then
                  set end of matchingNotes to n
                end if
              end repeat
              
              set resultCount to length of matchingNotes
              if resultCount > ${toBoundedInt(limit, 5, 1, 1000)} then set resultCount to ${toBoundedInt(limit, 5, 1, 1000)}
              
              set jsonResult to "["
              repeat with i from 1 to resultCount
                set n to item i of matchingNotes
                set noteTitle to name of n
                set noteCreationDate to creation date of n
                set noteModDate to modification date of n
                ${includeBody ? 'set noteBody to body of n' : ''}
                
                set noteJson to "{\\"title\\": \\""
                set noteJson to noteJson & noteTitle & "\\""
                ${includeBody ? 'set noteJson to noteJson & ", \\"body\\": \\"" & noteBody & "\\""' : ''}
                set noteJson to noteJson & ", \\"creationDate\\": \\"" & noteCreationDate & "\\""
                set noteJson to noteJson & ", \\"modificationDate\\": \\"" & noteModDate & "\\"}"
                
                set jsonResult to jsonResult & noteJson
                if i < resultCount then set jsonResult to jsonResult & ", "
              end repeat
              set jsonResult to jsonResult & "]"
              
              return jsonResult
            end tell
          `;
        }
      },
      schema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Text to search for in notes (title and body)"
          },
          folder: {
            type: "string",
            description: "Optional folder name to search in"
          },
          limit: {
            type: "number",
            description: "Maximum number of results to return (default: 5)"
          },
          includeBody: {
            type: "boolean",
            description: "Whether to include note body in results (default: true)"
          }
        },
        required: ["query"]
      }
    }
  ]
};