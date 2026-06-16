import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from '@/hooks/useTranslations';

interface Props {
  onComplete: () => void;
  editMode?: boolean;
}

const SECTORS = [
  'Retail', 'Hospitality', 'Professional services', 'Construction',
  'Manufacturing', 'Health & care', 'Education', 'Arts & culture',
  'Transport & logistics', 'Agriculture & food', 'Other',
];

const Row: React.FC<{
  label: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  required?: boolean;
}> = ({ label, value, placeholder, onChange, multiline, required }) => (
  <div className="w-full bg-[#f5a623] rounded-2xl px-5 py-3 shadow-md">
    <span className="block font-serif font-bold text-black text-sm mb-1">
      {label}{required && <span className="text-red-700"> *</span>}
    </span>
    {multiline ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full bg-white/40 rounded-lg px-3 py-2 outline-none font-serif text-black placeholder:text-black/70 text-base"
      />
    ) : (
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/40 rounded-lg px-3 py-2 outline-none font-serif text-black placeholder:text-black/70 text-base"
      />
    )}
  </div>
);

const BusinessOnboarding: React.FC<Props> = ({ onComplete, editMode }) => {
  const { t } = useTranslations();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    business_name: '',
    tagline: '',
    sector: '',
    website: '',
    phone: '',
    address: '',
    postcode: '',
    climate_goals: '',
    pen_portrait: '',
    offer_to_residents: '',
    offer_to_businesses: '',
  });

  // Pre-load if editing
  useEffect(() => {
    if (!editMode || !user) return;
    (async () => {
      const { data } = await supabase
        .from('business_cards')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) setForm((f) => ({ ...f, ...data }));
    })();
  }, [editMode, user]);

  const canSubmit = !loading && form.business_name.trim().length > 1 && form.sector.trim();

  const handleSubmit = async () => {
    if (!canSubmit || !user) return;
    setLoading(true);
    const { error } = await supabase
      .from('business_cards')
      .upsert({ user_id: user.id, ...form }, { onConflict: 'user_id' });
    if (!error) {
      await supabase.from('profiles').update({ account_type: 'business' }).eq('user_id', user.id);
    }
    setLoading(false);
    if (error) {
      toast({ title: t('Could not save card'), description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: editMode ? t('Card updated') : t('Card submitted — auto-approved for early access') });
    onComplete();
  };

  return (
    <div className="min-h-screen w-full bg-black px-4 pt-6 pb-28">
      <h1 className="font-serif font-bold text-2xl text-white mb-2">
        {editMode ? t('Edit your business card') : t('Build your business card')}
      </h1>
      <p className="text-white/80 font-serif text-sm mb-4 leading-snug">
        {t('This card will appear in the Woolly Wallets of residents and businesses across Caerphilly. Use the free-text fields to offer help — advice, consultancy, discounts for active-travel visits, anything that lowers carbon.')}
      </p>

      <div className="flex flex-col gap-3">
        <Row label={t('Business name')} required placeholder={t('e.g. Caerphilly Coffee Co.')}
          value={form.business_name} onChange={(v) => setForm({ ...form, business_name: v })} />

        <div className="w-full bg-[#f5a623] rounded-2xl px-5 py-3 shadow-md">
          <span className="block font-serif font-bold text-black text-sm mb-1">
            {t('Sector')} <span className="text-red-700">*</span>
          </span>
          <select
            value={form.sector}
            onChange={(e) => setForm({ ...form, sector: e.target.value })}
            className="w-full bg-white/40 rounded-lg px-3 py-2 outline-none font-serif text-black text-base"
          >
            <option value="">{t('Choose a sector')}</option>
            {SECTORS.map((s) => <option key={s} value={s}>{t(s)}</option>)}
          </select>
        </div>

        <Row label={t('Tagline')} placeholder={t('One line about you')}
          value={form.tagline} onChange={(v) => setForm({ ...form, tagline: v })} />
        <Row label={t('Pen portrait')} multiline placeholder={t('A short paragraph about your business and why low carbon matters to you.')}
          value={form.pen_portrait} onChange={(v) => setForm({ ...form, pen_portrait: v })} />
        <Row label={t('Climate goals')} multiline placeholder={t('e.g. Net zero by 2030; halve packaging by 2027.')}
          value={form.climate_goals} onChange={(v) => setForm({ ...form, climate_goals: v })} />

        <Row label={t('Offer to residents')} multiline placeholder={t('e.g. 10% off for anyone who arrives by foot, bike or bus. Free repair advice on Saturdays.')}
          value={form.offer_to_residents} onChange={(v) => setForm({ ...form, offer_to_residents: v })} />
        <Row label={t('Offer to businesses')} multiline placeholder={t('e.g. Free 30-min carbon advice call. Bulk discounts on local supplies.')}
          value={form.offer_to_businesses} onChange={(v) => setForm({ ...form, offer_to_businesses: v })} />

        <Row label={t('Website')} placeholder="https://"
          value={form.website} onChange={(v) => setForm({ ...form, website: v })} />
        <Row label={t('Phone')} placeholder={t('Business phone')}
          value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
        <Row label={t('Address')} placeholder={t('Street address')}
          value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
        <Row label={t('Postcode')} placeholder={t('CF...')}
          value={form.postcode} onChange={(v) => setForm({ ...form, postcode: v })} />
      </div>

      <div className="fixed left-0 right-0 bottom-4 px-6 flex justify-center pointer-events-none">
        <button
          disabled={!canSubmit}
          onClick={handleSubmit}
          className={`pointer-events-auto w-full max-w-md py-4 rounded-2xl font-serif font-bold text-xl shadow-lg transition ${
            canSubmit ? 'bg-[#3a5a8a] text-white active:scale-[0.98]' : 'bg-[#3a5a8a]/60 text-white/70 cursor-not-allowed'
          }`}
        >
          {loading ? t('Saving…') : editMode ? t('Save changes') : t('Submit business card')}
        </button>
      </div>
    </div>
  );
};

export default BusinessOnboarding;
