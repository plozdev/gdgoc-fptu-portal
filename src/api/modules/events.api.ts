import { api, buildQueryString } from '../client';

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

export interface ToggleCheckinDto {
  checkedIn?: boolean;
  isVerified?: boolean;
  evidenceImageUrl?: string;
  notes?: string;
}

export const eventsApi = {
  getEvents: (params?: QueryEventsParams) =>
    api.get(`/api/events${buildQueryString(params)}`),

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
    dto: ToggleCheckinDto,
  ) =>
    api.patch(
      `/api/events/${eventId}/attendees/${attendeeId}/checkin`,
      dto,
    ),

  deleteAttendee: (eventId: string, attendeeId: string) =>
    api.delete(`/api/events/${eventId}/attendees/${attendeeId}`),

  addOrganizer: (eventId: string, dto: { userId: string; roleInEvent?: string }) =>
    api.post(`/api/events/${eventId}/organizers`, dto),

  getOrganizers: (eventId: string) =>
    api.get(`/api/events/${eventId}/organizers`),

  removeOrganizer: (eventId: string, userId: string) =>
    api.delete(`/api/events/${eventId}/organizers/${userId}`),

  settleOrganizerGems: (eventId: string) =>
    api.post(`/api/events/${eventId}/organizers/settle-gems`),
};
