import React, { useEffect, useState, useCallback } from 'react';
import { Home, Lightbulb, Wheat, Trash2, ShoppingCart, Car } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import CategoryQuestionnaire from '@/components/CategoryQuestionnaire';
import { useToast } from '@/hooks/use-toast';

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
    await supabase.from('profiles').update({ current_footprint: total }).eq('user_id', user.id);
    toast({ title: 'Score updated', description: `${active?.label}: ${agg[categoryId] || 0} kg CO₂` });
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
          return (
            <button
              key={c.id}
              onClick={() => setActive(c)}
              className="flex flex-col items-center"
            >
              <span className="font-serif font-bold text-white text-lg mb-2">{c.label}</span>
              <div
                className="w-full aspect-square rounded-2xl bg-white p-1.5 shadow-md"
              >
                <div
                  className="w-full h-full rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: c.bg }}
                >
                  <Icon className="w-14 h-14 text-white" />
                </div>
              </div>
              <span className="text-white font-bold mt-1">{score}</span>
            </button>
          );
        })}
      </div>

      {active && (
        <CategoryQuestionnaire
          category={{ id: active.id, title: active.label, description: active.description }}
          onComplete={handleComplete}
          onClose={() => setActive(null)}
          user={user}
        />
      )}
    </div>
  );
};

export default CalculatorScreen;
