/**
 * @file auth.types.ts
 * @description Core auth types, RBAC definitions & user session interface for GDGoC Platform.
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
export type Tier = 'ADVISOR' | 'ORG_ADMIN' | 'BAN_LEAD' | 'BAN_MEMBER' | 'COLLABORATOR';

export type BanId = 'ai' | 'cloud' | 'research' | 'web' | 'media' | 'hr-event';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  tier: Tier;
  banId: BanId | null;
  banName?: string;
  mssv?: string;
  gemsBalance?: number;
  gen?: string;
  tenureId?: string;
  tenureName?: string;
  position?: string;
}

export const BAN_NAMES: Record<BanId, string> = {
  ai: 'Ban Trí Tuệ Nhân Tạo (AI)',
  cloud: 'Ban Điện Toán Đám Mây (Cloud)',
  web: 'Ban Phát Triển Web',
  research: 'Ban Nghiên Cứu (Research)',
  media: 'Ban Truyền Thông & Media',
  'hr-event': 'Ban Nhân Sự & Sự Kiện (HR-Event)',
};

export const DEPT_CODE_TO_BAN_ID: Record<string, BanId> = {
  TECH_AI: 'ai',
  TECH_CLOUD: 'cloud',
  TECH_WEB: 'web',
  TECH_RESEARCH: 'research',
  MEDIA: 'media',
  HR_EVENT: 'hr-event',
};

export const BAN_ID_TO_DEPT_CODE: Record<BanId, string> = {
  ai: 'TECH_AI',
  cloud: 'TECH_CLOUD',
  web: 'TECH_WEB',
  research: 'TECH_RESEARCH',
  media: 'MEDIA',
  'hr-event': 'HR_EVENT',
};

// ==========================================
// RBAC HELPERS
// ==========================================

/**
 * Helper: Kiểm tra user có quyền quản lý event & attendance không.
 * BCN (ORG_ADMIN) hoặc HR-Event ban (banId = 'hr-event') mới có quyền.
 * ADVISOR chỉ có quyền xem (read-only).
 */
export function canManageEvents(user: UserSession | null): boolean {
  if (!user) return false;
  return user.tier === 'ORG_ADMIN' || user.banId === 'hr-event';
}

/**
 * Helper: Kiểm tra user có quyền admin (BCN) không.
 */
export function isOrgAdmin(user: UserSession | null): boolean {
  if (!user) return false;
  return user.tier === 'ORG_ADMIN';
}

/**
 * Helper: Kiểm tra user có quyền HR Management không.
 */
export function canManageHR(user: UserSession | null): boolean {
  if (!user) return false;
  return user.tier === 'ORG_ADMIN' || user.banId === 'hr-event';
}

/**
 * Helper: Chuyển đổi payload User từ Backend sang UserSession của Frontend
 */
export function mapBackendUserToSession(raw: any): UserSession {
  if (!raw) return raw;

  // Unwrap if nested in { data: ... }
  const actual = raw.data ? raw.data : raw;

  // If already UserSession format
  if (actual.tier && actual.name && typeof actual.name === 'string') {
    return actual as UserSession;
  }

  // Handle active tenure / currentTenure object or tenures array
  const currentTenure =
    actual.currentTenure ||
    (Array.isArray(actual.tenures) ? actual.tenures.find((t: any) => !t.tenure?.isArchived && t.status === 'ACTIVE') || actual.tenures[0] : null);

  const role = currentTenure?.role || actual.role || 'MEMBER';
  let tier: Tier = 'BAN_MEMBER';
  if (role === 'LEAD') tier = 'ORG_ADMIN';
  else if (role === 'ADVISOR') tier = 'ADVISOR';
  else if (role === 'DEPARTMENT_LEAD') tier = 'BAN_LEAD';
  else if (role === 'COLLABORATOR') tier = 'COLLABORATOR';

  const deptCode = currentTenure?.department?.code || currentTenure?.departmentCode || actual.departmentCode;
  let banId: BanId | null = null;
  if (deptCode && DEPT_CODE_TO_BAN_ID[deptCode]) {
    banId = DEPT_CODE_TO_BAN_ID[deptCode];
  }

  const deptName =
    currentTenure?.department?.name ||
    currentTenure?.departmentName ||
    (banId ? BAN_NAMES[banId] : tier === 'ORG_ADMIN' ? 'Ban Chủ Nhiệm' : 'Thành Viên GDG');

  const genLabel =
    currentTenure?.genLabel ||
    currentTenure?.tenure?.genLabel ||
    currentTenure?.tenureName ||
    currentTenure?.tenure?.name ||
    '';

  const tenureId = currentTenure?.tenureId || currentTenure?.tenure?.id || '';
  const tenureName = currentTenure?.tenureName || currentTenure?.tenure?.name || '';
  const position = currentTenure?.position || actual.position || '';

  return {
    id: actual.id,
    email: actual.email,
    name: actual.fullName || actual.name || actual.email || 'Thành Viên GDG',
    tier,
    banId,
    banName: deptName,
    mssv: actual.mssv,
    gemsBalance: actual.gemsBalance ?? 0,
    gen: genLabel,
    tenureId,
    tenureName,
    position,
  };
}
