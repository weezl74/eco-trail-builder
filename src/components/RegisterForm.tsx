import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { markPasswordResetDone } from '@/components/ForcePasswordResetGate';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';

interface RegisterFormProps {
  onComplete: (details: RegistrationDetails, isBusiness: boolean) => void;
}

export interface RegistrationDetails {
  firstName: string;
  lastName: string;
  email: string;
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
    firstName: '', lastName: '', email: '', postcode: '', phone: '', age: '',
  });
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [isBusiness, setIsBusiness] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslations();

  const canSubmit =
    agreed && !loading &&
    d.firstName.trim() && d.lastName.trim() && d.email.trim() &&
    password.length >= 6 &&
    d.postcode.trim() && d.phone.trim() && d.age.trim();

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    const redirectUrl = `${window.location.origin}/`;
    const { error, data } = await supabase.auth.signUp({
      email: d.email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: d.firstName,
          last_name: d.lastName,
          display_name: `${d.firstName} ${d.lastName}`,
          postcode: d.postcode,
          phone: d.phone,
          age: d.age,
        },
      },
    });
    if (error) {
      setLoading(false);
      toast({ title: 'Registration failed', description: error.message, variant: 'destructive' });
      return;
    }
    // New users do NOT need the forced password reset (migration-only flow).
    if (data.user) markPasswordResetDone(data.user.id);
    // Set account_type on profile (best-effort; trigger creates the row).
    if (data.user && isBusiness) {
      try {
        await supabase
          .from('profiles')
          .update({ account_type: 'business' })
          .eq('user_id', data.user.id);
      } catch {}
    }
    setLoading(false);
    onComplete(d, isBusiness);
  };

  return (
    <div className="min-h-screen w-full bg-black flex flex-col px-4 pt-6 pb-28">
      <div className="flex flex-col gap-4 flex-1">
        {/* Business toggle */}
        <div className="w-full bg-[#1f1f1f] rounded-2xl px-5 py-4 flex items-center justify-between gap-3 shadow-md">
          <span className="font-serif font-bold text-white text-base leading-tight">
            {t('Is this a business account?')}
          </span>
          <div className="flex gap-2">
            {([['no', false], ['yes', true]] as const).map(([k, v]) => (
              <button
                key={k}
                type="button"
                onClick={() => setIsBusiness(v)}
                className={`px-4 py-1.5 rounded-xl font-serif font-bold text-sm ${
                  isBusiness === v ? 'bg-[#f5a623] text-black' : 'bg-black/40 text-white/80'
                }`}
              >
                {k === 'yes' ? t('Yes') : t('No')}
              </button>
            ))}
          </div>
        </div>

        <Field label={t('First Name')} placeholder={t('Enter your First Name')}
          value={d.firstName} onChange={(v) => setD({ ...d, firstName: v })} />
        <Field label={t('Last Name')} placeholder={t('Enter your Last Name')}
          value={d.lastName} onChange={(v) => setD({ ...d, lastName: v })} />
        <Field label={t('Email')} placeholder={t('Enter your Email')}
          value={d.email} onChange={(v) => setD({ ...d, email: v })} type="email" inputMode="email" />
        <Field label={t('Password')} placeholder={t('Min 6 characters')}
          value={password} onChange={setPassword} type={showPw ? 'text' : 'password'}
          trailing={
            <button type="button" onClick={() => setShowPw((s) => !s)} className="text-black" aria-label={showPw ? 'Hide password' : 'Show password'}>
              {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          } />
        <Field label={t('Postcode')} placeholder={t('Enter your Postcode')}
          value={d.postcode} onChange={(v) => setD({ ...d, postcode: v })} />
        <Field label={t('Phone Number')} placeholder={t('Enter your Phone Number')}
          value={d.phone} onChange={(v) => setD({ ...d, phone: v })} type="tel" inputMode="tel" />
        <Field label={t('Age')} placeholder={t('Enter your Age')}
          value={d.age} onChange={(v) => setD({ ...d, age: v })} inputMode="numeric" />

        {isBusiness && (
          <div className="bg-[#1f1f1f] rounded-2xl p-4 text-white/90 text-sm leading-snug font-serif">
            {t("Next we'll help you build your business spotlight card. It will appear in the Woolly Wallets of residents and businesses across Caerphilly to promote your low-carbon work and reduce supply-chain emissions. Submissions are auto-approved for early access while we finish full review (1-2 working days). You can use the resident app right away.")}
          </div>
        )}

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
              Nelson App's Terms of Service
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
          {loading ? t('Creating account...') : isBusiness ? t('Next: Business Card') : t('Confirm Details')}
        </button>
      </div>
    </div>
  );
};

export default RegisterForm;
