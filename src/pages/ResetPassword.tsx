import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => { if (data.session) setReady(true); });
    return () => subscription.unsubscribe();
  }, []);

  const submit = async () => {
    if (password.length < 6) {
      toast({ title: 'Too short', description: 'Use at least 6 characters.', variant: 'destructive' });
      return;
    }
    if (password !== confirm) {
      toast({ title: 'Mismatch', description: 'Passwords do not match.', variant: 'destructive' });
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Password updated', description: 'You can now sign in with your new password.' });
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen w-full bg-black flex flex-col px-4 pt-10 pb-28">
      <h1 className="text-white font-serif font-bold text-3xl text-center mb-8">Reset Password</h1>
      {!ready ? (
        <p className="text-white/80 text-center font-serif">Open this page from the password reset link in your email.</p>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="w-full bg-[#f5a623] rounded-2xl px-5 py-4 flex items-center gap-3 shadow-md">
            <span className="font-serif font-bold text-black text-lg">New:</span>
            <input
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              className="flex-1 bg-transparent outline-none font-serif font-bold text-black placeholder:text-black/80 text-base min-w-0"
            />
            <button type="button" onClick={() => setShow(s => !s)} className="text-black">
              {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <div className="w-full bg-[#f5a623] rounded-2xl px-5 py-4 flex items-center gap-3 shadow-md">
            <span className="font-serif font-bold text-black text-lg">Confirm:</span>
            <input
              type={show ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm password"
              className="flex-1 bg-transparent outline-none font-serif font-bold text-black placeholder:text-black/80 text-base min-w-0"
            />
          </div>
          <button
            disabled={busy}
            onClick={submit}
            className="w-full py-5 rounded-2xl bg-[#3a5a8a] text-white font-serif font-bold text-2xl shadow-lg"
          >
            {busy ? 'Updating…' : 'Update Password'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ResetPassword;
