export type Tier = 'ORG_ADMIN' | 'BAN_LEAD' | 'BAN_MEMBER';
export type BanId = 'ai' | 'cloud' | 'research' | 'web' | 'media' | 'hr-event';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  tier: Tier;
  banId: BanId | null;
  banName?: string;
}

export const BAN_NAMES: Record<BanId, string> = {
  'ai': 'Ban Trí Tuệ Nhân Tạo (AI)',
  'cloud': 'Ban Điện Toán Đám Mây (Cloud)',
  'web': 'Ban Phát Triển Web',
  'research': 'Ban Nghiên Cứu (Research)',
  'media': 'Ban Truyền Thông & Media',
  'hr-event': 'Ban Nhân Sự & Sự Kiện (HR-Event)',
};

export const mockUsers: UserSession[] = [
  // --- BAN CHỦ NHIỆM (ORG_ADMIN) ---
  { id: '1', email: 'lead@fpt.edu.vn', name: 'Đặng Mai Phương (Chapter Lead)', tier: 'ORG_ADMIN', banId: null, banName: 'Ban Chủ Nhiệm' },
  { id: '2', email: 'co-lead@fpt.edu.vn', name: 'Nguyễn Văn A (Co-Chapter Lead)', tier: 'ORG_ADMIN', banId: null, banName: 'Ban Chủ Nhiệm' },

  // --- KHỐI TECH: 4 TRƯỞNG BAN NGANG HÀNG (BAN_LEAD) ---
  { id: '3', email: 'ai.lead@fpt.edu.vn', name: 'Trần Nguyên Bảo (AI Lead)', tier: 'BAN_LEAD', banId: 'ai', banName: BAN_NAMES['ai'] },
  { id: '4', email: 'cloud.lead@fpt.edu.vn', name: 'Hoàng Minh Tuấn (Cloud Lead)', tier: 'BAN_LEAD', banId: 'cloud', banName: BAN_NAMES['cloud'] },
  { id: '5', email: 'web.lead@fpt.edu.vn', name: 'Lê Hoàng Long (Web Lead)', tier: 'BAN_LEAD', banId: 'web', banName: BAN_NAMES['web'] },
  { id: '6', email: 'research.lead@fpt.edu.vn', name: 'Phạm Quốc Anh (Research Lead)', tier: 'BAN_LEAD', banId: 'research', banName: BAN_NAMES['research'] },

  // --- KHỐI NON-TECH: 2 TRƯỞNG BAN NGANG HÀNG (BAN_LEAD) ---
  { id: '7', email: 'media.lead@fpt.edu.vn', name: 'Vũ Thị Lan Hương (Media Lead)', tier: 'BAN_LEAD', banId: 'media', banName: BAN_NAMES['media'] },
  { id: '8', email: 'hr.lead@fpt.edu.vn', name: 'Bùi Đức Thịnh (HR-Event Lead)', tier: 'BAN_LEAD', banId: 'hr-event', banName: BAN_NAMES['hr-event'] },

  // --- THÀNH VIÊN CÁC BAN (BAN_MEMBER) ---
  { id: '9', email: 'ai.member@fpt.edu.vn', name: 'Nguyễn Thành Nam (AI Member)', tier: 'BAN_MEMBER', banId: 'ai', banName: BAN_NAMES['ai'] },
  { id: '10', email: 'cloud.member@fpt.edu.vn', name: 'Trần Đức Toàn (Cloud Member)', tier: 'BAN_MEMBER', banId: 'cloud', banName: BAN_NAMES['cloud'] },
  { id: '11', email: 'web.member@fpt.edu.vn', name: 'Đỗ Hữu Minh (Web Member)', tier: 'BAN_MEMBER', banId: 'web', banName: BAN_NAMES['web'] },
  { id: '12', email: 'research.member@fpt.edu.vn', name: 'Võ Mai Linh (Research Member)', tier: 'BAN_MEMBER', banId: 'research', banName: BAN_NAMES['research'] },
  { id: '13', email: 'media.member@fpt.edu.vn', name: 'Lê Minh Tú (Media Member)', tier: 'BAN_MEMBER', banId: 'media', banName: BAN_NAMES['media'] },
  { id: '14', email: 'hr.member@fpt.edu.vn', name: 'Hoàng Kim Chi (HR-Event Member)', tier: 'BAN_MEMBER', banId: 'hr-event', banName: BAN_NAMES['hr-event'] },
];
