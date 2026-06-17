import React, { useEffect, useState, useCallback } from 'react';
import { Home, Lightbulb, Wheat, Trash2, ShoppingCart, Car } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import CategoryQuestionnaire from '@/components/CategoryQuestionnaire';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from '@/hooks/useTranslations';

type Cat = {
  id: string; // questionnaire id
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  bg: string;
  description: string;
};

const CATEGORIES: Cat[] = [
  { id: 'buildings', label: 'Home', Icon: Home, bg: '#7B5BB6', description: 'Your home & buildings impact' },
  { id: 'energy', label: 'Energy', Icon: Lightbulb, bg: '#4A90D9', description: 'Your household energy use' },
  { id: 'land-food', label: 'Nutrition', Icon: Wheat, bg: '#A8B82A', description: 'Your diet & food choices' },
  { id: 'waste', label: 'Waste', Icon: Trash2, bg: '#3F51A8', description: 'Your waste & recycling habits' },
  { id: 'consumption', label: 'Retail', Icon: ShoppingCart, bg: '#D8443C', description: 'Your shopping & consumption' },
  { id: 'travel', label: 'Transport', Icon: Car, bg: '#A23A3A', description: 'Your transport choices' },
];

const Dial: React.FC<{ value: number; max?: number }> = ({ value, max = 10000 }) => {
  // value in kg CO2/year. Map to 0..1 (clamped)
  const pct = Math.max(0, Math.min(1, value / max));
  // Arc from 180° (left) to 0° (right). angle = 180 - pct*180
  const angle = 180 - pct * 180;
  const cx = 100, cy = 100, r = 70;
  const rad = (angle * Math.PI) / 180;
  const nx = cx + r * Math.cos(rad);
  const ny = cy - r * Math.sin(rad);

  return (
    <div className="w-full flex items-center justify-center">
      <svg viewBox="0 0 200 130" className="w-full max-w-[280px]">
        {/* segments */}
        {[
          { from: 180, to: 150, color: '#2E7D32' },
          { from: 150, to: 120, color: '#7CB342' },
          { from: 120, to: 90,  color: '#FBC02D' },
          { from: 90,  to: 60,  color: '#F57C00' },
          { from: 60,  to: 30,  color: '#E64A19' },
          { from: 30,  to: 0,   color: '#C62828' },
        ].map((s, i) => {
          const a1 = (s.from * Math.PI) / 180;
          const a2 = (s.to * Math.PI) / 180;
          const x1 = cx + r * Math.cos(a1), y1 = cy - r * Math.sin(a1);
          const x2 = cx + r * Math.cos(a2), y2 = cy - r * Math.sin(a2);
          return (
            <path
              key={i}
              d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`}
              stroke={s.color}
              strokeWidth={22}
              fill="none"
              strokeLinecap="butt"
            />
          );
        })}
        {/* needle */}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#111" strokeWidth={4} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={7} fill="#111" />
        <text x={cx} y={cy + 28} textAnchor="middle" fontSize="22" fontWeight="700" fill="#111">
          {Math.round(value)}
        </text>
      </svg>
    </div>
  );
};

const CalculatorScreen: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslations();
  const [footprint, setFootprint] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [active, setActive] = useState<Cat | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const { data: profile } = await supabase
      .from('profiles')
      .select('current_footprint')
      .eq('user_id', user.id)
      .maybeSingle();
    setFootprint(profile?.current_footprint || 0);

    const { data: responses } = await supabase
      .from('user_responses')
      .select('category, impact_value')
      .eq('user_id', user.id);
    const agg: Record<string, number> = {};
    (responses || []).forEach((r: any) => {
      agg[r.category] = (agg[r.category] || 0) + (r.impact_value || 0);
    });
    setScores(agg);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const handleComplete = async (categoryId: string, impact: number) => {
    if (!user) { setActive(null); return; }
    const wasFirstTime = !scores[categoryId];
    // Recompute footprint from all responses to keep it accurate
    const { data: responses } = await supabase
      .from('user_responses')
      .select('category, impact_value')
      .eq('user_id', user.id);
    const agg: Record<string, number> = {};
    let total = 0;
    (responses || []).forEach((r: any) => {
      agg[r.category] = (agg[r.category] || 0) + (r.impact_value || 0);
      total += r.impact_value || 0;
    });
    setScores(agg);
    setFootprint(total);

    // Award points: 25 first time completing a category, +50 bonus for completing all 6
    let pointsAwarded = 0;
    if (wasFirstTime) pointsAwarded += 25;
    const completedCount = Object.keys(agg).length;
    const { data: profile } = await supabase
      .from('profiles')
      .select('total_points, calc_bonus_awarded')
      .eq('user_id', user.id)
      .maybeSingle();
    const currentPoints = profile?.total_points || 0;
    let newPoints = currentPoints + pointsAwarded;
    if (completedCount >= 6 && !profile?.calc_bonus_awarded) {
      newPoints += 50;
      pointsAwarded += 50;
    }
    await supabase
      .from('profiles')
      .update({
        current_footprint: total,
        total_points: newPoints,
        ...(completedCount >= 6 ? { calc_bonus_awarded: true } : {}),
      })
      .eq('user_id', user.id);

    toast({
      title: pointsAwarded > 0 ? `+${pointsAwarded} ${t('points!')}` : t('Score updated'),
      description: `${active ? t(active.label) : ''}: ${((agg[categoryId] || 0) / 1000).toFixed(2)} ${t('tonnes CO₂e/year')}${wasFirstTime ? ' • ' + t('Carbon Counter badge earned!') : ''}`,
    });
    setActive(null);
  };

  return (
    <div className="min-h-screen bg-black pb-24 px-4 pt-4">
      {/* Dial card */}
      <div className="rounded-2xl bg-[#F4971D] p-4 mb-6">
        <Dial value={footprint} />
      </div>

      {/* 6 category tiles */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-5">
        {CATEGORIES.map((c) => {
          const Icon = c.Icon;
          const score = scores[c.id] || 0;
          const tonnes = (score / 1000).toFixed(2);
          return (
            <button
              key={c.id}
              onClick={() => setActive(c)}
              className="flex flex-col items-center"
            >
              <div className="w-full aspect-square rounded-2xl bg-white p-1.5 shadow-md">
                <div
                  className="w-full h-full rounded-xl flex flex-col items-center justify-between py-2"
                  style={{ backgroundColor: c.bg }}
                >
                  <span className="font-serif font-bold text-white text-sm leading-tight">{t(c.label)}</span>
                  <Icon className="w-10 h-10 text-white" />
                  <span className="text-white font-bold text-[10px] leading-tight text-center px-1">
                    {tonnes} {t('tonnes CO₂e/year')}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {active && (
        <CategoryQuestionnaire
          category={{ id: active.id, title: t(active.label), description: t(active.description) }}
          onComplete={handleComplete}
          onClose={() => setActive(null)}
          user={user}
        />
      )}
    </div>
  );
};

export default CalculatorScreen;
