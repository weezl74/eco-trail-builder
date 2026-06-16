import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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
      const { data } = await supabase
        .from('profiles')
        .select('account_type')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!active) return;
      setAccountType(((data?.account_type as AccountType) ?? 'resident'));
      setLoading(false);
    })();
    return () => { active = false; };
  }, [user, authLoading]);

  return { accountType, loading };
};
