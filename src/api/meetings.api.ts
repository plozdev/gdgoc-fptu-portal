import { request } from './client';

export interface DispatchMeetingPayload {
  title: string;
  startTime: string; // ISO 8601
  endTime: string;   // ISO 8601
  location?: string;
  meetingUrl?: string;
  description?: string;
  targetType?: 'ALL' | 'CUSTOM';
  targetDepartmentCodes?: string[];
  targetUserIds?: string[];
  autoGenerateMeet?: boolean;
}

export interface DispatchMeetingResponse {
  success: boolean;
  recipientCount: number;
  meetingUrl?: string;
  message: string;
  recipients?: { id: string; fullName: string; email: string }[];
}

export interface GenerateMeetPayload {
  title: string;
  startTime: string; // ISO 8601
  endTime: string;   // ISO 8601
  description?: string;
  attendeeEmails?: string[];
}

export interface GenerateMeetResponse {
  success: boolean;
  meetingUrl: string | null;
  message: string;
}

export const meetingsApi = {
  dispatchMeeting: (payload: DispatchMeetingPayload) =>
    request<DispatchMeetingResponse>('/api/meetings/dispatch', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  generateMeet: (payload: GenerateMeetPayload) =>
    request<GenerateMeetResponse>('/api/meetings/generate-meet', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
