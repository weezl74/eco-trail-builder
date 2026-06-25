import React, { useEffect, useState } from 'react';
import { Check, Circle, ArrowLeft, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useTranslations } from '@/hooks/useTranslations';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { usePoints } from '@/hooks/usePoints';
import quizIcon from '@/assets/svg/quiz-icon.svg.asset.json';

const QUIZ_WOOL_POINTS = 5;
const storageKey = (uid: string) => `quizzes:${uid}`;

type Question = { q: string; options: string[]; answer: number; explain: string };

type Topic = { id: string; label: string; questions: Question[] };

const TOPICS: Topic[] = [
  {
    id: 'climate',
    label: 'Climate Change',
    questions: [
      { q: 'What is the main human cause of recent climate change?', options: ['Volcanic eruptions', 'Burning fossil fuels', 'Solar flares', 'Cosmic rays'], answer: 1, explain: 'Burning coal, oil and gas releases CO₂ that traps heat in the atmosphere.' },
      { q: 'Roughly how much has the global average temperature risen since 1900?', options: ['About 0.2°C', 'About 1.2°C', 'About 3°C', 'About 5°C'], answer: 1, explain: 'The planet has warmed by roughly 1.2°C since the late 1800s.' },
      { q: 'Which gas is the largest single contributor to warming today?', options: ['Methane', 'Carbon dioxide', 'Nitrous oxide', 'Water vapour'], answer: 1, explain: 'CO₂ accounts for the majority of long-lived greenhouse warming.' },
      { q: 'A warmer atmosphere holds more…', options: ['Oxygen', 'Water vapour', 'Nitrogen', 'Helium'], answer: 1, explain: 'About 7% more moisture per 1°C — which is why downpours are getting heavier.' },
      { q: 'Which UK nation set a legal net-zero target first?', options: ['England', 'Scotland', 'Wales', 'Northern Ireland'], answer: 2, explain: 'Wales legislated for net-zero by 2050 with strong interim targets.' },
    ],
  },
  {
    id: 'decarb',
    label: 'Decarbonisation',
    questions: [
      { q: 'Decarbonisation means…', options: ['Removing carbon from steel', 'Reducing CO₂ emissions across the economy', 'Banning all carbon products', 'Replanting forests only'], answer: 1, explain: 'It is the broad shift to lower-carbon energy, transport, food and buildings.' },
      { q: 'Which sector is the UK\'s biggest emitter today?', options: ['Aviation', 'Transport', 'Agriculture', 'Tourism'], answer: 1, explain: 'Road transport overtook power as the UK\'s largest emitting sector.' },
      { q: 'A heat pump moves heat rather than burning fuel — it is typically how efficient?', options: ['50%', '90%', '300%+', '1000%'], answer: 2, explain: 'A good heat pump delivers 3–4 units of heat per unit of electricity.' },
      { q: 'Which is the lowest-carbon way to travel between Cardiff and London?', options: ['Petrol car alone', 'Domestic flight', 'Train', 'Diesel coach'], answer: 2, explain: 'Rail is roughly 6× lower-carbon per passenger than a solo petrol car.' },
      { q: 'Switching to a green electricity tariff…', options: ['Has no effect', 'Increases overall demand for renewables', 'Removes existing emissions', 'Powers your home from sunshine only'], answer: 1, explain: 'It signals demand and helps fund more renewable generation.' },
    ],
  },
  {
    id: 'greenhouse',
    label: 'Greenhouse Effect',
    questions: [
      { q: 'The greenhouse effect is…', options: ['Always harmful', 'A natural process that keeps Earth warm', 'Caused only by humans', 'Cooling the Earth'], answer: 1, explain: 'Without it Earth would be about 33°C colder — humans are now strengthening it.' },
      { q: 'Which is NOT a greenhouse gas?', options: ['Carbon dioxide', 'Methane', 'Oxygen', 'Nitrous oxide'], answer: 2, explain: 'Oxygen does not trap infrared heat the way greenhouse gases do.' },
      { q: 'Methane is, over 20 years, roughly how much more potent than CO₂?', options: ['2×', '10×', '80×', '500×'], answer: 2, explain: 'Methane is about 80× more warming than CO₂ over a 20-year window.' },
      { q: 'Which everyday source produces methane?', options: ['Solar panels', 'Food waste left to rot', 'LED bulbs', 'Tap water'], answer: 1, explain: 'Food waste breaking down without air releases methane.' },
      { q: 'Trees help by…', options: ['Releasing CO₂', 'Absorbing CO₂ and storing carbon', 'Generating methane', 'Reflecting sunlight only'], answer: 1, explain: 'They lock carbon away in wood, roots and soil.' },
    ],
  },
  {
    id: 'fossil',
    label: 'Fossil Fuels',
    questions: [
      { q: 'Fossil fuels were formed from…', options: ['Volcanic lava', 'Ancient plants and plankton', 'Meteorites', 'Sea salt'], answer: 1, explain: 'They\'re the buried remains of life from hundreds of millions of years ago.' },
      { q: 'Which fossil fuel emits the most CO₂ per unit of energy?', options: ['Natural gas', 'Oil', 'Coal', 'They\'re identical'], answer: 2, explain: 'Coal is the most carbon-intensive of the three.' },
      { q: 'The UK closed its last coal power station in…', options: ['1999', '2015', '2024', '2030'], answer: 2, explain: 'The UK ended coal-fired electricity in 2024.' },
      { q: 'Petrol and diesel cars are scheduled to stop new UK sales from…', options: ['2025', '2030', '2035', '2050'], answer: 2, explain: 'The current UK target is no new petrol/diesel cars from 2035.' },
      { q: 'A "stranded asset" is…', options: ['A car left in the rain', 'A fossil reserve that can\'t be burned within climate limits', 'A renewable project', 'A solar panel without sun'], answer: 1, explain: 'Many known fossil reserves must stay underground to meet climate goals.' },
    ],
  },
  {
    id: 'renewables',
    label: 'Renewables',
    questions: [
      { q: 'Which is a renewable energy source?', options: ['Coal', 'Natural gas', 'Wind', 'Petroleum'], answer: 2, explain: 'Wind is replenished by the sun heating the atmosphere — endlessly renewable.' },
      { q: 'Wales\' first big offshore wind farm was…', options: ['North Hoyle', 'Hornsea', 'Dogger Bank', 'Triton Knoll'], answer: 0, explain: 'North Hoyle off the North Wales coast opened in 2003.' },
      { q: 'Solar panels still generate on cloudy days because…', options: ['They use moonlight', 'Diffuse daylight still contains photons', 'They burn gas as backup', 'They\'re heated by rain'], answer: 1, explain: 'Diffuse daylight still produces useful electricity, just less than direct sun.' },
      { q: 'What does a battery storage system do for the grid?', options: ['Generates new energy', 'Shifts renewable energy to when it\'s needed', 'Burns hydrogen', 'Cleans the air'], answer: 1, explain: 'It stores surplus renewable power for peak demand periods.' },
      { q: 'Roughly what share of UK electricity came from renewables in 2024?', options: ['About 10%', 'About 25%', 'About 50%', 'About 90%'], answer: 2, explain: 'Around half of UK electricity now comes from renewables.' },
    ],
  },
  {
    id: 'biodiversity',
    label: 'Biodiversity',
    questions: [
      { q: 'Biodiversity means…', options: ['Just the number of trees', 'The variety of life in an ecosystem', 'A type of fertiliser', 'A farming method'], answer: 1, explain: 'It includes species, genes and ecosystems together.' },
      { q: 'Pollinators like bees support roughly what share of food crops?', options: ['5%', '20%', '75%', '99%'], answer: 2, explain: 'About three-quarters of food crops benefit from animal pollination.' },
      { q: 'A hedgerow is valuable because it…', options: ['Looks tidy', 'Provides shelter, food and wildlife corridors', 'Stops rain', 'Generates electricity'], answer: 1, explain: 'Hedgerows are mini-ecosystems linking habitats across farmland.' },
      { q: 'Peatlands matter for climate because they…', options: ['Burn easily', 'Store huge amounts of carbon when wet', 'Release oxygen', 'Are good for ski runs'], answer: 1, explain: 'Healthy peat is one of the densest carbon stores on Earth.' },
      { q: 'A "rewilding" project aims to…', options: ['Plant only one tree species', 'Let natural processes restore an ecosystem', 'Build new towns', 'Replace farmland with concrete'], answer: 1, explain: 'It hands ecosystems back to natural processes and native species.' },
    ],
  },
  {
    id: 'walk-warmup',
    label: '#WalkMyWarmUp',
    questions: [
      { q: 'Swapping a 2-mile car trip for a walk saves roughly how much CO₂?', options: ['10 g', '100 g', '900 g', '5 kg'], answer: 2, explain: 'About 0.9 kg of CO₂ per 2-mile petrol-car trip avoided.' },
      { q: 'Walking briskly for 30 mins a day is linked to…', options: ['Higher risk of illness', 'Reduced risk of heart disease', 'No health benefit', 'More fuel use'], answer: 1, explain: 'NHS-backed research shows clear cardiovascular benefits.' },
      { q: 'School "walking buses" are…', options: ['Electric minibuses', 'Groups of children walked to school by adults', 'A type of timetable', 'A new bike lane'], answer: 1, explain: 'They cut congestion and emissions at the school gate.' },
      { q: 'Active travel investment in Wales focuses on…', options: ['Motorways', 'Walking and cycling routes', 'Cruise ships', 'Helipads'], answer: 1, explain: 'The Active Travel (Wales) Act prioritises walking and cycling.' },
      { q: '#WalkMyWarmUp is mainly about…', options: ['Marathon training', 'Replacing short car trips with walks', 'Buying new trainers', 'Indoor treadmills'], answer: 1, explain: 'Short, regular walks instead of car trips — climate-friendly and healthy.' },
    ],
  },
];

const QuizzesScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { user } = useAuth();
  const { award } = usePoints();
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [reveal, setReveal] = useState(false);
  const { t } = useTranslations();
  const { toast } = useToast();

  // Load persisted state for this user
  useEffect(() => {
    if (!user) return;
    try {
      const raw = localStorage.getItem(storageKey(user.id));
      if (raw) {
        const parsed = JSON.parse(raw);
        setProgress(parsed.progress || {});
        setCompleted(parsed.completed || {});
      }
    } catch (e) {
      console.error('[QuizzesScreen] load failed', e);
    }
  }, [user]);

  // Persist whenever state changes
  useEffect(() => {
    if (!user) return;
    try {
      localStorage.setItem(storageKey(user.id), JSON.stringify({ progress, completed }));
    } catch (e) {
      console.error('[QuizzesScreen] save failed', e);
    }
  }, [user, progress, completed]);

  const topic = TOPICS.find((tp) => tp.id === activeTopic) || null;

  const openTopic = (id: string) => {
    setActiveTopic(id);
    setQIndex(progress[id] && progress[id] < 5 ? progress[id] : 0);
    setSelected(null);
    setReveal(false);
  };

  const closeTopic = () => {
    setActiveTopic(null);
    setSelected(null);
    setReveal(false);
  };

  const submitAnswer = () => {
    if (selected === null || !topic) return;
    setReveal(true);
  };

  const nextQuestion = () => {
    if (!topic) return;
    const isLast = qIndex >= topic.questions.length - 1;
    const wasCompleted = completed[topic.id];
    setProgress((p) => {
      const next = Math.min(5, qIndex + 1);
      if (next === 5 && !wasCompleted) {
        setCompleted((c) => ({ ...c, [topic.id]: true }));
        // Award wool points (unverified knowledge action) — only on first completion
        award(QUIZ_WOOL_POINTS, 'wool', 'quiz', topic.id);
        toast({
          title: t('Quiz completed!'),
          description: `${t(topic.label)} — +${QUIZ_WOOL_POINTS} 🧶`,
        });
      }
      return { ...p, [topic.id]: next };
    });
    if (isLast) {
      closeTopic();
      return;
    }
    setQIndex((i) => i + 1);
    setSelected(null);
    setReveal(false);
  };

  return (
    <div className="min-h-screen bg-black pb-28 px-4 pt-4 relative">
      {onBack && (
        <button onClick={onBack} className="mb-3 text-white flex items-center gap-1 font-serif font-bold">
          <ArrowLeft className="h-5 w-5" /> {t('Back')}
        </button>
      )}
      <div className="space-y-5">
        {TOPICS.map((tp) => {
          const done = completed[tp.id];
          const current = progress[tp.id] ?? 0;
          return (
            <button
              key={tp.id}
              onClick={() => openTopic(tp.id)}
              className="w-full bg-white rounded-2xl p-5 text-left shadow-lg active:scale-[0.99] transition border-2 border-black"
            >
              <div className="flex">
                <div className="flex-1">
                  <h3 className="font-serif font-bold text-2xl text-black">{t(tp.label)}</h3>
                  <p className="font-serif font-bold text-[#f5a623] mt-3">
                    {t('Current Question:')} <span className="text-black">{current}/5</span>
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center gap-3 w-24">
                  <span className="font-serif text-black">{t('Completed?')}</span>
                  {done ? (
                    <Check className="h-9 w-9 text-[#f5a623]" strokeWidth={3} />
                  ) : (
                    <span
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full"
                      style={{
                        boxShadow:
                          '0 0 12px 3px rgba(245,166,35,0.85), 0 0 24px 6px rgba(245,166,35,0.45)',
                        animation: 'pulse 1.6s ease-in-out infinite',
                      }}
                    >
                      <Circle className="h-8 w-8 text-[#f5a623]" strokeWidth={2.5} />
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Quiz icon sat on top of bottom nav, far left */}
      <img
        src={quizIcon.url}
        alt=""
        aria-hidden
        draggable={false}
        className="fixed left-2 bottom-16 h-32 w-32 object-contain pointer-events-none z-40 drop-shadow-lg"
      />



      <Dialog open={!!topic} onOpenChange={(v) => { if (!v) closeTopic(); }}>
        <DialogContent className="bg-[#1f1f1f] border-0 text-white max-w-md p-5 rounded-3xl">
          {topic && (() => {
            const q = topic.questions[qIndex];
            const isCorrect = selected === q.answer;
            return (
              <>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-serif font-bold text-[#f5a623] text-sm uppercase tracking-wide">
                    {t(topic.label)}
                  </p>
                  <button onClick={closeTopic} aria-label="Close" className="text-white/70">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-white/60 text-xs font-serif mb-3">
                  {t('Question')} {qIndex + 1} / {topic.questions.length}
                </p>
                <h3 className="font-serif font-bold text-xl mb-4 leading-snug">{t(q.q)}</h3>

                <div className="space-y-2">
                  {q.options.map((opt, i) => {
                    const chosen = selected === i;
                    const correct = reveal && i === q.answer;
                    const wrong = reveal && chosen && i !== q.answer;
                    return (
                      <button
                        key={i}
                        disabled={reveal}
                        onClick={() => setSelected(i)}
                        className={`w-full text-left rounded-xl p-3 border-2 font-serif transition ${
                          correct
                            ? 'bg-green-600/30 border-green-400 text-white'
                            : wrong
                            ? 'bg-red-600/30 border-red-400 text-white'
                            : chosen
                            ? 'bg-white text-black border-white'
                            : 'bg-[#2a2a2a] border-white/20 text-white hover:border-white/50'
                        }`}
                      >
                        {t(opt)}
                      </button>
                    );
                  })}
                </div>

                {reveal && (
                  <div className={`mt-4 rounded-xl p-3 text-sm font-serif ${isCorrect ? 'bg-green-900/40 text-green-100' : 'bg-red-900/40 text-red-100'}`}>
                    <p className="font-bold mb-1">{isCorrect ? t('Correct!') : t('Not quite.')}</p>
                    <p className="opacity-90">{t(q.explain)}</p>
                  </div>
                )}

                <button
                  onClick={reveal ? nextQuestion : submitAnswer}
                  disabled={selected === null}
                  className="w-full mt-4 bg-[#f5a623] disabled:bg-[#f5a623]/40 text-black font-serif font-bold py-3 rounded-xl"
                >
                  {reveal
                    ? qIndex >= topic.questions.length - 1
                      ? t('Finish')
                      : t('Next question')
                    : t('Check answer')}
                </button>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuizzesScreen;
