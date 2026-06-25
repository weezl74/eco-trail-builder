import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { X, Calculator } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';


interface Question {
  id: string;
  question: string;
  options: { value: string; label: string; impact: number }[];
  allowCustom?: boolean;
  customUnit?: string;
  customLabel?: string;
}

interface CategoryQuestionnaireProps {
  category: {
    id: string;
    title: string;
    description: string;
  };
  onComplete: (categoryId: string, totalImpact: number) => void;
  onClose: () => void;
  user?: any;
}

const categoryQuestions: Record<string, Question[]> = {
  waste: [
    {
      id: 'food-waste',
      question: 'How much food do you typically waste per week?',
      options: [
        { value: 'none', label: 'Almost none - I plan meals carefully', impact: 0 },
        { value: 'little', label: 'A little (1-2 meals worth)', impact: 60 },
        { value: 'moderate', label: 'Moderate (3-5 meals worth)', impact: 120 },
        { value: 'lots', label: 'A lot (6+ meals worth)', impact: 200 }
      ],
      allowCustom: true,
      customUnit: 'kg',
      customLabel: 'Enter exact kg of food waste per week'
    },
    {
      id: 'recycling',
      question: 'How much of your household waste do you recycle?',
      options: [
        { value: 'everything', label: '80-100% - I recycle everything possible', impact: 0 },
        { value: 'most', label: '60-80% - Most things', impact: 80 },
        { value: 'some', label: '30-60% - Some things', impact: 200 },
        { value: 'little', label: 'Less than 30%', impact: 400 }
      ]
    },
    {
      id: 'packaging',
      question: 'How often do you buy products with excessive packaging?',
      options: [
        { value: 'never', label: 'Never - I actively avoid it', impact: 0 },
        { value: 'rarely', label: 'Rarely', impact: 100 },
        { value: 'sometimes', label: 'Sometimes', impact: 200 },
        { value: 'often', label: 'Often - convenience matters more', impact: 350 }
      ]
    },
    {
      id: 'composting',
      question: 'Do you compost organic waste?',
      options: [
        { value: 'yes-home', label: 'Yes, I compost at home', impact: 0 },
        { value: 'yes-service', label: 'Yes, through municipal service', impact: 50 },
        { value: 'sometimes', label: 'Sometimes', impact: 150 },
        { value: 'no', label: 'No, it goes in the general bin', impact: 300 }
      ]
    },
    {
      id: 'single-use',
      question: 'How often do you use single-use plastics (bags, bottles, cups)?',
      options: [
        { value: 'never', label: 'Never - I use reusables', impact: 0 },
        { value: 'rarely', label: 'Rarely (emergency only)', impact: 80 },
        { value: 'sometimes', label: 'Sometimes (few times/week)', impact: 200 },
        { value: 'daily', label: 'Daily or multiple times per day', impact: 400 }
      ]
    }
  ],
  energy: [
    {
      id: 'electricity-source',
      question: 'What is your primary electricity source?',
      options: [
        { value: 'renewable', label: '100% renewable energy', impact: 0 },
        { value: 'mixed-green', label: 'Mix with high renewable %', impact: 100 },
        { value: 'standard', label: 'Standard grid electricity', impact: 400 },
        { value: 'coal-heavy', label: 'Coal/fossil fuel heavy grid', impact: 600 }
      ],
      allowCustom: true,
      customUnit: 'kWh/month',
      customLabel: 'Enter your monthly electricity usage'
    },
    {
      id: 'heating',
      question: 'What temperature do you keep your home in winter?',
      options: [
        { value: 'very-low', label: '16°C or below', impact: 0 },
        { value: 'low', label: '17-18°C', impact: 150 },
        { value: 'moderate', label: '19-21°C', impact: 400 },
        { value: 'high', label: '22°C or above', impact: 700 }
      ]
    },
    {
      id: 'cooling',
      question: 'How do you cool your home in summer?',
      options: [
        { value: 'natural', label: 'Open windows and natural ventilation', impact: 0 },
        { value: 'fans', label: 'Fans and natural cooling', impact: 100 },
        { value: 'portable-ac', label: 'Occasional portable air conditioning', impact: 300 },
        { value: 'fixed-ac', label: 'Fixed air conditioning system', impact: 600 }
      ]
    },
    {
      id: 'appliances',
      question: 'How energy-efficient are your major appliances?',
      options: [
        { value: 'all-efficient', label: 'All A+++ rated or equivalent', impact: 0 },
        { value: 'mostly-efficient', label: 'Mostly efficient (A+ or better)', impact: 150 },
        { value: 'mixed', label: 'Mix of efficient and older appliances', impact: 300 },
        { value: 'old', label: 'Mostly older, less efficient appliances', impact: 500 }
      ]
    },
    {
      id: 'standby',
      question: 'How often do you leave appliances on standby?',
      options: [
        { value: 'never', label: 'Never - everything switched off', impact: 0 },
        { value: 'rarely', label: 'Rarely', impact: 80 },
        { value: 'sometimes', label: 'Sometimes', impact: 150 },
        { value: 'always', label: 'Most things left on standby', impact: 250 }
      ]
    },
    {
      id: 'water-heating',
      question: 'How do you heat water in your home?',
      options: [
        { value: 'solar', label: 'Solar water heater', impact: 0 },
        { value: 'heat-pump', label: 'Heat pump water heater', impact: 100 },
        { value: 'gas-efficient', label: 'Efficient gas system', impact: 200 },
        { value: 'electric-standard', label: 'Standard electric heating', impact: 400 }
      ]
    }
  ],
  buildings: [
    {
      id: 'home-size',
      question: 'What is the size of your primary residence?',
      options: [
        { value: 'small', label: 'Small (under 100m²)', impact: 0 },
        { value: 'medium', label: 'Medium (100-200m²)', impact: 300 },
        { value: 'large', label: 'Large (200-300m²)', impact: 600 },
        { value: 'very-large', label: 'Very large (over 300m²)', impact: 1000 }
      ]
    },
    {
      id: 'insulation',
      question: 'How well insulated is your home?',
      options: [
        { value: 'excellent', label: 'Excellent - passive house standard', impact: 0 },
        { value: 'very-good', label: 'Very good - modern insulation', impact: 200 },
        { value: 'good', label: 'Good - some insulation', impact: 400 },
        { value: 'poor', label: 'Poor - minimal insulation', impact: 700 },
        { value: 'none', label: 'Very poor/no insulation', impact: 1000 }
      ]
    },
    {
      id: 'windows',
      question: 'What type of windows does your home have?',
      options: [
        { value: 'triple', label: 'Triple-glazed, high-performance', impact: 0 },
        { value: 'double-good', label: 'Good quality double-glazed', impact: 150 },
        { value: 'double-standard', label: 'Standard double-glazed', impact: 300 },
        { value: 'single', label: 'Single-glazed windows', impact: 500 }
      ]
    },
    {
      id: 'building-age',
      question: 'When was your home built?',
      options: [
        { value: 'new-efficient', label: 'After 2010 - energy efficient', impact: 0 },
        { value: 'recent', label: '1990-2010', impact: 200 },
        { value: 'older', label: '1970-1990', impact: 400 },
        { value: 'old', label: 'Before 1970', impact: 600 }
      ]
    },
    {
      id: 'renewable-features',
      question: 'Does your home have renewable energy features?',
      options: [
        { value: 'multiple', label: 'Solar panels + other renewables', impact: -300 },
        { value: 'solar', label: 'Solar panels', impact: -200 },
        { value: 'small', label: 'Small renewable features', impact: -100 },
        { value: 'none', label: 'No renewable features', impact: 0 }
      ]
    }
  ],
  travel: [
    {
      id: 'daily-transport',
      question: 'What is your primary daily transport?',
      options: [
        { value: 'walk-bike', label: 'Walking/Cycling', impact: 0 },
        { value: 'e-bike', label: 'E-bike/E-scooter', impact: 50 },
        { value: 'public', label: 'Public transport', impact: 200 },
        { value: 'car-share', label: 'Car sharing/ride sharing', impact: 300 },
        { value: 'car-efficient', label: 'Efficient car (hybrid/small)', impact: 400 },
        { value: 'car-standard', label: 'Standard car', impact: 700 },
        { value: 'car-large', label: 'Large car/SUV', impact: 1000 }
      ]
    },
    {
      id: 'daily-distance',
      question: 'How far do you travel daily for work/regular activities?',
      options: [
        { value: 'none', label: 'Work from home/walk to work', impact: 0 },
        { value: 'short', label: 'Less than 10km total', impact: 50 },
        { value: 'medium', label: '10-30km total', impact: 150 },
        { value: 'long', label: '30-60km total', impact: 250 },
        { value: 'very-long', label: 'More than 60km total', impact: 400 }
      ],
      allowCustom: true,
      customUnit: 'km/day',
      customLabel: 'Enter exact daily travel distance'
    },
    {
      id: 'car-efficiency',
      question: 'If you drive, what type of vehicle?',
      options: [
        { value: 'no-car', label: 'I don\'t own/drive a car', impact: 0 },
        { value: 'electric', label: 'Electric vehicle', impact: 200 },
        { value: 'hybrid', label: 'Hybrid vehicle', impact: 400 },
        { value: 'small-efficient', label: 'Small, fuel-efficient car', impact: 600 },
        { value: 'standard', label: 'Standard car', impact: 800 },
        { value: 'large-suv', label: 'Large car/SUV/truck', impact: 1200 }
      ]
    },
    {
      id: 'flights-domestic',
      question: 'How many domestic flights do you take per year?',
      options: [
        { value: 'none', label: 'None', impact: 0 },
        { value: 'one', label: '1 return trip', impact: 400 },
        { value: 'two-three', label: '2-3 return trips', impact: 800 },
        { value: 'many', label: '4+ return trips', impact: 1500 }
      ]
    },
    {
      id: 'flights-international',
      question: 'How many international flights do you take per year?',
      options: [
        { value: 'none', label: 'None', impact: 0 },
        { value: 'short', label: '1 short-haul return trip', impact: 800 },
        { value: 'long', label: '1 long-haul return trip', impact: 2500 },
        { value: 'multiple-short', label: '2+ short-haul trips', impact: 1800 },
        { value: 'multiple-long', label: '2+ long-haul trips', impact: 5000 },
        { value: 'frequent', label: 'Frequent flyer (6+ trips)', impact: 8000 }
      ]
    },
    {
      id: 'holiday-transport',
      question: 'How do you typically travel for holidays?',
      options: [
        { value: 'local', label: 'Local/regional destinations by train/car', impact: 100 },
        { value: 'train', label: 'Mainly by train for longer trips', impact: 200 },
        { value: 'mix', label: 'Mix of car, train, and some flights', impact: 500 },
        { value: 'fly', label: 'Mainly by air', impact: 1000 }
      ]
    }
  ],
  consumption: [
    {
      id: 'shopping-frequency',
      question: 'How often do you buy new clothes?',
      options: [
        { value: 'minimal', label: 'Rarely - only when necessary', impact: 0 },
        { value: 'seasonal', label: 'Each season (4 times/year)', impact: 200 },
        { value: 'monthly', label: 'Monthly', impact: 500 },
        { value: 'weekly', label: 'Weekly or more', impact: 1000 }
      ]
    },
    {
      id: 'clothing-type',
      question: 'What type of clothing do you typically buy?',
      options: [
        { value: 'secondhand', label: 'Mainly secondhand/vintage', impact: 0 },
        { value: 'sustainable', label: 'Sustainable/ethical brands', impact: 100 },
        { value: 'mixed', label: 'Mix of sustainable and regular brands', impact: 300 },
        { value: 'fast-fashion', label: 'Mainly fast fashion', impact: 600 }
      ]
    },
    {
      id: 'electronics',
      question: 'How often do you buy new electronics?',
      options: [
        { value: 'minimal', label: 'Only when broken, use for many years', impact: 0 },
        { value: 'occasional', label: 'Every 3-4 years', impact: 200 },
        { value: 'regular', label: 'Every 1-2 years', impact: 500 },
        { value: 'frequent', label: 'Multiple times per year', impact: 800 }
      ]
    },
    {
      id: 'furniture',
      question: 'How do you furnish your home?',
      options: [
        { value: 'secondhand', label: 'Mainly secondhand/inherited furniture', impact: 0 },
        { value: 'durable', label: 'Buy quality, durable furniture to last', impact: 200 },
        { value: 'mix', label: 'Mix of new and secondhand', impact: 400 },
        { value: 'new-frequent', label: 'Frequently buy new furniture', impact: 700 }
      ]
    },
    {
      id: 'consumption-mindset',
      question: 'Which best describes your consumption approach?',
      options: [
        { value: 'minimalist', label: 'Minimalist - buy very little', impact: 0 },
        { value: 'conscious', label: 'Conscious consumer - research before buying', impact: 150 },
        { value: 'average', label: 'Average consumer', impact: 400 },
        { value: 'high', label: 'I enjoy shopping and buying new things', impact: 700 }
      ]
    }
  ],
  'land-food': [
    {
      id: 'diet-type',
      question: 'How would you describe your diet?',
      options: [
        { value: 'vegan', label: 'Vegan', impact: 0 },
        { value: 'vegetarian', label: 'Vegetarian', impact: 300 },
        { value: 'pescatarian', label: 'Pescatarian (fish but no meat)', impact: 500 },
        { value: 'low-meat', label: 'Low meat (1-2 times/week)', impact: 800 },
        { value: 'moderate-meat', label: 'Moderate meat (3-4 times/week)', impact: 1200 },
        { value: 'high-meat', label: 'High meat consumption (daily)', impact: 1800 }
      ]
    },
    {
      id: 'meat-type',
      question: 'If you eat meat, what type do you consume most?',
      options: [
        { value: 'no-meat', label: 'I don\'t eat meat', impact: 0 },
        { value: 'chicken-fish', label: 'Mainly chicken and fish', impact: 400 },
        { value: 'mixed', label: 'Mix of chicken, pork, and some beef', impact: 800 },
        { value: 'beef-heavy', label: 'Significant beef consumption', impact: 1500 }
      ]
    },
    {
      id: 'food-source',
      question: 'Where do you source most of your food?',
      options: [
        { value: 'local-organic', label: 'Local, organic, seasonal food', impact: 0 },
        { value: 'local-mixed', label: 'Mix of local and non-local, some organic', impact: 200 },
        { value: 'supermarket-conscious', label: 'Supermarket but choose seasonal/local when possible', impact: 400 },
        { value: 'supermarket-standard', label: 'Standard supermarket shopping', impact: 600 },
        { value: 'processed-heavy', label: 'Lots of processed/packaged foods', impact: 800 }
      ]
    },
    {
      id: 'dairy',
      question: 'How much dairy do you consume?',
      options: [
        { value: 'none', label: 'No dairy products', impact: 0 },
        { value: 'plant-alternatives', label: 'Mainly plant-based alternatives', impact: 100 },
        { value: 'low-dairy', label: 'Small amounts of dairy', impact: 300 },
        { value: 'moderate-dairy', label: 'Moderate dairy consumption', impact: 500 },
        { value: 'high-dairy', label: 'High dairy consumption', impact: 700 }
      ]
    },
    {
      id: 'food-waste-detailed',
      question: 'How much food do you waste?',
      options: [
        { value: 'none', label: 'Almost no food waste - meal planning/composting', impact: 0 },
        { value: 'minimal', label: 'Very little waste', impact: 100 },
        { value: 'some', label: 'Some waste (occasional leftovers)', impact: 250 },
        { value: 'moderate', label: 'Moderate waste', impact: 400 },
        { value: 'high', label: 'Significant food waste', impact: 600 }
      ]
    },
    {
      id: 'growing-food',
      question: 'Do you grow any of your own food?',
      options: [
        { value: 'significant', label: 'Yes, significant portion (garden/allotment)', impact: -200 },
        { value: 'some', label: 'Yes, some herbs/vegetables', impact: -100 },
        { value: 'herbs', label: 'Just herbs on windowsill', impact: -50 },
        { value: 'none', label: 'No, I don\'t grow food', impact: 0 }
      ]
    }
  ]
};

