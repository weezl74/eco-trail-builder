import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
    setNotes(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSkipCategory = () => {
    setSkippedCategories(prev => [...prev, currentCategory.id]);
    handleNext();
  };

  const handleNext = () => {
    if (currentCategoryIndex < categories.length - 1) {
      setCurrentCategoryIndex(prev => prev + 1);
    } else {
      setStep('results');
    }
  };

  const handleBack = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(prev => prev - 1);
    }
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
          (sum, [_, response]) => sum + response.emissions,
          0
        );

        categoryResults.push({
          category: category.name,
          totalEmissions,
          responses: categoryResponses.map(([_, r]) => r)
        });
      }
    });

    const totalEmissions = categoryResults.reduce(
      (sum, cat) => sum + cat.totalEmissions,
      0
    );

    return { categoryResults, totalEmissions };
  };

  const results = step === 'results' ? calculateResults() : null;
  const totalEmissionsTonnes = results ? results.totalEmissions / 1000 : 0;

  const IconComponent = currentCategory ? iconMap[currentCategory.icon] || Building : Building;

  if (step === 'mode-select') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 p-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-zinc-900/50 border-cyan-500/20 p-8">
            <div className="text-center mb-8">
              <Target className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-white mb-2">
                Carbon Reporting Calculator
              </h1>
              <p className="text-zinc-400">
                Calculate your business carbon footprint using UK Government emission factors
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* SME Mode */}
              <Card 
                className="bg-zinc-800/50 border-cyan-500/30 p-6 cursor-pointer hover:border-cyan-400 transition-all"
                onClick={() => handleModeSelect('sme')}
              >
                <Building className="w-12 h-12 text-cyan-400 mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">
                  SME Calculator
                </h2>
                <p className="text-zinc-400 mb-4">
                  Simplified reporting for small and medium businesses
                </p>
                <ul className="text-sm text-zinc-400 space-y-2 mb-6">
                  <li>• Core emission categories</li>
                  <li>• Buildings energy & water</li>
                  <li>• Fleet & business travel</li>
                  <li>• Waste disposal</li>
                  <li>• ~15 minutes to complete</li>
                </ul>
                <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-black">
                  Start SME Report
                </Button>
              </Card>

              {/* Full Mode */}
              <Card 
                className="bg-zinc-800/50 border-purple-500/30 p-6 cursor-pointer hover:border-purple-400 transition-all"
                onClick={() => handleModeSelect('full')}
              >
                <Factory className="w-12 h-12 text-purple-400 mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">
                  Full Organization Report
                </h2>
                <p className="text-zinc-400 mb-4">
                  Comprehensive reporting for large organizations
                </p>
                <ul className="text-sm text-zinc-400 space-y-2 mb-6">
                  <li>• All emission categories</li>
                  <li>• Employee commuting</li>
                  <li>• Homeworking emissions</li>
                  <li>• Supply chain (Tier 1)</li>
                  <li>• ~30-45 minutes to complete</li>
                </ul>
                <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white">
                  Start Full Report
                </Button>
              </Card>
            </div>

            {onClose && (
              <Button 
                onClick={onClose} 
                variant="ghost" 
                className="w-full mt-6 text-zinc-400"
              >
                Cancel
              </Button>
            )}
          </Card>
        </div>
      </div>
    );
  }

  if (step === 'questionnaire' && currentCategory) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 p-4 pb-20">
        <div className="max-w-3xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-zinc-400 mb-2">
              <span>{mode === 'sme' ? 'SME' : 'Full'} Report</span>
              <span>Category {currentCategoryIndex + 1} of {categories.length}</span>
            </div>
            <Progress value={progress} className="h-2 bg-zinc-800" />
          </div>

          <Card className="bg-zinc-900/50 border-cyan-500/20 p-8">
            {/* Category Header */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-zinc-800">
              <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center">
                <IconComponent className="w-6 h-6 text-cyan-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white">
                  {currentCategory.name}
                </h2>
                <p className="text-zinc-400">{currentCategory.description}</p>
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-6">
              {currentCategory.questions.map((question) => (
                <div key={question.id} className="space-y-2">
                  <Label htmlFor={question.id} className="text-white flex items-start gap-2">
                    <span>{question.question}</span>
                    {question.required && (
                      <span className="text-red-400">*</span>
                    )}
                  </Label>
                  
                  {question.helpText && (
                    <p className="text-sm text-zinc-400 flex items-start gap-2">
                      <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
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
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                    <div className="flex items-center px-4 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-400 text-sm whitespace-nowrap">
                      {question.unit}
                    </div>
                  </div>

                  {responses[question.id] && responses[question.id].emissions > 0 && (
                    <div className="text-sm text-cyan-400 flex justify-between items-center">
                      <span>Emissions: {responses[question.id].emissions.toFixed(2)} kg CO₂e</span>
                      <span className="text-zinc-500">
                        ({(responses[question.id].emissions / 1000).toFixed(3)} tonnes)
                      </span>
                    </div>
                  )}

                  {/* Optional notes field */}
                  {question.unit !== 'notes' && (
                    <Textarea
                      placeholder="Optional: Add notes about this data..."
                      value={notes[question.id] || ''}
                      onChange={(e) => handleNotesChange(question.id, e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white text-sm"
                      rows={2}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex gap-4 mt-8 pt-6 border-t border-zinc-800">
              <Button
                onClick={handleBack}
                disabled={currentCategoryIndex === 0}
                variant="outline"
                className="border-zinc-700 text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <Button
                onClick={handleSkipCategory}
                variant="ghost"
                className="text-zinc-400"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Skip Category
              </Button>

              <div className="flex-1" />

              <Button
                onClick={handleNext}
                className="bg-cyan-500 hover:bg-cyan-600 text-black"
              >
                {currentCategoryIndex < categories.length - 1 ? (
                  <>
                    Next <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Calculate Results <CheckCircle2 className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (step === 'results' && results) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 p-4 pb-20">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Total Emissions Card */}
          <Card className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-cyan-500/30 p-8">
            <div className="text-center">
              <Target className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-white mb-2">
                {totalEmissionsTonnes.toFixed(2)} tonnes CO₂e
              </h1>
              <p className="text-xl text-zinc-400 mb-4">
                Total Annual Carbon Footprint
              </p>
              <p className="text-sm text-zinc-500">
                {results.totalEmissions.toFixed(0)} kg CO₂e | Reporting Mode: {mode === 'sme' ? 'SME' : 'Full Organization'}
              </p>
            </div>
          </Card>

          {/* Benchmark Information */}
          <Alert className="bg-zinc-900/50 border-cyan-500/20">
            <Info className="w-4 h-4 text-cyan-400" />
            <AlertDescription className="text-zinc-300">
              <strong>Context:</strong> The average UK SME produces around 25-50 tonnes CO₂e per year. 
              Large organizations can range from 100-10,000+ tonnes depending on size and sector.
            </AlertDescription>
          </Alert>

          {/* Category Breakdown */}
          <Card className="bg-zinc-900/50 border-cyan-500/20 p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Emissions Breakdown</h2>
            <div className="space-y-4">
              {results.categoryResults.map((categoryResult) => {
                const percentage = (categoryResult.totalEmissions / results.totalEmissions) * 100;
                const categoryIcon = categories.find(c => c.name === categoryResult.category)?.icon;
                const Icon = iconMap[categoryIcon || 'Building'];

                return (
                  <div key={categoryResult.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-cyan-400" />
                        <span className="text-white font-medium">{categoryResult.category}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">
                          {(categoryResult.totalEmissions / 1000).toFixed(2)} tonnes
                        </div>
                        <div className="text-sm text-zinc-400">{percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                    <Progress 
                      value={percentage} 
                      className="h-2 bg-zinc-800"
                    />
                    <div className="pl-8 space-y-1">
                      {categoryResult.responses.map((response, idx) => (
                        <div key={idx} className="text-sm text-zinc-400 flex justify-between">
                          <span>{response.activityData} {response.unit}</span>
                          <span>{response.emissions.toFixed(2)} kg CO₂e</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Skipped Categories */}
          {skippedCategories.length > 0 && (
            <Alert className="bg-zinc-900/50 border-zinc-700">
              <AlertDescription className="text-zinc-400">
                <strong>Skipped categories:</strong> {skippedCategories.join(', ')}
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              onClick={() => {
                setStep('mode-select');
                setCurrentCategoryIndex(0);
                setResponses({});
                setSkippedCategories([]);
              }}
              variant="outline"
              className="flex-1 border-zinc-700 text-white"
            >
              Start New Report
            </Button>
            <Button
              onClick={() => {
                toast.success(`Carbon report completed: ${totalEmissionsTonnes.toFixed(2)} tonnes CO₂e`);
                onComplete?.(results.totalEmissions);
                onClose?.();
              }}
              className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-black"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Save Report
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};