/**
 * @file useLandingContentStore.ts
 * @description Zustand store quản lý nội dung Landing Page (CMS).
 * Kết nối trực tiếp với backend APIs:
 * - cmsApi.getStats() / updateStats()
 * - eventsApi.getEvents() / updateEvent()
 * - membersApi.getOrganizers()
 *
 * Dữ liệu lưu trữ đồng bộ với Database PostgreSQL và fallback vào localStorage khi offline.
 */

import { create } from 'zustand';
import {
  CHAPTER_INFO,
  DEPARTMENTS_DATA,
  EVENTS_DATA,
  STATS_DATA,
  CORE_ORGANIZERS_DATA,
} from '../data/gdgData';
import type { Department, EventItem, EventAttendee, StatMilestone, OrganizerMember } from '../types';
import { cmsApi } from '../api/cms.api';
import { eventsApi } from '../api/events.api';
import { membersApi } from '../api/members.api';

// ==========================================
// STATE INTERFACE
// ==========================================

interface LandingContentState {
  chapterInfo: typeof CHAPTER_INFO;
  events: EventItem[];
  organizers: OrganizerMember[];
  stats: StatMilestone[];
  departments: Department[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  fetchCmsData: () => Promise<void>;
  saveCmsPublish: () => Promise<void>;

  updateChapterInfo: (info: Partial<typeof CHAPTER_INFO>) => void;
  setEvents: (events: EventItem[]) => void;
  updateEvent: (id: string, updated: Partial<EventItem>) => void;
  addEvent: (event: EventItem) => void;
  deleteEvent: (id: string) => void;
  toggleShowOnLanding: (eventId: string) => Promise<void>;

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

// ==========================================
// STORAGE HELPERS
// ==========================================

const STORAGE_KEY = 'gdgoc_landing_content_v2';

function loadFromStorage(): Partial<LandingContentState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as Partial<LandingContentState>;
    }
  } catch (error) {
    console.error('[LandingContentStore] Failed to load from localStorage:', error);
  }
  return null;
}

function saveState(state: Partial<LandingContentState>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('[LandingContentStore] Failed to save to localStorage:', error);
  }
}

// ==========================================
// DATA MAPPING HELPERS
// ==========================================

function mapEventTypeToCategory(type?: string): EventItem['category'] {
  if (!type) return 'Workshop Series';
  const upper = type.toUpperCase();
  if (upper.includes('FLAGSHIP')) return 'Flagship Event';
  if (upper.includes('CHALLENGE')) return 'Campus Challenge';
  if (upper.includes('SHOWCASE')) return 'Showcase';
  return 'Workshop Series';
}

function getCategoryColors(category: EventItem['category']) {
  switch (category) {
    case 'Flagship Event':
      return { accentColor: '#4285F4', pastelColor: '#C3ECF6' };
    case 'Campus Challenge':
      return { accentColor: '#EA4335', pastelColor: '#F8D8D8' };
    case 'Showcase':
      return { accentColor: '#FBBC04', pastelColor: '#FFE7A5' };
    case 'Workshop Series':
    default:
      return { accentColor: '#34A853', pastelColor: '#CCF6C5' };
  }
}

// ==========================================
// INITIAL STATE
// ==========================================

const saved = typeof window !== 'undefined' ? loadFromStorage() : null;

// ==========================================
// STORE
// ==========================================

