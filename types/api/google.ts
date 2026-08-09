// Google Calendar integration types

export interface GoogleCalendarStatusData {
  connected: boolean;
  googleEmail?: string;
  scopes?: string[];
}

export interface GoogleCalendarAuthUrlData {
  authUrl: string;
}
