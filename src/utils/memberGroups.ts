import type { Member } from '../store/useMemberStore';

// Status takes precedence over historical department and title.
export function matchesMemberGroup(member: Member, group: string): boolean {
  if (group === 'all') return true;
  if (group === 'alumni') return member.status === 'ALUMNI';
  if (member.status === 'ALUMNI') return false;
  if (group === 'bcn') return ['ORG_ADMIN', 'ADVISOR'].includes(member.tier);
  return member.banId === group;
}
