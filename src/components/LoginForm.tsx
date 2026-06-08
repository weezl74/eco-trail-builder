import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LoginFormProps {
  onSuccess: () => void;
}

const Field: React.FC<{
  label: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  type?: string;
}> = ({ label, value, placeholder, onChange, type = 'text' }) => (
  <div className="w-full bg-[#f5a623] rounded-2xl px-5 py-4 flex items-center gap-3 shadow-md">
    <span className="font-serif font-bold text-black text-lg whitespace-nowrap">{label}:</span>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="flex-1 bg-transparent outline-none font-serif font-bold text-black placeholder:text-black/80 text-base min-w-0"
    />
  </div>
);

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: 'Login failed', description: error.message, variant: 'destructive' });
    } else {
      onSuccess();
    }
  };

  return (
    <div className="min-h-screen w-full bg-black flex flex-col px-4 pt-10 pb-28">
      <h1 className="text-white font-serif font-bold text-3xl text-center mb-8">Login</h1>
      <div className="flex flex-col gap-5">
        <Field label="Email" placeholder="your@email.com" value={email} onChange={setEmail} type="email" />
        <Field label="Password" placeholder="••••••••" value={password} onChange={setPassword} type="password" />
      </div>
      <div className="fixed left-0 right-0 bottom-4 px-6 flex justify-center">
        <button
          disabled={loading || !email || !password}
          onClick={handleLogin}
          className={`w-full max-w-md py-5 rounded-2xl font-serif font-bold text-2xl shadow-lg transition ${
            !loading && email && password ? 'bg-[#3a5a8a] text-white active:scale-[0.98]' : 'bg-[#3a5a8a]/60 text-white/70'
          }`}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </div>
    </div>
  );
};

export default LoginForm;
