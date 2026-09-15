import { create } from 'zustand';
import { 
  CHAPTER_INFO, 
  DEPARTMENTS_DATA, 
  EVENTS_DATA, 
  STATS_DATA, 
  CORE_ORGANIZERS_DATA 
} from '../data/gdgData';
import { Department, EventItem, EventAttendee, StatMilestone, OrganizerMember } from '../types';

interface LandingContentState {
  chapterInfo: typeof CHAPTER_INFO;
  events: EventItem[];
  organizers: OrganizerMember[];
  stats: StatMilestone[];
  departments: Department[];

  updateChapterInfo: (info: Partial<typeof CHAPTER_INFO>) => void;
  setEvents: (events: EventItem[]) => void;
  updateEvent: (id: string, updated: Partial<EventItem>) => void;
  addEvent: (event: EventItem) => void;
  deleteEvent: (id: string) => void;
  toggleShowOnLanding: (eventId: string) => void;

  toggleAttendeeCheckIn: (eventId: string, attendeeId: string) => void;
  addAttendee: (eventId: string, attendee: Omit<EventAttendee, 'id'>) => void;
  removeAttendee: (eventId: string, attendeeId: string) => void;

  setOrganizers: (organizers: OrganizerMember[]) => void;
  updateOrganizer: (id: string, updated: Partial<OrganizerMember>) => void;
  addOrganizer: (organizer: OrganizerMember) => void;
  deleteOrganizer: (id: string) => void;

  updateStats: (index: number, updated: Partial<StatMilestone>) => void;
  updateDepartment: (id: string, updated: Partial<Department>) => void;

  resetToDefaults: () => void;
}

const STORAGE_KEY = 'gdgoc_landing_content_v1';

// Load from localStorage if present
const loadSavedData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load saved landing content', e);
  }
  return null;
};

const saved = typeof window !== 'undefined' ? loadSavedData() : null;

export const useLandingContentStore = create<LandingContentState>((set, get) => ({
  chapterInfo: saved?.chapterInfo || CHAPTER_INFO,
  events: saved?.events || EVENTS_DATA,
  organizers: saved?.organizers || CORE_ORGANIZERS_DATA,
  stats: saved?.stats || STATS_DATA,
  departments: saved?.departments || DEPARTMENTS_DATA,

  updateChapterInfo: (info) => {
    set((state) => {
      const chapterInfo = { ...state.chapterInfo, ...info };
      const next = { ...state, chapterInfo };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  },

  setEvents: (events) => {
    set((state) => {
      const next = { ...state, events };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  },

  updateEvent: (id, updated) => {
    set((state) => {
      const events = state.events.map((ev) => (ev.id === id ? { ...ev, ...updated } : ev));
      const next = { ...state, events };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  },

  addEvent: (newEvent) => {
    set((state) => {
      const events = [newEvent, ...state.events];
      const next = { ...state, events };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  },

  deleteEvent: (id) => {
    set((state) => {
      const events = state.events.filter((ev) => ev.id !== id);
      const next = { ...state, events };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  },

  toggleShowOnLanding: (eventId) => {
    set((state) => {
      const events = state.events.map((ev) => 
        ev.id === eventId ? { ...ev, showOnLanding: !ev.showOnLanding } : ev
      );
      const next = { ...state, events };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  },

  toggleAttendeeCheckIn: (eventId, attendeeId) => {
    set((state) => {
      const events = state.events.map((ev) => {
        if (ev.id !== eventId) return ev;
        const attendees = (ev.attendees || []).map((att) => {
          if (att.id !== attendeeId) return att;
          const nextChecked = !att.checkedIn;
          return {
            ...att,
            checkedIn: nextChecked,
            checkedInAt: nextChecked 
              ? new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('vi-VN') 
              : undefined
          };
        });
        return { ...ev, attendees };
      });
      const next = { ...state, events };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  },

  addAttendee: (eventId, attendeeData) => {
    set((state) => {
      const events = state.events.map((ev) => {
        if (ev.id !== eventId) return ev;
        const newAttendee: EventAttendee = {
          ...attendeeData,
          id: `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          registeredAt: new Date().toLocaleDateString('vi-VN')
        };
        return {
          ...ev,
          attendees: [newAttendee, ...(ev.attendees || [])]
        };
      });
      const next = { ...state, events };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  },

  removeAttendee: (eventId, attendeeId) => {
    set((state) => {
      const events = state.events.map((ev) => {
        if (ev.id !== eventId) return ev;
        return {
          ...ev,
          attendees: (ev.attendees || []).filter((a) => a.id !== attendeeId)
        };
      });
      const next = { ...state, events };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  },

  setOrganizers: (organizers) => {
    set((state) => {
      const next = { ...state, organizers };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  },

  updateOrganizer: (id, updated) => {
    set((state) => {
      const organizers = state.organizers.map((org) => (org.id === id ? { ...org, ...updated } : org));
      const next = { ...state, organizers };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  },

  addOrganizer: (newOrg) => {
    set((state) => {
      const organizers = [...state.organizers, newOrg];
      const next = { ...state, organizers };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  },

  deleteOrganizer: (id) => {
    set((state) => {
      const organizers = state.organizers.filter((org) => org.id !== id);
      const next = { ...state, organizers };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  },

  updateStats: (index, updated) => {
    set((state) => {
      const stats = [...state.stats];
      if (stats[index]) {
        stats[index] = { ...stats[index], ...updated };
      }
      const next = { ...state, stats };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  },

  updateDepartment: (id, updated) => {
    set((state) => {
      const departments = state.departments.map((dept) => (dept.id === id ? { ...dept, ...updated } : dept));
      const next = { ...state, departments };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  },

  resetToDefaults: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({
      chapterInfo: CHAPTER_INFO,
      events: EVENTS_DATA,
      organizers: CORE_ORGANIZERS_DATA,
      stats: STATS_DATA,
      departments: DEPARTMENTS_DATA,
    });
  },
}));
