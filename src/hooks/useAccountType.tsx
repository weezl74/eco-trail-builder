import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { fetchMyProfile } from '@/lib/api';

export type AccountType = 'resident' | 'business';

export const useAccountType = () => {
  const { user, loading: authLoading } = useAuth();
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setAccountType(null); setLoading(false); return; }
    let active = true;
    (async () => {
      try {
        const profile = await fetchMyProfile(user.id);
        if (!active) return;
        setAccountType((profile?.account_type as AccountType) ?? 'resident');
      } catch {
        if (!active) return;
        setAccountType('resident');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [user, authLoading]);

  return { accountType, loading };
};
