import { create } from 'zustand';
import { Tier, BanId, BAN_NAMES } from '../mocks/fixtures/users';

export interface MemberSocials {
  facebook?: string;
  github?: string;
  linkedin?: string;
  discord?: string;
}

export interface Member {
  id: string;
  name: string;              // Họ và tên
  studentId: string;         // MSSV ví dụ: SE180123 (Khóa)
  academicYear: string;      // Khóa đại học: K19, K20, K21, K22 (Khóa)
  email: string;             // Email FPT (Khóa)
  phone: string;             // Số điện thoại
  position: string;          // Chức danh ví dụ: 'Chapter Lead', 'AI Lead', 'Cloud Member'
  tier: Tier;                // Cấp bậc: ORG_ADMIN, BAN_LEAD, BAN_MEMBER (Khóa)
  banId: BanId | null;       // Ban trực thuộc (Khóa)
  banName: string;           // Tên ban đầy đủ
  gen: string;               // Khóa Gen: 'Gen 4.0', 'Gen 3.5', 'Gen 3.0', 'Gen 2.5', etc. (Khóa)
  status: 'ACTIVE' | 'ALUMNI' | 'ON_LEAVE';
  joinedDate: string;        // dd/MM/yyyy
  
  // Dữ liệu cá nhân (Thành viên TỰ DO SỬA):
  bio?: string;
  avatar?: string;
  socials?: MemberSocials;
  skills?: string[];
}

export interface ExcelImportRow {
  'Họ và tên'?: string;
  'Khóa'?: string;
  'MSSV'?: string;
  'Email'?: string;
  'Số điện thoại'?: string;
  'Position'?: string;
}

