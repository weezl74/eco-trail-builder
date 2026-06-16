import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from '@/hooks/useTranslations';

interface SprintTemplate {
  id: string;
  title: string;
  description: string;
  durations: (7 | 14 | 30)[];
}

interface ActiveSprint {
  id: string;
  templateId: string;
  title: string;
  durationDays: 7 | 14 | 30;
  startedAt: number;
}

const TEMPLATES: SprintTemplate[] = [
  { id: 'paperless', title: 'Paperless Fortnight', description: 'Run the office with zero printing for the duration.', durations: [7, 14] },
  { id: 'lights-out', title: 'Lights & Screens Out', description: 'Shut down every screen and non-essential light at the wall each night.', durations: [7, 14, 30] },
  { id: 'local-supply', title: 'Local Supply Sprint', description: 'Place every supply order this period with Caerphilly or Welsh suppliers.', durations: [14, 30] },
  { id: 'meeting-walk', title: 'Walking Meetings', description: 'Replace at least one meeting a day with a walking meeting.', durations: [7, 14] },
  { id: 'no-fly', title: 'No-Fly Period', description: 'Replace any flights with trains or virtual meetings.', durations: [30] },
  { id: 'plant-menu', title: 'Plant-Forward Catering', description: 'Default all team meals and client catering to plant-based.', durations: [7, 14, 30] },
  { id: 'waste-zero', title: 'Waste Zero Sprint', description: 'Send nothing to landfill — recycle, compost, refuse.', durations: [7, 14] },
  { id: 'commute-swap', title: 'Commute Swap', description: 'Whole team logs at least one active or public-transport commute per week.', durations: [14, 30] },
];

const POINTS_PER_DAY = 25;
const storageKey = (uid: string) => `nurture.biz.sprints.${uid}`;

const BusinessSprintsScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslations();
  const [sprints, setSprints] = useState<ActiveSprint[]>([]);
  const [choosing, setChoosing] = useState<SprintTemplate | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!user) return;
    try {
      const raw = localStorage.getItem(storageKey(user.id));
      if (raw) setSprints(JSON.parse(raw));
    } catch {}
  }, [user]);

  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(i);
  }, []);

  const persist = (next: ActiveSprint[]) => {
    setSprints(next);
    if (user) localStorage.setItem(storageKey(user.id), JSON.stringify(next));
  };

  const start = (tmpl: SprintTemplate, duration: 7 | 14 | 30) => {
    const sprint: ActiveSprint = {
      id: `${tmpl.id}-${Date.now()}`,
      templateId: tmpl.id,
      title: tmpl.title,
      durationDays: duration,
      startedAt: Date.now(),
    };
    persist([...sprints, sprint]);
    setChoosing(null);
    toast({ title: t('Sprint started') });
  };

  return (
    <div className="min-h-screen bg-[#F4971D] pb-24 px-4 pt-4">
      {onBack && (
        <button onClick={onBack} className="mb-3 text-black flex items-center gap-1 font-serif font-bold">
          <ArrowLeft className="h-5 w-5" /> {t('Back')}
        </button>
      )}

      {sprints.length > 0 && (
        <div className="mb-4">
          <h2 className="font-serif font-bold text-white text-lg mb-2">{t('Active sprints')}</h2>
          <div className="space-y-2">
            {sprints.map((s) => {
              const totalMs = s.durationDays * 86_400_000;
              const remaining = Math.max(0, s.startedAt + totalMs - now);
              const days = Math.ceil(remaining / 86_400_000);
              return (
                <div key={s.id} className="bg-[#1f1f1f] rounded-xl p-3 text-white font-serif flex items-center justify-between">
                  <div>
                    <p className="font-bold">{t(s.title)}</p>
                    <p className="text-xs opacity-80">{days} {t('days remaining')}</p>
                  </div>
                  {remaining === 0 && <Check className="h-6 w-6 text-green-400" />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {TEMPLATES.map((tmpl) => (
          <div key={tmpl.id} className="bg-[#1f1f1f] rounded-2xl p-4 text-white">
            <h3 className="font-serif font-bold text-lg">{t(tmpl.title)}</h3>
            <p className="font-serif text-sm opacity-90 mt-1">{t(tmpl.description)}</p>
            <div className="flex gap-2 mt-3">
              {tmpl.durations.map((d) => (
                <button
                  key={d}
                  onClick={() => start(tmpl, d)}
                  className="bg-[#F4971D] text-black font-serif font-bold text-sm px-4 py-1.5 rounded-lg"
                >
                  {d} {t('days')} · +{d * POINTS_PER_DAY}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BusinessSprintsScreen;
