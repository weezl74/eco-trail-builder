import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';


interface LoginFormProps {
  onSuccess: () => void;
}

const Field: React.FC<{
  label: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  type?: string;
  trailing?: React.ReactNode;
}> = ({ label, value, placeholder, onChange, type = 'text', trailing }) => (
  <div className="w-full bg-[#f5a623] rounded-2xl px-5 py-4 flex items-center gap-3 shadow-md">
    <span className="font-serif font-bold text-black text-lg whitespace-nowrap">{label}:</span>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="flex-1 bg-transparent outline-none font-serif font-bold text-black placeholder:text-black/80 text-base min-w-0"
    />
    {trailing}
  </div>
);

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetBusy, setResetBusy] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslations();

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      playBadBaa();
      toast({ title: 'Login failed', description: error.message, variant: 'destructive' });
    } else {
      playGoodBaa();
      onSuccess();
    }
  };

  const handleForgot = async () => {
    if (!resetEmail) return;
    setResetBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setResetBusy(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Check your email', description: 'We\'ve sent a password reset link.' });
      setForgotOpen(false);
      setResetEmail('');
    }
  };

  return (
    <div className="min-h-screen w-full bg-black flex flex-col px-4 pt-10 pb-28">
      <h1 className="text-white font-serif font-bold text-3xl text-center mb-8">{t('Login')}</h1>
      <div className="flex flex-col gap-5">
        <Field label={t('Email')} placeholder="your@email.com" value={email} onChange={setEmail} type="email" />
        <Field
          label={t('Password')}
          placeholder="••••••••"
          value={password}
          onChange={setPassword}
          type={showPw ? 'text' : 'password'}
          trailing={
            <button type="button" onClick={() => setShowPw((s) => !s)} className="text-black" aria-label={showPw ? 'Hide password' : 'Show password'}>
              {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          }
        />
        <button
          type="button"
          onClick={() => { setResetEmail(email); setForgotOpen(true); }}
          className="self-end text-white/90 underline font-serif text-sm pr-2"
        >
          {t('Forgot password?')}
        </button>
      </div>

      {forgotOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-6" onClick={() => setForgotOpen(false)}>
          <div className="w-full max-w-md bg-[#1f1f1f] rounded-2xl p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-white font-serif font-bold text-xl">{t('Reset your password')}</h2>
            <p className="text-white/80 text-sm font-serif">{t("Enter your email and we'll send a reset link.")}</p>
            <div className="w-full bg-[#f5a623] rounded-2xl px-5 py-4 flex items-center gap-3">
              <span className="font-serif font-bold text-black text-lg">{t('Email')}:</span>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 bg-transparent outline-none font-serif font-bold text-black placeholder:text-black/80 text-base min-w-0"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setForgotOpen(false)}
                className="flex-1 py-3 rounded-2xl bg-white/10 text-white font-serif font-bold"
              >
                {t('Cancel')}
              </button>
              <button
                disabled={!resetEmail || resetBusy}
                onClick={handleForgot}
                className={`flex-1 py-3 rounded-2xl font-serif font-bold ${resetEmail && !resetBusy ? 'bg-[#3a5a8a] text-white' : 'bg-[#3a5a8a]/60 text-white/70'}`}
              >
                {resetBusy ? t('Sending…') : t('Send link')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed left-0 right-0 bottom-4 px-6 flex justify-center">
        <button
          disabled={loading || !email || !password}
          onClick={handleLogin}
          className={`w-full max-w-md py-5 rounded-2xl font-serif font-bold text-2xl shadow-lg transition ${
            !loading && email && password ? 'bg-[#3a5a8a] text-white active:scale-[0.98]' : 'bg-[#3a5a8a]/60 text-white/70'
          }`}
        >
          {loading ? t('Signing in...') : t('Sign In')}
        </button>
      </div>
    </div>
  );
};

export default LoginForm;
