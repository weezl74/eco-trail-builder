import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from '@/hooks/useTranslations';
import { SECTORS, getSector, SectorKey } from '@/lib/sectorIcons';
import { Phone, MapPin, Globe, Check, RotateCcw } from 'lucide-react';

interface Props {
  onComplete: () => void;
  editMode?: boolean;
}

type FormState = {
  business_name: string;
  tagline: string;
  sector: string;
  sector_icon: string;
  website: string;
  phone: string;
  address: string;
  postcode: string;
  climate_goals: string;
  pen_portrait: string;
  offer_to_residents: string;
  offer_to_businesses: string;
  reward_text: string;
  stamps_required: number;
  latitude: number | null;
  longitude: number | null;
};

const EMPTY: FormState = {
  business_name: '',
  tagline: '',
  sector: '',
  sector_icon: '',
  website: '',
  phone: '',
  address: '',
  postcode: '',
  climate_goals: '',
  pen_portrait: '',
  offer_to_residents: '',
  offer_to_businesses: '',
  reward_text: '',
  stamps_required: 6,
  latitude: null,
  longitude: null,
};

// Tiny inline editable field on the live card preview.
const EditableLine: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  className?: string;
  multiline?: boolean;
  maxLength?: number;
}> = ({ value, onChange, placeholder, className, multiline, maxLength = 240 }) => {
  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={2}
        onClick={(e) => e.stopPropagation()}
        className={`w-full bg-transparent outline-none resize-none placeholder:text-black/40 ${className ?? ''}`}
      />
    );
  }
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      onClick={(e) => e.stopPropagation()}
      className={`w-full bg-transparent outline-none placeholder:text-black/40 ${className ?? ''}`}
    />
  );
};

