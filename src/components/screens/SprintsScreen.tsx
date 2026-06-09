import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface SprintTemplate {
  id: string;
  title: string;
  description: string;
  durations: (1 | 3 | 7)[];
}

interface ActiveSprint {
  id: string;
  templateId: string;
  title: string;
  durationDays: 1 | 3 | 7;
  startedAt: number; // ms
}

const TEMPLATES: SprintTemplate[] = [
  { id: 'meat-free', title: 'Meat Free', description: 'Cut out meat for the duration of the sprint.', durations: [1, 3, 7] },
  { id: 'ditch-drive', title: 'Ditch My Drive', description: 'Use public transport or active travel instead of the car.', durations: [3, 7] },
  { id: 'zero-waste', title: 'Zero Waste', description: 'Send nothing to landfill — recycle, compost or refuse.', durations: [1, 3, 7] },
  { id: 'unplugged', title: 'Unplugged', description: 'Switch off non-essential electronics at the wall every night.', durations: [1, 3, 7] },
  { id: 'shop-local-only', title: 'Local Only', description: 'Only buy from independent local shops and producers.', durations: [3, 7] },
  { id: 'second-hand', title: 'Second-Hand First', description: 'Buy nothing new — borrow, swap or buy preloved.', durations: [7] },
  { id: 'plastic-free', title: 'Plastic Free', description: 'Avoid all single-use plastic.', durations: [1, 3, 7] },
  { id: 'cold-wash', title: 'Cold Wash Week', description: 'Wash all laundry on cold and line dry.', durations: [7] },
];

const POINTS_PER_DAY = 15;

const storageKey = (uid: string) => `nurture.sprints.${uid}`;

const useSprints = (uid: string | null) => {
  const [sprints, setSprints] = useState<ActiveSprint[]>([]);

  useEffect(() => {
    if (!uid) return;
    try {
      const raw = localStorage.getItem(storageKey(uid));
      if (raw) setSprints(JSON.parse(raw));
    } catch {}
  }, [uid]);

  const persist = (next: ActiveSprint[]) => {
    setSprints(next);
    if (uid) localStorage.setItem(storageKey(uid), JSON.stringify(next));
  };

  return { sprints, persist };
};

const lerpColor = (a: [number, number, number], b: [number, number, number], t: number) =>
  `rgb(${Math.round(a[0] + (b[0] - a[0]) * t)}, ${Math.round(a[1] + (b[1] - a[1]) * t)}, ${Math.round(a[2] + (b[2] - a[2]) * t)})`;

