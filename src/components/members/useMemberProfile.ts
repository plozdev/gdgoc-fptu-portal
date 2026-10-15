import { useEffect, useState } from 'react';
import { MemberProfile, membersApi } from '../../api/members.api';
import { subscribeSync } from '../../sync/subscriptions';

export function useMemberProfile(id?: string) {
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!id) { setLoading(false); return; }
    let active = true;
    const controller = new AbortController();
    setProfile(null); setError(''); setLoading(true);
    const unsubscribe = subscribeSync(['members', 'semesters', 'scope'], async () => {
      try {
        const result = await membersApi.getProfile(id, { signal: controller.signal });
        if (!active) return false;
        setProfile(result); setError(''); return true;
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Không tải được hồ sơ.');
        return false;
      } finally { if (active) setLoading(false); }
    });
    return () => { active = false; unsubscribe(); controller.abort(); };
  }, [id, retry]);
  return { profile, loading, error, retry: () => setRetry(value => value + 1) };
}