const CategoryQuestionnaire: React.FC<CategoryQuestionnaireProps> = ({
  category,
  onComplete,
  onClose,
  user
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [customValues, setCustomValues] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  
  // Load existing responses on mount
  useEffect(() => {
    const loadExistingResponses = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        const { data } = await supabase
          .from('user_responses')
          .select('question_id, answer_value')
          .eq('user_id', user.id)
          .eq('category', category.id);
        
        if (data) {
          const existingAnswers = data.reduce((acc, response) => {
            const questionId = response.question_id;
            const answerValue = response.answer_value;
            
            if (!acc[questionId]) {
              acc[questionId] = [];
            }
            
            // Parse comma-separated values or single value
            const values = answerValue.includes(',') ? answerValue.split(',') : [answerValue];
            acc[questionId] = [...acc[questionId], ...values];
            
            return acc;
          }, {} as Record<string, string[]>);
          setAnswers(existingAnswers);
        }
      } catch (error) {
        console.error('Error loading responses:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadExistingResponses();
  }, [user, category.id]);
  
  const questions = categoryQuestions[category.id] || [];
  const currentQuestion = questions[currentQuestionIndex];
  
  if (questions.length === 0) {
    // Fallback for categories without specific questions
    const handleQuickComplete = () => {
      onComplete(category.id, 500); // Default impact
    };
    
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4 bg-slate-800 border-slate-700">
          <CardHeader className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2 text-slate-400 hover:text-white"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
            <CardTitle className="text-white">{category.title}</CardTitle>
            <CardDescription className="text-slate-400">{category.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 mb-6">
              Questions for this category are being developed. For now, we'll use an estimated impact.
            </p>
            <Button onClick={handleQuickComplete} className="w-full">
              Continue with Estimate
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAnswer = (value: string) => {
    const questionId = currentQuestion.id;
    // Single-select: only one option may be active at a time.
    setAnswers({ ...answers, [questionId]: [value] });
  };


  const handleNext = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Save all responses to database
      if (user) {
        try {
          // Delete existing responses for this category first
          await supabase
            .from('user_responses')
            .delete()
            .eq('user_id', user.id)
            .eq('category', category.id);

          const responsesToSave = questions.flatMap(question => {
            const questionAnswers = answers[question.id] || [];
            if (questionAnswers.length === 0) return [];
            
            // Calculate total impact for this question
            const totalImpact = questionAnswers.reduce((sum, answerValue) => {
              const option = question.options.find(opt => opt.value === answerValue);
              return sum + (option?.impact || 0);
            }, 0);
            
            // Save as comma-separated values with total impact
            return [{
              user_id: user.id,
              category: category.id,
              question_id: question.id,
              answer_value: questionAnswers.join(','),
              impact_value: totalImpact
            }];
          });

          // Insert new responses
          if (responsesToSave.length > 0) {
            await supabase
              .from('user_responses')
              .insert(responsesToSave);
          }
            
        } catch (error) {
          console.error('Error saving responses:', error);
        }
      }
      
      // Calculate total impact
      const totalImpact = questions.reduce((total, question) => {
        // Check if custom value is provided
        const customValue = customValues[question.id];
        if (customValue && customValue > 0) {
          // Use custom calculation based on question type
          if (question.id === 'food-waste') {
            return total + (customValue * 52 * 3.3); // kg/week * weeks * CO2 per kg
          } else if (question.id === 'electricity-source') {
            return total + (customValue * 12 * 0.21); // kWh/month * months * UK grid factor
          } else if (question.id === 'daily-distance') {
            return total + (customValue * 365 * 0.2); // km/day * days * avg car emissions
          }
          return total + customValue;
        }
        
        // Use selected options
        const questionAnswers = answers[question.id] || [];
        const questionImpact = questionAnswers.reduce((sum, answerValue) => {
          const option = question.options.find(opt => opt.value === answerValue);
          return sum + (option?.impact || 0);
        }, 0);
        return total + questionImpact;
      }, 0);
      
      onComplete(category.id, totalImpact);
    }
  };

  const canProceed = (answers[currentQuestion.id] && answers[currentQuestion.id].length > 0) || 
                    (currentQuestion.allowCustom && customValues[currentQuestion.id] > 0);
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4 bg-slate-800 border-slate-700">
          <CardContent className="p-6 text-center">
            <div className="text-slate-300">Loading your previous responses...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-full max-w-lg mx-4 bg-slate-800 border-slate-700">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2 text-slate-400 hover:text-white"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
          <CardTitle className="text-white">{category.title}</CardTitle>
          <CardDescription className="text-slate-400">
            Question {currentQuestionIndex + 1} of {questions.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h3 className="text-lg font-medium text-white mb-4">
              {currentQuestion.question}
            </h3>
            
            <div className="space-y-3">
              <p className="text-sm text-slate-400 mb-3">
                Select one option:
              </p>
              <RadioGroup
                value={(answers[currentQuestion.id] || [])[0] || ''}
                onValueChange={(v) => handleAnswer(v)}
              >
                {currentQuestion.options.map((option) => (
                  <div key={option.value} className="flex items-center space-x-3">
                    <RadioGroupItem
                      id={option.value}
                      value={option.value}
                      className="border-slate-500 text-blue-500"
                    />
                    <Label
                      htmlFor={option.value}
                      className="text-slate-300 cursor-pointer flex-1"
                    >
                      {option.label}
                      <span className="text-xs text-slate-500 ml-2">
                        ({option.impact > 0 ? '+' : ''}{option.impact} kg CO₂/year)
                      </span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              
              {currentQuestion.allowCustom && (
                <div className="mt-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                  <div className="flex items-center gap-2 mb-3">
                    <Calculator className="w-4 h-4 text-blue-400" />
                    <Label className="text-slate-300 font-medium">
                      Custom Value
                    </Label>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">
                    {currentQuestion.customLabel}
                  </p>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="0"
                      value={customValues[currentQuestion.id] || ''}
                      onChange={(e) => setCustomValues(prev => ({
                        ...prev,
                        [currentQuestion.id]: parseFloat(e.target.value) || 0
                      }))}
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                    <span className="text-slate-400 text-sm flex items-center px-2">
                      {currentQuestion.customUnit}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    This will override the selected options above for more accuracy
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Previous
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!canProceed}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLastQuestion ? 'Complete Assessment' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryQuestionnaire;