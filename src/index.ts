import { calendarCategory } from "./categories/calendar/index.js";
import { clipboardCategory } from "./categories/clipboard/index.js";
import { finderCategory } from "./categories/finder/index.js";
import { itermCategory } from "./categories/iterm/index.js";
import { mailCategory } from "./categories/mail/index.js";
import { messagesCategory } from "./categories/messages/index.js";
import { notificationsCategory } from "./categories/notifications/index.js";
import { pagesCategory } from "./categories/pages/index.js";
import { shortcutsCategory } from "./categories/shortcuts/index.js";
import { systemCategory } from "./categories/system/index.js";
import { AppleScriptFramework } from "./framework.js";


const server = new AppleScriptFramework({
  name: "applescript-server",
  version: "1.1.0",
  debug: true,
});

// Add all categories
server.addCategory(systemCategory);
server.addCategory(calendarCategory);
server.addCategory(finderCategory);
server.addCategory(clipboardCategory);
server.addCategory(notificationsCategory);
server.addCategory(itermCategory);
server.addCategory(mailCategory);
server.addCategory(pagesCategory);
server.addCategory(shortcutsCategory);
server.addCategory(messagesCategory);

// Start the server
server.run().catch(console.error);