import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Building, Zap, Droplet, Truck, Plane, Home, Trash, Factory,
  ArrowLeft, ArrowRight, CheckCircle2, XCircle, Info, Target
} from 'lucide-react';
import { getCategoriesForMode } from '@/data/carbonQuestions';
import { calculateEmissions, emissionFactors } from '@/data/emissionFactors';
import type { ReportingMode, CarbonResponse, CategoryResult } from '@/types/carbonReporting';
import { toast } from 'sonner';

const iconMap: Record<string, any> = {
  Building, Zap, Droplet, Truck, Plane, Home, Trash, Factory
};

interface BusinessCarbonReportProps {
  onComplete?: (totalEmissions: number) => void;
  onClose?: () => void;
}

// Resident-style dial: green→red arc with needle. value/max in kg CO2e.
const Dial: React.FC<{ value: number; max?: number }> = ({ value, max = 50000 }) => {
  const pct = Math.max(0, Math.min(1, value / max));
  const angle = 180 - pct * 180;
  const cx = 100, cy = 100, r = 70;
  const rad = (angle * Math.PI) / 180;
  const nx = cx + r * Math.cos(rad);
  const ny = cy - r * Math.sin(rad);
  return (
    <div className="w-full flex items-center justify-center">
      <svg viewBox="0 0 200 130" className="w-full max-w-[280px]">
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
            <path key={i} d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`}
              stroke={s.color} strokeWidth={22} fill="none" strokeLinecap="butt" />
          );
        })}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#111" strokeWidth={4} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={7} fill="#111" />
        <text x={cx} y={cy + 28} textAnchor="middle" fontSize="20" fontWeight="700" fill="#111">
          {Math.round(value)}
        </text>
      </svg>
    </div>
  );
};

export const BusinessCarbonReport: React.FC<BusinessCarbonReportProps> = ({
  onComplete,
  onClose
}) => {
  const [step, setStep] = useState<'mode-select' | 'questionnaire' | 'results'>('mode-select');
  const [mode, setMode] = useState<ReportingMode>('sme');
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, CarbonResponse>>({});
  const [skippedCategories, setSkippedCategories] = useState<string[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const categories = getCategoriesForMode(mode);
  const currentCategory = categories[currentCategoryIndex];
  const progress = ((currentCategoryIndex + 1) / categories.length) * 100;

  const handleModeSelect = (selectedMode: ReportingMode) => {
    setMode(selectedMode);
    setStep('questionnaire');
    setCurrentCategoryIndex(0);
    setResponses({});
    setSkippedCategories([]);
  };

  const handleResponseChange = (questionId: string, value: string) => {
    const question = currentCategory.questions.find(q => q.id === questionId);
    if (!question) return;
    const activityData = parseFloat(value) || 0;
    const emissions = calculateEmissions(question.emissionFactorKey, activityData);
    const factor = emissionFactors[question.emissionFactorKey];
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        category: question.category,
        subcategory: question.subcategory,
        activityData,
        unit: question.unit,
        emissionFactor: factor?.factor || 0,
        emissions,
        notes: notes[questionId]
      }
    }));
  };

  const handleNotesChange = (questionId: string, value: string) => {
    setNotes(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSkipCategory = () => {
    setSkippedCategories(prev => [...prev, currentCategory.id]);
    handleNext();
  };

  const handleNext = () => {
    if (currentCategoryIndex < categories.length - 1) setCurrentCategoryIndex(p => p + 1);
    else setStep('results');
  };

  const handleBack = () => {
    if (currentCategoryIndex > 0) setCurrentCategoryIndex(p => p - 1);
  };

  const calculateResults = (): { categoryResults: CategoryResult[], totalEmissions: number } => {
    const categoryResults: CategoryResult[] = [];
    categories.forEach(category => {
      const categoryResponses = Object.entries(responses).filter(
        ([_, response]) => response.category === category.id ||
        category.questions.some(q => q.id === _)
      );
      if (categoryResponses.length > 0) {
        const totalEmissions = categoryResponses.reduce(
          (sum, [_, response]) => sum + response.emissions, 0
        );
        categoryResults.push({
          category: category.name,
          totalEmissions,
          responses: categoryResponses.map(([_, r]) => r)
        });
      }
    });
    const totalEmissions = categoryResults.reduce((sum, cat) => sum + cat.totalEmissions, 0);
    return { categoryResults, totalEmissions };
  };

  const results = step === 'results' ? calculateResults() : null;
  const totalEmissionsTonnes = results ? results.totalEmissions / 1000 : 0;
  const IconComponent = currentCategory ? iconMap[currentCategory.icon] || Building : Building;

  // ============= MODE SELECT =============
  if (step === 'mode-select') {
    return (
      <div className="min-h-screen bg-black pb-24 px-4 pt-6">
        <div className="rounded-2xl bg-[#F4971D] p-6 mb-6 text-center">
          <Target className="w-12 h-12 text-black mx-auto mb-2" />
          <h1 className="text-2xl font-serif font-bold text-black leading-tight">
            Carbon Reporting Calculator
          </h1>
          <p className="text-black/80 font-serif text-sm mt-1">
            UK Government emission factors
          </p>
        </div>

        <div className="grid gap-4">
          <button
            onClick={() => handleModeSelect('sme')}
            className="w-full bg-white rounded-2xl p-1.5 shadow-md active:scale-95 transition text-left"
          >
            <div className="rounded-xl p-5 bg-[#4A90D9]">
              <Building className="w-10 h-10 text-white mb-3" />
              <h2 className="text-xl font-serif font-bold text-white">SME Calculator</h2>
              <p className="text-white/90 font-serif text-sm mt-1 mb-3">
                Simplified reporting for small & medium businesses
              </p>
              <ul className="text-xs text-white/90 font-serif space-y-1">
                <li>• Core emission categories</li>
                <li>• Buildings energy & water</li>
                <li>• Fleet & business travel</li>
                <li>• Waste disposal</li>
                <li>• ~15 minutes to complete</li>
              </ul>
            </div>
          </button>

          <button
            onClick={() => handleModeSelect('full')}
            className="w-full bg-white rounded-2xl p-1.5 shadow-md active:scale-95 transition text-left"
          >
            <div className="rounded-xl p-5 bg-[#7B5BB6]">
              <Factory className="w-10 h-10 text-white mb-3" />
              <h2 className="text-xl font-serif font-bold text-white">Full Organisation Report</h2>
              <p className="text-white/90 font-serif text-sm mt-1 mb-3">
                Comprehensive reporting for large organisations
              </p>
              <ul className="text-xs text-white/90 font-serif space-y-1">
                <li>• All emission categories</li>
                <li>• Employee commuting</li>
                <li>• Homeworking emissions</li>
                <li>• Supply chain (Tier 1)</li>
                <li>• ~30–45 minutes to complete</li>
              </ul>
            </div>
          </button>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="w-full mt-6 bg-[#1f1f1f] text-white font-serif font-bold py-3 rounded-2xl"
          >
            Cancel
          </button>
        )}
      </div>
    );
  }

  // ============= QUESTIONNAIRE =============
  if (step === 'questionnaire' && currentCategory) {
    return (
      <div className="min-h-screen bg-black pb-24 px-4 pt-6">
        {/* Progress card */}
        <div className="rounded-2xl bg-[#F4971D] p-4 mb-4">
          <div className="flex justify-between text-black font-serif font-bold text-sm mb-2">
            <span>{mode === 'sme' ? 'SME' : 'Full'} Report</span>
            <span>Category {currentCategoryIndex + 1} of {categories.length}</span>
          </div>
          <div className="h-2 bg-black/20 rounded-full overflow-hidden">
            <div className="h-full bg-black" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Category card */}
        <div className="bg-white rounded-2xl p-1.5 shadow-md mb-4">
          <div className="rounded-xl p-5 bg-[#1f1f1f]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-[#F4971D] flex items-center justify-center">
                <IconComponent className="w-6 h-6 text-black" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-serif font-bold text-white leading-tight">
                  {currentCategory.name}
                </h2>
                <p className="text-white/70 font-serif text-sm">{currentCategory.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {currentCategory.questions.map((question) => (
            <div key={question.id} className="bg-white rounded-2xl p-4 shadow-md space-y-2">
              <Label htmlFor={question.id} className="font-serif font-bold text-black flex items-start gap-2 text-sm">
                <span>{question.question}</span>
                {question.required && <span className="text-red-500">*</span>}
              </Label>

              {question.helpText && (
                <p className="text-xs text-gray-600 font-serif flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span>{question.helpText}</span>
                </p>
              )}

              <div className="flex gap-2">
                <Input
                  id={question.id}
                  type="number"
                  placeholder="0"
                  min="0"
                  step="any"
                  value={responses[question.id]?.activityData || ''}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  className="bg-[#fff8ec] border-[#F4971D] text-black font-serif font-bold"
                />
                <div className="flex items-center px-3 bg-[#F4971D] rounded-md text-black font-serif font-bold text-sm whitespace-nowrap">
                  {question.unit}
                </div>
              </div>

              {responses[question.id] && responses[question.id].emissions > 0 && (
                <div className="text-xs font-serif font-bold flex justify-between items-center text-[#1f1f1f] bg-[#fff8ec] rounded-md px-2 py-1">
                  <span>Emissions: {responses[question.id].emissions.toFixed(2)} kg CO₂e</span>
                  <span className="text-gray-500">
                    ({(responses[question.id].emissions / 1000).toFixed(3)} t)
                  </span>
                </div>
              )}

              {question.unit !== 'notes' && (
                <Textarea
                  placeholder="Optional notes…"
                  value={notes[question.id] || ''}
                  onChange={(e) => handleNotesChange(question.id, e.target.value)}
                  className="bg-[#fff8ec] border-gray-200 text-black text-xs font-serif"
                  rows={2}
                />
              )}
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex gap-2 mt-6">
          <button
            onClick={handleBack}
            disabled={currentCategoryIndex === 0}
            className="flex-1 bg-[#1f1f1f] text-white font-serif font-bold py-3 rounded-2xl shadow-md disabled:opacity-40 flex items-center justify-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button
            onClick={handleSkipCategory}
            className="flex-1 bg-[#1f1f1f]/70 text-white font-serif font-bold py-3 rounded-2xl shadow-md flex items-center justify-center gap-1"
          >
            <XCircle className="w-4 h-4" /> Skip
          </button>
          <button
            onClick={handleNext}
            className="flex-1 bg-[#F4971D] text-black font-serif font-bold py-3 rounded-2xl shadow-md flex items-center justify-center gap-1"
          >
            {currentCategoryIndex < categories.length - 1 ? (
              <>Next <ArrowRight className="w-4 h-4" /></>
            ) : (
              <>Calc <CheckCircle2 className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ============= RESULTS =============
  if (step === 'results' && results) {
    return (
      <div className="min-h-screen bg-black pb-24 px-4 pt-6">
        {/* Dial card */}
        <div className="rounded-2xl bg-[#F4971D] p-4 mb-6">
          <Dial value={results.totalEmissions} max={mode === 'sme' ? 50000 : 500000} />
          <p className="text-center font-serif font-bold text-black text-2xl -mt-2">
            {totalEmissionsTonnes.toFixed(2)} t CO₂e
          </p>
          <p className="text-center font-serif text-black/80 text-sm">
            Total Annual Carbon Footprint • {mode === 'sme' ? 'SME' : 'Full Org'}
          </p>
        </div>

        {/* Context */}
        <div className="bg-white rounded-2xl p-4 shadow-md mb-4">
          <p className="font-serif text-sm text-black">
            <strong>Context:</strong> UK SMEs average ~25–50 t CO₂e/year. Large organisations
            range 100–10,000+ t depending on size and sector.
          </p>
        </div>

        {/* Breakdown */}
        <div className="bg-white rounded-2xl p-1.5 shadow-md mb-4">
          <div className="rounded-xl p-5 bg-[#1f1f1f]">
            <h2 className="text-xl font-serif font-bold text-white mb-4">Emissions Breakdown</h2>
            <div className="space-y-4">
              {results.categoryResults.map((cr) => {
                const pct = (cr.totalEmissions / results.totalEmissions) * 100;
                const ic = categories.find(c => c.name === cr.category)?.icon;
                const Icon = iconMap[ic || 'Building'];
                return (
                  <div key={cr.category} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5 text-[#F4971D]" />
                        <span className="text-white font-serif font-bold">{cr.category}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-[#F4971D] font-serif font-bold">
                          {(cr.totalEmissions / 1000).toFixed(2)} t
                        </div>
                        <div className="text-xs text-white/60 font-serif">{pct.toFixed(1)}%</div>
                      </div>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-[#F4971D]" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="pl-7 space-y-0.5 pt-1">
                      {cr.responses.map((r, idx) => (
                        <div key={idx} className="text-xs text-white/70 font-serif flex justify-between">
                          <span>{r.activityData} {r.unit}</span>
                          <span>{r.emissions.toFixed(2)} kg CO₂e</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {skippedCategories.length > 0 && (
          <div className="bg-white rounded-2xl p-3 shadow-md mb-4">
            <p className="font-serif text-sm text-gray-700">
              <strong>Skipped:</strong> {skippedCategories.join(', ')}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => {
              setStep('mode-select');
              setCurrentCategoryIndex(0);
              setResponses({});
              setSkippedCategories([]);
            }}
            className="flex-1 bg-[#1f1f1f] text-white font-serif font-bold py-3 rounded-2xl shadow-md"
          >
            Start New
          </button>
          <button
            onClick={() => {
              toast.success(`Report saved: ${totalEmissionsTonnes.toFixed(2)} t CO₂e`);
              onComplete?.(results.totalEmissions);
              onClose?.();
            }}
            className="flex-1 bg-[#F4971D] text-black font-serif font-bold py-3 rounded-2xl shadow-md flex items-center justify-center gap-1"
          >
            <CheckCircle2 className="w-4 h-4" /> Save
          </button>
        </div>
      </div>
    );
  }

  return null;
};