interface MemberState {
  members: Member[];
  addMember: (member: Omit<Member, 'id'>) => void;
  updateMember: (id: string, updates: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  updateSelfProfile: (id: string, profile: {
    bio?: string;
    phone?: string;
    socials?: MemberSocials;
    skills?: string[];
    avatar?: string;
  }) => void;
  importFromExcel: (rows: ExcelImportRow[], defaultGen: string) => { added: number; errors: string[] };
  getMemberById: (id: string) => Member | undefined;
  getMemberByEmail: (email: string) => Member | undefined;
  getAvailableGens: () => string[];
}

const STORAGE_KEY = 'gdgoc_members_directory_v1';

const INITIAL_MEMBERS: Member[] = [
  // --- BAN CHỦ NHIỆM ---
  {
    id: '1',
    name: 'Đặng Mai Phương',
    studentId: 'SE180001',
    academicYear: 'K19',
    email: 'lead@fpt.edu.vn',
    phone: '0901234567',
    position: 'Chapter Lead',
    tier: 'ORG_ADMIN',
    banId: null,
    banName: 'Ban Chủ Nhiệm',
    gen: 'Gen 4.0',
    status: 'ACTIVE',
    joinedDate: '15/09/2023',
    bio: 'Xây dựng cộng đồng sinh viên công nghệ năng động, kết nối giải pháp Google đến với sinh viên FPTU HCMC! 🚀',
    socials: {
      facebook: 'https://facebook.com',
      linkedin: 'https://linkedin.com',
      github: 'https://github.com',
      discord: 'mai.phuong#1234'
    },
    skills: ['Community Leadership', 'Google Cloud', 'Project Management', 'Public Speaking']
  },
  {
    id: '2',
    name: 'Nguyễn Văn A',
    studentId: 'SE180002',
    academicYear: 'K19',
    email: 'co-lead@fpt.edu.vn',
    phone: '0902345678',
    position: 'Co-Chapter Lead',
    tier: 'ORG_ADMIN',
    banId: null,
    banName: 'Ban Chủ Nhiệm',
    gen: 'Gen 4.0',
    status: 'ACTIVE',
    joinedDate: '15/09/2023',
    bio: 'Đồng hành cùng ban điều hành nâng cao chất lượng hoạt động chuyên môn và kết nối doanh nghiệp.',
    socials: {
      facebook: 'https://facebook.com',
      github: 'https://github.com'
    },
    skills: ['DevOps', 'Operations', 'Team Leadership']
  },

  // --- TRƯỞNG BAN (BAN_LEAD) ---
  {
    id: '3',
    name: 'Trần Nguyên Bảo',
    studentId: 'SE180101',
    academicYear: 'K19',
    email: 'ai.lead@fpt.edu.vn',
    phone: '0903456789',
    position: 'AI Lead',
    tier: 'BAN_LEAD',
    banId: 'ai',
    banName: BAN_NAMES['ai'],
    gen: 'Gen 4.0',
    status: 'ACTIVE',
    joinedDate: '01/10/2023',
    bio: 'Đam mê nghiên cứu Generative AI, Large Language Models và Agentic AI workflows.',
    socials: { github: 'https://github.com', linkedin: 'https://linkedin.com' },
    skills: ['PyTorch', 'TensorFlow', 'Gemini API', 'LangChain', 'Python']
  },
  {
    id: '4',
    name: 'Hoàng Minh Tuấn',
    studentId: 'SE180202',
    academicYear: 'K19',
    email: 'cloud.lead@fpt.edu.vn',
    phone: '0904567890',
    position: 'Cloud Lead',
    tier: 'BAN_LEAD',
    banId: 'cloud',
    banName: BAN_NAMES['cloud'],
    gen: 'Gen 4.0',
    status: 'ACTIVE',
    joinedDate: '01/10/2023',
    bio: 'Google Cloud Certified Professional Cloud Architect. Sẵn sàng hỗ trợ anh em vượt ải GCP Credits!',
    socials: { github: 'https://github.com' },
    skills: ['Google Cloud Platform', 'Kubernetes', 'Docker', 'Terraform']
  },
  {
    id: '5',
    name: 'Lê Hoàng Long',
    studentId: 'SE190303',
    academicYear: 'K20',
    email: 'web.lead@fpt.edu.vn',
    phone: '0905678901',
    position: 'Web Lead',
    tier: 'BAN_LEAD',
    banId: 'web',
    banName: BAN_NAMES['web'],
    gen: 'Gen 4.0',
    status: 'ACTIVE',
    joinedDate: '15/02/2024',
    bio: 'Frontend enthusiast, thích làm UI/UX mượt mà và brutalism design.',
    socials: { github: 'https://github.com' },
    skills: ['React', 'Next.js', 'TailwindCSS', 'TypeScript', 'Vite']
  },
  {
    id: '6',
    name: 'Phạm Quốc Anh',
    studentId: 'SE190404',
    academicYear: 'K20',
    email: 'research.lead@fpt.edu.vn',
    phone: '0906789012',
    position: 'Research Lead',
    tier: 'BAN_LEAD',
    banId: 'research',
    banName: BAN_NAMES['research'],
    gen: 'Gen 3.5',
    status: 'ACTIVE',
    joinedDate: '15/04/2024',
    bio: 'Tập trung nghiên cứu khoa học sinh viên và hướng dẫn Solution Challenge.',
    skills: ['Data Analysis', 'Paper Writing', 'Deep Learning']
  },
  {
    id: '7',
    name: 'Vũ Thị Lan Hương',
    studentId: 'SE190505',
    academicYear: 'K20',
    email: 'media.lead@fpt.edu.vn',
    phone: '0907890123',
    position: 'Media Lead',
    tier: 'BAN_LEAD',
    banId: 'media',
    banName: BAN_NAMES['media'],
    gen: 'Gen 4.0',
    status: 'ACTIVE',
    joinedDate: '01/10/2023',
    bio: 'Storyteller của GDG on Campus FPTU HCMC. Yêu thích thiết kế branding và video sản xuất.',
    skills: ['Figma', 'Photoshop', 'Premiere Pro', 'Content Writing']
  },
  {
    id: '8',
    name: 'Bùi Đức Thịnh',
    studentId: 'SE190606',
    academicYear: 'K20',
    email: 'hr.lead@fpt.edu.vn',
    phone: '0908901234',
    position: 'HR-Event Lead',
    tier: 'BAN_LEAD',
    banId: 'hr-event',
    banName: BAN_NAMES['hr-event'],
    gen: 'Gen 3.5',
    status: 'ACTIVE',
    joinedDate: '01/03/2024',
    bio: 'Gắn kết mọi thành viên, điều phối sự kiện lớn nhỏ và xây dựng văn hóa CLB vững chắc.',
    skills: ['Event Planning', 'HR Operations', 'MC & Hosting', 'Teambuilding']
  },

  // --- THÀNH VIÊN CÁC BAN (BAN_MEMBER) ---
  {
    id: '9',
    name: 'Nguyễn Thành Nam',
    studentId: 'SE200707',
    academicYear: 'K21',
    email: 'ai.member@fpt.edu.vn',
    phone: '0909012345',
    position: 'AI Member',
    tier: 'BAN_MEMBER',
    banId: 'ai',
    banName: BAN_NAMES['ai'],
    gen: 'Gen 4.0',
    status: 'ACTIVE',
    joinedDate: '15/09/2024',
    bio: 'Sinh viên K21 thích học hỏi về Computer Vision và Prompt Engineering.',
    skills: ['Python', 'Prompt Engineering', 'OpenCV']
  },
  {
    id: '10',
    name: 'Trần Đức Toàn',
    studentId: 'SE200808',
    academicYear: 'K21',
    email: 'cloud.member@fpt.edu.vn',
    phone: '0910123456',
    position: 'Cloud Member',
    tier: 'BAN_MEMBER',
    banId: 'cloud',
    banName: BAN_NAMES['cloud'],
    gen: 'Gen 4.0',
    status: 'ACTIVE',
    joinedDate: '15/09/2024',
    bio: 'Đang cày cuốc Google Cloud Skills Boost và các chứng chỉ Associate Cloud Engineer.',
    skills: ['GCP Basics', 'Linux', 'Networking']
  },
  {
    id: '11',
    name: 'Đỗ Hữu Minh',
    studentId: 'SE200909',
    academicYear: 'K21',
    email: 'web.member@fpt.edu.vn',
    phone: '0911234567',
    position: 'Web Member',
    tier: 'BAN_MEMBER',
    banId: 'web',
    banName: BAN_NAMES['web'],
    gen: 'Gen 3.5',
    status: 'ACTIVE',
    joinedDate: '15/04/2024',
    bio: 'Fullstack developer tập trung vào React và Node.js.',
    skills: ['JavaScript', 'HTML/CSS', 'React']
  },
  {
    id: '12',
    name: 'Võ Mai Linh',
    studentId: 'SE201010',
    academicYear: 'K21',
    email: 'research.member@fpt.edu.vn',
    phone: '0912345678',
    position: 'Research Member',
    tier: 'BAN_MEMBER',
    banId: 'research',
    banName: BAN_NAMES['research'],
    gen: 'Gen 3.0',
    status: 'ACTIVE',
    joinedDate: '01/10/2023',
    bio: 'Tìm kiếm cơ hội tham gia các đề tài nghiên cứu AI ứng dụng cho y tế.',
    skills: ['Literature Review', 'Statistical Analysis']
  },
  {
    id: '13',
    name: 'Lê Minh Tú',
    studentId: 'SE211111',
    academicYear: 'K22',
    email: 'media.member@fpt.edu.vn',
    phone: '0913456789',
    position: 'Media Member',
    tier: 'BAN_MEMBER',
    banId: 'media',
    banName: BAN_NAMES['media'],
    gen: 'Gen 4.0',
    status: 'ACTIVE',
    joinedDate: '15/09/2024',
    bio: 'Nhiếp ảnh gia nghiệp dư, thích ghi lại những khoảnh khắc đẹp nhất của sự kiện GDG.',
    skills: ['Photography', 'Lightroom', 'CapCut']
  },
  {
    id: '14',
    name: 'Hoàng Kim Chi',
    studentId: 'SE211212',
    academicYear: 'K22',
    email: 'hr.member@fpt.edu.vn',
    phone: '0914567890',
    position: 'HR-Event Member',
    tier: 'BAN_MEMBER',
    banId: 'hr-event',
    banName: BAN_NAMES['hr-event'],
    gen: 'Gen 4.0',
    status: 'ACTIVE',
    joinedDate: '15/09/2024',
    bio: 'Hỗ trợ check-in, đón tiếp khách mời và chuẩn bị teabreak chu đáo cho sự kiện.',
    skills: ['Check-in Logistics', 'Guest Care', 'Communication']
  }
];

const loadMembersFromStorage = (): Member[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading members from storage', e);
  }
  return INITIAL_MEMBERS;
};

