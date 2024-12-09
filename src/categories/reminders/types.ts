export interface ReminderProperties {
  title: string;
  notes?: string;
  dueDate?: string;
  list?: string;
  priority?: number;
  url?: string;
  tags?: string[];
  location?: string;
  remindDate?: string;
}

export interface ListProperties {
  name: string;
  color?: string;
}

export interface SearchOptions {
  list?: string;
  includeCompleted?: boolean;
  dueBefore?: string;
  dueAfter?: string;
  hasAttachments?: boolean;
  hasDueDate?: boolean;
  hasReminder?: boolean;
  isOverdue?: boolean;
}
