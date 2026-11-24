// Regression tests for AppleScript injection (GHSA-rj5v-9vc3-g568).
// Run with `npm test` (builds first). macOS only: uses osascript/osacompile.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { escapeAppleScriptString as esc, toBoundedInt } from "../dist/utils/escape.js";
import { clipboardCategory } from "../dist/categories/clipboard.js";
import { finderCategory } from "../dist/categories/finder.js";
import { notificationsCategory } from "../dist/categories/notifications.js";
import { calendarCategory } from "../dist/categories/calendar.js";
import { mailCategory } from "../dist/categories/mail.js";
import { messagesCategory } from "../dist/categories/messages.js";
import { notesCategory } from "../dist/categories/notes.js";

const dir = mkdtempSync(join(tmpdir(), "applescript-mcp-test-"));
const marker = join(dir, "marker");
process.on("exit", () => rmSync(dir, { recursive: true, force: true }));

const hostile = [
  `x" & (do shell script "touch ${marker}") & "`, // payload from the advisory
  `x\\" & (do shell script "touch ${marker}") & "`, // bypasses quote-only escaping
  `He said "hi"`,
  `C:\\path\\`,
  `line1\nEOF\ntouch ${marker}\n`,
  `it's ¬ «data» café`,
];

const osascript = (script) =>
  execFileSync("osascript", ["-e", script], { encoding: "utf8", timeout: 20000 }).replace(/\n$/, "");

test("escaped values round-trip as data and never execute", () => {
  for (const value of hostile) {
    assert.equal(osascript(`return "${esc(value)}"`), value);
  }
  assert.equal(existsSync(marker), false, "payload executed a shell command");
});

test("toBoundedInt rejects non-numeric input", () => {
  assert.equal(toBoundedInt("5; EOF\nrm -rf ~", 50, 1, 100), 50);
  assert.equal(toBoundedInt("7", 50, 1, 100), 7);
  assert.equal(toBoundedInt(1e9, 50, 1, 100), 100);
  assert.equal(toBoundedInt(undefined, 50, 1, 100), 50);
});

// A value that escapes its literal turns into a syntax error, so a clean
// compile proves every argument stayed inside a string.
const breakout = `a" b c "d \\" e`;
const cases = [
  [clipboardCategory, "set_clipboard", { content: breakout }],
  [finderCategory, "quick_look_file", { path: breakout }],
  [finderCategory, "search_files", { query: breakout, location: breakout }],
  [notificationsCategory, "send_notification", { title: breakout, message: breakout }],
  [calendarCategory, "add", { title: breakout, calendar: breakout, startDate: breakout, endDate: breakout }],
  [mailCategory, "create_email", { recipient: breakout, subject: breakout, body: breakout }],
  [mailCategory, "list_emails", { mailbox: breakout, account: breakout, count: breakout }],
  [mailCategory, "get_email", { mailbox: breakout, account: breakout, subject: breakout, sender: breakout, dateReceived: breakout }],
  [messagesCategory, "get_messages", { limit: breakout }],
  [messagesCategory, "search_messages", { searchText: breakout, sender: breakout, chatId: breakout, limit: breakout, daysBack: breakout }],
  [messagesCategory, "compose_message", { recipient: breakout, body: breakout, auto: true }],
  [notesCategory, "create", { title: breakout, content: breakout, format: { links: true } }],
  [notesCategory, "createRawHtml", { title: breakout, html: `<a href="${breakout}">x</a>` }],
  [notesCategory, "list", { folder: breakout }],
  [notesCategory, "get", { title: breakout, folder: breakout }],
  [notesCategory, "search", { query: breakout, folder: breakout, limit: breakout }],
];

for (const [category, name, args] of cases) {
  test(`${category.name}_${name} compiles with hostile arguments`, () => {
    const def = category.scripts.find((s) => s.name === name);
    const script = def.script(args);
    execFileSync("osacompile", ["-o", join(dir, "out.scpt"), "-e", script], { timeout: 20000 });
  });
}