const BusinessOnboarding: React.FC<Props> = ({ onComplete, editMode }) => {
  const { t } = useTranslations();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [sectorPickerOpen, setSectorPickerOpen] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  // Pre-load if editing
  useEffect(() => {
    if (!editMode || !user) return;
    (async () => {
      const { data } = await supabase
        .from('business_cards')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        setForm((f) => ({
          ...f,
          ...data,
          stamps_required: data.stamps_required ?? 6,
          sector_icon: data.sector_icon ?? '',
        }));
      }
    })();
  }, [editMode, user]);

  const sectorMeta = useMemo(() => getSector(form.sector_icon), [form.sector_icon]);
  const SectorIcon = sectorMeta.Icon;

  const canSubmit =
    !loading &&
    form.business_name.trim().length > 1 &&
    form.sector_icon.trim().length > 0 &&
    form.postcode.trim().length > 0;

  // UK postcode -> lat/lng via postcodes.io (free, no key)
  const geocodePostcode = async (pc: string) => {
    const cleaned = pc.replace(/\s+/g, '').toUpperCase();
    if (cleaned.length < 5) return;
    setGeocoding(true);
    try {
      const r = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(cleaned)}`);
      const j = await r.json();
      if (j?.result?.latitude && j?.result?.longitude) {
        setForm((f) => ({ ...f, latitude: j.result.latitude, longitude: j.result.longitude }));
      }
    } catch { /* ignore */ }
    finally { setGeocoding(false); }
  };

  const handleSubmit = async () => {
    if (!canSubmit || !user) return;
    setLoading(true);
    // Final geocode if user changed postcode and didn't blur it
    if (!form.latitude || !form.longitude) {
      await geocodePostcode(form.postcode);
    }
    const payload = {
      user_id: user.id,
      business_name: form.business_name,
      tagline: form.tagline,
      sector: sectorMeta.label,
      sector_icon: form.sector_icon,
      website: form.website,
      phone: form.phone,
      address: form.address,
      postcode: form.postcode,
      climate_goals: form.climate_goals,
      pen_portrait: form.pen_portrait,
      offer_to_residents: form.offer_to_residents,
      offer_to_businesses: form.offer_to_businesses,
      reward_text: form.reward_text,
      stamps_required: form.stamps_required,
      latitude: form.latitude,
      longitude: form.longitude,
    };
    const { error } = await supabase
      .from('business_cards')
      .upsert(payload, { onConflict: 'user_id' });
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
      <div className="flex items-center justify-between mb-3">
        <h1 className="font-serif font-bold text-2xl text-white">
          {editMode ? t('Edit your business card') : t('Build your business card')}
        </h1>
        <button
          type="button"
          onClick={() => setFlipped((v) => !v)}
          className="flex items-center gap-1 text-white/80 text-xs bg-white/10 rounded-full px-3 py-1.5"
          aria-label={t('Flip card')}
        >
          <RotateCcw className="h-3.5 w-3.5" /> {t('Flip')}
        </button>
      </div>
      <p className="text-white/70 font-serif text-xs mb-4 leading-snug">
        {t('Fill in your card directly. Tap the card to flip — front is your shopfront, back is contact details, offer & loyalty stamps.')}
      </p>

      {/* ===== LIVE FLIPPABLE CARD ===== */}
      <div className="perspective-1000 w-full" style={{ aspectRatio: '1.586 / 1' }}>
        <div
          className={`relative w-full h-full preserve-3d transition-transform duration-700 cursor-pointer ${flipped ? 'rotate-y-180' : ''}`}
          onClick={() => setFlipped((v) => !v)}
        >
          {/* FRONT */}
          <div
            className="absolute inset-0 backface-hidden rounded-2xl p-4 shadow-xl overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${sectorMeta.color} 0%, #000 140%)`, color: '#fff' }}
          >
            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10" />
            <div className="relative h-full flex flex-col justify-between">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setSectorPickerOpen(true); }}
                  className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0 border border-white/30 active:scale-95"
                  aria-label={t('Choose sector avatar')}
                >
                  <SectorIcon className="h-8 w-8 text-white" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-wider opacity-80">{t(sectorMeta.label)}</p>
                  <div className="text-lg font-bold leading-tight bg-white/15 rounded-md px-2 py-1 mt-0.5">
                    <EditableLine
                      value={form.business_name}
                      onChange={(v) => set('business_name', v)}
                      placeholder={t('Business name')}
                      className="text-white placeholder:text-white/50 font-bold"
                      maxLength={60}
                    />
                  </div>
                </div>
              </div>
              <div className="bg-white/15 rounded-md px-2 py-1.5 text-sm italic">
                <EditableLine
                  value={form.tagline}
                  onChange={(v) => set('tagline', v)}
                  placeholder={t('One line about you')}
                  className="text-white placeholder:text-white/50 italic"
                  maxLength={80}
                />
              </div>
              <p className="text-[10px] opacity-70 text-center">{t('Tap card to flip')}</p>
            </div>
          </div>

          {/* BACK */}
          <div
            className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl p-3 shadow-xl overflow-hidden bg-[#f4971d] text-black"
          >
            <div className="h-full flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <SectorIcon className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider truncate flex-1">
                  {form.business_name || t('Your card')}
                </span>
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex items-center gap-1.5 bg-white/40 rounded px-1.5 py-0.5">
                  <Phone className="h-3 w-3 shrink-0" />
                  <EditableLine value={form.phone} onChange={(v) => set('phone', v)} placeholder={t('Phone')} maxLength={30} />
                </div>
                <div className="flex items-center gap-1.5 bg-white/40 rounded px-1.5 py-0.5">
                  <Globe className="h-3 w-3 shrink-0" />
                  <EditableLine value={form.website} onChange={(v) => set('website', v)} placeholder="https://" maxLength={120} />
                </div>
                <div className="flex items-center gap-1.5 bg-white/40 rounded px-1.5 py-0.5">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <EditableLine value={form.address} onChange={(v) => set('address', v)} placeholder={t('Street address')} maxLength={120} />
                  <input
                    value={form.postcode}
                    onChange={(e) => set('postcode', e.target.value)}
                    onBlur={() => geocodePostcode(form.postcode)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder={t('CF...')}
                    className="w-20 bg-white/60 rounded px-1 outline-none text-[11px] font-bold uppercase"
                    maxLength={10}
                  />
                </div>
              </div>
              <div className="bg-white/40 rounded px-1.5 py-1 text-[10px]">
                <p className="font-bold uppercase tracking-wider opacity-70">{t('Reward')}</p>
                <EditableLine
                  value={form.reward_text}
                  onChange={(v) => set('reward_text', v)}
                  placeholder={t('e.g. Free coffee after 6 visits')}
                  maxLength={60}
                  className="text-[11px]"
                />
              </div>
              {/* stamp dots preview */}
              <div className="flex gap-1 justify-center">
                {Array.from({ length: form.stamps_required }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-full border ${i === form.stamps_required - 1 ? 'border-dashed border-black/70 bg-yellow-300' : 'border-black/50 bg-white/40'}`}
                    style={{ width: 14, height: 14 }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {geocoding && (
        <p className="text-[10px] text-white/60 mt-2 text-center">{t('Locating your postcode…')}</p>
      )}
      {form.latitude && form.longitude && (
        <p className="text-[10px] text-emerald-300 mt-2 text-center flex items-center justify-center gap-1">
          <Check className="h-3 w-3" /> {t('Pin placed on Act Local map')}
        </p>
      )}

      {/* ===== Extras below the card ===== */}
      <div className="mt-5 space-y-3">
        <div className="bg-white/5 rounded-2xl p-3">
          <label className="block text-white/80 text-xs font-bold mb-1">{t('Pen portrait')}</label>
          <textarea
            value={form.pen_portrait}
            onChange={(e) => set('pen_portrait', e.target.value)}
            rows={3}
            placeholder={t('A short paragraph about your business and why low carbon matters to you.')}
            className="w-full bg-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none placeholder:text-white/40"
          />
        </div>

        <div className="bg-white/5 rounded-2xl p-3">
          <label className="block text-white/80 text-xs font-bold mb-1">{t('Climate goals')}</label>
          <textarea
            value={form.climate_goals}
            onChange={(e) => set('climate_goals', e.target.value)}
            rows={2}
            placeholder={t('e.g. Net zero by 2030; halve packaging by 2027.')}
            className="w-full bg-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none placeholder:text-white/40"
          />
        </div>

        <div className="bg-white/5 rounded-2xl p-3">
          <label className="block text-white/80 text-xs font-bold mb-1">{t('Offer to residents')}</label>
          <textarea
            value={form.offer_to_residents}
            onChange={(e) => set('offer_to_residents', e.target.value)}
            rows={2}
            placeholder={t('e.g. 10% off for anyone who arrives by foot, bike or bus.')}
            className="w-full bg-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none placeholder:text-white/40"
          />
        </div>

        <div className="bg-white/5 rounded-2xl p-3">
          <label className="block text-white/80 text-xs font-bold mb-1">{t('Offer to businesses')}</label>
          <textarea
            value={form.offer_to_businesses}
            onChange={(e) => set('offer_to_businesses', e.target.value)}
            rows={2}
            placeholder={t('e.g. Free 30-min carbon advice call.')}
            className="w-full bg-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none placeholder:text-white/40"
          />
        </div>

        <div className="bg-white/5 rounded-2xl p-3">
          <label className="block text-white/80 text-xs font-bold mb-2">
            {t('Loyalty stamps required')}: <span className="text-[#f4971d]">{form.stamps_required}</span>
          </label>
          <input
            type="range"
            min={3}
            max={12}
            value={form.stamps_required}
            onChange={(e) => set('stamps_required', Number(e.target.value))}
            className="w-full accent-[#f4971d]"
          />
          <p className="text-[10px] text-white/50 mt-1">{t('How many visits before residents earn your reward.')}</p>
        </div>
      </div>

      {/* ===== Sector picker overlay ===== */}
      {sectorPickerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-4"
          onClick={() => setSectorPickerOpen(false)}
        >
          <div
            className="bg-zinc-900 rounded-2xl p-4 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-serif font-bold text-white text-lg mb-3">{t('Choose your sector avatar')}</h2>
            <div className="grid grid-cols-4 gap-2">
              {SECTORS.map((s) => {
                const SIcon = s.Icon;
                const selected = form.sector_icon === s.key;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => {
                      set('sector_icon', s.key);
                      set('sector', s.label);
                      setSectorPickerOpen(false);
                    }}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-1 p-1 border-2 transition ${
                      selected ? 'border-[#f4971d] bg-white/10' : 'border-white/10 bg-white/5'
                    }`}
                    style={selected ? { background: `${s.color}33` } : undefined}
                  >
                    <SIcon className="h-6 w-6" style={{ color: s.color }} />
                    <span className="text-[9px] text-white/80 text-center leading-tight">{t(s.label)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Submit */}
      <div className="fixed left-0 right-0 bottom-4 px-6 flex justify-center pointer-events-none">
        <button
          disabled={!canSubmit}
          onClick={handleSubmit}
          className={`pointer-events-auto w-full max-w-md py-4 rounded-2xl font-serif font-bold text-xl shadow-lg transition ${
            canSubmit ? 'bg-[#f4971d] text-black active:scale-[0.98]' : 'bg-[#f4971d]/40 text-black/50 cursor-not-allowed'
          }`}
        >
          {loading ? t('Saving…') : editMode ? t('Save changes') : t('Submit business card')}
        </button>
      </div>
    </div>
  );
};

export default BusinessOnboarding;
