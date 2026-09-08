// Google Calendar integration types

export interface GoogleCalendarStatusData {
  connected: boolean;
  googleEmail?: string;
  scopes?: string[];
}

export interface GoogleCalendarAuthUrlData {
  authUrl: string;
}

export interface GoogleGmailStatusData {
  connected: boolean;
  googleEmail?: string;
}

export interface GoogleGmailAuthUrlData {
  authUrl: string;
}

export interface GmailAttachment {
  filename: string;
  size: number;
  mimeType?: string;
}

export interface GmailMessageSummary {
  id: string;
  from: string;
  date: string;
  subject: string;
  snippet: string;
  hasAttachment?: boolean;
  threadId?: string;
  to?: string;
  labelIds?: string[];
}

export interface GmailMessageDetails {
  id: string;
  from: string;
  date: string;
  subject: string;
  body?: string;
  htmlBody?: string;
  attachments?: GmailAttachment[];
}

export interface GoogleGmailMessagesResult {
  messages: GmailMessageSummary[];
  nextPageToken?: string;
  resultSizeEstimate?: number;
}
