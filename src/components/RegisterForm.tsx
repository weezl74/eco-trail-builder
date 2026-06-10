import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';

interface RegisterFormProps {
  onComplete: (details: RegistrationDetails) => void;
}

export interface RegistrationDetails {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  postcode: string;
  phone: string;
  age: string;
}

const Field: React.FC<{
  label: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  type?: string;
  inputMode?: 'text' | 'numeric' | 'tel' | 'email';
  trailing?: React.ReactNode;
}> = ({ label, value, placeholder, onChange, type = 'text', inputMode, trailing }) => (
  <div className="w-full bg-[#f5a623] rounded-2xl px-5 py-4 flex items-center gap-3 shadow-md">
    <span className="font-serif font-bold text-black text-lg whitespace-nowrap">{label}:</span>
    <input
      type={type}
      inputMode={inputMode}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="flex-1 bg-transparent outline-none font-serif font-bold text-black placeholder:text-black/80 placeholder:font-bold text-base min-w-0"
    />
    {trailing}
  </div>
);

const RegisterForm: React.FC<RegisterFormProps> = ({ onComplete }) => {
  const [d, setD] = useState<RegistrationDetails>({
    firstName: '', lastName: '', email: '', address: '', postcode: '', phone: '', age: '',
  });
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const canSubmit =
    agreed && !loading &&
    d.firstName.trim() && d.lastName.trim() && d.email.trim() &&
    password.length >= 6 &&
    d.address.trim() && d.postcode.trim() && d.phone.trim() && d.age.trim();

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email: d.email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: d.firstName,
          last_name: d.lastName,
          display_name: `${d.firstName} ${d.lastName}`,
          address: d.address,
          postcode: d.postcode,
          phone: d.phone,
          age: d.age,
        },
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: 'Registration failed', description: error.message, variant: 'destructive' });
      return;
    }
    onComplete(d);
  };

  return (
    <div className="min-h-screen w-full bg-black flex flex-col px-4 pt-6 pb-28">
      <div className="flex flex-col gap-4 flex-1">
        <Field label="First Name" placeholder="Enter your First Name"
          value={d.firstName} onChange={(v) => setD({ ...d, firstName: v })} />
        <Field label="Last Name" placeholder="Enter your Last Name"
          value={d.lastName} onChange={(v) => setD({ ...d, lastName: v })} />
        <Field label="Email" placeholder="Enter your Email"
          value={d.email} onChange={(v) => setD({ ...d, email: v })} type="email" inputMode="email" />
        <Field label="Password" placeholder="Min 6 characters"
          value={password} onChange={setPassword} type={showPw ? 'text' : 'password'}
          trailing={
            <button type="button" onClick={() => setShowPw((s) => !s)} className="text-black" aria-label={showPw ? 'Hide password' : 'Show password'}>
              {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          } />
        <Field label="Address" placeholder="Enter your Address"
          value={d.address} onChange={(v) => setD({ ...d, address: v })} />
        <Field label="Postcode" placeholder="Enter your Postcode"
          value={d.postcode} onChange={(v) => setD({ ...d, postcode: v })} />
        <Field label="Phone Number" placeholder="Enter your Phone Number"
          value={d.phone} onChange={(v) => setD({ ...d, phone: v })} type="tel" inputMode="tel" />
        <Field label="Age" placeholder="Enter your Age"
          value={d.age} onChange={(v) => setD({ ...d, age: v })} inputMode="numeric" />

        <label className="flex items-start gap-3 pt-2 cursor-pointer select-none">
          <button
            type="button"
            onClick={() => setAgreed((a) => !a)}
            className={`mt-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center flex-shrink-0 ${agreed ? 'bg-white' : 'bg-transparent'}`}
            aria-pressed={agreed}
          >
            {agreed && <span className="w-3 h-3 rounded-full bg-black" />}
          </button>
          <span className="text-white font-serif font-bold text-base leading-snug">
            I have read and agree{' '}
            <a
              href="https://ccbc-decarb.github.io/privacy-policy/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-blue-400 underline"
            >
              Nurture App's Terms of Service
            </a>{' '}
            <span className="font-bold">and</span>{' '}
            <a
              href="https://ccbc-decarb.github.io/privacy-policy/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-blue-400 underline"
            >
              Privacy Notice
            </a>
          </span>
        </label>
      </div>

      <div className="fixed left-0 right-0 bottom-4 px-6 flex justify-center pointer-events-none">
        <button
          disabled={!canSubmit}
          onClick={handleSubmit}
          className={`pointer-events-auto w-full max-w-md py-5 rounded-2xl font-serif font-bold text-2xl shadow-lg transition ${
            canSubmit ? 'bg-[#3a5a8a] text-white active:scale-[0.98]' : 'bg-[#3a5a8a]/60 text-white/70 cursor-not-allowed'
          }`}
        >
          {loading ? 'Creating account...' : 'Confirm Details'}
        </button>
      </div>
    </div>
  );
};

export default RegisterForm;