const CountdownCircle: React.FC<{ sprint: ActiveSprint; now: number; size?: number }> = ({
  sprint, now, size = 96,
}) => {
  const totalMs = sprint.durationDays * 24 * 60 * 60 * 1000;
  const elapsed = Math.min(totalMs, Math.max(0, now - sprint.startedAt));
  const progress = elapsed / totalMs; // 0..1
  const remainingMs = totalMs - elapsed;

  // Red (start) -> Blue (end)
  const red: [number, number, number] = [220, 53, 69];
  const blue: [number, number, number] = [30, 110, 220];
  const color = lerpColor(red, blue, progress);

  const r = size / 2 - 6;
  const c = 2 * Math.PI * r;
  const dash = c * progress;

  const days = Math.floor(remainingMs / (24 * 60 * 60 * 1000));
  const hours = Math.floor((remainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const mins = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
  const label = remainingMs <= 0
    ? 'Done!'
    : days > 0 ? `${days}d ${hours}h` : hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#eee" strokeWidth={8} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={8}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          style={{ transition: 'stroke-dasharray 0.5s linear, stroke 0.5s linear' }}
        />
      </svg>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center font-roboto"
        style={{ color }}
      >
        <span className="font-bold text-sm leading-none">{label}</span>
        <span className="text-[10px] opacity-70 mt-0.5">{sprint.durationDays}d</span>
      </div>
    </div>
  );
};

const SprintsScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { sprints, persist } = useSprints(user?.id || null);
  const [now, setNow] = useState(Date.now());
  const [pickingFor, setPickingFor] = useState<SprintTemplate | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000 * 30);
    return () => clearInterval(t);
  }, []);

  const active = sprints.filter((s) => now - s.startedAt < s.durationDays * 86400000);
  const completed = sprints.filter((s) => now - s.startedAt >= s.durationDays * 86400000);

  const activate = (template: SprintTemplate, durationDays: 1 | 3 | 7) => {
    const newSprint: ActiveSprint = {
      id: `${Date.now()}`,
      templateId: template.id,
      title: template.title,
      durationDays,
      startedAt: Date.now(),
    };
    persist([newSprint, ...sprints]);
    setPickingFor(null);
    toast({
      title: 'Sprint started!',
      description: `${template.title} • ${durationDays} day${durationDays > 1 ? 's' : ''}. Earn ${POINTS_PER_DAY * durationDays} points when you finish.`,
    });
  };

  const remove = (id: string) => {
    persist(sprints.filter((s) => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#F4971D] pb-24 px-4 pt-6 font-roboto">
      <button onClick={onBack} className="flex items-center gap-2 text-white font-bold mb-4">
        <ArrowLeft className="h-5 w-5" /> Back
      </button>

      <h1 className="text-white text-3xl font-bold mb-1">Sprints</h1>
      <p className="text-white/90 text-sm mb-5">
        Short bursts of low-carbon living. Pick one, set the length, and watch the
        countdown turn from red to blue as you go.
      </p>

      {/* Active sprints */}
      <h2 className="text-white text-xl font-bold mb-3">Active sprints</h2>
      {active.length === 0 ? (
        <div className="bg-white/95 rounded-2xl p-4 mb-6 text-[#1f1f1f] text-sm">
          No sprints running yet — activate one below to start your countdown.
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {active.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl p-4 shadow-md flex items-center gap-4">
              <CountdownCircle sprint={s} now={now} />
              <div className="flex-1">
                <p className="font-bold text-[#1f1f1f] text-lg leading-tight">{s.title}</p>
                <p className="text-xs text-[#1f1f1f]/70 mt-1">
                  {s.durationDays} day sprint • {POINTS_PER_DAY * s.durationDays} pts on completion
                </p>
              </div>
              <button
                onClick={() => remove(s.id)}
                className="text-xs text-[#1f1f1f]/60 underline"
              >
                Stop
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <>
          <h2 className="text-white text-xl font-bold mb-3">Completed</h2>
          <div className="space-y-2 mb-6">
            {completed.map((s) => (
              <div key={s.id} className="bg-white/95 rounded-2xl p-3 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-[#1e6edc] flex items-center justify-center">
                  <Check className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-[#1f1f1f] text-sm">{s.title}</p>
                  <p className="text-[10px] text-[#1f1f1f]/60">{s.durationDays} day sprint</p>
                </div>
                <button onClick={() => remove(s.id)} className="text-xs text-[#1f1f1f]/60 underline">
                  Clear
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Available */}
      <h2 className="text-white text-xl font-bold mb-3">Available sprints</h2>
      <div className="space-y-3">
        {TEMPLATES.map((t) => {
          const isActive = active.some((s) => s.templateId === t.id);
          return (
            <button
              key={t.id}
              disabled={isActive}
              onClick={() => setPickingFor(t)}
              className={`w-full text-left bg-white rounded-2xl p-4 shadow-md transition active:scale-[0.99] ${
                isActive ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="font-bold text-[#1f1f1f] text-lg">{t.title}</p>
                <span className="text-xs text-[#F4971D] font-bold">
                  {isActive ? 'Running' : t.durations.join(' / ') + ' days'}
                </span>
              </div>
              <p className="text-xs text-[#1f1f1f]/70">{t.description}</p>
            </button>
          );
        })}
      </div>

      {/* Duration picker modal */}
      {pickingFor && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setPickingFor(null)}
        >
          <div
            className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-bold text-[#1f1f1f] text-lg mb-1">{pickingFor.title}</p>
            <p className="text-sm text-[#1f1f1f]/70 mb-4">Choose a sprint length</p>
            <div className="grid grid-cols-3 gap-2">
              {([1, 3, 7] as const).map((d) => {
                const available = pickingFor.durations.includes(d);
                return (
                  <button
                    key={d}
                    disabled={!available}
                    onClick={() => activate(pickingFor, d)}
                    className={`rounded-2xl py-3 font-bold text-white ${
                      available ? 'bg-[#F4971D] hover:opacity-90' : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {d} day{d > 1 ? 's' : ''}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setPickingFor(null)}
              className="w-full mt-4 text-sm text-[#1f1f1f]/60"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SprintsScreen;
