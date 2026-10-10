import { api } from './client';

export interface QueryEventsParams {
  tenureId?: string;
  isPublic?: boolean;
  type?: string;
  status?: string;
  search?: string;
}

export interface CreateEventDto {
  title: string;
  description?: string;
  type: string;
  location: string;
  startTime: string;
  endTime: string;
  attendeeGems?: number;
  organizerGems?: number;
  status?: string;
  isPublic?: boolean;
  bannerImageUrl?: string;
  registrationUrl?: string;
  tenureId: string;
}

export interface AddAttendeeDto {
  userId?: string;
  guestName?: string;
  guestMssv?: string;
  guestEmail?: string;
  guestDepartment?: string;
  checkinMethod?: string;
  isVerified?: boolean;
  notes?: string;
}

export const eventsApi = {
  getEvents: (params?: QueryEventsParams) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, String(val));
        }
      });
    }
    const queryString = query.toString();
    return api.get(`/api/events${queryString ? `?${queryString}` : ''}`);
  },

  getEvent: (id: string) => api.get(`/api/events/${id}`),

  createEvent: (dto: CreateEventDto) => api.post('/api/events', dto),

  updateEvent: (id: string, dto: Partial<CreateEventDto>) =>
    api.put(`/api/events/${id}`, dto),

  deleteEvent: (id: string) => api.delete(`/api/events/${id}`),

  getAttendees: (eventId: string) =>
    api.get(`/api/events/${eventId}/attendees`),

  addAttendee: (eventId: string, dto: AddAttendeeDto) =>
    api.post(`/api/events/${eventId}/attendees`, dto),

  toggleCheckin: (
    eventId: string,
    attendeeId: string,
    dto: { checkedIn: boolean; evidenceImageUrl?: string; notes?: string },
  ) =>
    api.patch(
      `/api/events/${eventId}/attendees/${attendeeId}/checkin`,
      dto,
    ),

  deleteAttendee: (eventId: string, attendeeId: string) =>
    api.delete(`/api/events/${eventId}/attendees/${attendeeId}`),
};
