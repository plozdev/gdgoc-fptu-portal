/**
 * @file users.ts
 * @description Core auth types & user session interface.
 * Mock user list removed — authentication is handled by real backend.
 * For dev testing, user switching is managed via MSW handler (/api/auth/switch-user).
 */

// ==========================================
// TYPES & ENUMS
// ==========================================

/**
 * Tier system (cấp bậc trong CLB):
 * - ADVISOR      : Cố vấn CLB (ngang cấp BCN, quyền xem toàn bộ, không thao tác)
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
 * ADVISOR chỉ có quyền xem (read-only).
 */
export function canManageEvents(user: UserSession | null): boolean {
  if (!user) return false;
  return user.tier === 'ORG_ADMIN' || user.banId === 'hr-event';
}

/**
 * Helper: Kiểm tra user có quyền admin (BCN/ADVISOR) không.
 * ADVISOR có quyền xem nhưng không được thao tác.
 */
export function isOrgAdmin(user: UserSession | null): boolean {
  if (!user) return false;
  return user.tier === 'ORG_ADMIN';
}

/**
 * Helper: Kiểm tra user có quyền HR Management không.
 * Chỉ ORG_ADMIN mới được quản lý nhân sự.
 */
export function canManageHR(user: UserSession | null): boolean {
  if (!user) return false;
  return user.tier === 'ORG_ADMIN';
}
