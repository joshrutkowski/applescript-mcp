import { ReminderProperties, SearchOptions } from './types.js';

export function escapeAppleScriptString(str: string): string {
  return str.replace(/"/g, '\\"');
}

export function formatReminderProperties(props: ReminderProperties): string {
  const properties = [
    `name: "${escapeAppleScriptString(props.title)}"`,
  ];

  if (props.notes) {
    properties.push(`body: "${escapeAppleScriptString(props.notes)}"`);
  }
  if (props.dueDate) {
    properties.push(`due date: date "${props.dueDate}"`);
  }
  if (props.priority !== undefined) {
    properties.push(`priority: ${props.priority}`);
  }
  if (props.url) {
    properties.push(`url: "${escapeAppleScriptString(props.url)}"`);
  }
  if (props.remindDate) {
    properties.push(`remind me date: date "${props.remindDate}"`);
  }

  return properties.join(', ');
}

export function buildSearchCriteria(options: SearchOptions): string {
  const criteria: string[] = [];

  if (options.includeCompleted === false) {
    criteria.push('completed is false');
  }
  if (options.dueBefore) {
    criteria.push(`due date ≤ date "${options.dueBefore}"`);
  }
  if (options.dueAfter) {
    criteria.push(`due date ≥ date "${options.dueAfter}"`);
  }
  if (options.hasAttachments !== undefined) {
    criteria.push(`size of attachments ${options.hasAttachments ? '>' : '='} 0`);
  }
  if (options.hasDueDate !== undefined) {
    criteria.push(`due date is ${options.hasDueDate ? 'not ' : ''}missing value`);
  }
  if (options.hasReminder !== undefined) {
    criteria.push(`remind me date is ${options.hasReminder ? 'not ' : ''}missing value`);
  }
  if (options.isOverdue) {
    criteria.push('due date < (current date) and completed is false');
  }

  return criteria.join(' and ');
}