export const useMemberStore = create<MemberState>((set, get) => ({
  members: loadMembersFromStorage(),

  addMember: (memberData) => {
    const newMember: Member = {
      ...memberData,
      id: `mem-${Date.now()}`
    };

    set((state) => {
      const updated = [newMember, ...state.members];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return { members: updated };
    });
  },

  updateMember: (id, updates) => {
    set((state) => {
      const updated = state.members.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      );
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return { members: updated };
    });
  },

  deleteMember: (id) => {
    set((state) => {
      const updated = state.members.filter((m) => m.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return { members: updated };
    });
  },

  updateSelfProfile: (id, profile) => {
    set((state) => {
      const updated = state.members.map((m) => {
        if (m.id === id) {
          return {
            ...m,
            bio: profile.bio !== undefined ? profile.bio : m.bio,
            phone: profile.phone !== undefined ? profile.phone : m.phone,
            socials: profile.socials !== undefined ? { ...m.socials, ...profile.socials } : m.socials,
            skills: profile.skills !== undefined ? profile.skills : m.skills,
            avatar: profile.avatar !== undefined ? profile.avatar : m.avatar,
          };
        }
        return m;
      });
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return { members: updated };
    });
  },

  importFromExcel: (rows, defaultGen) => {
    const errors: string[] = [];
    const newMembers: Member[] = [];
    const currentMembers = get().members;

    rows.forEach((row, index) => {
      const name = (row['Họ và tên'] || '').trim();
      const studentId = (row['MSSV'] || '').trim().toUpperCase();
      const email = (row['Email'] || '').trim().toLowerCase();
      const academicYear = (row['Khóa'] || 'K20').trim().toUpperCase();
      const phone = (row['Số điện thoại'] || '').trim();
      const position = (row['Position'] || 'Thành Viên').trim();

      if (!name) {
        errors.push(`Dòng ${index + 2}: Thiếu Họ và tên`);
        return;
      }
      if (!studentId) {
        errors.push(`Dòng ${index + 2} (${name}): Thiếu MSSV`);
        return;
      }
      if (!email) {
        errors.push(`Dòng ${index + 2} (${name}): Thiếu Email FPT`);
        return;
      }

      // Check for duplicate email in current directory or batch
      const emailExists = currentMembers.some(m => m.email.toLowerCase() === email) ||
                          newMembers.some(m => m.email.toLowerCase() === email);
      if (emailExists) {
        errors.push(`Dòng ${index + 2}: Email ${email} đã tồn tại trong hệ thống`);
        return;
      }

      // Determine tier and ban from position
      let tier: Tier = 'BAN_MEMBER';
      let banId: BanId | null = null;
      let banName = 'Ban Thành Viên';

      const posLower = position.toLowerCase();

      if (posLower.includes('chapter lead') || posLower.includes('chủ nhiệm') || posLower.includes('bcn')) {
        tier = 'ORG_ADMIN';
        banId = null;
        banName = 'Ban Chủ Nhiệm';
      } else if (posLower.includes('ai') || posLower.includes('trí tuệ')) {
        banId = 'ai';
        banName = BAN_NAMES['ai'];
        tier = posLower.includes('lead') ? 'BAN_LEAD' : 'BAN_MEMBER';
      } else if (posLower.includes('cloud') || posLower.includes('đám mây')) {
        banId = 'cloud';
        banName = BAN_NAMES['cloud'];
        tier = posLower.includes('lead') ? 'BAN_LEAD' : 'BAN_MEMBER';
      } else if (posLower.includes('web') || posLower.includes('frontend') || posLower.includes('backend')) {
        banId = 'web';
        banName = BAN_NAMES['web'];
        tier = posLower.includes('lead') ? 'BAN_LEAD' : 'BAN_MEMBER';
      } else if (posLower.includes('research') || posLower.includes('nghiên cứu')) {
        banId = 'research';
        banName = BAN_NAMES['research'];
        tier = posLower.includes('lead') ? 'BAN_LEAD' : 'BAN_MEMBER';
      } else if (posLower.includes('media') || posLower.includes('truyền thông')) {
        banId = 'media';
        banName = BAN_NAMES['media'];
        tier = posLower.includes('lead') ? 'BAN_LEAD' : 'BAN_MEMBER';
      } else if (posLower.includes('hr') || posLower.includes('nhân sự') || posLower.includes('event')) {
        banId = 'hr-event';
        banName = BAN_NAMES['hr-event'];
        tier = posLower.includes('lead') ? 'BAN_LEAD' : 'BAN_MEMBER';
      } else {
        banId = 'ai';
        banName = BAN_NAMES['ai'];
        tier = 'BAN_MEMBER';
      }

      const member: Member = {
        id: `mem-import-${Date.now()}-${index}`,
        name,
        studentId,
        academicYear,
        email,
        phone: phone || 'Chưa cập nhật',
        position,
        tier,
        banId,
        banName,
        gen: defaultGen || 'Gen 4.0',
        status: 'ACTIVE',
        joinedDate: new Date().toLocaleDateString('vi-VN'),
        bio: `${position} tại GDG on Campus FPT University HCMC.`,
        skills: []
      };

      newMembers.push(member);
    });

    if (newMembers.length > 0) {
      set((state) => {
        const updated = [...newMembers, ...state.members];
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {}
        return { members: updated };
      });
    }

    return { added: newMembers.length, errors };
  },

  getMemberById: (id) => {
    return get().members.find(m => m.id === id);
  },

  getMemberByEmail: (email) => {
    if (!email) return undefined;
    return get().members.find(m => m.email.toLowerCase() === email.toLowerCase());
  },

  getAvailableGens: () => {
    const gens = Array.from(new Set(get().members.map(m => m.gen)));
    // Prepend standard gens if not present
    ['Gen 4.0', 'Gen 3.5', 'Gen 3.0', 'Gen 2.5', 'Gen 2.0', 'Gen 1.0'].forEach(g => {
      if (!gens.includes(g)) gens.push(g);
    });
    // Sort descending by number
    return gens.sort((a, b) => {
      const numA = parseFloat(a.replace(/[^\d.]/g, '')) || 0;
      const numB = parseFloat(b.replace(/[^\d.]/g, '')) || 0;
      return numB - numA;
    });
  }
}));
