import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const FLAG_PREFIX = 'force_pwd_reset_done:';

const storageGet = (k: string) => {
  try { return localStorage.getItem(k) ?? sessionStorage.getItem(k); } catch { return null; }
};
const storageSet = (k: string, v: string) => {
  try { localStorage.setItem(k, v); } catch {}
  try { sessionStorage.setItem(k, v); } catch {}
};

export const markPasswordResetDone = (userId?: string | null) => {
  if (!userId) return;
  storageSet(FLAG_PREFIX + userId, '1');
};

export const hasResetPassword = (userId?: string | null) => {
  if (!userId) return false;
  return storageGet(FLAG_PREFIX + userId) === '1';
};

const ForcePasswordResetGate = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (location.pathname === '/reset-password') return;
    if (hasResetPassword(user.id)) return;
    navigate('/reset-password', { replace: true });
  }, [user, loading, location.pathname, navigate]);

  return <>{children}</>;
};

export default ForcePasswordResetGate;
