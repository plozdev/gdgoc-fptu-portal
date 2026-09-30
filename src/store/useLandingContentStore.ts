/**
 * @file useLandingContentStore.ts
 * @description Zustand store quản lý nội dung Landing Page (CMS) đồng bộ Backend API.
 */

import { create } from 'zustand';
import {
  CHAPTER_INFO,
  DEPARTMENTS_DATA,
  EVENTS_DATA,
  STATS_DATA,
  CORE_ORGANIZERS_DATA,
} from '../data/gdgData';
import type { Department, EventItem, StatMilestone, OrganizerMember } from '../types';
import { cmsApi, membersApi, eventsApi } from '../api';

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

  fetchPublicCms: () => Promise<void>;
  updateChapterInfo: (info: Partial<typeof CHAPTER_INFO>) => void;
  setEvents: (events: EventItem[]) => void;
  updateEvent: (id: string, updated: Partial<EventItem>) => Promise<void>;
  addEvent: (event: any) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  toggleShowOnLanding: (eventId: string) => void;

  setOrganizers: (organizers: OrganizerMember[]) => void;
  updateOrganizer: (id: string, updated: Partial<OrganizerMember>) => void;
  addOrganizer: (organizer: OrganizerMember) => void;
  deleteOrganizer: (id: string) => void;

  updateStats: (index: number, updated: Partial<StatMilestone>) => void;
  saveStatsToBackend: () => Promise<void>;
  updateDepartment: (id: string, updated: Partial<Department>) => void;
  resetToDefaults: () => void;
}

function mapPublicEventToUi(e: any): EventItem {
  const pastelColors = ['#C3ECF6', '#FFE7A5', '#CCF6C5', '#F8D8D8', '#E8D5F5'];
  const colorIndex = Math.abs((e.id || '').split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0)) % pastelColors.length;

  return {
    id: e.id,
    title: e.title,
    category: e.type === 'SHOWCASE' ? 'Showcase' : e.type === 'HACKATHON' ? 'Flagship Event' : e.type === 'WORKSHOP' ? 'Workshop Series' : 'Campus Challenge',
    date: e.startTime ? new Date(e.startTime).toLocaleDateString('vi-VN') : '20/10/2026',
    time: e.startTime && e.endTime
      ? `${new Date(e.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${new Date(e.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
      : '08:30 AM - 12:00 PM',
    location: e.location || 'Hội trường Innovation, ĐH FPT TP.HCM',
    isHybrid: true,
    status: 'Registration Open',
    summary: e.description || '',
    speaker: {
      name: 'Google Developer Experts & GDGoC Core Team',
      role: 'Speaker & Mentors',
    },
    pastelColor: pastelColors[colorIndex],
    registrationUrl: e.registrationUrl || '',
    showOnLanding: Boolean(e.isPublic !== false),
  };
}

function mapOrganizerToUi(m: any): OrganizerMember {
  const currentTenure = m.tenure || (Array.isArray(m.tenures) ? m.tenures[0] : null);
  const deptCode = currentTenure?.department?.code || currentTenure?.departmentCode || '';
  const role = currentTenure?.role || 'MEMBER';

  let domain: OrganizerMember['domain'] = 'Tech';
  if (role === 'LEAD' || role === 'ADVISOR') domain = 'Leads';
  else if (deptCode === 'MEDIA') domain = 'Design & Media';
  else if (deptCode === 'HR_EVENT') domain = 'Event Operations';

  return {
    id: m.id,
    name: m.fullName || m.name || m.email,
    role: currentTenure?.position || (role === 'LEAD' ? 'Chapter Lead' : role === 'ADVISOR' ? 'Cố Vấn CLB' : 'Trưởng Ban'),
    department: currentTenure?.department?.name || 'Ban Chuyên Môn',
    domain,
    bio: m.bio || 'Core organizer tại GDGoC FPT University HCMC.',
    avatarUrl: m.avatarUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`,
    socials: {
      github: m.githubUrl,
      linkedin: m.linkedinUrl,
      facebook: m.facebookUrl,
    },
    featured: Boolean(m.featured ?? (role === 'LEAD' || role === 'DEPARTMENT_LEAD' || role === 'ADVISOR')),
  };
}

