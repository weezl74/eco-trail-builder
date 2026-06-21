import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const FLAG_PREFIX = 'force_pwd_reset_done:';

export const markPasswordResetDone = (userId?: string | null) => {
  if (!userId) return;
  try {
    sessionStorage.setItem(FLAG_PREFIX + userId, '1');
  } catch {}
};

const isResetDone = (userId?: string | null) => {
  if (!userId) return false;
  try {
    return sessionStorage.getItem(FLAG_PREFIX + userId) === '1';
  } catch {
    return false;
  }
};

const ForcePasswordResetGate = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (isResetDone(user.id)) return;
    if (location.pathname === '/reset-password') return;
    navigate('/reset-password', { replace: true });
  }, [user, loading, location.pathname, navigate]);

  return <>{children}</>;
};

export default ForcePasswordResetGate;
