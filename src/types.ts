export interface Department {
  id: string;
  name: string;
  vietnameseName: string;
  division: 'TECH' | 'NON-TECH';
  coreColor: string;
  pastelColor: string;
  halftoneColor: string;
  textColor: string;
  iconName: string;
  shortDesc: string;
  skills: string[]; // Tech-stack / Kỹ năng liên quan
  jd: {
    overview: string;
    responsibilities: string[];
    requirements: string[];
    benefits: string[];
  };
}

export interface LeadRole {
  id: string;
  role: string;
  departmentId: string;
  division: 'KHỐI TECH' | 'KHỐI NON-TECH';
  badge: string; // "Open for Application / Tuyển chọn nội bộ"
  accentColor: string;
  pastelColor: string;
  mission: string;
  responsibilities: string[];
  requirements: string[];
}

export interface EventAttendee {
  id: string;
  name: string;
  studentId: string;
  email: string;
  ban?: string;
  checkedIn: boolean;
  checkedInAt?: string;
  registeredAt?: string;
}

export interface EventItem {
  id: string;
  title: string;
  category: 'Showcase' | 'Flagship Event' | 'Workshop Series' | 'Campus Challenge';
  date: string;
  time: string;
  location: string;
  isHybrid?: boolean;
  status: 'Upcoming' | 'Registration Open' | 'Opening Soon' | 'Completed';
  speaker?: {
    name: string;
    role: string;
    avatar?: string;
    company?: string;
  };
  summary: string;
  highlights: string[];
  accentColor: string;
  pastelColor: string;
  bannerImage?: string;
  showOnLanding?: boolean;
  attendees?: EventAttendee[];
}

export interface StatMilestone {
  value: string;
  number: number;
  suffix: string;
  label: string;
  description: string;
  accentColor: string;
  pastelColor: string;
}

export interface RegistrationFormData {
  fullName: string;
  studentId: string;
  email: string;
  cohort: string;
  major: string;
  division: 'TECH' | 'NON-TECH';
  departmentOfInterest: string;
  isApplyingForLead: boolean;
  portfolioUrl: string;
  motivation: string;
}

export interface OrganizerMember {
  id: string;
  name: string;
  role: string;
  domain: 'Leads' | 'Tech' | 'Design & Media' | 'Event Operations';
  major: string;
  cohort: string;
  bio: string;
  avatarUrl: string;
  color: string;
  dotColor: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
}