export const useLandingContentStore = create<LandingContentState>((set, get) => ({
  chapterInfo: CHAPTER_INFO,
  events: EVENTS_DATA,
  organizers: CORE_ORGANIZERS_DATA,
  stats: STATS_DATA,
  departments: DEPARTMENTS_DATA,
  isLoading: false,

  fetchPublicCms: async () => {
    set({ isLoading: true });
    try {
      const [statsRes, eventsRes, organizersRes] = await Promise.allSettled([
        cmsApi.getStats(),
        cmsApi.getPublicEvents(),
        membersApi.getOrganizers(true),
      ]);

      if (statsRes.status === 'fulfilled' && Array.isArray(statsRes.value) && statsRes.value.length > 0) {
        set({ stats: statsRes.value as StatMilestone[] });
      }

      if (eventsRes.status === 'fulfilled') {
        const rawEvents = (eventsRes.value as any)?.items || (Array.isArray(eventsRes.value) ? eventsRes.value : []);
        if (rawEvents.length > 0) {
          set({ events: rawEvents.map(mapPublicEventToUi) });
        }
      }

      if (organizersRes.status === 'fulfilled') {
        const rawOrgs = (organizersRes.value as any)?.items || (Array.isArray(organizersRes.value) ? organizersRes.value : []);
        if (rawOrgs.length > 0) {
          set({ organizers: rawOrgs.map(mapOrganizerToUi) });
        }
      }

      set({ isLoading: false });
    } catch (error) {
      console.error('[LandingContentStore] Failed to fetch CMS data:', error);
      set({ isLoading: false });
    }
  },

  updateChapterInfo: (info) => {
    set((state) => ({
      ...state,
      chapterInfo: { ...state.chapterInfo, ...info },
    }));
  },

  setEvents: (events) => set({ events }),

  updateEvent: async (id, updated) => {
    set((state) => ({
      events: state.events.map((ev) => (ev.id === id ? { ...ev, ...updated } : ev)),
    }));
  },

  addEvent: async (newEvent) => {
    set((state) => ({
      events: [newEvent, ...state.events],
    }));
  },

  deleteEvent: async (id) => {
    try {
      await eventsApi.deleteEvent(id);
    } catch {
      // ignore
    }
    set((state) => ({
      events: state.events.filter((ev) => ev.id !== id),
    }));
  },

  toggleShowOnLanding: (eventId) => {
    set((state) => ({
      events: state.events.map((ev) =>
        ev.id === eventId ? { ...ev, showOnLanding: !ev.showOnLanding } : ev
      ),
    }));
  },

  setOrganizers: (organizers) => set({ organizers }),

  updateOrganizer: (id, updated) => {
    set((state) => ({
      organizers: state.organizers.map((org) =>
        org.id === id ? { ...org, ...updated } : org
      ),
    }));
  },

  addOrganizer: (newOrg) => {
    set((state) => ({
      organizers: [...state.organizers, newOrg],
    }));
  },

  deleteOrganizer: (id) => {
    set((state) => ({
      organizers: state.organizers.filter((org) => org.id !== id),
    }));
  },

  updateStats: (index, updated) => {
    set((state) => {
      const stats = [...state.stats];
      if (stats[index]) {
        stats[index] = { ...stats[index], ...updated };
      }
      return { stats };
    });
  },

  saveStatsToBackend: async () => {
    const { stats } = get();
    await cmsApi.updateStats(stats);
  },

  updateDepartment: (id, updated) => {
    set((state) => ({
      departments: state.departments.map((dept) =>
        dept.id === id ? { ...dept, ...updated } : dept
      ),
    }));
  },

  resetToDefaults: () => {
    set({
      chapterInfo: CHAPTER_INFO,
      events: EVENTS_DATA,
      organizers: CORE_ORGANIZERS_DATA,
      stats: STATS_DATA,
      departments: DEPARTMENTS_DATA,
    });
  },
}));
