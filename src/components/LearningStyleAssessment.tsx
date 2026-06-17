import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, Volume2, Brain, Heart, Users, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useUserPreferences } from '@/hooks/useUserPreferences';

interface AssessmentData {
  learningStyle: 'visual' | 'auditory' | 'mixed' | null;
  complexityLevel: 'simple' | 'detailed' | 'comprehensive' | null;
  priorKnowledge: 'new' | 'some' | 'experienced' | null;
  accessibilityNeeds: string[];
}

const LearningStyleAssessment = () => {
  console.log('🚀 LearningStyleAssessment component is rendering!');
  const navigate = useNavigate();
  const { setLearningPreferences } = useUserPreferences();
  const [currentStep, setCurrentStep] = useState(0);
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({
    learningStyle: null,
    complexityLevel: null,
    priorKnowledge: null,
    accessibilityNeeds: []
  });

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to Your Learning Journey',
      subtitle: 'Let\'s personalise your experience'
    },
    {
      id: 'learning-style',
      title: 'How Do You Learn Best?',
      subtitle: 'Everyone has their own brilliant way of understanding new information'
    },
    {
      id: 'complexity',
      title: 'What Level of Detail Works for You?',
      subtitle: 'We can present information in the way that suits you best'
    },
    {
      id: 'knowledge',
      title: 'Your Experience with Environmental Topics',
      subtitle: 'Help us know where to start your journey'
    },
    {
      id: 'accessibility',
      title: 'Making This Work for You',
      subtitle: 'Tell us about any preferences that help you engage better'
    },
    {
      id: 'ready',
      title: 'You\'re All Set!',
      subtitle: 'Your personalised toolkit is ready'
    }
  ];

  const currentStepData = steps[currentStep];

  const handleLearningStyleSelect = (style: AssessmentData['learningStyle']) => {
    console.log('🔥 LEARNING STYLE CLICKED:', style);
    console.log('🔥 CURRENT STATE BEFORE:', assessmentData);
    setAssessmentData(prev => {
      const newState = { ...prev, learningStyle: style };
      console.log('🔥 NEW STATE:', newState);
      return newState;
    });
  };

  const handleComplexitySelect = (level: AssessmentData['complexityLevel']) => {
    console.log('Complexity level selected:', level);
    setAssessmentData(prev => ({ ...prev, complexityLevel: level }));
  };

  const handleKnowledgeSelect = (knowledge: AssessmentData['priorKnowledge']) => {
    console.log('Knowledge level selected:', knowledge);
    setAssessmentData(prev => ({ ...prev, priorKnowledge: knowledge }));
  };

  const handleAccessibilityToggle = (need: string) => {
    setAssessmentData(prev => ({
      ...prev,
      accessibilityNeeds: prev.accessibilityNeeds.includes(need)
        ? prev.accessibilityNeeds.filter(item => item !== need)
        : [...prev.accessibilityNeeds, need]
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return true; // Welcome
      case 1: return assessmentData.learningStyle !== null;
      case 2: return assessmentData.complexityLevel !== null;
      case 3: return assessmentData.priorKnowledge !== null;
      case 4: return true; // Accessibility is optional
      case 5: return true; // Ready page
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Store assessment data and navigate to toolkit
      localStorage.setItem('learningPreferences', JSON.stringify(assessmentData));
      navigate('/toolkit');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-wfg-blue rounded-full flex items-center justify-center">
                <Lightbulb className="h-12 w-12 text-white" />
              </div>
            </div>
            <p className="text-lg text-gray-700 font-helvetica max-w-2xl mx-auto">
              This quick assessment will help us create the perfect learning experience for you. 
              There are no right or wrong answers - just your personal preferences that make you unique.
            </p>
            <p className="text-lg text-gray-600 font-helvetica max-w-2xl mx-auto mt-4">
              Let's see if you are a:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Card className="p-4 bg-wfg-yellow text-white border-0">
                <Eye className="h-8 w-8 mb-2" />
                <h4 className="font-helvetica font-bold">Visual Learner</h4>
                <p className="text-sm">Charts, diagrams, and images</p>
              </Card>
              <Card className="p-4 bg-wfg-green text-white border-0">
                <Volume2 className="h-8 w-8 mb-2" />
                <h4 className="font-helvetica font-bold">Auditory Learner</h4>
                <p className="text-sm">Discussions and explanations</p>
              </Card>
              <Card className="p-4 bg-wfg-purple text-white border-0">
                <Brain className="h-8 w-8 mb-2" />
                <h4 className="font-helvetica font-bold">Mixed Approach</h4>
                <p className="text-sm">Combination of different methods</p>
              </Card>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <p className="text-center text-gray-700 font-helvetica mb-8">
              Choose the approach that feels most natural and engaging for you:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div 
                className={`p-6 cursor-pointer transition-all duration-300 hover:scale-105 border-2 rounded-lg text-left w-full ${
                  assessmentData.learningStyle === 'visual' 
                    ? 'bg-wfg-yellow text-white border-wfg-yellow' 
                    : 'bg-white border-gray-200 hover:border-wfg-yellow'
                }`}
                onClick={() => handleLearningStyleSelect('visual')}
              >
                <div className="text-center">
                  <Eye className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-xl font-helvetica font-bold mb-2">I love visuals</h3>
                  <p className="text-sm">Charts, infographics, diagrams, and images help me understand concepts quickly and clearly.</p>
                </div>
              </div>

              <div 
                className={`p-6 cursor-pointer transition-all duration-300 hover:scale-105 border-2 rounded-lg text-left w-full ${
                  assessmentData.learningStyle === 'auditory' 
                    ? 'bg-wfg-green text-white border-wfg-green' 
                    : 'bg-white border-gray-200 hover:border-wfg-green'
                }`}
                onClick={() => handleLearningStyleSelect('auditory')}
              >
                <div className="text-center">
                  <Volume2 className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-xl font-helvetica font-bold mb-2">I prefer explanations</h3>
                  <p className="text-sm">I learn best through detailed descriptions, discussions, and step-by-step explanations.</p>
                </div>
              </div>

              <div 
                className={`p-6 cursor-pointer transition-all duration-300 hover:scale-105 border-2 rounded-lg text-left w-full ${
                  assessmentData.learningStyle === 'mixed' 
                    ? 'bg-wfg-purple text-white border-wfg-purple' 
                    : 'bg-white border-gray-200 hover:border-wfg-purple'
                }`}
                onClick={() => handleLearningStyleSelect('mixed')}
              >
                <div className="text-center">
                  <Brain className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-xl font-helvetica font-bold mb-2">I like variety</h3>
                  <p className="text-sm">A mix of visuals, text, and interactive elements keeps me engaged and helps me learn.</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <p className="text-center text-gray-700 font-helvetica mb-8">
              How much detail helps you make confident decisions?
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button 
                className={`p-6 cursor-pointer transition-all duration-300 hover:scale-105 border-2 rounded-lg text-left w-full ${
                  assessmentData.complexityLevel === 'simple' 
                    ? 'bg-wfg-blue text-white border-wfg-blue' 
                    : 'bg-white border-gray-200 hover:border-wfg-blue'
                }`}
                onClick={() => handleComplexitySelect('simple')}
              >
                <div className="text-center">
                  <Heart className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-xl font-helvetica font-bold mb-2">Keep it simple</h3>
                  <p className="text-sm">I prefer clear, straightforward information that gets to the point quickly.</p>
                </div>
              </button>

              <button 
                className={`p-6 cursor-pointer transition-all duration-300 hover:scale-105 border-2 rounded-lg text-left w-full ${
                  assessmentData.complexityLevel === 'detailed' 
                    ? 'bg-wfg-orange text-white border-wfg-orange' 
                    : 'bg-white border-gray-200 hover:border-wfg-orange'
                }`}
                onClick={() => handleComplexitySelect('detailed')}
              >
                <div className="text-center">
                  <Users className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-xl font-helvetica font-bold mb-2">Give me context</h3>
                  <p className="text-sm">I like some background information and context to help me understand the bigger picture.</p>
                </div>
              </button>

              <button 
                className={`p-6 cursor-pointer transition-all duration-300 hover:scale-105 border-2 rounded-lg text-left w-full ${
                  assessmentData.complexityLevel === 'comprehensive' 
                    ? 'bg-wfg-red text-white border-wfg-red' 
                    : 'bg-white border-gray-200 hover:border-wfg-red'
                }`}
                onClick={() => handleComplexitySelect('comprehensive')}
              >
                <div className="text-center">
                  <Brain className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-xl font-helvetica font-bold mb-2">I want the details</h3>
                  <p className="text-sm">I appreciate comprehensive information, data, and technical details to make informed decisions.</p>
                </div>
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <p className="text-center text-gray-700 font-helvetica mb-8">
              Everyone starts their environmental journey at a different point:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button 
                className={`p-6 cursor-pointer transition-all duration-300 hover:scale-105 border-2 rounded-lg text-left w-full ${
                  assessmentData.priorKnowledge === 'new' 
                    ? 'bg-wfg-green text-white border-wfg-green' 
                    : 'bg-white border-gray-200 hover:border-wfg-green'
                }`}
                onClick={() => handleKnowledgeSelect('new')}
              >
                <div className="text-center">
                  <Lightbulb className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-xl font-helvetica font-bold mb-2">I'm just starting</h3>
                  <p className="text-sm">Environmental topics are quite new to me, and I'm excited to learn from the beginning.</p>
                </div>
              </button>

              <button 
                className={`p-6 cursor-pointer transition-all duration-300 hover:scale-105 border-2 rounded-lg text-left w-full ${
                  assessmentData.priorKnowledge === 'some' 
                    ? 'bg-wfg-yellow text-white border-wfg-yellow' 
                    : 'bg-white border-gray-200 hover:border-wfg-yellow'
                }`}
                onClick={() => handleKnowledgeSelect('some')}
              >
                <div className="text-center">
                  <Users className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-xl font-helvetica font-bold mb-2">I know some basics</h3>
                  <p className="text-sm">I have some understanding of environmental issues and am ready to build on what I know.</p>
                </div>
              </button>

              <button 
                className={`p-6 cursor-pointer transition-all duration-300 hover:scale-105 border-2 rounded-lg text-left w-full ${
                  assessmentData.priorKnowledge === 'experienced' 
                    ? 'bg-wfg-purple text-white border-wfg-purple' 
                    : 'bg-white border-gray-200 hover:border-wfg-purple'
                }`}
                onClick={() => handleKnowledgeSelect('experienced')}
              >
                <div className="text-center">
                  <Brain className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-xl font-helvetica font-bold mb-2">I'm quite experienced</h3>
                  <p className="text-sm">I have good knowledge of environmental topics and am looking for advanced insights.</p>
                </div>
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <p className="text-center text-gray-700 font-helvetica mb-8">
              Select any preferences that help you engage better with digital tools:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: 'large-text', label: 'Larger text size', description: 'Makes reading more comfortable' },
                { id: 'high-contrast', label: 'High contrast colours', description: 'Improves visibility and readability' },
                { id: 'audio-support', label: 'Audio descriptions', description: 'Helpful spoken explanations' },
                { id: 'simple-navigation', label: 'Simplified navigation', description: 'Cleaner, less cluttered interface' },
                { id: 'extra-time', label: 'More time to read', description: 'No time pressure for decisions' },
                { id: 'clear-language', label: 'Plain English', description: 'Avoids technical jargon where possible' }
              ].map((option) => (
                <button 
                  key={option.id}
                  className={`p-4 cursor-pointer transition-all duration-300 hover:scale-105 border-2 rounded-lg text-left w-full ${
                    assessmentData.accessibilityNeeds.includes(option.id)
                      ? 'bg-wfg-blue text-white border-wfg-blue' 
                      : 'bg-white border-gray-200 hover:border-wfg-blue'
                  }`}
                  onClick={() => handleAccessibilityToggle(option.id)}
                >
                  <h4 className="font-helvetica font-bold">{option.label}</h4>
                  <p className="text-sm mt-1 opacity-80">{option.description}</p>
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-gray-600 font-helvetica">
              These are all optional - select any that would be helpful for you
            </p>
          </div>
        );

      case 5:
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-wfg-green rounded-full flex items-center justify-center">
                <Heart className="h-12 w-12 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-helvetica font-bold text-gray-800 mb-4">
              Your Personalised Toolkit is Ready!
            </h3>
            <div className="max-w-2xl mx-auto">
              <Card className="p-6 bg-gray-50 border-0">
                <h4 className="font-helvetica font-bold text-lg mb-4">Your Learning Profile:</h4>
                <div className="space-y-2 text-left">
                  <p><strong>Learning Style:</strong> {
                    assessmentData.learningStyle === 'visual' ? 'Visual learner - loves charts and diagrams' :
                    assessmentData.learningStyle === 'auditory' ? 'Prefers detailed explanations' :
                    'Enjoys a mix of different approaches'
                  }</p>
                  <p><strong>Detail Level:</strong> {
                    assessmentData.complexityLevel === 'simple' ? 'Clear and straightforward information' :
                    assessmentData.complexityLevel === 'detailed' ? 'Context and background information' :
                    'Comprehensive details and data'
                  }</p>
                  <p><strong>Experience:</strong> {
                    assessmentData.priorKnowledge === 'new' ? 'New to environmental topics' :
                    assessmentData.priorKnowledge === 'some' ? 'Some existing knowledge' :
                    'Experienced with environmental topics'
                  }</p>
                  {assessmentData.accessibilityNeeds.length > 0 && (
                    <p><strong>Preferences:</strong> {assessmentData.accessibilityNeeds.length} helpful features selected</p>
                  )}
                </div>
              </Card>
            </div>
            <p className="text-gray-700 font-helvetica">
              The toolkit will now be customised to match your preferences and learning style.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-wfg-blue p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-helvetica font-bold text-white">
            Learning Style Assessment
          </h1>
          <div className="text-white text-sm">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-200 h-2">
        <div 
          className="bg-wfg-blue h-2 transition-all duration-300"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-helvetica font-bold text-gray-800 mb-2">
              {currentStepData.title}
            </CardTitle>
            <p className="text-xl text-gray-600 font-helvetica">
              {currentStepData.subtitle}
            </p>
          </CardHeader>
          <CardContent className="p-8">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            className="border-wfg-blue text-wfg-blue hover:bg-wfg-blue hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {currentStep === 0 ? 'Back to Main App' : 'Previous'}
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="bg-wfg-blue hover:bg-wfg-blue/90 text-white disabled:opacity-50"
          >
            {currentStep === steps.length - 1 ? 'Start Using Toolkit' : 'Continue'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LearningStyleAssessment;