/** Authentication types and permissions. */

// ==========================================
// TYPES & ENUMS
// ==========================================

/**
 * Tier system (cấp bậc trong CLB):
 * - ADVISOR      : Cố vấn CLB (quyền cấp 1, ngang LEAD và ADMIN)
 * - ORG_ADMIN    : Ban Chủ Nhiệm (Chapter Lead, Co-Chapter Lead) — quyền cao nhất
 * - BAN_LEAD     : Trưởng Ban các ban (AI Lead, Cloud Lead, v.v.)
 * - BAN_MEMBER   : Thành viên ban
 */
export type Tier = 'ADVISOR' | 'ORG_ADMIN' | 'BAN_LEAD' | 'BAN_MEMBER';

export type BanId = 'ai' | 'cloud' | 'research' | 'web' | 'media' | 'hr-event';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  tier: Tier;
  banId: BanId | null;
  banName?: string;
  mssv?: string;
  phoneNumber?: string;
  phone?: string;
  avatarUrl?: string;
  avatar?: string;
  gemsBalance?: number;
  [key: string]: any;
}

export const BAN_NAMES: Record<BanId, string> = {
  'ai': 'Ban Trí Tuệ Nhân Tạo (AI)',
  'cloud': 'Ban Điện Toán Đám Mây (Cloud)',
  'web': 'Ban Phát Triển Web',
  'research': 'Ban Nghiên Cứu (Research)',
  'media': 'Ban Truyền Thông & Media',
  'hr-event': 'Ban Nhân Sự & Sự Kiện (HR-Event)',
};

/**
 * Helper: Kiểm tra user có quyền quản lý event & attendance không.
 * Chỉ BCN (ORG_ADMIN) hoặc HR-Event ban (banId = 'hr-event') mới có quyền.
 * Alumni chỉ đọc; quyền quản trị yêu cầu trạng thái đang hoạt động.
 */
export function canManageEvents(user: UserSession | null): boolean {
  if (!user) return false;
  return !user.readOnly && (user.tier === 'ORG_ADMIN' || (user.tier === 'BAN_LEAD' && user.banId === 'hr-event'));
}

/**
 * Helper: Kiểm tra user có quyền admin (BCN/ADVISOR) không.
 * LEAD, ADVISOR, ADMIN dùng chung quyền cấp 1.
 */
export function isOrgAdmin(user: UserSession | null): boolean {
  if (!user) return false;
  return !user.readOnly && user.tier === 'ORG_ADMIN';
}

/**
 * Helper: Kiểm tra user có quyền HR Management không.
 * Chỉ ORG_ADMIN mới được quản lý nhân sự.
 */
export function canManageHR(user: UserSession | null): boolean {
  if (!user) return false;
  return !user.readOnly && user.tier === 'ORG_ADMIN';
}