export const useLandingContentStore = create<LandingContentState>((set, get) => ({
  chapterInfo: saved?.chapterInfo ?? CHAPTER_INFO,
  events: saved?.events ?? EVENTS_DATA,
  organizers: saved?.organizers ?? CORE_ORGANIZERS_DATA,
  stats: saved?.stats ?? STATS_DATA,
  departments: saved?.departments ?? DEPARTMENTS_DATA,
  isLoading: false,
  isSaving: false,
  error: null,

  fetchCmsData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [statsRes, eventsRes, organizersRes] = await Promise.allSettled([
        cmsApi.getStats(),
        eventsApi.getEvents(),
        cmsApi.getOrganizers(),
      ]);

      // 1. Sync Impact Stats from backend
      if (statsRes.status === 'fulfilled' && Array.isArray(statsRes.value) && statsRes.value.length > 0) {
        const defaultPastels = ['#C3ECF6', '#CCF6C5', '#FFE7A5', '#F8D8D8'];
        const defaultAccents = ['#4285F4', '#34A853', '#FBBC04', '#EA4335'];
        const mappedStats: StatMilestone[] = statsRes.value.map((s: any, idx: number) => {
          const numMatch = String(s.value).match(/\d+/);
          const numVal = numMatch ? parseInt(numMatch[0], 10) : 0;
          return {
            label: s.label,
            value: s.value,
            number: numVal,
            suffix: String(s.value).includes('+') ? '+' : '',
            description: s.description || '',
            accentColor: s.accentColor || defaultAccents[idx % 4],
            pastelColor: defaultPastels[idx % 4],
          };
        });
        set({ stats: mappedStats });
      }

      // 2. Sync Events from backend
      if (eventsRes.status === 'fulfilled' && Array.isArray(eventsRes.value)) {
        if (eventsRes.value.length > 0) {
          const mappedEvents: EventItem[] = eventsRes.value.map((e: any) => {
            const category = mapEventTypeToCategory(e.type);
            const colors = getCategoryColors(category);
            const startTime = e.startTime ? new Date(e.startTime) : new Date();
            const endTime = e.endTime ? new Date(e.endTime) : startTime;
            const isPast = endTime.getTime() < Date.now();

            return {
              id: e.id,
              title: e.title,
              category,
              date: e.startTime ? e.startTime.slice(0, 10) : new Date().toISOString().slice(0, 10),
              time: startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
              location: e.location || 'FPT University HCMC',
              status: e.status || (isPast ? 'Completed' : 'Registration Open'),
              summary: e.description || '',
              highlights: [],
              accentColor: colors.accentColor,
              pastelColor: colors.pastelColor,
              showOnLanding: e.isPublic !== false,
              bannerImage: e.bannerImageUrl,
              registrationUrl: e.registrationUrl || 'https://gdg.community.dev/gdg-on-campus-fpt-university-ho-chi-minh-city-vietnam/',
              tenureId: e.tenureId,
              tenureName: e.tenureName,
              attendees: [],
            };
          });
          set({ events: mappedEvents });
        }
      }

      // 3. Sync Organizers from backend (Persistent in DB)
      if (organizersRes.status === 'fulfilled' && Array.isArray(organizersRes.value)) {
        if (organizersRes.value.length > 0) {
          const colors = [
            { color: '#4285F4', dotColor: '#4285F4' },
            { color: '#34A853', dotColor: '#34A853' },
            { color: '#FBBC04', dotColor: '#FBBC04' },
            { color: '#EA4335', dotColor: '#EA4335' },
          ];

          const getInitialsAvatar = (fullName: string) =>
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName || 'Member')}&backgroundColor=4285F4,34A853,FBBC04,EA4335&textColor=ffffff`;

          const mappedOrganizers: OrganizerMember[] = organizersRes.value.map((org: any, idx: number) => {
            const colorPair = colors[idx % colors.length];
            const name = org.name || org.fullName || 'Core Member';

            let domain: OrganizerMember['domain'] = org.domain || 'Leads';
            const orgDomainStr = `${org.domain || ''} ${org.position || org.role || ''}`.toLowerCase();
            if (
              orgDomainStr.includes('tech') ||
              orgDomainStr.includes('kỹ thuật') ||
              orgDomainStr.includes('web') ||
              orgDomainStr.includes('ai')
            ) {
              domain = 'Tech';
            } else if (
              orgDomainStr.includes('media') ||
              orgDomainStr.includes('design') ||
              orgDomainStr.includes('truyền thông')
            ) {
              domain = 'Design & Media';
            } else if (
              orgDomainStr.includes('event') ||
              orgDomainStr.includes('hr') ||
              orgDomainStr.includes('nhân sự')
            ) {
              domain = 'Event Operations';
            }

            // Nếu avatar trống hoặc là placeholder unsplash cũ, tự động đổi sang avatar chữ cái theo tên
            const isGenericUnsplash = org.avatarUrl && org.avatarUrl.includes('photo-1534528741775-53994a69daeb');
            const avatarUrl = !org.avatarUrl || isGenericUnsplash ? getInitialsAvatar(name) : org.avatarUrl;

            return {
              id: org.id,
              name,
              role: org.role || org.position || 'Core Team',
              domain,
              major: org.major || 'Kỹ thuật phần mềm',
              cohort: org.cohort || 'K18',
              bio: org.bio || 'Core Team Leader @ GDG on Campus FPT University HCMC',
              avatarUrl,
              color: org.color || colorPair.color,
              dotColor: org.dotColor || colorPair.dotColor,
              githubUrl: org.githubUrl,
              linkedinUrl: org.linkedinUrl,
            };
          });
          set({ organizers: mappedOrganizers });
        }
      }

      set({ isLoading: false });
    } catch (err: any) {
      console.error('[LandingContentStore] fetchCmsData error:', err);
      set({ isLoading: false, error: err?.message || 'Lỗi tải dữ liệu CMS' });
    }
  },

  saveCmsPublish: async () => {
    set({ isSaving: true, error: null });
    const { stats, events, organizers } = get();

    try {
      // 1. Cập nhật Stats lên backend qua /api/cms/stats (lưu bền vững vào PostgreSQL)
      await cmsApi.updateStats(
        stats.map((s) => ({
          label: s.label,
          value: s.value,
          description: s.description || '',
          accentColor: s.accentColor || '#4285F4',
        }))
      );

      // 2. Cập nhật Core Team Organizers lên backend qua /api/cms/organizers (lưu bền vững vào PostgreSQL)
      await cmsApi.updateOrganizers(organizers);

      // 3. Đồng bộ trạng thái và thông tin của các Events lên PostgreSQL
      await Promise.allSettled(
        events.map((ev) =>
          eventsApi.updateEvent(ev.id, {
            isPublic: ev.showOnLanding !== false,
            status: ev.status,
            title: ev.title,
            location: ev.location,
            description: ev.summary,
            registrationUrl: ev.registrationUrl,
          })
        )
      );

      saveState(get());
      set({ isSaving: false });
    } catch (err: any) {
      console.error('[LandingContentStore] saveCmsPublish error:', err);
      saveState(get()); // Lưu local storage để không mất thao tác
      set({ isSaving: false, error: err?.message || 'Lỗi lưu CMS' });
      throw err;
    }
  },

  updateChapterInfo: (info) => {
    set((state) => {
      const chapterInfo = { ...state.chapterInfo, ...info };
      const next = { ...state, chapterInfo };
      saveState(next);
      return next;
    });
  },

  setEvents: (events) => {
    set((state) => {
      const next = { ...state, events };
      saveState(next);
      return next;
    });
  },

  updateEvent: (id, updated) => {
    set((state) => {
      const events = state.events.map((ev) => (ev.id === id ? { ...ev, ...updated } : ev));
      const next = { ...state, events };
      saveState(next);
      return next;
    });

    // Tự động đồng bộ ngay lập tức vào database PostgreSQL
    const target = get().events.find((ev) => ev.id === id);
    if (target) {
      eventsApi
        .updateEvent(id, {
          isPublic: target.showOnLanding !== false,
          status: target.status,
          title: target.title,
          location: target.location,
          description: target.summary,
          registrationUrl: target.registrationUrl,
        })
        .catch((err) => {
          console.warn('[LandingContentStore] Auto sync updateEvent error:', err);
        });
    }
  },

  addEvent: (newEvent) => {
    set((state) => {
      const events = [newEvent, ...state.events];
      const next = { ...state, events };
      saveState(next);
      return next;
    });
  },

  deleteEvent: (id) => {
    set((state) => {
      const events = state.events.filter((ev) => ev.id !== id);
      const next = { ...state, events };
      saveState(next);
      return next;
    });
  },

  toggleShowOnLanding: async (eventId) => {
    const currentEvents = get().events;
    const target = currentEvents.find((e) => e.id === eventId);
    if (!target) return;

    const nextShow = !(target.showOnLanding !== false);

    set((state) => {
      const events = state.events.map((ev) =>
        ev.id === eventId ? { ...ev, showOnLanding: nextShow } : ev
      );
      const next = { ...state, events };
      saveState(next);
      return next;
    });

    try {
      await eventsApi.updateEvent(eventId, { isPublic: nextShow });
    } catch (err) {
      console.warn('[LandingContentStore] toggleShowOnLanding sync error:', err);
    }
  },

  toggleAttendeeCheckIn: (eventId, attendeeId) => {
    set((state) => {
      const events = state.events.map((ev) => {
        if (ev.id !== eventId) return ev;
        const attendees = (ev.attendees ?? []).map((att) => {
          if (att.id !== attendeeId) return att;
          const nextChecked = !att.checkedIn;
          return {
            ...att,
            checkedIn: nextChecked,
            checkedInAt: nextChecked
              ? `${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ${new Date().toLocaleDateString('vi-VN')}`
              : undefined,
          };
        });
        return { ...ev, attendees };
      });
      const next = { ...state, events };
      saveState(next);
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
          registeredAt: new Date().toLocaleDateString('vi-VN'),
        };
        return { ...ev, attendees: [newAttendee, ...(ev.attendees ?? [])] };
      });
      const next = { ...state, events };
      saveState(next);
      return next;
    });
  },

  removeAttendee: (eventId, attendeeId) => {
    set((state) => {
      const events = state.events.map((ev) => {
        if (ev.id !== eventId) return ev;
        return { ...ev, attendees: (ev.attendees ?? []).filter((a) => a.id !== attendeeId) };
      });
      const next = { ...state, events };
      saveState(next);
      return next;
    });
  },

  setOrganizers: (organizers) => {
    set((state) => {
      const next = { ...state, organizers };
      saveState(next);
      return next;
    });
    cmsApi.updateOrganizers(organizers).catch((err) => {
      console.warn('[LandingContentStore] Auto sync setOrganizers error:', err);
    });
  },

  updateOrganizer: (id, updated) => {
    set((state) => {
      const organizers = state.organizers.map((org) =>
        org.id === id ? { ...org, ...updated } : org
      );
      const next = { ...state, organizers };
      saveState(next);
      return next;
    });
  },

  addOrganizer: (newOrg) => {
    const organizers = [...get().organizers, newOrg];
    set((state) => {
      const next = { ...state, organizers };
      saveState(next);
      return next;
    });
    cmsApi.updateOrganizers(organizers).catch((err) => {
      console.warn('[LandingContentStore] Auto sync addOrganizer error:', err);
    });
  },

  deleteOrganizer: (id) => {
    const organizers = get().organizers.filter((org) => org.id !== id);
    set((state) => {
      const next = { ...state, organizers };
      saveState(next);
      return next;
    });
    cmsApi.updateOrganizers(organizers).catch((err) => {
      console.warn('[LandingContentStore] Auto sync deleteOrganizer error:', err);
    });
  },

  updateStats: (index, updated) => {
    let nextStats: StatMilestone[] = [];
    set((state) => {
      const stats = [...state.stats];
      if (stats[index]) {
        stats[index] = { ...stats[index], ...updated };
      }
      nextStats = stats;
      const next = { ...state, stats };
      saveState(next);
      return next;
    });

    if (nextStats.length > 0) {
      cmsApi
        .updateStats(
          nextStats.map((s) => ({
            label: s.label,
            value: s.value,
            description: s.description || '',
            accentColor: s.accentColor || '#4285F4',
          }))
        )
        .catch((err) => {
          console.warn('[LandingContentStore] Auto sync updateStats error:', err);
        });
    }
  },

  updateDepartment: (id, updated) => {
    set((state) => {
      const departments = state.departments.map((dept) =>
        dept.id === id ? { ...dept, ...updated } : dept
      );
      const next = { ...state, departments };
      saveState(next);
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
