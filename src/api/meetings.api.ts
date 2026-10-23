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
}

export interface DispatchMeetingResponse {
  success: boolean;
  recipientCount: number;
  message: string;
  recipients?: { id: string; fullName: string; email: string }[];
}

export const meetingsApi = {
  dispatchMeeting: (payload: DispatchMeetingPayload) =>
    request<DispatchMeetingResponse>('/api/meetings/dispatch', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
